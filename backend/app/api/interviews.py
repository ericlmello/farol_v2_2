from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from ..db.database import get_db
from ..models.user import User
from ..api.auth import get_current_user
from ..schemas.interviews import Interview, InterviewResponse

router = APIRouter(prefix="/interviews", tags=["interviews"])

@router.get("/", response_model=List[InterviewResponse])
async def get_interviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna lista de entrevistas agendadas para o usuário logado"""
    
    # Log para confirmar sucesso da autenticação
    print(f'✅ Usuário {current_user.id} ({current_user.email}) acessou /interviews com sucesso')
    
    # Dados mockados - em produção viria do banco de dados
    mock_interviews = [
        {
            "id": 1,
            "job_title": "Desenvolvedor Frontend React",
            "company_name": "TechCorp Brasil",
            "company_logo": "https://via.placeholder.com/50x50/3B82F6/FFFFFF?text=TC",
            "interview_date": datetime.now() + timedelta(days=2, hours=14),
            "duration_minutes": 60,
            "interview_type": "Técnica",
            "meeting_link": "https://meet.google.com/abc-defg-hij",
            "meeting_id": "abc-defg-hij",
            "meeting_password": "123456",
            "status": "agendada",
            "location": "Remoto",
            "interviewer_name": "Maria Silva",
            "interviewer_role": "Tech Lead",
            "preparation_notes": "Prepare-se para discutir React, TypeScript e acessibilidade web",
            "requirements": [
                "Conhecimento em React e TypeScript",
                "Experiência com testes automatizados",
                "Conhecimento em acessibilidade web (WCAG)"
            ],
            "created_at": datetime.now() - timedelta(days=5)
        },
        {
            "id": 2,
            "job_title": "Analista de Acessibilidade Digital",
            "company_name": "InclusivaTech",
            "company_logo": "https://via.placeholder.com/50x50/10B981/FFFFFF?text=IT",
            "interview_date": datetime.now() + timedelta(days=5, hours=10),
            "duration_minutes": 45,
            "interview_type": "Comportamental",
            "meeting_link": "https://zoom.us/j/123456789",
            "meeting_id": "123456789",
            "meeting_password": "acessibilidade2024",
            "status": "agendada",
            "location": "Remoto",
            "interviewer_name": "Carlos Santos",
            "interviewer_role": "Gerente de Produto",
            "preparation_notes": "Foque em suas experiências com acessibilidade e inclusão digital",
            "requirements": [
                "Conhecimento em WCAG 2.1",
                "Experiência com auditorias de acessibilidade",
                "Conhecimento em tecnologias assistivas"
            ],
            "created_at": datetime.now() - timedelta(days=3)
        },
        {
            "id": 3,
            "job_title": "UX/UI Designer Inclusivo",
            "company_name": "DesignAcessível",
            "company_logo": "https://via.placeholder.com/50x50/8B5CF6/FFFFFF?text=DA",
            "interview_date": datetime.now() + timedelta(days=7, hours=15),
            "duration_minutes": 90,
            "interview_type": "Mista",
            "meeting_link": "https://teams.microsoft.com/l/meetup-join/123456789",
            "meeting_id": "123456789",
            "meeting_password": "design2024",
            "status": "agendada",
            "location": "Híbrido",
            "interviewer_name": "Ana Costa",
            "interviewer_role": "Head de Design",
            "preparation_notes": "Prepare um portfólio com projetos inclusivos e esteja pronto para um exercício prático",
            "requirements": [
                "Portfólio com projetos de design inclusivo",
                "Conhecimento em Figma e ferramentas de prototipação",
                "Experiência com user research inclusivo"
            ],
            "created_at": datetime.now() - timedelta(days=2)
        },
        {
            "id": 4,
            "job_title": "Engenheiro de Software Sênior",
            "company_name": "TechGiant Brasil",
            "company_logo": "https://via.placeholder.com/50x50/EF4444/FFFFFF?text=TG",
            "interview_date": datetime.now() + timedelta(days=10, hours=9),
            "duration_minutes": 120,
            "interview_type": "Técnica",
            "meeting_link": "https://meet.google.com/xyz-1234-abc",
            "meeting_id": "xyz-1234-abc",
            "meeting_password": "senior2024",
            "status": "agendada",
            "location": "Presencial",
            "interviewer_name": "Roberto Lima",
            "interviewer_role": "Engineering Manager",
            "preparation_notes": "Prepare-se para discussões sobre arquitetura de sistemas e liderança técnica",
            "requirements": [
                "Experiência com arquitetura de microserviços",
                "Conhecimento em AWS e Kubernetes",
                "Experiência em liderança de equipes técnicas"
            ],
            "created_at": datetime.now() - timedelta(days=1)
        }
    ]
    
    return mock_interviews

@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna detalhes de uma entrevista específica"""
    
    # Simular busca por entrevista específica
    mock_interviews = [
        {
            "id": 1,
            "job_title": "Desenvolvedor Frontend React",
            "company_name": "TechCorp Brasil",
            "company_logo": "https://via.placeholder.com/50x50/3B82F6/FFFFFF?text=TC",
            "interview_date": datetime.now() + timedelta(days=2, hours=14),
            "duration_minutes": 60,
            "interview_type": "Técnica",
            "meeting_link": "https://meet.google.com/abc-defg-hij",
            "meeting_id": "abc-defg-hij",
            "meeting_password": "123456",
            "status": "agendada",
            "location": "Remoto",
            "interviewer_name": "Maria Silva",
            "interviewer_role": "Tech Lead",
            "preparation_notes": "Prepare-se para discutir React, TypeScript e acessibilidade web",
            "requirements": [
                "Conhecimento em React e TypeScript",
                "Experiência com testes automatizados",
                "Conhecimento em acessibilidade web (WCAG)"
            ],
            "created_at": datetime.now() - timedelta(days=5)
        }
    ]
    
    interview = next((i for i in mock_interviews if i["id"] == interview_id), None)
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrevista não encontrada"
        )
    
    return interview

@router.post("/{interview_id}/join")
async def join_interview(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Registra que o usuário entrou na entrevista"""
    
    # Simular registro de entrada na entrevista
    return {
        "message": "Entrada na entrevista registrada com sucesso",
        "interview_id": interview_id,
        "user_id": current_user.id,
        "joined_at": datetime.now()
    }

