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
    if (name) {
      setUserName(name);
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
    sessionStorage.setItem("googleApiKey", apiKey);
    navigate("/chat");
  };

  return (
    <div className="sign-in-container" style={{backgroundImage: `url(${backgroundImage})`}}>
      <h2>Welcome to the Tech Support Bot</h2>
      {userName ? (
        <>
          <p>Hello, {userName}!</p>
          <p>
            You need to get a Gemini API key from{" "}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Gemini API key</a>
            {" "}and enter the key below.
          </p>
          <input
            className='api-input'
            type="text"
            placeholder="Enter Gemini API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <button onClick={handleSubmitApiKey}>Submit</button>
        </>
      ) : (
        <button className="signin-button"
        onClick={handleGoogleSignIn}>Sign in with Google</button>
      )}
    </div>
  );
};

export default SignInPage;