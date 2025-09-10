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
from app.models.user import User, UserType
from sqlalchemy.orm import Session

def create_admin_user():
    """Cria o usuário administrador fixo"""
    print("👤 Criando usuário administrador...")
    
    try:
        # Obter sessão do banco
        db = next(get_db())
        
        # Verificar se o usuário admin já existe
        existing_admin = db.query(User).filter(User.email == "adm@farol.com").first()
        if existing_admin:
            print("✅ Usuário administrador já existe!")
            # Atualizar senha caso tenha mudado
            existing_admin.password_hash = get_password_hash("adm1234")
            existing_admin.is_active = True
            existing_admin.is_verified = True
            existing_admin.user_type = UserType.ADMIN
            db.commit()
            print("✅ Senha do administrador atualizada!")
            return True
        
        # Criar usuário administrador
        admin_user = User(
            email="adm@farol.com",
            password_hash=get_password_hash("adm1234"),
            user_type=UserType.ADMIN,
            is_active=True,
            is_verified=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Usuário administrador criado com sucesso!")
        print(f"   Email: adm@farol.com")
        print(f"   Senha: adm1234")
        print(f"   Tipo: admin")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao criar usuário administrador: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

def create_test_user():
    """Cria um usuário de teste candidato"""
    print("👤 Criando usuário de teste candidato...")
    
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
            user_type=UserType.CANDIDATE,
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
    print("🚀 Iniciando criação de usuários...")
    print("=" * 50)
    
    # Criar usuário administrador
    admin_success = create_admin_user()
    
    print("\n" + "-" * 30)
    
    # Criar usuário de teste
    test_success = create_test_user()
    
    print("\n" + "=" * 50)
    if admin_success and test_success:
        print("✅ Todos os usuários criados com sucesso!")
        sys.exit(0)
    else:
        print("❌ Alguns usuários falharam ao ser criados.")
        sys.exit(1)
