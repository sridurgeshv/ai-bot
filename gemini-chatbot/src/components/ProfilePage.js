import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css'; // Add CSS as needed

const ProfilePage = () => {
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the fullName and preferredName from sessionStorage when the component loads
    const storedUserName = sessionStorage.getItem('userName');
    const storedPreferredName = sessionStorage.getItem('preferredName');
    
    if (storedUserName) {
      setFullName(storedUserName); // Set full name
      setPreferredName(storedPreferredName || storedUserName);  // Use preferredName if available, otherwise use fullName
    }
  }, []);

  const handleUpdate = () => {
    console.log(`Preferred Name: ${preferredName}`);
    sessionStorage.setItem('preferredName', preferredName);  // Store preferredName in sessionStorage
    alert('Preferred name updated!');
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
              disabled // fullname can't be edited
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
      <button onClick={handleBack}>Back</button>
    </div>
    );      
};

export default ProfilePage;
