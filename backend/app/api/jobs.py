from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import Optional, List
from datetime import datetime

from ..db.database import get_db
from ..models.user import User, Job, Company
from ..models.application import Application
from ..schemas.job import (
    Job as JobSchema,
    JobCreate,
    JobUpdate,
    JobFilter,
    ApplicationCreate,
    ApplicationResponse
)
from ..api.auth import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("/", response_model=List[JobSchema])
async def list_jobs(
    title: Optional[str] = Query(None, description="Filtrar por título da vaga"),
    location: Optional[str] = Query(None, description="Filtrar por localização"),
    remote_work: Optional[bool] = Query(None, description="Filtrar por trabalho remoto"),
    employment_type: Optional[str] = Query(None, description="Tipo de emprego"),
    salary_min: Optional[int] = Query(None, description="Salário mínimo"),
    salary_max: Optional[int] = Query(None, description="Salário máximo"),
    company_id: Optional[int] = Query(None, description="ID da empresa"),
    limit: int = Query(20, ge=1, le=100, description="Número de resultados por página"),
    offset: int = Query(0, ge=0, description="Número de resultados para pular"),
    db: Session = Depends(get_db)
):
    """Lista vagas com filtros opcionais"""
    
    query = db.query(Job).filter(Job.is_active == True)
    
    # Aplicar filtros
    if title:
        query = query.filter(Job.title.ilike(f"%{title}%"))
    
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    
    if remote_work is not None:
        query = query.filter(Job.remote_work == remote_work)
    
    if employment_type:
        query = query.filter(Job.employment_type == employment_type)
    
    if salary_min:
        query = query.filter(Job.salary_min >= salary_min)
    
    if salary_max:
        query = query.filter(Job.salary_max <= salary_max)
    
    if company_id:
        query = query.filter(Job.company_id == company_id)
    
    # Aplicar paginação
    jobs = query.offset(offset).limit(limit).all()
    
    # Adicionar informações da empresa e contagem de aplicações
    result = []
    for job in jobs:
        job_dict = {
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "requirements": job.requirements,
            "benefits": job.benefits,
            "location": job.location,
            "remote_work": job.remote_work,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "employment_type": job.employment_type,
            "company_id": job.company_id,
            "is_active": job.is_active,
            "created_at": job.created_at,
            "updated_at": job.updated_at,
            "company": None,
            "application_count": 0
        }
        
        # Buscar informações da empresa
        company = db.query(Company).filter(Company.id == job.company_id).first()
        if company:
            job_dict["company"] = {
                "id": company.id,
                "name": company.name,
                "industry": company.industry,
                "size": company.size,
                "location": company.location,
                "is_inclusive": company.is_inclusive
            }
        
        # Contar aplicações
        application_count = db.query(Application).filter(Application.job_id == job.id).count()
        job_dict["application_count"] = application_count
        
        result.append(job_dict)
    
    return result

@router.get("/{job_id}", response_model=JobSchema)
async def get_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    """Retorna detalhes de uma vaga específica"""
    
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vaga não encontrada"
        )
    
    # Buscar informações da empresa
    company = db.query(Company).filter(Company.id == job.company_id).first()
    company_info = None
    if company:
        company_info = {
            "id": company.id,
            "name": company.name,
            "description": company.description,
            "website": company.website,
            "industry": company.industry,
            "size": company.size,
            "location": company.location,
            "is_inclusive": company.is_inclusive,
            "inclusion_policies": company.inclusion_policies
        }
    
    # Contar aplicações
    application_count = db.query(Application).filter(Application.job_id == job.id).count()
    
    return {
        "id": job.id,
        "title": job.title,
        "description": job.description,
        "requirements": job.requirements,
        "benefits": job.benefits,
        "location": job.location,
        "remote_work": job.remote_work,
        "salary_min": job.salary_min,
        "salary_max": job.salary_max,
        "employment_type": job.employment_type,
        "company_id": job.company_id,
        "is_active": job.is_active,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
        "company": company_info,
        "application_count": application_count
    }

@router.post("/{job_id}/apply", response_model=ApplicationResponse)
async def apply_to_job(
    job_id: int,
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Permite um usuário se aplicar a uma vaga"""
    
    # Verificar se a vaga existe e está ativa
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vaga não encontrada ou inativa"
        )
    
    # Verificar se o usuário já se aplicou a esta vaga para evitar duplicatas
    existing_application = db.query(Application).filter(
        Application.candidate_id == current_user.id,
        Application.job_id == job_id
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Você já se aplicou a esta vaga"
        )
    
    # Criar nova instância do modelo Application
    application = Application(
        candidate_id=current_user.id,
        job_id=job_id,
        cover_letter=application_data.cover_letter,
        resume_url=application_data.resume_url,
        status="pending"
    )
    
    # Adicionar à sessão do banco de dados e fazer commit
    db.add(application)
    db.commit()
    db.refresh(application)
    
    # Buscar informações do candidato
    candidate_info = {
        "id": current_user.id,
        "email": current_user.email,
        "user_type": current_user.user_type
    }
    
    # Retornar mensagem de sucesso com status 201 Created
    return {
        "id": application.id,
        "candidate_id": application.candidate_id,
        "job_id": application.job_id,
        "status": application.status,
        "cover_letter": application.cover_letter,
        "resume_url": application.resume_url,
        "applied_at": application.applied_at,
        "candidate": candidate_info
    }

@router.get("/{job_id}/applications")
async def get_job_applications(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna as aplicações de uma vaga (apenas para a empresa dona da vaga)"""
    
    # Verificar se a vaga existe
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vaga não encontrada"
        )
    
    # Verificar se o usuário é a empresa dona da vaga
    company = db.query(Company).filter(Company.id == job.company_id).first()
    if not company or company.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Você não é dono desta vaga"
        )
    
    # Buscar aplicações
    applications = db.query(Application).filter(Application.job_id == job_id).all()
    
    result = []
    for app in applications:
        # Buscar informações do candidato
        candidate = db.query(User).filter(User.id == app.candidate_id).first()
        candidate_info = None
        if candidate:
            candidate_info = {
                "id": candidate.id,
                "email": candidate.email,
                "user_type": candidate.user_type
            }
        
        result.append({
            "id": app.id,
            "candidate_id": app.candidate_id,
            "job_id": app.job_id,
            "status": app.status,
            "cover_letter": app.cover_letter,
            "resume_url": app.resume_url,
            "applied_at": app.applied_at,
            "candidate": candidate_info
        })
    
    return {"applications": result}

@router.get("/my-applications")
async def get_my_applications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna as aplicações do candidato logado"""
    
    if current_user.user_type != "candidate":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas candidatos podem acessar este endpoint"
        )
    
    # Buscar aplicações do candidato
    applications = db.query(Application).filter(Application.candidate_id == current_user.id).all()
    
    result = []
    for app in applications:
        # Buscar informações da vaga
        job = db.query(Job).filter(Job.id == app.job_id).first()
        job_info = None
        if job:
            # Buscar informações da empresa
            company = db.query(Company).filter(Company.id == job.company_id).first()
            company_info = None
            if company:
                company_info = {
                    "id": company.id,
                    "name": company.name,
                    "industry": company.industry,
                    "location": company.location,
                    "is_inclusive": company.is_inclusive
                }
            
            job_info = {
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "location": job.location,
                "remote_work": job.remote_work,
                "salary_min": job.salary_min,
                "salary_max": job.salary_max,
                "employment_type": job.employment_type,
                "company": company_info
            }
        
        result.append({
            "id": app.id,
            "candidate_id": app.candidate_id,
            "job_id": app.job_id,
            "status": app.status,
            "cover_letter": app.cover_letter,
            "resume_url": app.resume_url,
            "applied_at": app.applied_at,
            "job": job_info
        })
    
    return {"applications": result}
