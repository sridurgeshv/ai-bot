from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import streamlit as st

load_dotenv()

st.title("Self-Learning Tech Support Bot for Open-Source Software")

# Load and preprocess documents
loader = PyPDFLoader("open_source_software_guide.pdf")  # Use a relevant guide or documentation
data = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000)
docs = text_splitter.split_documents(data)

# Create vector store and retriever
vectorstore = Chroma.from_documents(documents=docs, embedding=GoogleGenerativeAIEmbeddings(model="models/embedding-001"))
retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 10})

# Initialize language model
llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0, max_tokens=None, timeout=None)

# Define prompt template
system_prompt = (
    "You are a tech support assistant specializing in troubleshooting issues with popular open-source software. "
    "Use the following pieces of retrieved context to provide solutions or guidance to the user. "
    "If you don't know the answer based on the provided context, say that the issue is not in the context. "
    "You can also suggest adding new issues to the knowledge base. Keep your answers concise, ideally within three sentences."
    "\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
    ]
)

# Function to handle user input and provide responses
def handle_query(query):
    if query:
        question_answer_chain = create_stuff_documents_chain(llm, prompt)
        rag_chain = create_retrieval_chain(retriever, question_answer_chain)
        
        # Get response from the chain
        response = rag_chain.invoke({"input": query})
        answer = response["answer"]

        # Check if the response is based on context or not
        if "not in the context" in answer:
            return (answer, True)  # Indicates that the issue is not in the context
        else:
            return (answer, False)  # Indicates that the answer is within the context

# Streamlit UI
query = st.text_input("Ask your question about open-source software:")
if query:
    response, is_new_issue = handle_query(query)
    st.write(response)

    if is_new_issue:
        st.write("The issue is not in the context. Would you like to add this issue to the knowledge base?")
        if st.button("Yes"):
            new_issue = st.text_area("Describe the new issue:")
            if st.button("Submit"):
                # Save new issue to a file or database for future reference
                with open("new_issues.txt", "a") as f:
                    f.write(f"New issue: {new_issue}\n")
                st.write("Thank you! The issue has been added to the knowledge base.")
        
    st.write("Was the response helpful?")
    feedback = st.radio("Select feedback", ("Positive", "Negative"))
    if st.button("Submit Feedback"):
        # Save feedback to a file or database
        with open("feedback.txt", "a") as f:
            f.write(f"Query: {query}\nResponse: {response}\nFeedback: {feedback}\n\n")
        st.write("Thank you for your feedback!")

