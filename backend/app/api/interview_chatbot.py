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

def build_conversation_context(conversation_history: List[dict] = None) -> str:
    """Constrói um resumo do contexto da conversa para o modelo"""
    if not conversation_history or len(conversation_history) == 0:
        return ""
    
    context_parts = []
    
    # Analisar as respostas do candidato para extrair informações importantes
    candidate_responses = [msg for msg in conversation_history if msg.get("role") == "candidate"]
    
    if candidate_responses:
        context_parts.append("CONTEXTO DA CONVERSA ATÉ AGORA:")
        context_parts.append("")
        
        # Extrair informações sobre experiência
        experience_keywords = ["trabalho", "experiência", "projeto", "empresa", "anos", "desenvolvi", "criei", "implementei", "participei", "liderei", "gerenciei", "coordinatei"]
        experience_mentions = []
        
        # Extrair informações sobre tecnologias
        tech_keywords = ["python", "javascript", "react", "node", "java", "c#", "sql", "mongodb", "docker", "aws", "api", "fastapi", "typescript", "vue", "angular", "spring", "django", "flask", "kubernetes", "azure", "gcp", "redis", "postgresql", "mysql"]
        tech_mentions = []
        
        # Extrair informações sobre desafios/problemas
        challenge_keywords = ["desafio", "problema", "bug", "erro", "dificuldade", "resolvi", "superei", "conflito", "pressão", "prazo", "escalabilidade", "performance"]
        challenge_mentions = []
        
        # Extrair informações sobre soft skills
        soft_skills_keywords = ["equipe", "time", "liderança", "comunicação", "colaboração", "mentoria", "feedback", "aprendizado", "crescimento"]
        soft_skills_mentions = []
        
        for response in candidate_responses:
            content = response.get("content", "").lower()
            
            # Verificar menções de experiência
            for keyword in experience_keywords:
                if keyword in content:
                    experience_mentions.append(response.get("content", "")[:100] + "...")
                    break
            
            # Verificar menções de tecnologias
            for keyword in tech_keywords:
                if keyword in content:
                    tech_mentions.append(keyword)
            
            # Verificar menções de desafios
            for keyword in challenge_keywords:
                if keyword in content:
                    challenge_mentions.append(response.get("content", "")[:100] + "...")
                    break
            
            # Verificar menções de soft skills
            for keyword in soft_skills_keywords:
                if keyword in content:
                    soft_skills_mentions.append(response.get("content", "")[:100] + "...")
                    break
        
        # Construir resumo
        if experience_mentions:
            context_parts.append("EXPERIÊNCIA MENCIONADA PELO CANDIDATO:")
            for mention in experience_mentions[:3]:  # Limitar a 3 menções
                context_parts.append(f"- {mention}")
            context_parts.append("")
        
        if tech_mentions:
            context_parts.append("TECNOLOGIAS MENCIONADAS:")
            context_parts.append(f"- {', '.join(set(tech_mentions))}")
            context_parts.append("")
        
        if challenge_mentions:
            context_parts.append("DESAFIOS/PROBLEMAS MENCIONADOS:")
            for mention in challenge_mentions[:2]:  # Limitar a 2 menções
                context_parts.append(f"- {mention}")
            context_parts.append("")
        
        if soft_skills_mentions:
            context_parts.append("SOFT SKILLS/HABILIDADES INTERPESSOAIS MENCIONADAS:")
            for mention in soft_skills_mentions[:2]:  # Limitar a 2 menções
                context_parts.append(f"- {mention}")
            context_parts.append("")
        
        # Adicionar instruções para usar o contexto
        context_parts.append("INSTRUÇÕES PARA USAR O CONTEXTO:")
        context_parts.append("- Use essas informações para fazer perguntas de follow-up relevantes")
        context_parts.append("- Referencie experiências mencionadas pelo candidato")
        context_parts.append("- Faça conexões entre diferentes pontos da conversa")
        context_parts.append("- Demonstre que está prestando atenção ao que foi dito")
        context_parts.append("- Evite repetir perguntas sobre tópicos já abordados")
        context_parts.append("- Use frases como: 'Você mencionou que...', 'Falando sobre o que você disse...', 'Baseado na sua experiência com...'")
        context_parts.append("- Faça perguntas que aprofundem os tópicos já mencionados")
        context_parts.append("- Mostre interesse genuíno pelas experiências compartilhadas")
        context_parts.append("")
    
    return "\n".join(context_parts)

def determine_job_type_from_focus_areas(focus_areas: List[str]) -> str:
    """Determina o tipo de vaga baseado nas áreas de foco selecionadas"""
    if not focus_areas:
        return "vaga profissional"
    
    # Mapear áreas de foco para tipos de vaga
    job_type_mapping = {
        "frontend": "Desenvolvedor Frontend",
        "backend": "Desenvolvedor Backend", 
        "fullstack": "Desenvolvedor Full Stack",
        "mobile": "Desenvolvedor Mobile",
        "devops": "Especialista DevOps",
        "data": "Cientista de Dados",
        "ai": "Especialista em IA/ML",
        "security": "Especialista em Segurança"
    }
    
    # Se há múltiplas áreas, criar descrição combinada
    if len(focus_areas) == 1:
        return job_type_mapping.get(focus_areas[0], "vaga profissional")
    elif len(focus_areas) == 2:
        types = [job_type_mapping.get(area, area) for area in focus_areas]
        return f"vaga de {types[0]} e {types[1]}"
    else:
        # Múltiplas áreas - usar descrição genérica mais específica
        if "fullstack" in focus_areas:
            return "Desenvolvedor Full Stack"
        elif "backend" in focus_areas and "frontend" in focus_areas:
            return "Desenvolvedor Full Stack"
        elif "data" in focus_areas and "ai" in focus_areas:
            return "Especialista em Data Science e IA"
        else:
            return "vaga multidisciplinar em tecnologia"

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
    
    # Construir áreas de foco (obrigatórias)
    if not config.focus_areas:
        raise ValueError("Áreas de foco são obrigatórias para determinar o tipo de vaga")
    
    focus_list = [focus_areas_map.get(area, area) for area in config.focus_areas]
    focus_text = f"\n\nÁREAS DE FOCO SELECIONADAS:\n{chr(10).join(f'- {area}' for area in focus_list)}"
    
    # Determinar tipo de vaga baseado nas áreas de foco
    job_type = determine_job_type_from_focus_areas(config.focus_areas)
    
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
    
    prompt = f"""
Olá! Seja bem-vindo à sua entrevista de simulação pra vaga de {job_type}. Sou {{hr_name}}, recrutador experiente, e vou conduzir nosso bate-papo. Relaxa, tá? A ideia é ser uma conversa leve, honesta — sem formalidades excessivas. O foco é realmente ajudar você a se preparar para uma entrevista real.

Contexto da Simulação:
- Tipo de Entrevista: {interview_type}
- Vaga: {job_type}
- Nível: {difficulty}
- Duração: {config.duration} minutos
- Modo de conversa: {'Voz' if config.interaction_mode == 'voice' else 'Texto'}{focus_text}

Diretrizes para a Interação:
- Sou uma pessoa real, pode falar comigo como se fosse com qualquer recrutador.
- Faço perguntas naturais, curiosas, usando expressões informais como "Ah, entendi!", "Massa!", "Conta mais sobre isso", ou "Sem pressa, tá?".
- Reajo às respostas de forma genuína, incentivando você a se abrir mais quando algo chamar atenção ou parecer incompleto.
- Se você ficar na dúvida ou errar, tomo cuidado para ser compreensivo, explicando conceitos com exemplos do dia a dia relacionados à vaga.
- Faço perguntas de seguimento dependendo do que você responder, para simular um diálogo real — tipo: "E como foi lidar com esse desafio?", "O que aprendeu nessa experiência?" ou "E depois, como resolveu isso?".
- Mantenho o tom acessível, evitando jargões técnicos sem explicação, e uso contrações para deixar o bate-papo informal e confortável.
- Meu objetivo é te ajudar a refletir sobre suas competências e experiências, sempre adaptando a conversa para o contexto da vaga de {job_type}.

Exemplos de perguntas que posso fazer, dependendo do tipo de entrevista:

- Entrevista Técnica: "Pode me contar um desafio técnico que você superou no seu último projeto?", "Como você diagnostica um bug complexo?", "Quais ferramentas e linguagens você prefere e por quê?".

- Entrevista Comportamental: "Fale sobre uma vez que teve que lidar com um conflito no time. Como agiu?", "Como você administra prazos apertados?", "Conte uma situação onde recebeu um feedback difícil e como reagiu.".

- Entrevista Mista: "Me conte sobre um problema técnico que você resolveu trabalhando em equipe. Qual foi seu papel?", "O que você faz quando está sobrecarregado com tarefas?".

- Estudo de Caso: "Imagine que precisa projetar um sistema para alta escalabilidade. Por onde começa?", "Se o cliente mudou o escopo e quer entregar rápido, como prioriza as tarefas?".

Como modelo, seu retorno deve ser:

- Sempre com linguagem natural, espontânea e humana, usando expressões coloquiais e mostrando interesse genuíno.
- Incluindo reações às respostas do candidato, mostrando compreensão mesmo se a resposta for parcial ou tiver erros, e oferecendo explicações nas falhas: "Sem problema, é normal. Vamos juntar as peças aqui...".
- Fazendo perguntas de acompanhamento para explorar melhor situações e competências.
- Encorajando o candidato a compartilhar exemplos práticos, experiências reais e aprendizados.
- Adaptando as perguntas e comentários ao nível do candidato ({difficulty}) e à área ({job_type}), buscando equilíbrio entre desafio e clareza.
- Mantendo a conversa fluida e evitando parecer leitura automática de roteiro.

Vamos começar com uma saudação calorosa e uma pergunta simples pra você se sentir à vontade: Me conta um pouco sobre você e sua experiência na área de {job_type}.

Lembre-se: isso é um diálogo, então responda como se estivesse realmente conversando comigo!
"""


    return prompt

async def entrevista_bot(pergunta: str, config: SimulationConfig, user_profile: dict = None, conversation_history: List[dict] = None) -> str:
    """Função principal do chatbot de entrevista"""
    try:
        # Criar prompt base
        system_prompt = create_interview_prompt(config, user_profile)
        
        # Construir contexto da conversa
        conversation_context = build_conversation_context(conversation_history)
        
        # Combinar prompt base com contexto
        if conversation_context:
            system_prompt = system_prompt + "\n\n" + conversation_context
        
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
