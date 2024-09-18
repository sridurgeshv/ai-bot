import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProfilePage.css'; // Add CSS as needed

const ProfilePage = () => {
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    //fetch full name from session storage when component loads
    const storedUserName = sessionStorage.getItem('userName');
    if (storedUserName) {
      setFullName(storedUserName); //Set fullname
      setPreferredName(storedUserName); //initially set preferred name to full name
      }
    }, []);

  const handleUpdate = () => {
    console.log(`Preferred Name: ${preferredName}`);
    sessionStorage.setItem('preferredName', preferredName); // store preferred name in session storage
    alert('Preferred name updated successfully!');
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
          <button onClick={handleBack}>back</button>
        </div>
      );      
};

export default ProfilePage;
