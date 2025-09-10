from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class SimulationConfig(BaseModel):
    interview_type: str  # technical, behavioral, mixed, case_study
    difficulty_level: str  # beginner, intermediate, advanced, expert
    duration: str  # 15, 30, 45, 60 (minutos)
    interaction_mode: str  # text, voice
    focus_areas: List[str]  # frontend, backend, fullstack, etc. - OBRIGATÓRIO

class SimulationSession(BaseModel):
    id: str
    user_id: int
    interview_type: str
    difficulty_level: str
    duration: str
    interaction_mode: str  # text, voice
    focus_areas: List[str]
    status: str  # active, completed, paused
    current_question: int
    total_questions: int
    started_at: datetime
    created_at: datetime
    updated_at: datetime

class SimulationQuestion(BaseModel):
    id: int
    session_id: str
    question_text: str
    question_type: str  # technical, behavioral, case_study
    difficulty: str
    time_limit: int  # segundos
    order: int
    created_at: datetime

class SimulationResponse(BaseModel):
    id: str
    session_id: str
    question_id: int
    user_id: int
    answer_text: str
    audio_url: Optional[str] = None
    submitted_at: datetime
    created_at: datetime

class SimulationResult(BaseModel):
    session_id: str
    user_id: int
    total_questions: int
    answered_questions: int
    overall_score: int  # 0-100
    technical_score: int  # 0-100
    behavioral_score: int  # 0-100
    communication_score: int  # 0-100
    accessibility_awareness: int  # 0-100
    strengths: List[str]
    areas_for_improvement: List[str]
    recommendations: List[str]
    completed_at: datetime
    created_at: datetime

class SimulationHistory(BaseModel):
    user_id: int
    total_simulations: int
    average_score: int
    last_simulation: datetime
    simulations: List[dict]

class SimulationAnswer(BaseModel):
    answer_text: str
    current_question: int = 0
