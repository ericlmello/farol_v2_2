from pydantic import BaseModel
from typing import List
from datetime import datetime

class Match(BaseModel):
    id: int
    job_title: str
    company_name: str
    candidate_name: str
    compatibility_score: int  # 0-100
    skills_tags: List[str]
    location: str
    work_model: str
    salary_range: str
    match_reason: str
    created_at: datetime

class MatchResponse(BaseModel):
    id: int
    job_title: str
    company_name: str
    candidate_name: str
    compatibility_score: int
    skills_tags: List[str]
    location: str
    work_model: str
    salary_range: str
    match_reason: str
    created_at: datetime

