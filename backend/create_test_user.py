#!/usr/bin/env python3
"""
Script para criar um usuário de teste
"""

import sys
import os
from pathlib import Path

# Adicionar o diretório app ao path
sys.path.append(str(Path(__file__).parent / "app"))

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.database import get_db
from app.models.user import User
from sqlalchemy.orm import Session

def create_test_user():
    """Cria um usuário de teste"""
    print("👤 Criando usuário de teste...")
    
    try:
        # Obter sessão do banco
        db = next(get_db())
        
        # Verificar se o usuário já existe
        existing_user = db.query(User).filter(User.email == "test@test.com").first()
        if existing_user:
            print("✅ Usuário de teste já existe!")
            return True
        
        # Criar usuário de teste
        test_user = User(
            email="test@test.com",
            password_hash=get_password_hash("test123"),
            user_type="candidate",
            is_active=True,
            is_verified=True
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print("✅ Usuário de teste criado com sucesso!")
        print(f"   Email: test@test.com")
        print(f"   Senha: test123")
        print(f"   Tipo: candidate")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário de teste: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = create_test_user()
    sys.exit(0 if success else 1)
