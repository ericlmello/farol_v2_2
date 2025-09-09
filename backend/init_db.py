#!/usr/bin/env python3
"""
Script para inicializar o banco de dados
Executa a criação das tabelas e dados iniciais
"""

import sys
import os
from pathlib import Path

# Adicionar o diretório app ao path
sys.path.append(str(Path(__file__).parent / "app"))

from app.db.init_db import create_tables
from app.core.config import settings
import time

def wait_for_db():
    """Aguarda o banco de dados estar disponível"""
    from sqlalchemy import create_engine
    from sqlalchemy.exc import OperationalError
    
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            engine = create_engine(settings.database_url)
            with engine.connect() as conn:
                from sqlalchemy import text
                conn.execute(text("SELECT 1"))
            print("✅ Banco de dados conectado com sucesso!")
            return True
        except OperationalError as e:
            retry_count += 1
            print(f"⏳ Aguardando banco de dados... (tentativa {retry_count}/{max_retries})")
            time.sleep(2)
    
    print("❌ Não foi possível conectar ao banco de dados após 30 tentativas")
    return False

def main():
    """Função principal"""
    print("🚀 Iniciando configuração do banco de dados...")
    
    # Aguardar banco estar disponível
    if not wait_for_db():
        sys.exit(1)
    
    try:
        # Criar tabelas
        print("📋 Criando tabelas...")
        create_tables()
        print("✅ Tabelas criadas com sucesso!")
        
        print("🎉 Banco de dados inicializado com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao inicializar banco de dados: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

