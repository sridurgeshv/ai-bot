import React from 'react';
import { PlusCircle } from 'lucide-react';
import '../styles/ChatHistorySidebar.css';

const ChatHistorySidebar = ({ chatSessions, currentSession, onSessionClick, onNewChat }) => {
  return (
    <div className="chat-history-sidebar">
      <h2>Chat History</h2>
      <button className="new-chat-button" onClick={onNewChat}>
        <PlusCircle size={24} /> New Chat
      </button>
      <div className="chat-sessions-list">
        {chatSessions.map((session) => (
          <div
            key={session.id}
            className={`chat-session ${currentSession && currentSession.id === session.id ? 'active' : ''}`}
            onClick={() => onSessionClick(session)}
          >
            {session.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistorySidebar;