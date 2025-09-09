from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..db.database import get_db
from ..models.user import User
from ..api.auth import get_current_user
from ..schemas.matches import Match, MatchResponse

router = APIRouter(prefix="/matches", tags=["matches"])

@router.get("/", response_model=List[MatchResponse])
async def get_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna lista de matches para o usuário logado"""
    
    # Dados mockados - em produção viria do banco de dados
    mock_matches = [
        {
            "id": 1,
            "job_title": "Desenvolvedor Frontend React",
            "company_name": "TechCorp Brasil",
            "candidate_name": "Ana Silva",
            "compatibility_score": 92,
            "skills_tags": ["React", "TypeScript", "CSS", "Acessibilidade", "Jest"],
            "location": "São Paulo, SP",
            "work_model": "Híbrido",
            "salary_range": "R$ 6.000 - R$ 8.000",
            "match_reason": "Perfil técnico alinhado com 95% das habilidades requeridas",
            "created_at": datetime.now()
        },
        {
            "id": 2,
            "job_title": "Analista de Acessibilidade Digital",
            "company_name": "InclusivaTech",
            "candidate_name": "Carlos Santos",
            "compatibility_score": 88,
            "skills_tags": ["WCAG", "Auditoria", "UX/UI", "Testes", "Documentação"],
            "location": "Remoto",
            "work_model": "Remoto",
            "salary_range": "R$ 5.500 - R$ 7.500",
            "match_reason": "Especialização em acessibilidade e experiência com PCDs",
            "created_at": datetime.now()
        },
        {
            "id": 3,
            "job_title": "Desenvolvedor Full Stack",
            "company_name": "StartupInovadora",
            "candidate_name": "Maria Oliveira",
            "compatibility_score": 85,
            "skills_tags": ["Node.js", "React", "PostgreSQL", "Docker", "Git"],
            "location": "Rio de Janeiro, RJ",
            "work_model": "Presencial",
            "salary_range": "R$ 7.000 - R$ 9.000",
            "match_reason": "Stack tecnológico completo e experiência em startups",
            "created_at": datetime.now()
        },
        {
            "id": 4,
            "job_title": "UX/UI Designer Inclusivo",
            "company_name": "DesignAcessível",
            "candidate_name": "João Pereira",
            "compatibility_score": 90,
            "skills_tags": ["Figma", "Design System", "Acessibilidade", "Prototipação", "User Research"],
            "location": "São Paulo, SP",
            "work_model": "Híbrido",
            "salary_range": "R$ 6.500 - R$ 8.500",
            "match_reason": "Foco em design inclusivo e experiência com usuários PCDs",
            "created_at": datetime.now()
        },
        {
            "id": 5,
            "job_title": "Engenheiro de Software Sênior",
            "company_name": "TechGiant Brasil",
            "candidate_name": "Fernanda Costa",
            "compatibility_score": 87,
            "skills_tags": ["Python", "AWS", "Microserviços", "Kubernetes", "CI/CD"],
            "location": "São Paulo, SP",
            "work_model": "Híbrido",
            "salary_range": "R$ 12.000 - R$ 15.000",
            "match_reason": "Experiência sólida em arquitetura e liderança técnica",
            "created_at": datetime.now()
        },
        {
            "id": 6,
            "job_title": "Product Manager",
            "company_name": "ProdutoInclusivo",
            "candidate_name": "Roberto Lima",
            "compatibility_score": 83,
            "skills_tags": ["Product Strategy", "Agile", "Analytics", "Stakeholder Management", "Acessibilidade"],
            "location": "Remoto",
            "work_model": "Remoto",
            "salary_range": "R$ 10.000 - R$ 13.000",
            "match_reason": "Experiência em produtos inclusivos e metodologias ágeis",
            "created_at": datetime.now()
        }
    ]
    
    return mock_matches

@router.get("/{match_id}", response_model=MatchResponse)
async def get_match(
    match_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna detalhes de um match específico"""
    
    # Simular busca por match específico
    mock_matches = [
        {
            "id": 1,
            "job_title": "Desenvolvedor Frontend React",
            "company_name": "TechCorp Brasil",
            "candidate_name": "Ana Silva",
            "compatibility_score": 92,
            "skills_tags": ["React", "TypeScript", "CSS", "Acessibilidade", "Jest"],
            "location": "São Paulo, SP",
            "work_model": "Híbrido",
            "salary_range": "R$ 6.000 - R$ 8.000",
            "match_reason": "Perfil técnico alinhado com 95% das habilidades requeridas",
            "created_at": datetime.now()
        }
    ]
    
    match = next((m for m in mock_matches if m["id"] == match_id), None)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Match não encontrado"
        )
    
    return match

