import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import ChatHistorySidebar from './ChatHistorySidebar';
import { ChevronLeft, ChevronRight, Volume2, ThumbsUp, ThumbsDown, Copy} from 'lucide-react';
import '../styles/ChatPage.css';

const ChatPage = () => {
  const [query, setQuery] = useState("");
  const [chatSessions, setChatSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [googleId, setGoogleId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedbackStates, setFeedbackStates] = useState({});
  const [showEscalationPrompt, setShowEscalationPrompt] = useState(false);
  const navigate = useNavigate();

  const googleApiKey = sessionStorage.getItem("googleApiKey");

  useEffect(() => {
    const storedGoogleId = sessionStorage.getItem("googleId");
    if (storedGoogleId) {
      setGoogleId(storedGoogleId);
      fetchChatSessions(storedGoogleId);
    }
  }, []);

  useEffect(() => {
    if (!googleApiKey) {
      navigate('/');
    }
  }, [googleApiKey, navigate]);

  const fetchChatSessions = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8000/get_chat_sessions/${id}`);
      setChatSessions(response.data);
      if (response.data.length > 0) {
        setCurrentSession(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
    }
  };

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

  const handleFeedback = async (messageIndex, isPositive) => {
    const feedback = isPositive ? 'Positive' : 'Negative';
    const userMessage = currentSession.messages[messageIndex - 1].message;
    const botResponse = currentSession.messages[messageIndex].message;
  
    try {
      await axios.post("http://localhost:8000/feedback", {
        query: userMessage,
        response: botResponse,
        feedback: feedback
      });
  
      // Update feedback state
      setFeedbackStates(prev => ({
        ...prev,
        [messageIndex]: isPositive ? 'positive' : 'negative'
      }));
  
      console.log(`Feedback for message ${messageIndex}: ${feedback}`);
    } catch (error) {
      console.error("Error saving feedback:", error);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Optionally, show a "Copied!" message
      console.log("Text copied to clipboard");
    });
  };

  const handleNewChat = async () => {
    try {
      const response = await axios.post("http://localhost:8000/create_chat_session", {
        google_id: googleId,
        title: "New Chat"
      });
      const newSession = { id: response.data.session_id, title: response.data.title, messages: [] };
      setCurrentSession(newSession);
      setChatSessions([newSession, ...chatSessions]);
    } catch (error) {
      console.error("Error creating new chat session:", error);
    }
  };

  const handleSessionClick = (session) => {
    setCurrentSession(session);
  };

  const generateSessionTitle = async (query) => {
    try {
      const response = await axios.post("http://localhost:8000/generate_title", {
        apiKey: googleApiKey,
        query: query
      });
      return response.data.title;
    } catch (error) {
      console.error("Error generating session title:", error);
      return "New Chat";
    }
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!query.trim()) return;

    if (!currentSession) {
      await handleNewChat();
      return;
    }

    setIsLoading(true);
    const newUserMessage = { type: 'user', message: query };
    const updatedMessages = [...currentSession.messages, newUserMessage];
    setCurrentSession({ ...currentSession, messages: updatedMessages });

    try {
      const res = await axios.post("http://localhost:8000/chat", {
        apiKey: googleApiKey,
        question: query,
        sessionId: currentSession.id
      });

      let newBotMessage;
      if (!res.data.contextual) {
        const botResponse = formatBotResponse(res.data.answer);
        newBotMessage = { type: 'bot', message: botResponse };
        setShowEscalationPrompt(true);
      } else {
        const botResponse = formatBotResponse(res.data.answer);
        newBotMessage = { type: 'bot', message: botResponse };
        setShowEscalationPrompt(false);
      }

      const finalUpdatedMessages = [...updatedMessages, newBotMessage];
      setCurrentSession({ ...currentSession, messages: finalUpdatedMessages });

      if (currentSession.title === "New Chat") {
        const newTitle = await generateSessionTitle(query);
        setCurrentSession(prevSession => ({ ...prevSession, title: newTitle }));
        setChatSessions(prevSessions =>
          prevSessions.map(session =>
            session.id === currentSession.id ? { ...session, title: newTitle } : session
          )
        );
      }

      await axios.post("http://localhost:8000/add_chat_message", {
        session_id: currentSession.id,
        message_type: 'user',
        message: query
      });
      await axios.post("http://localhost:8000/add_chat_message", {
        session_id: currentSession.id,
        message_type: 'bot',
        message: res.data.answer
      });

      setChatSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === currentSession.id ? { ...session, messages: finalUpdatedMessages } : session
        )
      );

    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setCurrentSession({
        ...currentSession,
        messages: [...updatedMessages, { type: 'error', message: "Sorry, I couldn't process your request." }]
      });
    } finally {
      setIsLoading(false);
      setQuery("");
    }
  };

  const handleEscalation = (escalate) => {
    if (escalate) {
      // Redirect to escalation form page
      navigate('/escalate');
    } else {
      // Hide the Yes/No buttons
      setShowEscalationPrompt(false);
    }
  };

  const formatBotResponse = (response) => {
    const formattedResponse = response
      .replace(/```(\w+)?\n([\s\S]+?)```/g, (_, lang, code) => `<pre><code class="bot-code language-${lang || ''}">${code.trim()}</code></pre>`)
      .replace(/^###\s(.+)$/gm, '<h3 class="bot-header">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/^\s*[-*+]\s+(.+)$/gm, '<li class="bot-list-item">$1</li>')
      .replace(/^\s*(\d+\.)\s+(.+)$/gm, '<li class="bot-list-item">$2</li>');

    const paragraphs = formattedResponse.split('\n\n');
    return paragraphs.map(para => {
      if (para.startsWith('<li')) {
        return `<ul class="bot-list">${para}</ul>`;
      } else if (para.startsWith('<pre>')) {
        return para;
      } else {
        return `<p class="bot-paragraph">${para}</p>`;
      }
    }).join('');
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("googleApiKey");
    sessionStorage.removeItem("googleId");
    navigate('/');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  /*const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };*/

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
            <ChatHistorySidebar
              chatSessions={chatSessions}
              currentSession={currentSession}
              onSessionClick={handleSessionClick}
              onNewChat={handleNewChat}
            />
            <button className="toggle-sidebar" onClick={() => setIsSidebarOpen(false)}>
              <ChevronLeft size={24} />
            </button>
          </div>
        ) : (
          <button className="toggle-sidebar sidebar-closed" onClick={() => setIsSidebarOpen(true)}>
            <ChevronRight size={24} />
          </button>
        )}

        <div className="chat-main">
          <div className="chat-history">
          {currentSession && currentSession.messages.map((chat, index) => (
              <div key={index} className={`chat-message ${chat.type}`}>
                <strong>{chat.type === 'user' ? 'You: ' : 'Bot: '}</strong>
                {chat.type === 'bot' ? (
                 <>
                  <div className="bot-message-content">
                     <div dangerouslySetInnerHTML={{ __html: chat.message }} />
                  </div>
                 <div className="message-actions">
                   <button 
                     onClick={() => handleReadAloud(chat.message)}
                     title={isSpeaking ? "Stop Reading" : "Read Aloud"}
                   >
                     <Volume2 size={16} />
                   </button>
                   {feedbackStates[index] !== 'negative' && (
                        <button 
                          onClick={() => handleFeedback(index, true)}
                          title="Good response"
                          className={feedbackStates[index] === 'positive' ? 'selected' : ''}
                        >
                          <ThumbsUp size={16} />
                        </button>
                      )}
                      {feedbackStates[index] !== 'positive' && (
                        <button 
                          onClick={() => handleFeedback(index, false)}
                          title="Bad response"
                          className={feedbackStates[index] === 'negative' ? 'selected' : ''}
                        >
                          <ThumbsDown size={16} />
                        </button>
                      )}
                   <button 
                     onClick={() => handleCopy(chat.message)}
                     title="Copy message"
                   >
                     <Copy size={16} />
                   </button>
                 </div>
               </>
                ) : (
                  <div className="user-message-content">{chat.message}</div>
                )}
              </div>
            ))}
            {isLoading && <div className="chat-message bot"><strong>Bot:</strong> Thinking...</div>}

            {showEscalationPrompt && (
              <div className="escalation-prompt">
                <p>Would you like to raise this issue for further assistance?</p>
                <button onClick={() => handleEscalation(true)}>Yes</button>
                <button onClick={() => handleEscalation(false)}>No</button>
              </div>
            )}
          </div>
          <div className="chat-input">
            <textarea
              className='query-input'
              placeholder="Please feel free to inquire about any aspect of open-source software...."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleQuerySubmit(e);
                }
              }}
            />
            <button type="submit" className='send-option' disabled={isLoading}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;