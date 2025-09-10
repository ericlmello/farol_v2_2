#!/bin/bash

# Script de deploy para Render
# Execute este script para fazer deploy do Farol v2 no Render

echo "🚀 Iniciando deploy do Farol v2 no Render..."

# Verificar se o git está configurado
if ! git config user.name > /dev/null 2>&1; then
    echo "❌ Git não está configurado. Configure primeiro:"
    echo "   git config --global user.name 'Seu Nome'"
    echo "   git config --global user.email 'seu@email.com'"
    exit 1
fi

# Verificar se há mudanças não commitadas
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "📝 Há mudanças não commitadas. Fazendo commit..."
    git add .
    git commit -m "feat: preparar para deploy no Render"
fi

# Verificar se a branch main existe
if ! git show-ref --verify --quiet refs/heads/main; then
    echo "🔄 Criando branch main..."
    git checkout -b main
fi

# Fazer push para o repositório
echo "📤 Fazendo push para o repositório..."
git push origin main

echo "✅ Deploy iniciado! Acesse o Render Dashboard para acompanhar o progresso."
echo "🌐 URLs após o deploy:"
echo "   Frontend: https://farol-frontend.onrender.com"
echo "   Backend:  https://farol-backend.onrender.com"
echo "   API Docs: https://farol-backend.onrender.com/docs"
echo ""
echo "📋 Próximos passos:"
echo "   1. Acesse https://render.com/dashboard"
echo "   2. Conecte seu repositório GitHub"
echo "   3. Configure as variáveis de ambiente"
echo "   4. Aguarde o deploy completar"
echo "   5. Teste as URLs acima"

