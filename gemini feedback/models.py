from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, index=True)
    status = Column(String, default="pending")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String, unique=True, index=True)
    name = Column(String)
    chat_histories = relationship("ChatHistory", back_populates="user")

class ChatHistory(Base):
    __tablename__ = "chat_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message_type = Column(String)  # 'user' or 'bot'
    message = Column(Text)
    timestamp = Column(String)

    user = relationship("User", back_populates="chat_histories")