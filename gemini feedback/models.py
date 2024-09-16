from sqlalchemy import Column, Integer, String,Boolean
from database import Base

class Escalation(Base):
    __tablename__ = "escalations"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, index=True)
    status = Column(String, default="pending")