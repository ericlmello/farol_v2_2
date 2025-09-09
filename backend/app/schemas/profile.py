from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class ProfileBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    has_disability: bool = False
    disability_type: Optional[str] = None
    disability_description: Optional[str] = None
    accessibility_needs: Optional[str] = None
    experience_summary: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    has_disability: Optional[bool] = None
    disability_type: Optional[str] = None
    disability_description: Optional[str] = None
    accessibility_needs: Optional[str] = None
    experience_summary: Optional[str] = None

class ProfileInDB(ProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Profile(ProfileInDB):
    pass

class ProfileWithUser(Profile):
    user: Optional[dict] = None

class CVAnalysisRequest(BaseModel):
    cv_text: str

class CVAnalysisResponse(BaseModel):
    analysis: str
    strengths: List[str]
    areas_for_improvement: List[str]
    suggested_skills: List[str]
    accessibility_notes: Optional[str] = None

class FileUploadResponse(BaseModel):
    filename: str
    file_path: str
    file_size: int
    message: str
