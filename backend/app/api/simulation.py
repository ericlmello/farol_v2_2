from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from ..db.database import get_db
from ..models.user import User
from ..api.auth import get_current_user
from ..schemas.simulation import (
    SimulationConfig,
    SimulationSession,
    SimulationQuestion,
    SimulationResponse,
    SimulationResult,
    SimulationAnswer
)

router = APIRouter(prefix="/simulations", tags=["simulation"])

@router.post("/start", response_model=SimulationSession)
async def start_simulation(
    config: SimulationConfig,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Inicia uma nova sessão de simulação de entrevista"""
    
    # Validar configuração
    if not config.interview_type or not config.difficulty_level:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de entrevista e nível de dificuldade são obrigatórios"
        )
    
    # Simular criação de sessão de simulação
    session_id = f"sim_{current_user.id}_{int(datetime.now().timestamp())}"
    
    # Em produção, salvaria no banco de dados
    simulation_session = {
        "id": session_id,
        "user_id": current_user.id,
        "interview_type": config.interview_type,
        "difficulty_level": config.difficulty_level,
        "duration": config.duration,
        "interaction_mode": config.interaction_mode,
        "focus_areas": config.focus_areas,
        "status": "active",
        "current_question": 0,
        "total_questions": 6,  # Simulado
        "started_at": datetime.now(),
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    
    return simulation_session

@router.get("/pending", response_model=List[SimulationSession])
async def get_pending_simulations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna simulações pendentes (não concluídas) do usuário"""
    
    # Dados mockados de simulações pendentes
    # Em produção, buscaria no banco de dados simulações com status != "completed"
    mock_pending_simulations = [
        {
            "id": f"sim_{current_user.id}_{int(datetime.now().timestamp()) - 3600}",  # 1 hora atrás
            "user_id": current_user.id,
            "interview_type": "technical",
            "difficulty_level": "intermediate",
            "duration": "30",
            "interaction_mode": "text",
            "focus_areas": ["frontend", "javascript", "react"],
            "status": "active",
            "current_question": 2,
            "total_questions": 6,
            "started_at": datetime.now() - timedelta(hours=1),
            "created_at": datetime.now() - timedelta(hours=1),
            "updated_at": datetime.now() - timedelta(hours=1)
        },
        {
            "id": f"sim_{current_user.id}_{int(datetime.now().timestamp()) - 7200}",  # 2 horas atrás
            "user_id": current_user.id,
            "interview_type": "behavioral",
            "difficulty_level": "beginner",
            "duration": "15",
            "interaction_mode": "text",
            "focus_areas": ["soft_skills", "communication"],
            "status": "active",
            "current_question": 1,
            "total_questions": 4,
            "started_at": datetime.now() - timedelta(hours=2),
            "created_at": datetime.now() - timedelta(hours=2),
            "updated_at": datetime.now() - timedelta(hours=2)
        },
        {
            "id": f"sim_{current_user.id}_{int(datetime.now().timestamp()) - 1800}",  # 30 minutos atrás
            "user_id": current_user.id,
            "interview_type": "mixed",
            "difficulty_level": "advanced",
            "duration": "45",
            "interaction_mode": "voice",
            "focus_areas": ["fullstack", "architecture", "leadership"],
            "status": "active",
            "current_question": 3,
            "total_questions": 8,
            "started_at": datetime.now() - timedelta(minutes=30),
            "created_at": datetime.now() - timedelta(minutes=30),
            "updated_at": datetime.now() - timedelta(minutes=30)
        }
    ]
    
    return mock_pending_simulations

@router.get("/{session_id}", response_model=SimulationSession)
async def get_simulation_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna detalhes de uma sessão de simulação"""
    
    # Simular busca por sessão
    if not session_id.startswith(f"sim_{current_user.id}_"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sessão de simulação não encontrada"
        )
    
    # Retornar dados mockados da sessão
    return {
        "id": session_id,
        "user_id": current_user.id,
        "interview_type": "technical",
        "difficulty_level": "intermediate",
        "duration": "30",
        "interaction_mode": "text",
        "focus_areas": ["frontend", "backend"],
        "status": "active",
        "current_question": 2,
        "total_questions": 5,
        "started_at": datetime.now(),
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }

@router.get("/{session_id}/questions", response_model=List[SimulationQuestion])
async def get_simulation_questions(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna as perguntas da simulação"""
    
    # Simular perguntas baseadas na configuração
    mock_questions = [
        {
            "id": 1,
            "session_id": session_id,
            "question_text": "Explique a diferença entre let, const e var em JavaScript.",
            "question_type": "technical",
            "difficulty": "intermediate",
            "time_limit": 300,  # 5 minutos
            "order": 1,
            "created_at": datetime.now()
        },
        {
            "id": 2,
            "session_id": session_id,
            "question_text": "Como você lidaria com um conflito de merge no Git?",
            "question_type": "technical",
            "difficulty": "intermediate",
            "time_limit": 300,
            "order": 2,
            "created_at": datetime.now()
        },
        {
            "id": 3,
            "session_id": session_id,
            "question_text": "Descreva uma situação onde você teve que aprender uma nova tecnologia rapidamente.",
            "question_type": "behavioral",
            "difficulty": "intermediate",
            "time_limit": 300,
            "order": 3,
            "created_at": datetime.now()
        },
        {
            "id": 4,
            "session_id": session_id,
            "question_text": "Como você garante a acessibilidade em suas aplicações web?",
            "question_type": "technical",
            "difficulty": "intermediate",
            "time_limit": 300,
            "order": 4,
            "created_at": datetime.now()
        },
        {
            "id": 5,
            "session_id": session_id,
            "question_text": "Conte sobre um projeto desafiador que você trabalhou recentemente.",
            "question_type": "behavioral",
            "difficulty": "intermediate",
            "time_limit": 300,
            "order": 5,
            "created_at": datetime.now()
        }
    ]
    
    return mock_questions

@router.post("/{session_id}/respond", response_model=dict)
async def submit_answer(
    session_id: str,
    answer_data: SimulationAnswer,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submete uma resposta e retorna a próxima pergunta"""
    
    # Simular processamento da resposta e geração da próxima pergunta
    current_question = answer_data.current_question
    next_question = current_question + 1
    
    # Simular perguntas baseadas no progresso
    mock_questions = [
        {
            "id": 1,
            "question_text": "Olá! Vamos começar nossa entrevista. Primeiro, me conte um pouco sobre você e sua experiência profissional.",
            "question_type": "behavioral",
            "difficulty": "beginner",
            "time_limit": 300,
            "order": 1
        },
        {
            "id": 2,
            "question_text": "Excelente! Agora, me explique a diferença entre let, const e var em JavaScript.",
            "question_type": "technical",
            "difficulty": "intermediate",
            "time_limit": 300,
            "order": 2
        },
        {
            "id": 3,
            "question_text": "Muito bem! Como você lidaria com um conflito de merge no Git?",
            "question_type": "technical",
            "difficulty": "intermediate",
            "time_limit": 300,
            "order": 3
        },
        {
            "id": 4,
            "question_text": "Ótimo! Descreva uma situação onde você teve que aprender uma nova tecnologia rapidamente.",
            "question_type": "behavioral",
            "difficulty": "intermediate",
            "time_limit": 300,
            "order": 4
        },
        {
            "id": 5,
            "question_text": "Interessante! Como você garante a acessibilidade em suas aplicações web?",
            "question_type": "technical",
            "difficulty": "intermediate",
            "time_limit": 300,
            "order": 5
        },
        {
            "id": 6,
            "question_text": "Perfeito! Conte sobre um projeto desafiador que você trabalhou recentemente.",
            "question_type": "behavioral",
            "difficulty": "intermediate",
            "time_limit": 300,
            "order": 6
        }
    ]
    
    # Verificar se há próxima pergunta
    if next_question <= len(mock_questions):
        next_question_data = mock_questions[next_question - 1]
        is_complete = False
    else:
        next_question_data = None
        is_complete = True
    
    # Simular resposta da IA
    ai_feedback = f"Entendi sua resposta sobre: '{answer_data.answer_text[:50]}...'. "
    if next_question <= len(mock_questions):
        ai_feedback += "Vamos para a próxima pergunta!"
    else:
        ai_feedback += "Parabéns! Você completou todas as perguntas. Vamos analisar suas respostas."
    
    return {
        "response_id": f"resp_{session_id}_{current_question}_{int(datetime.now().timestamp())}",
        "ai_feedback": ai_feedback,
        "next_question": next_question_data,
        "is_complete": is_complete,
        "progress": {
            "current": next_question,
            "total": len(mock_questions)
        }
    }

@router.get("/{session_id}/feedback", response_model=dict)
async def get_simulation_feedback(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna o feedback detalhado da simulação"""
    
    # Simular análise e feedback
    feedback = {
        "session_id": session_id,
        "user_id": current_user.id,
        "overall_score": 85,
        "technical_score": 90,
        "behavioral_score": 80,
        "communication_score": 85,
        "accessibility_awareness": 95,
        "strengths": [
            "Conhecimento técnico sólido em JavaScript e Git",
            "Boa comunicação e clareza nas respostas",
            "Excelente consciência sobre acessibilidade web",
            "Experiência prática demonstrada em projetos",
            "Capacidade de aprendizado rápido"
        ],
        "areas_for_improvement": [
            "Prática com algoritmos complexos e estruturas de dados",
            "Experiência com arquiteturas de grande escala",
            "Conhecimento em testes automatizados avançados",
            "Experiência com DevOps e CI/CD",
            "Conhecimento em padrões de design avançados"
        ],
        "recommendations": [
            "Pratique problemas de algoritmos em plataformas como LeetCode",
            "Estude padrões de design e arquiteturas de software",
            "Explore ferramentas de teste como Jest, Cypress e Playwright",
            "Aprenda sobre Docker, Kubernetes e pipelines de CI/CD",
            "Continue desenvolvendo projetos inclusivos e acessíveis"
        ],
        "detailed_analysis": {
            "technical_skills": "Demonstrou conhecimento sólido em JavaScript, Git e desenvolvimento web. Mostrou boa compreensão de conceitos fundamentais.",
            "communication": "Comunicação clara e objetiva. Conseguiu explicar conceitos técnicos de forma compreensível.",
            "accessibility": "Excelente consciência sobre acessibilidade web. Demonstrou conhecimento prático em WCAG e desenvolvimento inclusivo.",
            "problem_solving": "Boa capacidade de resolução de problemas. Conseguiu abordar questões técnicas de forma estruturada."
        },
        "completed_at": datetime.now()
    }
    
    return feedback

@router.post("/{session_id}/complete", response_model=SimulationResult)
async def complete_simulation(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Finaliza uma simulação e retorna os resultados"""
    
    # Simular análise e resultados
    result = {
        "session_id": session_id,
        "user_id": current_user.id,
        "total_questions": 5,
        "answered_questions": 5,
        "overall_score": 85,
        "technical_score": 90,
        "behavioral_score": 80,
        "communication_score": 85,
        "accessibility_awareness": 95,
        "strengths": [
            "Conhecimento técnico sólido",
            "Boa comunicação",
            "Consciência sobre acessibilidade"
        ],
        "areas_for_improvement": [
            "Prática com algoritmos complexos",
            "Experiência com arquiteturas de grande escala"
        ],
        "recommendations": [
            "Pratique mais problemas de algoritmos",
            "Estude padrões de design avançados",
            "Continue desenvolvendo projetos inclusivos"
        ],
        "completed_at": datetime.now(),
        "created_at": datetime.now()
    }
    
    return result

@router.get("/user/history")
async def get_user_simulation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna o histórico de simulações do usuário"""
    
    # Dados mockados do histórico
    return {
        "user_id": current_user.id,
        "total_simulations": 3,
        "average_score": 82,
        "last_simulation": datetime.now(),
        "simulations": [
            {
                "id": "sim_1_1234567890",
                "interview_type": "technical",
                "difficulty_level": "intermediate",
                "score": 85,
                "completed_at": datetime.now(),
                "status": "completed"
            },
            {
                "id": "sim_1_1234567891",
                "interview_type": "behavioral",
                "difficulty_level": "beginner",
                "score": 78,
                "completed_at": datetime.now(),
                "status": "completed"
            },
            {
                "id": "sim_1_1234567892",
                "interview_type": "mixed",
                "difficulty_level": "advanced",
                "score": 83,
                "completed_at": datetime.now(),
                "status": "completed"
            }
        ]
    }

@router.get("/history")
async def get_simulation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna o histórico de simulações concluídas do usuário"""
    
    # Em produção, buscaria no banco de dados
    # Por enquanto, retornamos dados mockados
    history = [
        {
            "id": "sim_1_1234567890",
            "job_title": "Desenvolvedor(a) Frontend Acessível",
            "company_name": "InovaTech Soluções",
            "interview_type": "Técnica e Comportamental",
            "difficulty_level": "intermediate",
            "score": 85,
            "completed_at": "2024-01-15T10:30:00Z",
            "status": "completed",
            "type": "interview"
        },
        {
            "id": "sim_1_1234567891",
            "job_title": "Analista de Dados Pleno",
            "company_name": "DataDriven Corp",
            "interview_type": "Análise de Currículo",
            "difficulty_level": "beginner",
            "score": 78,
            "completed_at": "2024-01-10T14:20:00Z",
            "status": "completed",
            "type": "cv_analysis"
        },
        {
            "id": "sim_1_1234567892",
            "job_title": "Engenheiro(a) de Software Backend Sênior",
            "company_name": "ScaleUp Systems",
            "interview_type": "Técnica",
            "difficulty_level": "advanced",
            "score": 92,
            "completed_at": "2024-01-08T09:15:00Z",
            "status": "completed",
            "type": "interview"
        },
        {
            "id": "sim_1_1234567893",
            "job_title": "UX/UI Designer com Foco em Inclusão",
            "company_name": "Studio Criativo Inclusivo",
            "interview_type": "Comportamental",
            "difficulty_level": "intermediate",
            "score": 88,
            "completed_at": "2024-01-05T16:45:00Z",
            "status": "completed",
            "type": "interview"
        },
        {
            "id": "sim_1_1234567894",
            "job_title": "Product Manager",
            "company_name": "TechStart",
            "interview_type": "Análise de Currículo",
            "difficulty_level": "beginner",
            "score": 75,
            "completed_at": "2024-01-03T11:30:00Z",
            "status": "completed",
            "type": "cv_analysis"
        }
    ]
    
    return {
        "total": len(history),
        "simulations": history
    }
