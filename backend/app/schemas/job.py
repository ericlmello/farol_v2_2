from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class EmploymentType(str, Enum):
    FULL_TIME = "full-time"
    PART_TIME = "part-time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    FREELANCE = "freelance"

class JobStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"
    DRAFT = "draft"

class JobBase(BaseModel):
    title: str
    description: str
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    location: Optional[str] = None
    remote_work: bool = False
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    employment_type: EmploymentType = EmploymentType.FULL_TIME

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    benefits: Optional[str] = None
    location: Optional[str] = None
    remote_work: Optional[bool] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    employment_type: Optional[EmploymentType] = None
    is_active: Optional[bool] = None

    @validator('salary_min', 'salary_max')
    def validate_salary(cls, v):
        if v is not None and v < 0:
            raise ValueError('Salário deve ser positivo')
        return v

    @validator('salary_max')
    def validate_salary_range(cls, v, values):
        if v is not None and 'salary_min' in values and values['salary_min'] is not None:
            if v < values['salary_min']:
                raise ValueError('Salário máximo deve ser maior que o mínimo')
        return v

class JobInDB(JobBase):
    id: int
    company_id: int
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Job(JobInDB):
    company: Optional[dict] = None
    application_count: Optional[int] = 0

class JobWithApplications(Job):
    applications: Optional[List[dict]] = None

class JobFilter(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    remote_work: Optional[bool] = None
    employment_type: Optional[EmploymentType] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    company_id: Optional[int] = None
    is_active: Optional[bool] = True
    limit: int = 20
    offset: int = 0

class ApplicationCreate(BaseModel):
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    candidate_id: int
    job_id: int
    status: str
    cover_letter: Optional[str] = None
    resume_url: Optional[str] = None
    applied_at: datetime
    candidate: Optional[dict] = None

    class Config:
        from_attributes = True
