#!/usr/bin/env python3
"""
Script para resetar o banco de dados
Remove todas as tabelas e as recria
"""

import sys
from pathlib import Path

# Adicionar o diretório app ao path
sys.path.append(str(Path(__file__).parent / "app"))

from app.db.init_db import create_tables
from app.core.config import settings
from sqlalchemy import create_engine, text

def reset_database():
    """Remove todas as tabelas e as recria"""
    print("🔄 Resetando banco de dados...")
    
    try:
        # Conectar ao banco
        engine = create_engine(settings.database_url)
        
        with engine.connect() as conn:
            # Desabilitar verificação de chaves estrangeiras
            conn.execute(text("SET session_replication_role = replica;"))
            
            # Listar e remover todas as tabelas
            result = conn.execute(text("""
                SELECT tablename FROM pg_tables 
                WHERE schemaname = 'public' 
                AND tablename NOT LIKE 'pg_%'
                AND tablename != 'alembic_version'
            """))
            
            tables = [row[0] for row in result]
            
            if tables:
                print(f"🗑️  Removendo {len(tables)} tabelas...")
                for table in tables:
                    conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
                    print(f"   ✅ Removida tabela: {table}")
            else:
                print("ℹ️  Nenhuma tabela encontrada para remover")
            
            # Reabilitar verificação de chaves estrangeiras
            conn.execute(text("SET session_replication_role = DEFAULT;"))
            
            # Commit das mudanças
            conn.commit()
        
        # Recriar tabelas
        print("📋 Recriando tabelas...")
        create_tables()
        print("✅ Banco de dados resetado com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao resetar banco de dados: {e}")
        sys.exit(1)

if __name__ == "__main__":
    reset_database()

