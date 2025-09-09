from sqlalchemy import create_engine
from ..core.config import settings
from ..models.base import Base
from ..models import *  # Importa todos os modelos

def create_tables():
    """Cria todas as tabelas no banco de dados"""
    engine = create_engine(settings.database_url)
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    create_tables()
    print("Tabelas criadas com sucesso!")
