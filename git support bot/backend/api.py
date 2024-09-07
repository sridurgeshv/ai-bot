from flask import Flask, request, jsonify
from rag import GitRAG
from models import get_gemini_response 

app = Flask(__name__)

# Initialize the RAG engine (load data and TF-IDF)
rag_engine = GitRAG()

@app.route('/api/ask', methods=['POST'])
def ask_bot():
    """Handles user queries and returns the bot's response."""

    user_query = request.json.get('query')
    if not user_query:
        return jsonify({'error': 'Missing query'}), 400

    # 1. Retrieve relevant information using RAG
    context = rag_engine.retrieve_relevant_info(user_query)

    # 2. Format the prompt for Gemini Pro
    prompt = f"""
    You are a helpful tech support bot specializing in Git.
    A user is asking the following question:
    {user_query}

    Here's some relevant information from Git documentation:
    {context}

    Please provide a concise and helpful answer to the user's question.
    """

    # 3. Get the response from Gemini Pro
    try:
        response_text = get_gemini_response(prompt)
        return jsonify({'response': response_text})
    except Exception as e:
        print(f"Error during Gemini Pro API call: {e}") 
        return jsonify({'error': 'An error occurred'}), 500

if __name__ == '__main__':
    app.run(debug=True)