import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignInPage from "./components/SignInPage";
import ChatPage from "./components/ChatPage";
import SettingsPage from './components/SettingsPage';
import ProfilePage from './components/ProfilePage';
import SupportPage from "./components/SupportPage"; 
import EscalationForm from "./components/EscalationForm"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/escalate" element={<EscalationForm />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/help" element={<SupportPage />} /> 
      </Routes>
    </Router>
  );
}

export default App;
