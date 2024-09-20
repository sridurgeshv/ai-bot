# AI-Driven Open Source Support Bot: Bridging User Queries with Expert Insights

## Overview

This tool is an AI-Driven Open Source Support Bot designed to assist users with troubleshooting and guidance for popular open-source technologies, including Apache, Git, Ubuntu, Node.js, and PostgreSQL. The bot efficiently addresses a wide range of user queries and escalates unresolved issues to backend developers for further training. By combining automated responses with human expertise, it provides a streamlined and effective support experience that continually evolves based on user interactions.

## Key Features

- **Tech Support Bot**: Provides solutions to common issues in open-source software like Apache, Git, Ubuntu, Node.js, and PostgreSQL.

- **Chat Session Management**: Allows users to create, select, or delete chat sessions for different queries.

- **Chat History**: Users can view and interact with past chat sessions, enabling easy reference and continuity.

- **Text-to-Speech**: Bot responses can be read aloud using the browser's text-to-speech feature.

- **Feedback Mechanism**: Users can submit feedback on the bot's responses, helping improve its accuracy over time.

- **Responsive Sidebar**: Enables toggling the chat history sidebar for an uncluttered interface.

## Why Choose the AI-Driven Open Source Support Bot?

This tool harnesses advanced AI technology to enhance its support capabilities, continuously evolving through user feedback. It ensures that tech support is responsive, personalized, and adaptable to changing needs. Whether addressing routine queries or tackling complex issues, the bot streamlines the support process for key technologies, delivering accurate, on-demand assistance. Its combination of automation and human expertise guarantees a consistent and reliable user experience.

## Installation Instructions

The component initializes by checking for a stored Google ID in session storage. If the ID is not found, it will redirect the user to the login page.

### Clone the Repository

First, clone the repository from GitHub:
```bash
git clone https://github.com/sridurgeshv/ai-bot.git
```

### Frontend Setup
1. Navigate to the frontend directory in your terminal
   ```bash
    cd gemini-chatbot
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the frontend application:
   ```bash
   npm start
   ```

### Backend Setup

### 1.Navigate to the backend directory in another terminal.

```bash
cd gemini feedback
 ```

### 2.Create and activate a virtual environment:

```bash
python -m venv venv
.\venv\Scripts\activate
```

### 3.Install the required Dependencies:

```bash
 pip install -r requirements.txt
```

### 4.Start the backend server:

```bash
 uvicorn main:app --reload
```

### Database Initialization

- To set up the database:

```bash
 python init_db.py
```
## View the Application

Once both the frontend and backend are running, access the tool by navigating to `http://localhost:3000` in your browser.

## Video Demo

A [video demonstration](https://www.awesomescreenshot.com/video/31713673?key=ad8472ceee9ef30258cd8508bc374606) is available, showcasing how to use and navigate the Self-Learning Bot. This walkthrough highlights its key features and provides guidance on interacting with the application effectively.