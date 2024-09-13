from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
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

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            # Use the credentials to get user info
            user_info_service = build('oauth2', 'v2', credentials=credentials)
            user_info = user_info_service.userinfo().get().execute()
            user_name = user_info.get('name', 'User')
            
            return RedirectResponse(url=f"http://localhost:3000?userName={user_name}")
        else:
            raise HTTPException(status_code=400, detail="Authentication failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during OAuth callback: {str(e)}")

class ChatRequest(BaseModel):
    apiKey: str
    question: str

# PDF and Document Retrieval Setup
loader = PyPDFLoader("final pdf.pdf")  # Replace with your actual PDF file
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000)
docs = text_splitter.split_documents(data)

# Create vector store and retriever
vectorstore = Chroma.from_documents(documents=docs, embedding=GoogleGenerativeAIEmbeddings(model="models/embedding-001"))
retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 10})

system_prompt = (
    "You are a technical support assistant specializing in diagnosing and resolving issues related to widely-used open-source software."
    "Use the following pieces of retrieved context to provide solutions or guidance to the user. "
    "If you don't know the answer based on the provided context, say that the issue is not in the context. "
    "Keep your answers concise."
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
def chat_with_model(request: ChatRequest):
    try:
        # Initialize the language model with the API key from the request
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", api_key=request.apiKey, temperature=0, max_tokens=None, timeout=None)
        
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)
        
        response = rag_chain.invoke({"input": request.question})
        answer = response["answer"]

        # Check if the answer is based on context
        if "not in the context" in answer.lower():
            return {"answer": answer, "contextual": False}
        else:
            return {"answer": answer, "contextual": True}

    except Exception as e:
        print(f"Error in chat_with_model: {str(e)}")  # Detailed logging
        raise HTTPException(status_code=500, detail=str(e))