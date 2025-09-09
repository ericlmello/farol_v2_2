#!/bin/bash

echo "🚀 Iniciando Plataforma Farol Backend..."

# Iniciar servidor (a inicialização do banco será feita pelo FastAPI)
echo "🌐 Iniciando servidor FastAPI..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
