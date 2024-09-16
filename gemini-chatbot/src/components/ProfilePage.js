import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css'; // Add CSS as needed

const ProfilePage = () => {
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const navigate = useNavigate();

  const handleUpdate = () => {
    console.log(`Full Name: ${fullName}, Preferred Name: ${preferredName}`);
    // You can add logic here to save profile data
  };

    const handleBack = () => {
        navigate('/settings');
    };

    return (
        <div className="profile-container">
          <h2>Profile</h2>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>What should we call you?</label>
            <input
              type="text"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
            />
          </div>
          <button onClick={handleUpdate}>Update</button>
          <button onClick={handleBack}>back</button>
        </div>
      );      
};

export default ProfilePage;
