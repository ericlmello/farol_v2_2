from sqlalchemy import Column, String, Text, Integer, ForeignKey, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import BaseModel

class Course(BaseModel):
    __tablename__ = "courses"
    
    title = Column(String(255), nullable=False)
    description = Column(Text)
    content = Column(Text)
    duration_hours = Column(Integer)
    difficulty_level = Column(String(50))  # Ex: "beginner", "intermediate", "advanced"
    category = Column(String(100))  # Ex: "programming", "soft-skills", "accessibility"
    is_active = Column(Boolean, default=True)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relacionamentos
    creator = relationship("User")

class InterviewSimulation(BaseModel):
    __tablename__ = "interview_simulations"
    
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_title = Column(String(255), nullable=False)
    company_name = Column(String(255))
    questions = Column(Text)  # JSON string com as perguntas
    answers = Column(Text)    # JSON string com as respostas
    feedback = Column(Text)   # Feedback gerado pela IA
    score = Column(Integer)   # Pontuação de 0 a 100
    completed_at = Column(DateTime(timezone=True))
    
    # Relacionamentos
    candidate = relationship("User")
