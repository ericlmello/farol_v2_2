from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime

class CompanyBase(BaseModel):
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    location: Optional[str] = None
    is_inclusive: bool = False
    inclusion_policies: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    location: Optional[str] = None
    is_inclusive: Optional[bool] = None
    inclusion_policies: Optional[str] = None

    @validator('website')
    def validate_website(cls, v):
        if v and not v.startswith(('http://', 'https://')):
            return f'https://{v}'
        return v

class CompanyInDB(CompanyBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Company(CompanyInDB):
    user: Optional[dict] = None
    job_count: Optional[int] = 0

class CompanyWithJobs(Company):
    jobs: Optional[List[dict]] = None

class CompanyStats(BaseModel):
    total_jobs: int
    active_jobs: int
    total_applications: int
    pending_applications: int
    accepted_applications: int
    rejected_applications: int

class ApplicationStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None
