import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const apiResponse = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await apiResponse.json();

      if (apiResponse.ok) {
        setResponse(data.response);
      } else {
        setResponse(`Error: ${data.error}`);
      }
    } catch (error) {
      setResponse('An error occurred. Please try again later.'); 
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>Git Support Chatbot</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="query">Ask me anything about Git:</label>
          <input 
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Thinking..." : "Submit"} 
        </button>
      </form>

      {response && (
        <div className="response">
          <h2>Bot's Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;