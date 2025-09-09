from sqlalchemy import Column, String, Text, Enum, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from .base import BaseModel

class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"
    INTERVIEW = "interview"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class Application(BaseModel):
    __tablename__ = "applications"
    
    candidate_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)
    cover_letter = Column(Text)
    resume_url = Column(String(500))
    applied_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos
    candidate = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
