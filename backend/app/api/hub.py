from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..db.database import get_db
from ..models.user import User
from ..api.auth import get_current_user
from ..schemas.hub import (
    Course as CourseSchema,
    LearningPath as LearningPathSchema,
    CourseProgress,
    LearningPathProgress
)

router = APIRouter(prefix="/hub", tags=["development-hub"])

@router.get("/courses", response_model=List[CourseSchema])
async def get_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna lista de cursos disponíveis"""
    
    # Dados mockados - em produção viria do banco de dados
    mock_courses = [
        {
            "id": 1,
            "title": "Fundamentos de React",
            "description": "Aprenda os conceitos básicos do React, componentes, props e estado.",
            "duration": "4 semanas",
            "level": "Iniciante",
            "category": "Desenvolvimento Frontend",
            "progress": 75,
            "is_recommended": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 2,
            "title": "Acessibilidade Web",
            "description": "Desenvolva interfaces inclusivas seguindo as diretrizes WCAG.",
            "duration": "3 semanas",
            "level": "Intermediário",
            "category": "Acessibilidade",
            "progress": 0,
            "is_recommended": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 3,
            "title": "TypeScript Avançado",
            "description": "Domine TypeScript com tipos avançados, generics e decorators.",
            "duration": "5 semanas",
            "level": "Avançado",
            "category": "Desenvolvimento Frontend",
            "progress": 30,
            "is_recommended": False,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 4,
            "title": "Comunicação Eficaz",
            "description": "Melhore suas habilidades de comunicação em ambiente profissional.",
            "duration": "2 semanas",
            "level": "Iniciante",
            "category": "Soft Skills",
            "progress": 100,
            "is_recommended": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]
    
    return mock_courses

@router.get("/learning-paths", response_model=List[LearningPathSchema])
async def get_learning_paths(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna trilhas de aprendizagem disponíveis"""
    
    # Dados mockados - em produção viria do banco de dados
    mock_learning_paths = [
        {
            "id": 1,
            "title": "Trilha Frontend Inclusivo",
            "description": "Desenvolva interfaces acessíveis e inclusivas com as melhores práticas.",
            "courses": [1, 2, 3],  # IDs dos cursos
            "progress": 60,
            "estimated_time": "12 semanas",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        {
            "id": 2,
            "title": "Trilha Soft Skills",
            "description": "Desenvolva habilidades interpessoais essenciais para o mercado de trabalho.",
            "courses": [4],  # IDs dos cursos
            "progress": 100,
            "estimated_time": "4 semanas",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]
    
    return mock_learning_paths

@router.get("/courses/{course_id}", response_model=CourseSchema)
async def get_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna detalhes de um curso específico"""
    
    # Simular busca por curso específico
    if course_id not in [1, 2, 3, 4]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso não encontrado"
        )
    
    # Retornar dados mockados do curso
    mock_courses = {
        1: {
            "id": 1,
            "title": "Fundamentos de React",
            "description": "Aprenda os conceitos básicos do React, componentes, props e estado.",
            "duration": "4 semanas",
            "level": "Iniciante",
            "category": "Desenvolvimento Frontend",
            "progress": 75,
            "is_recommended": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        2: {
            "id": 2,
            "title": "Acessibilidade Web",
            "description": "Desenvolva interfaces inclusivas seguindo as diretrizes WCAG.",
            "duration": "3 semanas",
            "level": "Intermediário",
            "category": "Acessibilidade",
            "progress": 0,
            "is_recommended": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        3: {
            "id": 3,
            "title": "TypeScript Avançado",
            "description": "Domine TypeScript com tipos avançados, generics e decorators.",
            "duration": "5 semanas",
            "level": "Avançado",
            "category": "Desenvolvimento Frontend",
            "progress": 30,
            "is_recommended": False,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        },
        4: {
            "id": 4,
            "title": "Comunicação Eficaz",
            "description": "Melhore suas habilidades de comunicação em ambiente profissional.",
            "duration": "2 semanas",
            "level": "Iniciante",
            "category": "Soft Skills",
            "progress": 100,
            "is_recommended": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    }
    
    return mock_courses[course_id]

@router.post("/courses/{course_id}/progress", response_model=CourseProgress)
async def update_course_progress(
    course_id: int,
    progress_data: CourseProgress,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza o progresso de um curso"""
    
    # Simular atualização de progresso
    if course_id not in [1, 2, 3, 4]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso não encontrado"
        )
    
    # Em produção, salvaria no banco de dados
    return {
        "course_id": course_id,
        "user_id": current_user.id,
        "progress": progress_data.progress,
        "completed_at": datetime.now() if progress_data.progress == 100 else None,
        "updated_at": datetime.now()
    }

@router.get("/user/progress")
async def get_user_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna o progresso do usuário em cursos e trilhas"""
    
    # Dados mockados do progresso do usuário
    return {
        "user_id": current_user.id,
        "courses_completed": 1,
        "courses_in_progress": 2,
        "total_courses": 4,
        "learning_paths_completed": 1,
        "learning_paths_in_progress": 1,
        "total_learning_paths": 2,
        "overall_progress": 65
    }

