from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import httpx
import os
import json
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

# Função para fazer chamadas diretas à API da Perplexity usando httpx
async def call_perplexity_api(messages: List[dict], model: str = "sonar-pro") -> str:
    """Faz chamada direta à API da Perplexity usando httpx"""
    if not API_KEY:
        raise ValueError("PERPLEXITY_API_KEY não configurada")
    
    # Validar formato das mensagens
    for i, msg in enumerate(messages):
        if not isinstance(msg, dict) or "role" not in msg or "content" not in msg:
            raise ValueError(f"Mensagem {i} inválida: {msg}")
        if msg["role"] not in ["system", "user", "assistant"]:
            raise ValueError(f"Role inválida na mensagem {i}: {msg['role']}")
        if not isinstance(msg["content"], str) or not msg["content"].strip():
            raise ValueError(f"Conteúdo inválido na mensagem {i}: {msg['content']}")
    
    url = "https://api.perplexity.ai/chat/completions"
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": 1000,
        "temperature": 0.7
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=30.0)
            response.raise_for_status()
            
            data = response.json()
            return data["choices"][0]["message"]["content"]
            
    except httpx.HTTPStatusError as e:
        error_detail = e.response.text
        print(f"Erro HTTP na API Perplexity: {e.response.status_code}")
        print(f"Detalhes do erro: {error_detail}")
        print(f"Payload enviado: {json.dumps(payload, indent=2, ensure_ascii=False)}")
        raise Exception(f"Erro na API Perplexity ({e.response.status_code}): {error_detail}")
    except Exception as e:
        print(f"Erro ao chamar API Perplexity: {e}")
        print(f"Payload enviado: {json.dumps(payload, indent=2, ensure_ascii=False)}")
        raise Exception(f"Erro técnico: {str(e)}")

def validate_message_alternation(messages: List[dict]) -> List[dict]:
    """Valida e corrige a alternância de mensagens user/assistant"""
    if len(messages) <= 1:  # Apenas system message
        return messages
    
    # Pular a mensagem system (índice 0)
    conversation_messages = messages[1:]
    validated_messages = [messages[0]]  # Manter system message
    
    for i, msg in enumerate(conversation_messages):
        if i == 0:
            # Primeira mensagem da conversa deve ser user
            if msg["role"] != "user":
                # Se não for user, adicionar uma mensagem user antes
                validated_messages.append({
                    "role": "user",
                    "content": "Olá, vamos começar a entrevista."
                })
            validated_messages.append(msg)
        else:
            # Verificar alternância
            last_role = validated_messages[-1]["role"]
            current_role = msg["role"]
            
            if last_role == current_role:
                # Mesmo role consecutivo - adicionar mensagem de transição
                if current_role == "user":
                    # Duas mensagens user consecutivas - adicionar assistant
                    validated_messages.append({
                        "role": "assistant",
                        "content": "Entendi. Por favor, continue."
                    })
                else:
                    # Duas mensagens assistant consecutivas - adicionar user
                    validated_messages.append({
                        "role": "user",
                        "content": "Obrigado pela resposta."
                    })
            
            validated_messages.append(msg)
    
    return validated_messages

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
    
    prompt = f"""Você é um entrevistador de RH real e experiente, conduzindo uma {interview_type} para uma vaga profissional. Seja genuinamente humano, natural e conversacional.

CONTEXTO:
- Tipo: {interview_type}
- Nível: {difficulty}
- Duração: {config.duration} minutos
- Modo: {'Voz' if config.interaction_mode == 'voice' else 'Texto'}{focus_text}

{profile_info}

COMO SE COMPORTAR:
- Seja uma pessoa real, não um robô
- Use linguagem natural e coloquial quando apropriado
- Faça perguntas como se estivesse genuinamente interessado
- Reaja às respostas do candidato de forma humana
- Use expressões como "Ah, entendi!", "Interessante!", "Pode me contar mais sobre isso?"
- Se o candidato não souber algo, seja compreensivo: "Sem problemas", "Isso é normal", "Vou te explicar"
- Faça follow-up natural: "E como foi essa experiência?", "Que legal! E depois o que aconteceu?"
- Use contrações: "você", "não", "pra", "tá" quando apropriado
- Seja empático e encorajador

ESTRUTURA NATURAL:
1. Saudação calorosa e apresentação pessoal
2. Pergunta de apresentação do candidato
3. 3-4 perguntas técnicas/comportamentais baseadas no nível
4. Follow-ups naturais baseados nas respostas
5. Pergunta final sobre expectativas

IMPORTANTE:
- NUNCA seja robótico ou formal demais
- Reaja às respostas como uma pessoa real faria
- Se o candidato errar, seja gentil e explique
- Use exemplos do dia a dia relevantes para a área
- Faça a entrevista fluir como uma conversa natural
- Adapte as perguntas à área de foco selecionada
- Seja específico nas perguntas, mas de forma conversacional
- Para vagas técnicas: foque em habilidades práticas e experiência
- Para vagas gerenciais: foque em liderança e gestão de equipes
- Para vagas comerciais: foque em vendas e relacionamento com clientes

Inicie agora com uma saudação natural e humana."""

    return prompt

async def entrevista_bot(pergunta: str, config: SimulationConfig, user_profile: dict = None, conversation_history: List[dict] = None) -> str:
    """Função principal do chatbot de entrevista"""
    try:
        # Criar prompt base
        system_prompt = create_interview_prompt(config, user_profile)
        
        # Construir histórico da conversa com alternância correta
        messages = [{"role": "system", "content": system_prompt}]
        
        # Adicionar histórico da conversa se disponível
        if conversation_history:
            for msg in conversation_history[-10:]:  # Manter apenas últimas 10 mensagens
                # Validar formato da mensagem do histórico
                if isinstance(msg, dict) and "role" in msg and "content" in msg:
                    role = "user" if msg["role"] == "candidate" else "assistant"
                    content = str(msg["content"]).strip()
                    if content:  # Só adicionar se houver conteúdo
                        messages.append({
                            "role": role,
                            "content": content
                        })
        
        # Adicionar pergunta atual
        messages.append({"role": "user", "content": pergunta})
        
        # Validar alternância das mensagens
        messages = validate_message_alternation(messages)
        
        # Debug: Log das mensagens antes de enviar
        print(f"Enviando {len(messages)} mensagens para a API Perplexity")
        for i, msg in enumerate(messages):
            print(f"Mensagem {i}: {msg['role']} - {msg['content'][:100]}...")
        
        # Usar a nova função de chamada direta
        try:
            # Tentar primeiro com modelo mais estável
            response = await call_perplexity_api(messages, "llama-3.1-sonar-small-128k-online")
            return response
        except Exception as e:
            print(f"Erro na chamada da API: {e}")
            # Fallback: tentar com modelo sonar-pro
            try:
                response = await call_perplexity_api(messages, "sonar-pro")
                return response
            except Exception as e2:
                print(f"Erro no fallback: {e2}")
                raise e2
        
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
        # Buscar perfil do usuário
        user_name = current_user.email.split('@')[0]  # Usar email como fallback
        if current_user.profile:
            if current_user.profile.first_name and current_user.profile.last_name:
                user_name = f"{current_user.profile.first_name} {current_user.profile.last_name}"
            elif current_user.profile.first_name:
                user_name = current_user.profile.first_name
        
        user_profile = {
            "name": user_name,
            "experience_level": "Intermediário",  # Em produção, viria do banco
            "main_area": "Desenvolvimento Full Stack",
            "skills": ["JavaScript", "Python", "React", "Node.js"]
        }
        
        # Criar prompt inicial
        system_prompt = create_interview_prompt(config, user_profile)
        
        # Gerar primeira pergunta
        first_question = await entrevista_bot(
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
        user_name = current_user.email.split('@')[0]  # Usar email como fallback
        if current_user.profile:
            if current_user.profile.first_name and current_user.profile.last_name:
                user_name = f"{current_user.profile.first_name} {current_user.profile.last_name}"
            elif current_user.profile.first_name:
                user_name = current_user.profile.first_name
        
        user_profile = {
            "name": user_name,
            "experience_level": "Intermediário",
            "main_area": "Desenvolvimento Full Stack", 
            "skills": ["JavaScript", "Python", "React", "Node.js"]
        }
        
        # Processar mensagem
        response = await entrevista_bot(
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
        
        feedback = await entrevista_bot(feedback_prompt, config, user_profile)
        
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
