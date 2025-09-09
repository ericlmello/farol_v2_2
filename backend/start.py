#!/usr/bin/env python3
"""
Script de inicialização para Render
Inicializa o banco de dados e inicia o servidor
"""

import os
import sys
import subprocess
import time

def run_command(command, description):
    """Executa um comando e trata erros"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} - Sucesso")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} - Erro:")
        print(f"   Comando: {command}")
        print(f"   Erro: {e.stderr}")
        return False

def main():
    """Função principal de inicialização"""
    print("🚀 Iniciando Farol Backend no Render...")
    
    # 1. Instalar dependências
    if not run_command("pip install -r requirements.txt", "Instalando dependências"):
        print("❌ Falha ao instalar dependências")
        sys.exit(1)
    
    # 2. Aguardar banco de dados estar disponível
    print("🔄 Aguardando banco de dados...")
    max_retries = 30
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # Tentar conectar ao banco
            from app.db.database import engine
            from sqlalchemy import text
            
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("✅ Banco de dados conectado")
            break
        except Exception as e:
            retry_count += 1
            print(f"🔄 Tentativa {retry_count}/{max_retries} - Aguardando banco...")
            time.sleep(2)
    
    if retry_count >= max_retries:
        print("❌ Não foi possível conectar ao banco de dados")
        sys.exit(1)
    
    # 3. Inicializar banco de dados
    if not run_command("python init_db.py", "Inicializando banco de dados"):
        print("⚠️  Aviso: Falha ao inicializar banco de dados, continuando...")
    
    # 4. Criar usuário de teste (opcional)
    if os.getenv("CREATE_TEST_USER", "false").lower() == "true":
        if not run_command("python create_test_user.py", "Criando usuário de teste"):
            print("⚠️  Aviso: Falha ao criar usuário de teste")
    
    # 5. Popular com dados de exemplo (opcional)
    if os.getenv("SEED_DATA", "false").lower() == "true":
        if not run_command("python seed_jobs.py", "Populando dados de exemplo"):
            print("⚠️  Aviso: Falha ao popular dados de exemplo")
    
    # 6. Iniciar servidor
    print("🚀 Iniciando servidor...")
    port = os.environ.get("PORT", 8000)
    host = "0.0.0.0"
    
    print(f"🌐 Servidor rodando em http://{host}:{port}")
    print(f"📚 Documentação em http://{host}:{port}/docs")
    print(f"❤️  Health check em http://{host}:{port}/health")
    
    # Iniciar uvicorn
    subprocess.run([
        sys.executable, "-m", "uvicorn", 
        "app.main:app", 
        "--host", host, 
        "--port", str(port),
        "--workers", "1"  # Render recomenda 1 worker no plano gratuito
    ])

if __name__ == "__main__":
    main()
