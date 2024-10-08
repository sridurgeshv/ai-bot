import React, { useState, useEffect } from 'react';
import backgroundImage from '../assets/bg.jpg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SignInPage.css';

const SignInPage = () => {
  const [apiKey, setApiKey] = useState("");
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('userName');
    const googleId = urlParams.get('googleId');
    if (name) {
      setUserName(name);
      sessionStorage.setItem("userName", name);
      if (googleId) {
        sessionStorage.setItem("googleId", googleId);
      }
    }
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const response = await axios.get("http://localhost:8000/login");
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const handleSubmitApiKey = () => {
    const correctApiKey = "AIzaSyDIS5jHYWNaw0De2tcpXQAgPx2DQqOCvSg";
    if (apiKey === correctApiKey) {
      sessionStorage.setItem("googleApiKey", apiKey);
      navigate("/chat");
    } else {
      alert("Invalid API key. Please enter the correct key.");
    }
  };

  return (
    <div className="sign-in-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
      {userName ? (
        <div className="content-container">
          <h3>Hello, {userName}!</h3>
          <p>
            You need to use this Gemini API key for testing: <strong>AIzaSyDIS5jHYWNaw0De2tcpXQAgPx2DQqOCvSg</strong>.
            Please enter the key below.
          </p>
          <input
            className='api-input'
            type="text"
            placeholder="Enter Gemini API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button onClick={handleSubmitApiKey}>Submit</button>
        </div>
      ) : (
        <button className="signin-button" onClick={handleGoogleSignIn}>Sign in with Google</button>
      )}
    </div>
  );
};

export default SignInPage;