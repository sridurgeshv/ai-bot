import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const navigate = useNavigate();

  const googleApiKey = sessionStorage.getItem("googleApiKey");

  useEffect(() => {
    if (!googleApiKey) {
      navigate('/');
    }
  }, [googleApiKey, navigate]);

  const handleQuerySubmit = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setChatHistory(prev => [...prev, { type: 'user', message: query }]);
    
    try {
      const res = await axios.post("http://localhost:8000/chat", {
        apiKey: googleApiKey,
        question: query
      });
      const botResponse = formatBotResponse(res.data.answer);
      setChatHistory(prev => [...prev, { type: 'bot', message: botResponse }]);
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setChatHistory(prev => [...prev, { type: 'error', message: "Sorry, I couldn't process your request." }]);
    } finally {
      setIsLoading(false);
      setQuery("");
    }
  };

  const formatBotResponse = (response) => {
    const formattedResponse = response
      .replace(/```(\w+)?\n([\s\S]+?)```/g, (_, lang, code) => `<code>${code.trim()}</code>`)
      .replace(/^###\s(.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
    const paragraphs = formattedResponse.split('\n\n');
    return paragraphs.map(para =>
      para.startsWith('- ') ? `<ul><li>${para.substring(2)}</li></ul>` : `<p>${para}</p>`
    ).join('');
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("googleApiKey");
    navigate('/');
  };

  const handleSettings = () => {
    // Implement settings functionality here
    console.log("Settings clicked");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>Self-Learning Tech Support Bot for Open-Source Software</h1>
        <div 
          className="sign-out-container" 
          onMouseEnter={() => setShowOptions(true)} 
          onMouseLeave={() => setShowOptions(false)}
        >
          <img src="/sign-out.png" alt="Sign out" className="sign-out-icon" />
          {showOptions && (
            <div className="sign-out-options">
              <button onClick={handleSignOut}>Sign out</button>
              <button onClick={handleSettings}>Settings</button>
            </div>
          )}
        </div>
      </div>
      <div className="chat-history">
        {chatHistory.map((chat, index) => (
          <div key={index} className={`chat-message ${chat.type}`}>
          <strong>{chat.type === 'user' ? 'You: ' : 'Bot: '}</strong>
          {chat.type === 'bot' ? (
            <div dangerouslySetInnerHTML={{ __html: chat.message }} />
          ) : (
            chat.message
          )}
        </div>
        ))}
        {isLoading && <div className="chat-message bot"><strong>Bot:</strong> Thinking...</div>}
      </div>
      <div className="chat-input">
        <textarea
          className='query-input'
          placeholder="Please feel free to inquire about any aspect of open-source software...."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleQuerySubmit()}
        />
        <button className='send-option' 
        onClick={handleQuerySubmit} disabled={isLoading}>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;