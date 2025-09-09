from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional

from ..db.database import get_db
from ..models.user import User, Profile, Company, UserType
from ..schemas.user import UserCreate, User as UserSchema, Token
from ..core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    get_current_user_email
)
from ..core.config import settings

router = APIRouter(prefix="/auth", tags=["authentication"])

# Configuração OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Autentica um usuário verificando email e senha"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

@router.post("/register", response_model=UserSchema)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Registra um novo usuário"""
    # Verificar se o email já existe
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já está em uso"
        )
    
    # Criar novo usuário
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        user_type=user_data.user_type
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Criar perfil padrão para o usuário
    if user_data.user_type == UserType.CANDIDATE:
        profile = Profile(
            user_id=db_user.id,
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
    elif user_data.user_type == UserType.COMPANY:
        company = Company(
            user_id=db_user.id,
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
    
    return db_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Faz login do usuário e retorna token JWT"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuário inativo"
        )
    
    # Criar token de acesso
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Obtém o usuário atual baseado no token JWT"""
    print(f'🔍 Validando token: {token[:20]}...' if token else '❌ Token não fornecido')
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Não foi possível validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    email = get_current_user_email(token)
    print(f'📧 Email extraído do token: {email}')
    
    if email is None:
        print('❌ Email não encontrado no token')
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        print(f'❌ Usuário não encontrado no banco para email: {email}')
        raise credentials_exception
    
    print(f'✅ Usuário autenticado: {user.id} ({user.email})')
    return user

@router.get("/me", response_model=UserSchema)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Retorna informações do usuário atual"""
    return current_user
