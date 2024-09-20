import React, { useState, useEffect, useCallback } from "react";
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
  const [error, setError] = useState(null);
  const [preferredName, setPreferredName] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();

  const googleApiKey = sessionStorage.getItem("googleApiKey");

  const fetchChatMessages = useCallback(async (sessionId) => {
    try {
      const response = await axios.get(`http://localhost:8000/get_chat_messages/${sessionId}`);
      setCurrentSession(prevSession => ({
        ...prevSession,
        messages: response.data
      }));
      setShowWelcome(response.data.length === 0);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      setError("Failed to fetch chat messages. Please try again.");
    }
  }, []);

  const fetchChatSessions = useCallback(async (id) => {
    try {
      const response = await axios.get(`http://localhost:8000/get_chat_sessions/${id}`);
      if (Array.isArray(response.data)) {
        setChatSessions(response.data);
        if (response.data.length > 0) {
          const lastSession = response.data[0];
          setCurrentSession(lastSession);
          fetchChatMessages(lastSession.id);
        } else {
          setShowWelcome(true);
        }
      } else {
        console.error("Unexpected response format:", response.data);
        setError("Failed to fetch chat sessions. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      setError("Failed to fetch chat sessions. Please try again.");
    }
  }, [fetchChatMessages]);

  useEffect(() => {
    const storedGoogleId = sessionStorage.getItem("googleId");
    const storedPreferredName = sessionStorage.getItem("preferredName");
    if (storedGoogleId) {
      setGoogleId(storedGoogleId);
      fetchChatSessions(storedGoogleId);
    } else {
      console.error("Google ID not found in session storage");
      alert("User not authenticated. Please log in.");
      navigate('/');
    }
    if (storedPreferredName) {
      setPreferredName(storedPreferredName);
    } else {
      const userName = sessionStorage.getItem("userName");
      setPreferredName(userName || "");
    }
  }, [navigate, fetchChatSessions]);

    useEffect(() => {
      if (!googleApiKey) {
        navigate('/');
      }
    }, [googleApiKey, navigate]);

    /*const fetchChatSessions = useCallback(async (id) => {
      try {
        const response = await axios.get(`http://localhost:8000/get_chat_sessions/${id}`);
        if (Array.isArray(response.data)) {
          setChatSessions(response.data);
          if (response.data.length > 0) {
            const lastSession = response.data[0];
            setCurrentSession(lastSession);
            fetchChatMessages(lastSession.id);
          } else {
            setShowWelcome(true);
          }
        } else {
          console.error("Unexpected response format:", response.data);
          setError("Failed to fetch chat sessions. Please try again.");
        }
      } catch (error) {
        console.error("Error fetching chat sessions:", error);
        setError("Failed to fetch chat sessions. Please try again.");
      }
    }, [fetchChatMessages]);

    const fetchChatMessages = useCallback(async (sessionId) => {
      try {
        const response = await axios.get(`http://localhost:8000/get_chat_messages/${sessionId}`);
        setCurrentSession(prevSession => ({
          ...prevSession,
          messages: response.data
        }));
        setShowWelcome(response.data.length === 0);
      } catch (error) {
        console.error("Error fetching chat messages:", error);
        setError("Failed to fetch chat messages. Please try again.");
      }
    }, []);*/

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
      if (!googleId) {
        throw new Error("Google ID is not available");
      }
      const response = await axios.post("http://localhost:8000/create_chat_session", {
        google_id: googleId,
        title: "New Chat"
      });
      const newSession = { id: response.data.session_id, title: response.data.title, messages: [] };
      setCurrentSession(newSession);
      setChatSessions(prevSessions => [newSession, ...(prevSessions || [])]);
      setQuery("");
      setShowWelcome(true); // Show welcome message for new chat
    } catch (error) {
      console.error("Error creating new chat session:", error);
      setError(`Failed to create a new chat session. ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleSessionClick = (session) => {
    setCurrentSession(session);
    fetchChatMessages(session.id);
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await axios.delete(`http://localhost:8000/delete_chat_session/${sessionId}`);
      setChatSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));
      if (currentSession && currentSession.id === sessionId) {
        setCurrentSession(null);
      }
    } catch (error) {
      console.error("Error deleting chat session:", error);
      setError("Failed to delete chat session. Please try again.");
    }
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
    e.preventDefault();
    if (!query.trim()) return;

    setShowWelcome(false); // Hide welcome message on first query

    if (!currentSession) {
        await handleNewChat();
        return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/chat", {
        apiKey: googleApiKey,
        question: query,
        sessionId: currentSession.id
      });

      const newUserMessage = { type: 'user', message: query };
      const newBotMessage = { type: 'bot', message: formatBotResponse(res.data.answer) };

      setCurrentSession(prevSession => ({
        ...prevSession,
        messages: [...(prevSession.messages || []), newUserMessage, newBotMessage]
      }));

      if (currentSession.title === "New Chat") {
        const newTitle = await generateSessionTitle(query);
        updateSessionTitle(currentSession.id, newTitle);
      }

      setQuery("");

      if (res.data.answer.toLowerCase().includes("the provided context doesn't contain information about")) {
        setShowEscalationPrompt(true);
      }
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setCurrentSession(prevSession => ({
        ...prevSession,
        messages: [...(prevSession.messages || []), { type: 'error', message: "An error occurred. Please try again." }]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const updateSessionTitle = async (sessionId, newTitle) => {
    try {
      await axios.put(`http://localhost:8000/update_chat_session/${sessionId}`, { title: newTitle });
      setCurrentSession(prevSession => ({ ...prevSession, title: newTitle }));
      setChatSessions(prevSessions =>
        prevSessions.map(session =>
          session.id === sessionId ? { ...session, title: newTitle } : session
        )
      );
    } catch (error) {
      console.error("Error updating session title:", error);
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
    // Format code blocks first
    response = response.replace(/```([\s\S]*?)```/g, (match, code) => {
      // Trim whitespace and remove language identifier if present
      code = code.trim().replace(/^\w+\n/, '');
      return `<pre><code>${escapeHtml(code)}</code></pre>`;
    });
  
    // Format inline code
    response = response.replace(/`([^`\n]+)`/g, (match, code) => {
      return `<code>${escapeHtml(code)}</code>`;
    });
  
    // Format command-like lines that aren't already in code blocks
    response = response.replace(/^(git\s+.*|npm\s+.*|yarn\s+.*)$/gm, (match) => {
      return `<pre><code>${escapeHtml(match)}</code></pre>`;
    });
  
    // Convert newlines to <br> tags, except within <pre> tags
    response = response.replace(/<pre>[\s\S]*?<\/pre>|([^\n])\n(?!\n)/g, (match, p1) => {
      return match.startsWith('<pre>') ? match : `${p1 || ''}<br>`;
    });
  
    // Format lists, bold, italic, etc.
    response = response
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^(\s*)-\s+(.+)$/gm, '$1<li>$2</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/^(\s*)\d+\.\s+(.+)$/gm, '$1<li>$2</li>')
      .replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
  
    return response;
  };
  
  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("googleApiKey");
    sessionStorage.removeItem("googleId");
    navigate('/');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

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
              onDeleteSession={handleDeleteSession}
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
              {showWelcome && (
                <div className="welcome-message">
                  <h2>
                    <span style={{color: '#4285F4'}}>Hello, </span>
                    <span style={{color: '#DB4437'}}>{preferredName.toUpperCase()}</span>
                  </h2>
                  <p style={{color: '#5F6368'}}>How can I help you today?</p>
                </div>
              )}
               {currentSession && currentSession.messages && currentSession.messages.map((chat, index) => (
                   <div key={index} className={`chat-message ${chat.type}`}>
                        <strong>{chat.type === 'user' ? 'You: ' : 'Bot: '}</strong>
                        {chat.type === 'bot' ? (
                         <>
                          <div 
                            className="bot-message-content" 
                            dangerouslySetInnerHTML={{ __html: formatBotResponse(chat.message) }} 
                          />
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
              <div className="escalation-buttons">
                <button onClick={() => handleEscalation(true)}>Yes</button>
                <button onClick={() => handleEscalation(false)}>No</button>
              </div>
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
                        <button onClick={handleQuerySubmit} className='send-option' disabled={isLoading}>Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;