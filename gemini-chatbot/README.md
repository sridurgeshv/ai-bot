## Self-Learning Bot for Open Source Software

# Overview

The ChatPage component is part of a self-learning tech support bot designed to assist users with issues related to open-source software. The bot can provide solutions and guidance on topics such as Apache, Git, Ubuntu, Node.js, and PostgreSQL. The component includes features like query handling, feedback submission, text-to-speech, and chat history management.

## Features

- **Tech Support Bot**: Answers questions related to Apache, Git, Ubuntu, Node.js, and PostgreSQL.

- **Chat Management**: Create, select, and delete chat sessions.

- **Chat History**: View and interact with past chat sessions and their messages.

- **Text-to-Speech**: Read bot responses aloud using the browser's speech synthesis.

- **Feedback System**: Submit feedback on bot responses to improve its performance.

- **Responsive Sidebar**: Toggle the visibility of the chat history sidebar.

## Usage

# Initialization

The component initializes by checking for a stored Google ID in session storage. If the ID is not found, it will redirect the user to the login page.

# Fetching Chat Sessions

On component mount, it retrieves chat sessions based on the stored Google ID and sets the current session if available.

# Handling Queries

Users can submit questions about Apache, Git, Ubuntu, Node.js, and PostgreSQL through a textarea input. If no session exists, a new chat session will be created. The bot’s responses will be displayed, and session titles will be updated if necessary.

## Session Management

New Chat: Create a new chat session for each new query.

Select Session: Click on a session in the sidebar to view its messages.

Delete Session: Remove a chat session from the list.

## Message Actions

 Read Aloud: Click the speaker icon to read the bot’s response aloud.
 
 Feedback: Provide feedback on the bot’s responses using thumbs up or down icons.
 
 Copy: Copy the bot’s message to the clipboard.

## Sign Out and Settings

Sign Out: Remove the Google API key and ID from session storage and navigate to the login page.

Settings: Navigate to the settings page for profile and account management.

## Why Choose Self Learning Bot?
A self-learning bot offers continuous improvement and adaptability, making it highly effective for tech support.By handling routine queries and learning from user feedback, it enhances efficiency and delivers personalized, accurate support for technologies like Apache, Git, Ubuntu, Node.js, and PostgreSQL. This leads to a more consistent and engaging user experience.

## Installation Instructions
To use Self learning bot locally, follow these steps:

### Clone the Repository

First, clone the repository from GitHub:
```bash
git clone https://github.com/sridurgeshv/ai-bot.git
```
## Frontend Setup
1. Navigate to the frontend directory in your terminal
   ```bash
    cd gemini-chatbot
   ```

2. Install the required node modules:
   ```bash
   npm install
   ```
3. Start the frontend application:
    ```bash
   npm start
 ```



Backend Setup

Navigate to the backend directory in another terminal.

  ```bash
cd gemini feedback
 ```

# Create a virtual environment: 

```bash
  python -m venv venv
 ```

# Activate the virtual environment:
```bash
.\venv\Scripts\activate
```

 # Install the required Dependencies:
```bash
 pip install -r requirements.txt
```

 # Start the backend server:
```bash
 uvicorn main:app --reload
```

# for database, we run :
```bash
 python init_db.py
```
## View the Application

 Once both the frontend and backend are running, you can view Self Learning bot in your browser by navigating to http://localhost:3000.

 ## Video Demo

 To see Productivity Hub in action, check out our video demonstration. The video provides an overview of the app's features and shows how to navigate and use the tool effectively.

   
   
   





