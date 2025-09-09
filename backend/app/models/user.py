from sqlalchemy import Column, String, Boolean, Text, Enum, Integer, ForeignKey
from sqlalchemy.orm import relationship
import enum
from .base import BaseModel

class UserType(str, enum.Enum):
    CANDIDATE = "candidate"
    COMPANY = "company"
    ADMIN = "admin"

class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    user_type = Column(Enum(UserType), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Relacionamentos
    profile = relationship("Profile", back_populates="user", uselist=False)
    company = relationship("Company", back_populates="user", uselist=False)
    applications = relationship("Application", back_populates="candidate")

class Profile(BaseModel):
    __tablename__ = "profiles"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    phone = Column(String(20))
    bio = Column(Text)
    location = Column(String(255))
    linkedin_url = Column(String(500))
    github_url = Column(String(500))
    portfolio_url = Column(String(500))
    
    # Informações sobre deficiência
    has_disability = Column(Boolean, default=False)
    disability_type = Column(String(100))
    disability_description = Column(Text)
    accessibility_needs = Column(Text)
    experience_summary = Column(Text)
    
    # Relacionamentos
    user = relationship("User", back_populates="profile")

class Company(BaseModel):
    __tablename__ = "companies"
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    website = Column(String(500))
    industry = Column(String(100))
    size = Column(String(50))  # Ex: "1-10", "11-50", "51-200", etc.
    location = Column(String(255))
    is_inclusive = Column(Boolean, default=False)
    inclusion_policies = Column(Text)
    
    # Relacionamentos
    user = relationship("User", back_populates="company")
    jobs = relationship("Job", back_populates="company")

class Job(BaseModel):
    __tablename__ = "jobs"
    
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text)
    benefits = Column(Text)
    location = Column(String(255))
    remote_work = Column(Boolean, default=False)
    salary_min = Column(Integer)
    salary_max = Column(Integer)
    employment_type = Column(String(50))  # Ex: "full-time", "part-time", "contract"
    is_active = Column(Boolean, default=True)
    
    # Relacionamentos
    company = relationship("Company", back_populates="jobs")
    applications = relationship("Application", back_populates="job")
