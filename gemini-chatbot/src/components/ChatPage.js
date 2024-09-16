import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import ChatHistorySidebar from './ChatHistorySidebar';
import { ChevronLeft, ChevronRight, Volume2, ThumbsUp, ThumbsDown, Copy } from 'lucide-react';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const navigate = useNavigate();

  const googleApiKey = sessionStorage.getItem("googleApiKey");

  useEffect(() => {
    if (!googleApiKey) {
      navigate('/');
    }
  }, [googleApiKey, navigate]);

// Handle text-to-speech for the bot response
const handleReadAloud = (text) => {
  if (isSpeaking) {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  } else {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }
};

const handleFeedback = (messageIndex, isPositive) => {
  // Implement feedback logic here
  console.log(`Feedback for message ${messageIndex}: ${isPositive ? 'positive' : 'negative'}`);
};

const handleCopy = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    // Optionally, show a "Copied!" message
    console.log("Text copied to clipboard");
  });
};

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
      // speakResponse(res.data.answer);
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

  // Update handleSettings function in ChatPage.js
  const handleSettings = () => {
    navigate('/settings');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
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

      <div className="chat-content">
        {isSidebarOpen ? (
          <div className="sidebar-container">
            <ChatHistorySidebar chatHistory={chatHistory} />
            <button className="toggle-sidebar" onClick={toggleSidebar}>
              <ChevronLeft size={24} />
            </button>
          </div>
        ) : (
          <button className="toggle-sidebar sidebar-closed" onClick={toggleSidebar}>
            <ChevronRight size={24} />
          </button>
        )}

        <div className="chat-main">
          <div className="chat-history">
            {chatHistory.map((chat, index) => (
              <div key={index} className={`chat-message ${chat.type}`}>
                <strong>{chat.type === 'user' ? 'You: ' : 'Bot: '}</strong>
                {chat.type === 'bot' ? (
                 <>
                 <div dangerouslySetInnerHTML={{ __html: chat.message }} />
                 <div className="message-actions">
                   <button 
                     onClick={() => handleReadAloud(chat.message)}
                     title={isSpeaking ? "Stop Reading" : "Read Aloud"}
                   >
                     <Volume2 size={16} />
                   </button>
                   <button 
                     onClick={() => handleFeedback(index, true)}
                     title="Good response"
                   >
                     <ThumbsUp size={16} />
                   </button>
                   <button 
                     onClick={() => handleFeedback(index, false)}
                     title="Bad response"
                   >
                     <ThumbsDown size={16} />
                   </button>
                   <button 
                     onClick={() => handleCopy(chat.message)}
                     title="Copy message"
                   >
                     <Copy size={16} />
                   </button>
                 </div>
               </>
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
            <button className='send-option' onClick={handleQuerySubmit} disabled={isLoading}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;