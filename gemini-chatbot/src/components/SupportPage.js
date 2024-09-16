import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SupportPage.css"; // Ensure you have the relevant CSS file

const SupportPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/settings'); // Route to go back to settings page
  };

  return (
    <div className="support-container">
      <h1 className="support-title">Help & Support</h1>
      <section className="support-section introduction">
        <h2 className="support-heading">Introduction</h2>
        <p className="support-text">
        Our self-learning bot is specifically developed to assist users with comprehensive support for open-source software. By addressing technical queries, offering solutions, and recommending best practices, it ensures efficient problem-solving. Additionally, its adaptive learning capability allows it to continuously enhance its knowledge base, providing increasingly accurate and relevant responses as it evolves.
        </p>
      </section>

      <section className="support-section how-to-use">
        <h2 className="support-heading">How to Use the Bot</h2>
        <ol className="support-list">
          <li className="support-list-item">Type your query in the chat input area.</li>
          <li className="support-list-item">Press "Send" or hit "Enter" to submit your query.</li>
          <li className="support-list-item">Wait for the bot to process and respond.</li>
          <li className="support-list-item">You can review previous conversations by selecting them from the sidebar.</li>
        </ol>
      </section>

      <section className="support-section faq">
        <h2 className="support-heading">Frequently Asked Questions (FAQs)</h2>
        <ul className="support-list">
          <li className="support-list-item"><strong>What kind of questions can I ask the bot?</strong><br />
            You can ask any technical questions related to open-source software...
          </li>
          <li className="support-list-item"><strong>Why isn't the bot answering my query?</strong><br />
            Make sure you are asking specific, clear questions...
          </li>
        </ul>
      </section>

      <section className="support-section troubleshooting">
        <h2 className="support-heading">Troubleshooting</h2>
        <ul className="support-list">
          <li className="support-list-item"><strong>The bot is not responding.</strong><br />
            Ensure you are connected to the internet and refresh the page...
          </li>
          <li className="support-list-item"><strong>The response doesn’t make sense.</strong><br />
            The bot is learning continuously...
          </li>
        </ul>
      </section>

      <section className="support-section contact-support">
        <h2 className="support-heading">Contact Support</h2>
        <p className="support-text">
          If you need further assistance or would like to report a bug, please reach out to our support team at  
          <a href="mailto:ritikasrivastava456@gmail.com" className="support-link"> ritikasrivastava456@gmail.com</a>.
        </p>
      </section>

      <button className="support-back-button" onClick={handleBack}>Back to Settings</button>
    </div>
  );
};

export default SupportPage;
