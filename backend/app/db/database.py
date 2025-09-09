from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..core.config import settings
from ..models.base import Base

# Criar engine do banco de dados
engine = create_engine(settings.database_url)

# Criar sessão do banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency para obter sessão do banco de dados"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
