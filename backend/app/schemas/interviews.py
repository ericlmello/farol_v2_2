from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Interview(BaseModel):
    id: int
    job_title: str
    company_name: str
    company_logo: Optional[str] = None
    interview_date: datetime
    duration_minutes: int
    interview_type: str
    meeting_link: str
    meeting_id: str
    meeting_password: str
    status: str
    location: str
    interviewer_name: str
    interviewer_role: str
    preparation_notes: str
    requirements: List[str]
    created_at: datetime

class InterviewResponse(BaseModel):
    id: int
    job_title: str
    company_name: str
    company_logo: Optional[str] = None
    interview_date: datetime
    duration_minutes: int
    interview_type: str
    meeting_link: str
    meeting_id: str
    meeting_password: str
    status: str
    location: str
    interviewer_name: str
    interviewer_role: str
    preparation_notes: str
    requirements: List[str]
    created_at: datetime

