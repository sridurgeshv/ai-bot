import React, { useState } from 'react';
import '../styles/ChatHistorySidebar.css';

const ChatHistorySidebar = ({ chatHistory }) => {
  const [expandedIssues, setExpandedIssues] = useState({});

  const toggleIssue = (index) => {
    setExpandedIssues((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="chat-history-sidebar">
      <h2>Chat History</h2>
      {chatHistory.map((chat, index) => (
        <div key={index} className="chat-history-item">
          {chat.type === 'user' && (
            <>
              <div 
                className="issue-title" 
                onClick={() => toggleIssue(index)}
              >
                {chat.message.slice(0, 50)} {/* Trimming to show title */}
                {expandedIssues[index] ? ' ▲' : ' ▼'}
              </div>
              {expandedIssues[index] && (
                <div className="chat-details">
                  <div className="user-message">
                    <strong>You:</strong> {chat.message}
                  </div>
                  <div className="bot-response">
                    <strong>Bot:</strong> 
                    <div dangerouslySetInnerHTML={{ __html: chatHistory[index + 1]?.message }} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatHistorySidebar;