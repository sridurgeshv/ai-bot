from fastapi import FastAPI, HTTPException, Request, Depends
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from langchain_chroma import Chroma
from dotenv import load_dotenv
import os
from sqlalchemy.orm import Session
from models import User, ChatSession, ChatMessage, Escalation, Feedback
from database import SessionLocal, engine
from datetime import datetime
import models
import logging
import re
import html

models.Base.metadata.create_all(bind=engine)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add any other origins you need
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    apiKey: str
    question: str
    sessionId: int

class ChatSessionRequest(BaseModel):
    google_id: str
    title: str = Field(default="New Chat")

class ChatMessageRequest(BaseModel):
    session_id: int
    message_type: str
    message: str

class FeedbackRequest(BaseModel):
    query: str
    response: str
    feedback: str

class TitleRequest(BaseModel):
    apiKey: str
    query: str

# Google OAuth2 Setup
current_dir = os.path.dirname(os.path.abspath(__file__))
client_secret_path = os.path.join(current_dir, 'client_secret.json')

client_id = os.getenv("GOOGLE_CLIENT_ID")
client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
redirect_uri = "http://localhost:8000/callback"

flow = Flow.from_client_secrets_file(
    client_secret_path,
    scopes=['https://www.googleapis.com/auth/userinfo.profile', 'openid'],
    redirect_uri=redirect_uri
)

# Set to allow insecure localhost
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

@app.get("/login")
def login():
    auth_url, _ = flow.authorization_url()
    return JSONResponse(content={"auth_url": auth_url})

@app.get("/callback")
async def callback(request: Request):
    try:
        flow.fetch_token(authorization_response=str(request.url))
        credentials = flow.credentials
        
        if credentials:
            user_info_service = build('oauth2', 'v2', credentials=credentials)
            user_info = user_info_service.userinfo().get().execute()
            user_name = user_info.get('name', 'User')
            google_id = user_info.get('id')
            
            # Save user to database
            db = next(get_db())
            user = db.query(User).filter(User.google_id == google_id).first()
            if not user:
                user = User(google_id=google_id, name=user_name)
                db.add(user)
                db.commit()

            return RedirectResponse(url=f"http://localhost:3000?userName={user_name}&googleId={google_id}")
        else:
            raise HTTPException(status_code=400, detail="Authentication failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during OAuth callback: {str(e)}")

# Global variable to store the vectorstore
vectorstore = None

# Function to initialize or get the vectorstore
def get_vectorstore(api_key: str):
    global vectorstore
    if vectorstore is None:
        # PDF and Document Retrieval Setup
        loader = PyPDFLoader("final pdf.pdf")  # Replace with your actual PDF file
        data = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000)
        docs = text_splitter.split_documents(data)

        # Create vector store and retriever
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=api_key)
        vectorstore = Chroma.from_documents(documents=docs, embedding=embeddings)
    
    return vectorstore

system_prompt = (
    "You are an expert technical support specialist focused on diagnosing and resolving issues related to popular open-source software. Your goal is to deliver clear, and actionable guidance, ensuring users quickly overcome their technical challenges."
    "Use the following pieces of retrieved context to provide solutions or guidance to the user. "
    "If you don't know the answer based on the provided context, say the provided context doesn't contain information about issue. "
    "Keep your answers clear and concise with required explanations."
    "\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
    ]
)

@app.post("/chat")
async def chat_with_model(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        # Get the conversation history for the current session
        history = db.query(ChatMessage).filter(ChatMessage.session_id == request.sessionId).order_by(ChatMessage.timestamp).all()
        
        # Construct the conversation context
        context = "\n".join([f"{msg.message_type.capitalize()}: {msg.message}" for msg in history[-5:]])  # Include last 5 messages
        
        # Prepare the prompt with the conversation history
        full_prompt = f"{context}\nHuman: {request.question}\nAI:"

        # Initialize or get the vectorstore using the provided API key
        vectorstore = get_vectorstore(request.apiKey)
        retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 10})

        llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", google_api_key=request.apiKey, temperature=0, max_tokens=None, timeout=None)

        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)

        response = rag_chain.invoke({"input": full_prompt})
        answer = response["answer"]

        # Save the user message
        user_message = ChatMessage(
            session_id=request.sessionId,
            message_type='user',
            message=request.question
        )
        db.add(user_message)

        # Format the answer
        formatted_answer = format_bot_response(answer)

        # Save the bot message
        bot_message = ChatMessage(
            session_id=request.sessionId,
            message_type='bot',
            message=formatted_answer
        )
        db.add(bot_message)
        db.commit()

        if "the provided context doesn't contain information about" in answer.lower():
            escalation_result = await escalate_to_human_support(
                EscalateRequest(question=request.question), db
            )
            return {
                "answer": answer,
                "contextual": False,
                "message": "The current context doesn't cover this issue. Your query has been escalated to human support.",
                "escalation": escalation_result
            }
        else:
            return {"answer": formatted_answer, "contextual": True}

    except Exception as e:
        logger.error(f"Error in chat_with_model: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
# Add a new function to format the bot response
def format_bot_response(response):
    # Convert newlines to <br> tags, except within code blocks
    response = re.sub(r'```([\s\S]*?)```', lambda m: m.group(0).replace('\n', '$NEWLINE$'), response)
    response = response.replace('\n', '<br>')
    response = response.replace('$NEWLINE$', '\n')

    # Format code blocks
    response = re.sub(r'```(\w*)\n?([\s\S]*?)```', r'<pre><code class="language-\1">\2</code></pre>', response)

    # Format inline code
    response = re.sub(r'`([^`\n]+)`', r'<code>\1</code>', response)

    # Format bold text
    response = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', response)

    # Format italic text
    response = re.sub(r'\*(.*?)\*', r'<em>\1</em>', response)

    # Format lists
    response = re.sub(r'^\s*[-*+]\s+(.+)$', r'<li>\1</li>', response, flags=re.MULTILINE)
    response = re.sub(r'^\s*(\d+\.)\s+(.+)$', r'<li>\2</li>', response, flags=re.MULTILINE)
    response = re.sub(r'(<li>.*</li>)', r'<ul>\1</ul>', response, flags=re.DOTALL)

    return response

def format_code_block(code):
    code = code.strip().replace(r'^\w+\n', '', 1)  # Remove language identifier if present
    return f'<pre><code>{html.escape(code)}</code></pre>'

# POST /escalate route that saves the escalation request in the database
class EscalateRequest(BaseModel):
    question: str

@app.post("/create_chat_session")
async def create_chat_session(request: ChatSessionRequest, db: Session = Depends(get_db)):
    logger.info(f"Received request to create chat session: {request}")
    try:
        if not request.google_id:
            raise ValueError("google_id is required")

        user = db.query(User).filter(User.google_id == request.google_id).first()
        if not user:
            user = User(google_id=request.google_id, name="Unknown")
            db.add(user)
            db.commit()
            db.refresh(user)

        new_session = ChatSession(user_id=user.id, title=request.title)
        db.add(new_session)
        db.commit()
        db.refresh(new_session)

        logger.info(f"Created new chat session: {new_session.id}")
        return {"session_id": new_session.id, "title": new_session.title}
    except ValueError as ve:
        logger.error(f"Validation error: {str(ve)}")
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        logger.error(f"Error creating chat session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating chat session: {str(e)}")

@app.post("/add_chat_message")
async def add_chat_message(request: ChatMessageRequest, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == request.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    new_message = ChatMessage(
        session_id=session.id,
        message_type=request.message_type,
        message=request.message
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return {"message_id": new_message.id}

@app.get("/get_chat_sessions/{google_id}")
async def get_chat_sessions(google_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    sessions = db.query(ChatSession).filter(ChatSession.user_id == user.id).order_by(ChatSession.id.desc()).all()
    return [{"id": session.id, "title": session.title} for session in sessions]

@app.put("/update_chat_session/{session_id}")
async def update_chat_session(session_id: int, request: dict, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    session.title = request.get("title", session.title)
    db.commit()
    return {"status": "success", "message": "Chat session updated"}

@app.delete("/delete_chat_session/{session_id}")
async def delete_chat_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    # Delete associated messages
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    
    # Delete the session
    db.delete(session)
    db.commit()
    return {"status": "success", "message": "Chat session and associated messages deleted"}

@app.get("/get_chat_messages/{session_id}")
async def get_chat_messages(session_id: int, db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.id).all()
    return [{"type": msg.message_type, "message": msg.message} for msg in messages]

@app.post("/generate_title")
async def generate_title(request: TitleRequest):
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-pro", 
            google_api_key=request.apiKey, 
            temperature=0.7, 
            max_tokens=10
        )
        prompt = f"Generate a formal, concise title of 3-4 words for this chat, without any introductory phrases: {request.query}"
        response = llm.invoke(prompt)
        title = response.content.strip()
        return {"title": title}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating title: {str(e)}")

@app.post("/escalate")
async def escalate_to_human_support(request: EscalateRequest, db: Session = Depends(get_db)):
    try:
        # Create a new escalation record in the database
        new_escalation = Escalation(question=request.question)
        db.add(new_escalation)
        db.commit()
        
        # Simulate a successful escalation response
        return {"status": "escalated", "message": "The issue has been escalated to human support."}
    
    except Exception as e:
        print(f"Error in escalate_to_human_support: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/feedback")
async def save_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):
    try:
        new_feedback = Feedback(
            query=request.query,
            response=request.response,
            feedback=request.feedback
        )
        db.add(new_feedback)
        db.commit()
        db.refresh(new_feedback)
        return {"status": "success", "message": "Feedback saved successfully"}
    except Exception as e:
        print(f"Error saving feedback: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
