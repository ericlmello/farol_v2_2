from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import openai
import os
from dotenv import load_dotenv

from ..db.database import get_db
from ..models.user import User
from ..api.auth import get_current_user
from ..schemas.simulation import SimulationConfig, SimulationAnswer

# Carregar variáveis de ambiente
load_dotenv()

router = APIRouter(prefix="/interview-chatbot", tags=["interview-chatbot"])

# Configuração da API da Perplexity
API_KEY = os.getenv("PERPLEXITY_API_KEY")

# Configurar o cliente OpenAI para usar a API da Perplexity
client = openai.OpenAI(
    api_key=API_KEY,
    base_url="https://api.perplexity.ai"
)

def create_interview_prompt(config: SimulationConfig, user_profile: dict = None) -> str:
    """Cria um prompt personalizado baseado na configuração da simulação"""
    
    # Mapear tipos de entrevista
    interview_type_map = {
        "technical": "Entrevista Técnica",
        "behavioral": "Entrevista Comportamental com RH", 
        "mixed": "Entrevista Mista (Técnica e Comportamental)",
        "case_study": "Estudo de Caso"
    }
    
    # Mapear níveis de dificuldade
    difficulty_map = {
        "beginner": "Iniciante",
        "intermediate": "Intermediário", 
        "advanced": "Avançado",
        "expert": "Especialista"
    }
    
    # Mapear áreas de foco
    focus_areas_map = {
        "frontend": "Desenvolvimento Frontend (HTML, CSS, JavaScript, React, Vue, Angular)",
        "backend": "Desenvolvimento Backend (Node.js, Python, Java, C#, APIs, Bancos de Dados)",
        "fullstack": "Desenvolvimento Full Stack (Frontend + Backend)",
        "mobile": "Desenvolvimento Mobile (React Native, Flutter, iOS, Android)",
        "devops": "DevOps & Infrastructure (Docker, Kubernetes, AWS, Azure, CI/CD)",
        "data": "Data Science & Analytics (Python, R, Machine Learning, Big Data)",
        "ai": "AI & Machine Learning (Deep Learning, NLP, Computer Vision)",
        "security": "Cybersecurity (Segurança da Informação, Ethical Hacking)"
    }
    
    interview_type = interview_type_map.get(config.interview_type, "Entrevista Técnica")
    difficulty = difficulty_map.get(config.difficulty_level, "Intermediário")
    
    # Construir áreas de foco
    focus_text = ""
    if config.focus_areas:
        focus_list = [focus_areas_map.get(area, area) for area in config.focus_areas]
        focus_text = f"\n\nÁREAS DE FOCO ESPECÍFICAS:\n{chr(10).join(f'- {area}' for area in focus_list)}"
    
    # Informações do perfil do usuário (se disponível)
    profile_info = ""
    if user_profile:
        profile_info = f"""
PERFIL DO CANDIDATO:
- Nome: {user_profile.get('name', 'Candidato')}
- Experiência: {user_profile.get('experience_level', 'Não especificado')}
- Área Principal: {user_profile.get('main_area', 'Não especificada')}
- Habilidades: {', '.join(user_profile.get('skills', []))}
"""
    
    prompt = f"""Você é um entrevistador de RH experiente e profissional conduzindo uma {interview_type} para uma vaga de desenvolvedor.

CONTEXTO DA ENTREVISTA:
- Tipo: {interview_type}
- Nível: {difficulty}
- Duração: {config.duration} minutos
- Modo de Interação: {'Voz' if config.interaction_mode == 'voice' else 'Texto'}{focus_text}

{profile_info}

INSTRUÇÕES IMPORTANTES:
1. Seja natural, profissional e acolhedor como um entrevistador real
2. Faça perguntas progressivas baseadas no nível de dificuldade
3. Para entrevistas técnicas: foque em conceitos, práticas e resolução de problemas
4. Para entrevistas comportamentais: use a metodologia STAR (Situation, Task, Action, Result)
5. Para estudos de caso: apresente cenários realistas e práticos
6. Adapte as perguntas às áreas de foco selecionadas
7. Dê feedback construtivo e encorajador
8. Mantenha um tom conversacional e profissional
9. Faça follow-up questions baseadas nas respostas
10. Seja inclusivo e acessível em sua abordagem

ESTRUTURA DA ENTREVISTA:
- Comece com uma pergunta de apresentação
- Faça 3-5 perguntas principais baseadas no tipo e nível
- Inclua perguntas de follow-up quando apropriado
- Termine com uma pergunta sobre expectativas ou dúvidas do candidato

IMPORTANTE: 
- Responda APENAS como o entrevistador
- Seja específico e detalhado nas perguntas
- Mantenha o foco na área de desenvolvimento
- Use linguagem técnica apropriada para o nível
- Seja realista e prático nas situações apresentadas

Agora, inicie a entrevista com uma saudação calorosa e a primeira pergunta."""

    return prompt

def entrevista_bot(pergunta: str, config: SimulationConfig, user_profile: dict = None, conversation_history: List[dict] = None) -> str:
    """Função principal do chatbot de entrevista"""
    try:
        # Criar prompt base
        system_prompt = create_interview_prompt(config, user_profile)
        
        # Construir histórico da conversa
        messages = [{"role": "system", "content": system_prompt}]
        
        # Adicionar histórico da conversa se disponível
        if conversation_history:
            for msg in conversation_history[-10:]:  # Manter apenas últimas 10 mensagens
                messages.append({
                    "role": "user" if msg["role"] == "candidate" else "assistant",
                    "content": msg["content"]
                })
        
        # Adicionar pergunta atual
        messages.append({"role": "user", "content": pergunta})
        
        response = client.chat.completions.create(
            model="sonar-pro",  # Modelo mais atual da Perplexity
            messages=messages,
            max_tokens=1000,
            temperature=0.7
        )
        
        return response.choices[0].message.content
        
    except Exception as e:
        return f"Desculpe, ocorreu um erro técnico. Por favor, tente novamente. Erro: {str(e)}"

@router.post("/start-interview")
async def start_interview(
    config: SimulationConfig,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Inicia uma nova entrevista com o chatbot"""
    
    try:
        # Buscar perfil do usuário (simulado por enquanto)
        user_profile = {
            "name": current_user.name,
            "experience_level": "Intermediário",  # Em produção, viria do banco
            "main_area": "Desenvolvimento Full Stack",
            "skills": ["JavaScript", "Python", "React", "Node.js"]
        }
        
        # Criar prompt inicial
        system_prompt = create_interview_prompt(config, user_profile)
        
        # Gerar primeira pergunta
        first_question = entrevista_bot(
            "Inicie a entrevista com uma saudação e a primeira pergunta.",
            config, 
            user_profile
        )
        
        return {
            "session_id": f"chat_{current_user.id}_{int(datetime.now().timestamp())}",
            "interview_type": config.interview_type,
            "difficulty_level": config.difficulty_level,
            "duration": config.duration,
            "interaction_mode": config.interaction_mode,
            "focus_areas": config.focus_areas,
            "first_question": first_question,
            "user_profile": user_profile,
            "started_at": datetime.now()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao iniciar entrevista: {str(e)}"
        )

@router.post("/chat")
async def chat_with_interviewer(
    message_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Processa mensagem do candidato e retorna resposta do entrevistador"""
    
    try:
        session_id = message_data.get("session_id")
        user_message = message_data.get("message", "")
        config_data = message_data.get("config")
        conversation_history = message_data.get("conversation_history", [])
        
        if not session_id or not user_message or not config_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="session_id, message e config são obrigatórios"
            )
        
        # Reconstruir configuração
        config = SimulationConfig(**config_data)
        
        # Buscar perfil do usuário
        user_profile = {
            "name": current_user.name,
            "experience_level": "Intermediário",
            "main_area": "Desenvolvimento Full Stack", 
            "skills": ["JavaScript", "Python", "React", "Node.js"]
        }
        
        # Processar mensagem
        response = entrevista_bot(
            user_message,
            config,
            user_profile,
            conversation_history
        )
        
        return {
            "session_id": session_id,
            "interviewer_response": response,
            "timestamp": datetime.now(),
            "message_id": f"msg_{int(datetime.now().timestamp())}"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar mensagem: {str(e)}"
        )

@router.post("/end-interview")
async def end_interview(
    session_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Finaliza a entrevista e gera feedback"""
    
    try:
        session_id = session_data.get("session_id")
        conversation_history = session_data.get("conversation_history", [])
        config_data = session_data.get("config")
        
        if not session_id or not config_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="session_id e config são obrigatórios"
            )
        
        # Reconstruir configuração
        config = SimulationConfig(**config_data)
        
        # Buscar perfil do usuário
        user_profile = {
            "name": current_user.name,
            "experience_level": "Intermediário",
            "main_area": "Desenvolvimento Full Stack",
            "skills": ["JavaScript", "Python", "React", "Node.js"]
        }
        
        # Gerar feedback final
        feedback_prompt = f"""
        Baseado na entrevista realizada, forneça um feedback detalhado e construtivo.
        
        CONFIGURAÇÃO DA ENTREVISTA:
        - Tipo: {config.interview_type}
        - Nível: {config.difficulty_level}
        - Duração: {config.duration} minutos
        - Áreas de Foco: {', '.join(config.focus_areas)}
        
        HISTÓRICO DA CONVERSA:
        {chr(10).join([f"{msg['role']}: {msg['content']}" for msg in conversation_history])}
        
        Forneça um feedback estruturado incluindo:
        1. Pontos fortes observados
        2. Áreas de melhoria
        3. Sugestões específicas
        4. Recomendações de estudo
        5. Próximos passos
        """
        
        feedback = entrevista_bot(feedback_prompt, config, user_profile)
        
        return {
            "session_id": session_id,
            "feedback": feedback,
            "completed_at": datetime.now(),
            "total_messages": len(conversation_history),
            "interview_type": config.interview_type,
            "difficulty_level": config.difficulty_level
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao finalizar entrevista: {str(e)}"
        )
