from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CourseBase(BaseModel):
    title: str
    description: str
    duration: str
    level: str
    category: str
    is_recommended: bool = False

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[str] = None
    level: Optional[str] = None
    category: Optional[str] = None
    is_recommended: Optional[bool] = None

class Course(CourseBase):
    id: int
    progress: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LearningPathBase(BaseModel):
    title: str
    description: str
    courses: List[int]  # IDs dos cursos
    estimated_time: str

class LearningPathCreate(LearningPathBase):
    pass

class LearningPathUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    courses: Optional[List[int]] = None
    estimated_time: Optional[str] = None

class LearningPath(LearningPathBase):
    id: int
    progress: Optional[int] = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CourseProgress(BaseModel):
    course_id: int
    user_id: int
    progress: int  # 0-100
    completed_at: Optional[datetime] = None
    updated_at: datetime

class LearningPathProgress(BaseModel):
    learning_path_id: int
    user_id: int
    progress: int  # 0-100
    completed_at: Optional[datetime] = None
    updated_at: datetime

class UserProgress(BaseModel):
    user_id: int
    courses_completed: int
    courses_in_progress: int
    total_courses: int
    learning_paths_completed: int
    learning_paths_in_progress: int
    total_learning_paths: int
    overall_progress: int

