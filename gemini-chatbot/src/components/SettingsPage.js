import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SettingsPage.css'; // Add CSS as needed

const SettingsPage = () => {
  const navigate = useNavigate();

  const handleLogOut = () => {
    sessionStorage.removeItem('googleApiKey');
    navigate('/');
  };

  const handleClose = () => {
    navigate('/chat'); // Redirect to the chat page
  };

  return (
    <div className="settings-container">
      <button className="close-button" onClick={handleClose}>&times;</button>
      <h2>Settings</h2>
      <ul>
        <li onClick={() => navigate('/profile')}>Profile</li>
        <li onClick={() => navigate('/help')}>Help & Support</li>
        <li onClick={handleLogOut}>Log out</li>
      </ul>
    </div>
  );
};

export default SettingsPage;
