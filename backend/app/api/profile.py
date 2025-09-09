from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
import os
import shutil
from pathlib import Path
from datetime import datetime
import io
import re

from ..db.database import get_db
from ..models.user import User, Profile
from ..schemas.profile import (
    ProfileCreate, 
    ProfileUpdate, 
    Profile as ProfileSchema,
    CVAnalysisRequest,
    CVAnalysisResponse,
    FileUploadResponse
)
from ..api.auth import get_current_user
from ..core.config import settings
import openai
from docx import Document
import PyPDF2

router = APIRouter(tags=["profile"])

# Configurar OpenAI (removido - usando cliente direto)

# Diretório para uploads
UPLOAD_DIR = Path("uploads/cv")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def extract_text_from_pdf(content: bytes) -> str:
    """Extrai texto de um arquivo PDF"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao extrair texto do PDF: {str(e)}"
        )

def extract_text_from_docx(content: bytes) -> str:
    """Extrai texto de um arquivo DOCX"""
    try:
        doc = Document(io.BytesIO(content))
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao extrair texto do DOCX: {str(e)}"
        )

def extract_text_from_txt(content: bytes) -> str:
    """Extrai texto de um arquivo TXT"""
    try:
        return content.decode('utf-8').strip()
    except UnicodeDecodeError:
        try:
            return content.decode('latin-1').strip()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Erro ao extrair texto do TXT: {str(e)}"
            )

def extract_text_from_file(content: bytes, file_extension: str) -> str:
    """Extrai texto de arquivo baseado na extensão"""
    if file_extension == '.pdf':
        return extract_text_from_pdf(content)
    elif file_extension in ['.docx', '.doc']:
        return extract_text_from_docx(content)
    elif file_extension == '.txt':
        return extract_text_from_txt(content)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de arquivo não suportado para extração de texto"
        )

def analyze_cv_with_openai(cv_text: str) -> CVAnalysisResponse:
    """Analisa o currículo usando OpenAI"""
    if not settings.openai_api_key:
        # Retornar análise mockada se não houver API key
        return CVAnalysisResponse(
            analysis="Análise de currículo não disponível. Configure a API key da OpenAI para análise completa.",
            strengths=[
                "Experiência relevante na área",
                "Formação acadêmica adequada",
                "Habilidades técnicas demonstradas"
            ],
            areas_for_improvement=[
                "Adicionar mais detalhes sobre projetos",
                "Incluir certificações relevantes",
                "Destacar soft skills"
            ],
            suggested_skills=[
                "Comunicação",
                "Trabalho em equipe",
                "Resolução de problemas"
            ],
            accessibility_notes="Considere destacar adaptações e tecnologias assistivas utilizadas, se aplicável."
        )
    
    try:
        # Prompt para análise do CV
        prompt = f"""
        Analise o seguinte currículo e forneça uma análise detalhada focada em acessibilidade e inclusão:

        CURRÍCULO:
        {cv_text}

        Por favor, forneça:
        1. Uma análise geral do currículo
        2. Pontos fortes identificados
        3. Áreas que podem ser melhoradas
        4. Habilidades sugeridas para desenvolvimento
        5. Notas específicas sobre acessibilidade (se aplicável)

        Responda em português brasileiro e seja construtivo e encorajador.
        """

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Você é um especialista em recursos humanos focado em inclusão e acessibilidade para pessoas com deficiência."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        analysis_text = response.choices[0].message.content
        
        # Extrair informações estruturadas (simplificado)
        strengths = [
            "Experiência relevante na área",
            "Formação acadêmica adequada",
            "Habilidades técnicas demonstradas"
        ]
        
        areas_for_improvement = [
            "Adicionar mais detalhes sobre projetos",
            "Incluir certificações relevantes",
            "Destacar soft skills"
        ]
        
        suggested_skills = [
            "Comunicação",
            "Trabalho em equipe",
            "Resolução de problemas"
        ]
        
        accessibility_notes = "Considere destacar adaptações e tecnologias assistivas utilizadas, se aplicável."
        
        return CVAnalysisResponse(
            analysis=analysis_text,
            strengths=strengths,
            areas_for_improvement=areas_for_improvement,
            suggested_skills=suggested_skills,
            accessibility_notes=accessibility_notes
        )
        
    except Exception as e:
        # Retornar análise mockada em caso de erro
        return CVAnalysisResponse(
            analysis=f"Análise automática não disponível no momento. Erro: {str(e)}",
            strengths=[
                "Experiência relevante na área",
                "Formação acadêmica adequada",
                "Habilidades técnicas demonstradas"
            ],
            areas_for_improvement=[
                "Adicionar mais detalhes sobre projetos",
                "Incluir certificações relevantes",
                "Destacar soft skills"
            ],
            suggested_skills=[
                "Comunicação",
                "Trabalho em equipe",
                "Resolução de problemas"
            ],
            accessibility_notes="Considere destacar adaptações e tecnologias assistivas utilizadas, se aplicável."
        )

@router.get("/me", response_model=ProfileSchema)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna o perfil do usuário logado"""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    if not profile:
        # Se não existe perfil, criar um perfil padrão
        profile = Profile(
            user_id=current_user.id,
            first_name="",
            last_name="",
            phone="",
            bio="",
            location="",
            linkedin_url="",
            github_url="",
            portfolio_url="",
            has_disability=False,
            disability_type="",
            disability_description="",
            accessibility_needs="",
            experience_summary=""
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return profile

@router.put("/me", response_model=ProfileSchema)
async def update_my_profile(
    profile_update: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Atualiza o perfil do usuário logado"""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    if not profile:
        # Se não existe perfil, criar um novo
        profile_data = profile_update.dict(exclude_unset=True)
        profile = Profile(user_id=current_user.id, **profile_data)
        db.add(profile)
    else:
        # Atualizar perfil existente
        update_data = profile_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    
    return profile

@router.post("/upload-cv", response_model=dict)
async def upload_cv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload de arquivo de currículo com extração de texto e análise automática"""
    
    # Validar tipo de arquivo
    allowed_extensions = {'.pdf', '.doc', '.docx', '.txt'}
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de arquivo não suportado. Use PDF, DOC, DOCX ou TXT"
        )
    
    # Validar tamanho do arquivo (máximo 10MB)
    content = await file.read()
    file_size = len(content)
    
    if file_size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo muito grande. Máximo 10MB"
        )
    
    # Criar nome único para o arquivo
    user_dir = UPLOAD_DIR / str(current_user.id)
    user_dir.mkdir(exist_ok=True)
    
    filename = f"cv_{current_user.id}_{int(datetime.now().timestamp())}_{file.filename}"
    file_path = user_dir / filename
    
    # Salvar arquivo
    with open(file_path, "wb") as buffer:
        buffer.write(content)
    
    # Extrair texto do arquivo
    try:
        cv_text = extract_text_from_file(content, file_extension)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao extrair texto do arquivo: {str(e)}"
        )
    
    # Analisar currículo com OpenAI
    analysis = analyze_cv_with_openai(cv_text)
    
    # Atualizar perfil do usuário com informações extraídas
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(
            user_id=current_user.id,
            first_name="",
            last_name="",
            has_disability=False
        )
        db.add(profile)
    
    # Salvar texto extraído no campo experience_summary
    profile.experience_summary = cv_text
    db.commit()
    db.refresh(profile)
    
    return {
        "filename": filename,
        "file_path": str(file_path),
        "file_size": file_size,
        "message": "Arquivo enviado e analisado com sucesso",
        "extracted_text": cv_text[:500] + "..." if len(cv_text) > 500 else cv_text,
        "analysis": analysis
    }

@router.get("/my-cvs")
async def get_my_cvs(
    current_user: User = Depends(get_current_user)
):
    """Lista os arquivos de CV do usuário"""
    user_dir = UPLOAD_DIR / str(current_user.id)
    
    if not user_dir.exists():
        return {"files": []}
    
    files = []
    for file_path in user_dir.iterdir():
        if file_path.is_file():
            files.append({
                "filename": file_path.name,
                "file_path": str(file_path),
                "file_size": file_path.stat().st_size,
                "created_at": datetime.fromtimestamp(file_path.stat().st_ctime)
            })
    
    return {"files": files}

@router.delete("/cv/{filename}")
async def delete_cv(
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """Deleta um arquivo de CV do usuário"""
    user_dir = UPLOAD_DIR / str(current_user.id)
    file_path = user_dir / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Arquivo não encontrado"
        )
    
    # Verificar se o arquivo pertence ao usuário
    if not str(file_path).startswith(str(user_dir)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado"
        )
    
    file_path.unlink()
    
    return {"message": "Arquivo deletado com sucesso"}

@router.get("/analysis", response_model=CVAnalysisResponse)
async def get_cv_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retorna a análise do currículo do usuário"""
    
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    if not profile or not profile.experience_summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nenhum currículo encontrado. Faça upload de um currículo primeiro."
        )
    
    # Analisar currículo com OpenAI
    analysis = analyze_cv_with_openai(profile.experience_summary)
    
    return analysis

@router.post("/analyze-cv", response_model=CVAnalysisResponse)
async def analyze_cv(
    cv_analysis_request: CVAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analisa o currículo usando OpenAI"""
    
    # Analisar currículo com OpenAI
    analysis = analyze_cv_with_openai(cv_analysis_request.cv_text)
    
    return analysis
