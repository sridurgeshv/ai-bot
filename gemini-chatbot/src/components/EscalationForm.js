import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/EscalationForm.css';

const EscalateForm = () => {
    const [question, setQuestion] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:8000/escalate', { question });
            setMessage(response.data.message);
            setError('');
            // Set a timeout to redirect after 5 seconds
            setTimeout(() => {
                navigate('/chat');
            }, 5000);
        } catch (err) {
            setError('Failed to escalate the issue. Please try again.');
            setMessage('');
        }
    };

    return (
        <div className="escalate-form-container">
            <h1>Escalate Your Issue</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="question">Describe the issue:</label>
                    <textarea
                        id="question"
                        className="escalate-form-container"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Submit</button>
            </form>
            {message && (
                <div className="message-container">
                    <p className="green">{message}</p>
                    <p className="msg">Redirecting to chat in 5 seconds...</p>
                </div>
            )}
            {error && <p className="red">{error}</p>}
        </div>
    );
};

export default EscalateForm;
