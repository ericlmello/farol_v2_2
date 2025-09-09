# 🌟 Farol v2 - Plataforma de Empregabilidade Acessível para PCDs

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-green?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=for-the-badge&logo=postgresql)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=for-the-badge&logo=docker)](https://docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

> **Uma plataforma inovadora que conecta pessoas com deficiência (PCDs) a oportunidades de emprego através de IA, simulações de entrevistas e análise de compatibilidade.**

---

## 🎯 Visão Geral

O **Farol v2** é uma plataforma completa de empregabilidade desenvolvida especificamente para pessoas com deficiência. A plataforma utiliza inteligência artificial para:

- 🎤 **Simulações de Entrevistas** com feedback detalhado
- 🔍 **Análise de Compatibilidade** entre candidatos e vagas
- 📊 **Análise de Currículos** com sugestões de melhoria
- 🎯 **Matching Inteligente** de vagas
- 🎓 **Hub de Desenvolvimento** com cursos personalizados
- 🗣️ **Assistente de Voz** para acessibilidade

---

## ✨ Principais Funcionalidades

### 🎤 Simulações de Entrevistas
- **Entrevistas Técnicas e Comportamentais** com IA
- **Feedback Detalhado** sobre performance
- **Análise de Método STAR** para respostas comportamentais
- **Métricas de Clareza, Confiança e Profundidade Técnica**

### 🔍 Sistema de Compatibilidade
- **Algoritmo de Matching** personalizado para PCDs
- **Análise de Skills** e experiência
- **Compatibilidade por Localização** e modalidade de trabalho
- **Scores Realistas** baseados em perfil do candidato

### 📊 Análise de Currículos
- **Upload de PDF/DOCX** com extração automática
- **Análise de Pontos Fortes** e oportunidades de melhoria
- **Sugestões de Cursos** no Hub de Desenvolvimento
- **Alinhamento com Vagas** disponíveis

### 🎯 Matching de Vagas
- **Filtros Inteligentes** por compatibilidade
- **Vagas Acessíveis** com foco em inclusão
- **Detalhes Completos** de empresas e posições
- **Aplicação Simplificada** com um clique

### 🎓 Hub de Desenvolvimento
- **Cursos Personalizados** baseados em análise de perfil
- **Conteúdo Acessível** com foco em PCDs
- **Progresso Rastreado** e certificações
- **Recomendações Inteligentes** de aprendizado

### 🗣️ Assistente de Voz
- **Wake Word Detection** com Picovoice
- **Transcrição de Áudio** com OpenAI Whisper
- **Síntese de Voz** para feedback
- **Acessibilidade Total** para usuários com deficiência visual

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (FastAPI)     │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Python 3.11   │    │ • PostgreSQL 15 │
│ • TypeScript    │    │ • FastAPI       │    │ • SQLAlchemy    │
│ • Tailwind CSS  │    │ • OpenAI API    │    │ • Alembic       │
│ • ShadCN/UI     │    │ • JWT Auth      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🎨 Frontend (Next.js 15.5.2)
- **Framework**: Next.js com App Router
- **Linguagem**: TypeScript
- **Styling**: Tailwind CSS + ShadCN/UI
- **Estado**: React Context + useState/useEffect
- **Autenticação**: JWT com localStorage
- **Acessibilidade**: WCAG 2.2 AA compliant

### ⚡ Backend (FastAPI)
- **Framework**: FastAPI 0.104.1
- **Linguagem**: Python 3.11
- **ORM**: SQLAlchemy 2.0
- **Autenticação**: JWT com python-jose
- **IA**: OpenAI API (GPT-4, Whisper, TTS)
- **Documentação**: Swagger/OpenAPI automática

### 🗄️ Database (PostgreSQL)
- **SGBD**: PostgreSQL 15
- **Migrações**: Alembic
- **Modelos**: SQLAlchemy ORM
- **Backup**: Volumes Docker persistentes

---

## 🚀 Tecnologias Utilizadas

### Frontend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Next.js** | 15.5.2 | Framework React com SSR/SSG |
| **React** | 18 | Biblioteca de interface |
| **TypeScript** | 5.0 | Tipagem estática |
| **Tailwind CSS** | 3.3 | Framework CSS utilitário |
| **ShadCN/UI** | Latest | Componentes acessíveis |
| **Picovoice** | 3.0.3 | Wake word detection |
| **Axios** | 1.6.0 | Cliente HTTP |

### Backend
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **FastAPI** | 0.104.1 | Framework web assíncrono |
| **Python** | 3.11 | Linguagem principal |
| **SQLAlchemy** | 2.0.23 | ORM para banco de dados |
| **PostgreSQL** | 15 | Banco de dados relacional |
| **OpenAI** | 1.3.7 | Integração com IA |
| **JWT** | 3.3.0 | Autenticação |
| **Alembic** | 1.13.1 | Migrações de banco |

### DevOps & Infraestrutura
| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Docker** | Latest | Containerização |
| **Docker Compose** | Latest | Orquestração de containers |
| **PostgreSQL** | 15 | Banco de dados |
| **Nginx** | (Opcional) | Proxy reverso |

---

## 📋 Pré-requisitos

### Sistema
- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git** 2.30+

### APIs Externas
- **OpenAI API Key** (para funcionalidades de IA)
  - GPT-4 para análise de currículos
  - Whisper para transcrição de áudio
  - TTS para síntese de voz

---

## 🛠️ Instalação e Configuração

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/farol-v2.git
cd farol-v2
```

### 2. Configure as Variáveis de Ambiente
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env com suas configurações
nano .env
```

**Conteúdo do arquivo `.env`:**
```env
# OpenAI API Key (obrigatório)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Database (opcional - padrões do Docker)
DATABASE_URL=postgresql://faroluser:farolpassword@db:5432/faroldb
POSTGRES_USER=faroluser
POSTGRES_PASSWORD=farolpassword
POSTGRES_DB=faroldb

# Frontend (opcional)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Inicie os Serviços com Docker
```bash
# Construa e inicie todos os containers
docker-compose up --build

# Ou em modo detached (background)
docker-compose up --build -d
```

### 4. Inicialize o Banco de Dados
```bash
# Execute a inicialização do banco
docker-compose exec backend python init_db.py

# Crie um usuário de teste (opcional)
docker-compose exec backend python create_test_user.py

# Popule com vagas de exemplo (opcional)
docker-compose exec backend python seed_jobs.py
```

### 5. Acesse a Aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs
- **Database**: localhost:5432

---

## 🎮 Como Usar

### 1. **Primeiro Acesso**
- Acesse http://localhost:3000
- Clique em "Registrar" para criar uma conta
- Ou use o usuário de teste: `test@test.com` / `test123`

### 2. **Configuração do Perfil**
- Complete seu perfil na página "Perfil"
- Faça upload do seu currículo (PDF/DOCX)
- Aguarde a análise automática da IA

### 3. **Explorar Vagas**
- Navegue até "Vagas" para ver oportunidades
- Use os filtros de compatibilidade
- Visualize detalhes das empresas e posições

### 4. **Simulações de Entrevista**
- Acesse "Simulação" para iniciar uma entrevista
- Escolha o tipo: Técnica, Comportamental ou Mista
- Responda às perguntas usando voz ou texto
- Receba feedback detalhado sobre sua performance

### 5. **Análise de Matches**
- Veja sua compatibilidade com vagas em "Análise de Matches"
- Entenda por que certas vagas são recomendadas
- Explore oportunidades de melhoria

### 6. **Desenvolvimento**
- Acesse o "Hub de Desenvolvimento"
- Faça cursos recomendados baseados na análise do seu perfil
- Acompanhe seu progresso e certificações

---

## 🔧 Desenvolvimento

### Estrutura do Projeto
```
farol-v2/
├── frontend/                 # Aplicação Next.js
│   ├── src/
│   │   ├── app/             # App Router (Next.js 13+)
│   │   ├── components/      # Componentes React
│   │   ├── contexts/        # Context API
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilitários e serviços
│   ├── public/              # Arquivos estáticos
│   └── package.json
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── api/             # Endpoints da API
│   │   ├── core/            # Configurações centrais
│   │   ├── db/              # Banco de dados
│   │   ├── models/          # Modelos SQLAlchemy
│   │   └── schemas/         # Schemas Pydantic
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml       # Orquestração de containers
└── README.md
```

### Scripts de Desenvolvimento

#### Frontend
```bash
# Desenvolvimento
cd frontend
npm run dev

# Build para produção
npm run build

# Lint
npm run lint
```

#### Backend
```bash
# Desenvolvimento
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Testes
python -m pytest

# Migrações
alembic upgrade head
```

### Comandos Docker Úteis
```bash
# Ver logs
docker-compose logs -f [service_name]

# Executar comandos no container
docker-compose exec backend python [script]
docker-compose exec frontend npm [command]

# Rebuild específico
docker-compose up --build [service_name]

# Parar todos os serviços
docker-compose down

# Limpar volumes (CUIDADO: apaga dados)
docker-compose down -v
```

---

## 🧪 Testes

### Testes de API
```bash
# Teste de conexão
docker-compose exec backend python test_env.py

# Teste do endpoint de voz
docker-compose exec backend python test_voice_endpoint.py

# Teste simples da OpenAI
docker-compose exec backend python test_openai_simple.py
```

### Testes de Frontend
```bash
# Teste de conexão
cd frontend
node test-connection.js

# Teste de wake word
open test-wake-word-fix.html
```

---

## 📊 Monitoramento e Logs

### Logs em Tempo Real
```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Health Checks
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000/health
- **API Docs**: http://localhost:8000/docs

---

## 🚀 Deploy em Produção

### 1. **Preparação**
```bash
# Configure variáveis de produção
cp env.example .env.production

# Atualize as configurações para produção
nano .env.production
```

### 2. **Build de Produção**
```bash
# Build otimizado
docker-compose -f docker-compose.prod.yml up --build
```

### 3. **Configurações de Produção**
- Configure um proxy reverso (Nginx)
- Use HTTPS com certificados SSL
- Configure backup automático do banco
- Monitore logs e performance

---

## 🤝 Contribuição

### Como Contribuir
1. **Fork** o repositório
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### Padrões de Código
- **Frontend**: ESLint + Prettier
- **Backend**: Black + isort
- **Commits**: Conventional Commits
- **Documentação**: JSDoc + Docstrings

### Issues e Bugs
- Use o sistema de Issues do GitHub
- Inclua logs e steps para reproduzir
- Use labels apropriadas (bug, feature, enhancement)

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👥 Equipe

- **Desenvolvimento**: Equipe Farol v2
- **Mentoria**: FIAP
- **Foco**: Acessibilidade e Inclusão

---

## 🙏 Agradecimentos

- **OpenAI** pela API de IA
- **Picovoice** pelo wake word detection
- **ShadCN** pelos componentes acessíveis
- **FastAPI** pelo framework backend
- **Next.js** pelo framework frontend
- **Comunidade Open Source** por todas as bibliotecas utilizadas

---

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/farol-v2/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/farol-v2/wiki)
- **Email**: suporte@farol.com.br

---

## 🔮 Roadmap

### Próximas Funcionalidades
- [ ] **Integração com LinkedIn** para importação de perfil
- [ ] **Chatbot** para suporte 24/7
- [ ] **App Mobile** (React Native)
- [ ] **Integração com ATS** (Applicant Tracking Systems)
- [ ] **Analytics** avançados para empresas
- [ ] **Multi-idioma** (inglês, espanhol)
- [ ] **Integração com Zoom/Teams** para entrevistas reais
- [ ] **Sistema de Notificações** push
- [ ] **Gamificação** com pontos e conquistas
- [ ] **Mentoria** entre usuários

---

<div align="center">

**🌟 Se este projeto te ajudou, considere dar uma ⭐ no repositório!**

[![GitHub stars](https://img.shields.io/github/stars/seu-usuario/farol-v2?style=social)](https://github.com/seu-usuario/farol-v2/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/seu-usuario/farol-v2?style=social)](https://github.com/seu-usuario/farol-v2/network)
[![GitHub watchers](https://img.shields.io/github/watchers/seu-usuario/farol-v2?style=social)](https://github.com/seu-usuario/farol-v2/watchers)

</div>