from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
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

@app.post("/chat")
def chat_with_model(request: ChatRequest):
    try:
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", api_key=request.apiKey)
        response = llm.invoke(request.question)
        # Extract the text content from the response
        answer_text = response.content if hasattr(response, 'content') else str(response)
        return {"answer": answer_text}
    except Exception as e:
        print(f"Error in chat_with_model: {str(e)}")  # Detailed logging
        raise HTTPException(status_code=500, detail=str(e))