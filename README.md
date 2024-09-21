# RAGTech Genius: AI-Powered Open-Source Support Assistant

## Overview

RAGTech Genius is an AI-powered technical support assistant for popular open-source technologies, including Apache, Git, Ubuntu, Node.js, and PostgreSQL also leveraging the cutting-edge Retrieval-Augmented Generation (RAG) technology. It integrates with Google’s Gemini AI, FastAPI, and Chroma for efficient knowledge retrieval, providing context-aware, multi-turn conversations. With features like secure Google OAuth2 authentication, interactive chat sessions, and text-to-speech, it streamlines user support 24/7.

## Key Features

- **Tech Support Bot**: Provides solutions to common issues in open-source software like Apache, Git, Ubuntu, Node.js, and PostgreSQL.

- **Chat Session Management**: Allows users to create, select, or delete chat sessions for different queries.

- **Chat History**: Users can view and interact with past chat sessions, enabling easy reference and continuity.

- **Text-to-Speech**: Bot responses can be read aloud using the browser's text-to-speech feature.

- **Feedback Mechanism**: Users can submit feedback on the bot's responses, helping improve its accuracy over time.

- **Responsive Sidebar**: Enables toggling the chat history sidebar for an uncluttered interface.

## Why Choose RAGTech Genius?

RAGTech Genius offers efficient, 24/7 open-source software support using advanced AI and RAG technology. It reduces human workload by answering complex queries, manages multi-turn chats with context-aware responses, and includes features like feedback, text-to-speech, and secure user authentication for an enhanced support experience.

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

1. Navigate to the backend directory in another terminal.

```bash
 cd gemini feedback
 ```

2. Create and activate a virtual environment:

```bash
 python -m venv venv
 .\venv\Scripts\activate
```

3. Install the required Dependencies:

```bash
 pip install -r requirements.txt
```

4. Start the backend server:

```bash
 uvicorn main:app --reload
```

### Database Initialization and Migration

After setting up the backend:

1. Initialize the database:

```bash
python init_db.py
```

2. Run database migrations:
```bash
alembic upgrade head
```

If you encounter any issues with existing migrations, you can reset the migration process: \
a. Backup your database (if it contains important data). \
b. Delete all files in the `alembic/versions/` directory. \
c. Create a new initial migration: 
```bash
alembic revision --autogenerate -m "Initial migration"
```
d. Apply the new migration:
```bash
alembic upgrade head
```

These steps ensure your database schema is up-to-date with the latest models.

## View the Application

Once both the frontend and backend are running, access the tool by navigating to `http://localhost:3000` in your browser.

## Video Demo

A [video demonstration](https://www.youtube.com/watch?v=Z67BFCcK6II) is available, showcasing how to use and navigate the RAGTech Genius. This walkthrough highlights its key features and provides guidance on interacting with the application effectively.