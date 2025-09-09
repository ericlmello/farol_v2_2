from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..db.database import get_db
from ..models.user import User, Company, Job
from ..models.application import Application
from ..schemas.company import (
    Company as CompanySchema,
    CompanyCreate,
    CompanyUpdate,
    CompanyStats,
    ApplicationStatusUpdate
)
from ..schemas.job import Job as JobSchema, JobCreate, JobUpdate
from ..api.auth import get_current_user

router = APIRouter(prefix="/company", tags=["company"])

@router.get("/profile", response_model=CompanySchema)
async def get_company_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna o perfil da empresa do usuário logado"""
    
    if current_user.user_type != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas empresas podem acessar este endpoint"
        )
    
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    
    if not company:
        # Criar perfil padrão da empresa se não existir
        company = Company(
            user_id=current_user.id,
            name="",
            description="",
            website="",
            industry="",
            size="",
            location="",
            is_inclusive=False,
            inclusion_policies=""
        )
        db.add(company)
        db.commit()
        db.refresh(company)
    
    # Contar vagas
    job_count = db.query(Job).filter(Job.company_id == company.id).count()
    
    return {
        "id": company.id,
        "user_id": company.user_id,
        "name": company.name,
        "description": company.description,
        "website": company.website,
        "industry": company.industry,
        "size": company.size,
        "location": company.location,
        "is_inclusive": company.is_inclusive,
        "inclusion_policies": company.inclusion_policies,
        "created_at": company.created_at,
        "updated_at": company.updated_at,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "user_type": current_user.user_type
        },
        "job_count": job_count
    }

@router.put("/profile", response_model=CompanySchema)
async def update_company_profile(
    company_update: CompanyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza o perfil da empresa"""
    
    if current_user.user_type != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas empresas podem acessar este endpoint"
        )
    
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    
    if not company:
        # Criar novo perfil da empresa
        company_data = company_update.dict(exclude_unset=True)
        company = Company(user_id=current_user.id, **company_data)
        db.add(company)
    else:
        # Atualizar perfil existente
        update_data = company_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    
    # Contar vagas
    job_count = db.query(Job).filter(Job.company_id == company.id).count()
    
    return {
        "id": company.id,
        "user_id": company.user_id,
        "name": company.name,
        "description": company.description,
        "website": company.website,
        "industry": company.industry,
        "size": company.size,
        "location": company.location,
        "is_inclusive": company.is_inclusive,
        "inclusion_policies": company.inclusion_policies,
        "created_at": company.created_at,
        "updated_at": company.updated_at,
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "user_type": current_user.user_type
        },
        "job_count": job_count
    }

@router.post("/jobs", response_model=JobSchema)
async def create_job(
    job_data: JobCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cria uma nova vaga"""
    
    if current_user.user_type != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas empresas podem criar vagas"
        )
    
    # Verificar se a empresa tem perfil
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Perfil da empresa não encontrado. Complete seu perfil primeiro"
        )
    
    # Criar nova vaga
    job = Job(
        company_id=company.id,
        title=job_data.title,
        description=job_data.description,
        requirements=job_data.requirements,
        benefits=job_data.benefits,
        location=job_data.location,
        remote_work=job_data.remote_work,
        salary_min=job_data.salary_min,
        salary_max=job_data.salary_max,
        employment_type=job_data.employment_type
    )
    
    db.add(job)
    db.commit()
    db.refresh(job)
    
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
        "company": {
            "id": company.id,
            "name": company.name,
            "industry": company.industry,
            "size": company.size,
            "location": company.location,
            "is_inclusive": company.is_inclusive
        },
        "application_count": 0
    }

@router.get("/jobs", response_model=List[JobSchema])
async def get_company_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lista todas as vagas da empresa"""
    
    if current_user.user_type != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas empresas podem acessar este endpoint"
        )
    
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil da empresa não encontrado"
        )
    
    jobs = db.query(Job).filter(Job.company_id == company.id).all()
    
    result = []
    for job in jobs:
        # Contar aplicações
        application_count = db.query(Application).filter(Application.job_id == job.id).count()
        
        result.append({
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
            "company": {
                "id": company.id,
                "name": company.name,
                "industry": company.industry,
                "size": company.size,
                "location": company.location,
                "is_inclusive": company.is_inclusive
            },
            "application_count": application_count
        })
    
    return result

@router.put("/jobs/{job_id}", response_model=JobSchema)
async def update_job(
    job_id: int,
    job_update: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza uma vaga"""
    
    if current_user.user_type != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas empresas podem atualizar vagas"
        )
    
    # Verificar se a vaga existe e pertence à empresa
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil da empresa não encontrado"
        )
    
    job = db.query(Job).filter(Job.id == job_id, Job.company_id == company.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vaga não encontrada ou não pertence à sua empresa"
        )
    
    # Atualizar vaga
    update_data = job_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(job, field, value)
    
    db.commit()
    db.refresh(job)
    
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
        "company": {
            "id": company.id,
            "name": company.name,
            "industry": company.industry,
            "size": company.size,
            "location": company.location,
            "is_inclusive": company.is_inclusive
        },
        "application_count": application_count
    }

@router.delete("/jobs/{job_id}")
async def delete_job(
    job_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deleta uma vaga"""
    
    if current_user.user_type != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas empresas podem deletar vagas"
        )
    
    # Verificar se a vaga existe e pertence à empresa
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil da empresa não encontrado"
        )
    
    job = db.query(Job).filter(Job.id == job_id, Job.company_id == company.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vaga não encontrada ou não pertence à sua empresa"
        )
    
    # Deletar vaga
    db.delete(job)
    db.commit()
    
    return {"message": "Vaga deletada com sucesso"}

@router.get("/stats", response_model=CompanyStats)
async def get_company_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna estatísticas da empresa"""
    
    if current_user.user_type != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas empresas podem acessar este endpoint"
        )
    
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil da empresa não encontrado"
        )
    
    # Contar vagas
    total_jobs = db.query(Job).filter(Job.company_id == company.id).count()
    active_jobs = db.query(Job).filter(Job.company_id == company.id, Job.is_active == True).count()
    
    # Contar aplicações
    job_ids = [job.id for job in db.query(Job).filter(Job.company_id == company.id).all()]
    total_applications = db.query(Application).filter(Application.job_id.in_(job_ids)).count()
    pending_applications = db.query(Application).filter(Application.job_id.in_(job_ids), Application.status == "pending").count()
    accepted_applications = db.query(Application).filter(Application.job_id.in_(job_ids), Application.status == "accepted").count()
    rejected_applications = db.query(Application).filter(Application.job_id.in_(job_ids), Application.status == "rejected").count()
    
    return CompanyStats(
        total_jobs=total_jobs,
        active_jobs=active_jobs,
        total_applications=total_applications,
        pending_applications=pending_applications,
        accepted_applications=accepted_applications,
        rejected_applications=rejected_applications
    )

@router.put("/applications/{application_id}/status")
async def update_application_status(
    application_id: int,
    status_update: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza o status de uma aplicação"""
    
    if current_user.user_type != "company":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas empresas podem atualizar status de aplicações"
        )
    
    # Verificar se a aplicação existe
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aplicação não encontrada"
        )
    
    # Verificar se a vaga pertence à empresa
    job = db.query(Job).filter(Job.id == application.job_id).first()
    company = db.query(Company).filter(Company.id == job.company_id, Company.user_id == current_user.id).first()
    
    if not company:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Aplicação não pertence à sua empresa"
        )
    
    # Atualizar status
    application.status = status_update.status
    db.commit()
    db.refresh(application)
    
    return {"message": "Status da aplicação atualizado com sucesso"}
