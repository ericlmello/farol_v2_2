from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.responses import JSONResponse
import openai
import io
import json
import base64
import logging
from typing import Dict, Any
from ..core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# Configurar OpenAI (removido - usando cliente direto)

@router.post("/transcribe")
async def transcribe_audio(audio_file: UploadFile = File(...)):
    """
    Transcreve áudio usando OpenAI Whisper com tratamento robusto de erros
    """
    try:
        logger.info(f"Iniciando transcrição de áudio - Arquivo: {audio_file.filename}, Tipo: {audio_file.content_type}")
        
        # 1. Verificar se a API key está configurada
        if not settings.openai_api_key:
            logger.error("OpenAI API key não configurada no ambiente")
            raise HTTPException(
                status_code=500, 
                detail="OpenAI API key não configurada no servidor"
            )
        
        logger.info("OpenAI API key verificada com sucesso")
        
        # 2. Verificar se o arquivo foi recebido
        if not audio_file:
            logger.error("Nenhum arquivo de áudio foi recebido")
            raise HTTPException(
                status_code=400,
                detail="Nenhum arquivo de áudio foi enviado"
            )
        
        # 3. Verificar tipo de arquivo (mais flexível)
        allowed_types = ['audio/', 'video/']  # Aceita tanto áudio quanto vídeo
        if not audio_file.content_type or not any(audio_file.content_type.startswith(t) for t in allowed_types):
            logger.warning(f"Tipo de arquivo não suportado: {audio_file.content_type}")
            raise HTTPException(
                status_code=400,
                detail=f"Tipo de arquivo não suportado: {audio_file.content_type}. Use arquivos de áudio ou vídeo."
            )
        
        logger.info(f"Tipo de arquivo aceito: {audio_file.content_type}")
        
        # 4. Ler o arquivo de áudio
        try:
            audio_content = await audio_file.read()
            logger.info(f"Arquivo lido com sucesso - Tamanho: {len(audio_content)} bytes")
            
            if len(audio_content) == 0:
                logger.error("Arquivo de áudio está vazio")
                raise HTTPException(
                    status_code=400,
                    detail="Arquivo de áudio está vazio"
                )
                
        except Exception as e:
            logger.error(f"Erro ao ler arquivo de áudio: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail="Erro ao processar arquivo de áudio"
            )
        
        # 5. Criar um objeto de arquivo para o Whisper
        try:
            audio_file_obj = io.BytesIO(audio_content)
            # Definir nome do arquivo com extensão apropriada
            filename = audio_file.filename or "audio.webm"
            if not filename.lower().endswith(('.webm', '.mp4', '.mp3', '.wav', '.m4a')):
                filename = "audio.webm"  # Fallback para webm
            audio_file_obj.name = filename
            
            logger.info(f"Objeto de arquivo criado - Nome: {filename}")
            
        except Exception as e:
            logger.error(f"Erro ao criar objeto de arquivo: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Erro ao preparar arquivo para transcrição"
            )
        
        # 6. Transcrever usando Whisper
        try:
            logger.info("Iniciando chamada para OpenAI Whisper API")
            
            # Usar a nova API do OpenAI (v1.x)
            client = openai.OpenAI(api_key=settings.openai_api_key)
            
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file_obj,
                language="pt",  # Português brasileiro
                response_format="text"
            )
            
            logger.info("Transcrição concluída com sucesso")
            
            return {
                "success": True,
                "transcript": transcript,
                "language": "pt",
                "file_info": {
                    "filename": filename,
                    "content_type": audio_file.content_type,
                    "size_bytes": len(audio_content)
                }
            }
            
        except openai.APIError as e:
            logger.error(f"Erro da API OpenAI: {str(e)}")
            raise HTTPException(
                status_code=502,
                detail=f"Erro na API de transcrição: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Erro inesperado na transcrição: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Erro interno na transcrição de áudio"
            )
        
    except HTTPException:
        # Re-raise HTTPExceptions para manter o status code correto
        raise
    except Exception as e:
        # Capturar qualquer erro não tratado
        logger.exception("Erro crítico não tratado na transcrição de áudio")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor na transcrição de áudio"
        )

@router.post("/interpret")
async def interpret_intent(request: Dict[str, Any]):
    """
    Interpreta a intenção do usuário usando GPT-4o-mini
    """
    try:
        # Verificar se a API key está configurada
        if not settings.openai_api_key:
            raise HTTPException(
                status_code=500, 
                detail="OpenAI API key não configurada"
            )
        
        transcript = request.get("transcript", "")
        if not transcript:
            raise HTTPException(
                status_code=400,
                detail="Transcript é obrigatório"
            )
        
        # System prompt para interpretação de comandos
        system_prompt = """
        Você é o assistente de voz inteligente da Plataforma Farol, uma plataforma de empregabilidade para PCDs.
        
        Sua função é interpretar comandos de voz do usuário e retornar sempre um JSON estruturado com:
        - intent: A ação principal que o usuário quer executar
        - entities: Detalhes específicos extraídos do comando
        
        INTENTS DISPONÍVEIS:
        - "navigate": Navegar para uma página específica
        - "search_jobs": Buscar vagas com filtros específicos
        - "describe_screen": Descrever a tela atual
        - "profile": Acessar ou editar perfil
        - "matches": Ver matches de vagas
        - "interviews": Ver entrevistas agendadas
        - "simulations": Acessar simulações
        - "development_hub": Acessar hub de desenvolvimento
        - "help": Mostrar ajuda
        - "unrecognized": Comando não reconhecido
        
        ENTITIES POSSÍVEIS:
        - destination: Caminho da página (/jobs, /profile, /dashboard, etc.)
        - job_title: Título do cargo
        - location: Localização (home office, presencial, híbrido, cidade)
        - company: Nome da empresa
        - experience_level: Nível de experiência
        - salary_range: Faixa salarial
        
        EXEMPLOS:
        "Vou para vagas" -> {"intent": "navigate", "entities": {"destination": "/jobs"}}
        "Buscar vagas de analista de dados" -> {"intent": "search_jobs", "entities": {"job_title": "analista de dados"}}
        "Descrever a tela" -> {"intent": "describe_screen", "entities": {}}
        "Ver meu perfil" -> {"intent": "navigate", "entities": {"destination": "/profile"}}
        "Vagas home office" -> {"intent": "search_jobs", "entities": {"location": "home office"}}
        "Ajuda" -> {"intent": "help", "entities": {}}
        
        INTENTS ADICIONAIS:
        - "schedule_interview": Agendar entrevista
        - "update_profile": Atualizar perfil
        - "search_courses": Buscar cursos
        
        ENTITIES ADICIONAIS:
        - company: Nome da empresa
        - position: Cargo/posição
        - date: Data (formato YYYY-MM-DD)
        - time: Horário (formato HH:MM)
        - interview_type: Tipo de entrevista (online/presencial)
        - profile_field: Campo do perfil a atualizar
        - profile_value: Novo valor para o campo
        - course_query: Termo de busca para cursos
        - course_category: Categoria do curso
        - course_level: Nível do curso (iniciante/intermediario/avancado)
        
        EXEMPLOS ADICIONAIS:
        "Agendar entrevista com Google para desenvolvedor" -> {"intent": "schedule_interview", "entities": {"company": "Google", "position": "desenvolvedor"}}
        "Atualizar meu telefone para 11999999999" -> {"intent": "update_profile", "entities": {"profile_field": "phone", "profile_value": "11999999999"}}
        "Buscar cursos de Python" -> {"intent": "search_courses", "entities": {"course_query": "Python"}}
        "Cursos de JavaScript para iniciantes" -> {"intent": "search_courses", "entities": {"course_query": "JavaScript", "course_level": "iniciante"}}
        
        IMPORTANTE:
        - Retorne APENAS o JSON, sem texto adicional
        - Seja flexível com sinônimos e variações
        - Para navegação, use os caminhos exatos das rotas
        - Para busca de vagas, extraia o máximo de informações possível
        - Para comandos avançados, extraia todas as informações relevantes
        """
        
        # Fazer a chamada para GPT-4o-mini usando nova API
        client = openai.OpenAI(api_key=settings.openai_api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Comando do usuário: {transcript}"}
            ],
            temperature=0.1,  # Baixa temperatura para consistência
            max_tokens=200
        )
        
        # Extrair a resposta
        gpt_response = response.choices[0].message.content.strip()
        
        # Tentar fazer parse do JSON
        try:
            intent_data = json.loads(gpt_response)
        except json.JSONDecodeError:
            # Se não conseguir fazer parse, retornar como não reconhecido
            intent_data = {
                "intent": "unrecognized",
                "entities": {}
            }
        
        return {
            "success": True,
            "intent": intent_data.get("intent", "unrecognized"),
            "entities": intent_data.get("entities", {}),
            "original_transcript": transcript
        }
        
    except Exception as e:
        print(f"Erro na interpretação: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro na interpretação: {str(e)}"
        )

@router.post("/screenshot")
async def take_screenshot():
    """
    Endpoint para capturar screenshot (mantido para compatibilidade)
    """
    # Este endpoint será implementado pelo frontend
    # Por enquanto, retornamos um mock
    return {
        "success": True,
        "message": "Screenshot endpoint - implementar no frontend"
    }

@router.post("/describe")
async def describe_image(request: Dict[str, Any]):
    """
    Descreve uma imagem usando GPT-4o-mini Vision
    """
    try:
        if not settings.openai_api_key:
            raise HTTPException(
                status_code=500, 
                detail="OpenAI API key não configurada"
            )
        
        image_base64 = request.get("image", "")
        if not image_base64:
            raise HTTPException(
                status_code=400,
                detail="Imagem é obrigatória"
            )
        
        # Fazer a chamada para GPT-4o-mini Vision usando nova API
        client = openai.OpenAI(api_key=settings.openai_api_key)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Descreva detalhadamente o que você vê nesta tela da Plataforma Farol. Inclua elementos visuais, botões, textos, layout e funcionalidades disponíveis. Seja específico e útil para um usuário com deficiência visual."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{image_base64}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=500
        )
        
        description = response.choices[0].message.content
        
        return {
            "success": True,
            "description": description
        }
        
    except Exception as e:
        print(f"Erro na descrição: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro na descrição: {str(e)}"
        )

@router.post("/speak")
async def generate_speech(request: Dict[str, Any]):
    """
    Gera áudio de fala usando OpenAI TTS
    """
    try:
        if not settings.openai_api_key:
            raise HTTPException(
                status_code=500, 
                detail="OpenAI API key não configurada"
            )
        
        text = request.get("text", "")
        if not text:
            raise HTTPException(
                status_code=400,
                detail="Texto é obrigatório"
            )
        
        # Gerar áudio usando OpenAI TTS com nova API
        client = openai.OpenAI(api_key=settings.openai_api_key)
        response = client.audio.speech.create(
            model="tts-1",
            voice="alloy",  # Voz neutra e clara
            input=text,
            response_format="mp3"
        )
        
        # Converter para base64 para envio
        audio_base64 = base64.b64encode(response.content).decode('utf-8')
        
        return {
            "success": True,
            "audio": audio_base64,
            "format": "mp3"
        }
        
    except Exception as e:
        print(f"Erro na geração de fala: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro na geração de fala: {str(e)}"
        )

@router.post("/schedule-interview")
async def schedule_interview(request: Dict[str, Any]):
    """
    Agenda uma entrevista baseada em comando de voz
    """
    try:
        # Extrair dados da requisição
        company = request.get("company", "")
        position = request.get("position", "")
        date = request.get("date", "")
        time = request.get("time", "")
        interview_type = request.get("interview_type", "online")
        notes = request.get("notes", "")
        
        # Validações básicas
        if not company or not position:
            raise HTTPException(
                status_code=400,
                detail="Empresa e posição são obrigatórios"
            )
        
        # Aqui você integraria com seu sistema de agendamento
        # Por enquanto, retornamos um mock
        import time as time_module
        interview_id = f"int_{int(time_module.time())}"
        
        return {
            "success": True,
            "message": f"Entrevista agendada com {company} para {position}",
            "interview_id": interview_id,
            "details": {
                "company": company,
                "position": position,
                "date": date,
                "time": time,
                "type": interview_type,
                "notes": notes
            }
        }
        
    except Exception as e:
        print(f"Erro ao agendar entrevista: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao agendar entrevista: {str(e)}"
        )

@router.put("/update-profile")
async def update_profile(request: Dict[str, Any]):
    """
    Atualiza informações do perfil baseado em comando de voz
    """
    try:
        field = request.get("field", "")
        value = request.get("value", "")
        section = request.get("section", "personal")
        
        if not field or not value:
            raise HTTPException(
                status_code=400,
                detail="Campo e valor são obrigatórios"
            )
        
        # Mapear campos de voz para campos do banco
        field_mapping = {
            "telefone": "phone",
            "phone": "phone",
            "celular": "phone",
            "email": "email",
            "nome": "first_name",
            "sobrenome": "last_name",
            "bio": "bio",
            "experiência": "experience_summary",
            "experiencia": "experience_summary"
        }
        
        mapped_field = field_mapping.get(field.lower(), field)
        
        # Aqui você integraria com seu sistema de perfil
        # Por enquanto, retornamos um mock
        
        return {
            "success": True,
            "message": f"Campo {field} atualizado com sucesso",
            "updated_field": mapped_field,
            "new_value": value
        }
        
    except Exception as e:
        print(f"Erro ao atualizar perfil: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao atualizar perfil: {str(e)}"
        )

@router.post("/search-courses")
async def search_courses(request: Dict[str, Any]):
    """
    Busca cursos baseado em comando de voz
    """
    try:
        query = request.get("query", "")
        category = request.get("category", "")
        level = request.get("level", "")
        duration = request.get("duration", "")
        
        # Aqui você integraria com seu sistema de cursos
        # Por enquanto, retornamos um mock
        
        mock_courses = [
            {
                "id": "1",
                "title": f"Curso de {query or 'Programação'}",
                "description": f"Aprenda {query or 'programação'} do zero",
                "level": level or "iniciante",
                "duration": duration or "40 horas",
                "category": category or "programação",
                "rating": 4.5,
                "students": 1250
            },
            {
                "id": "2", 
                "title": f"{query or 'Desenvolvimento'} Avançado",
                "description": f"Curso avançado de {query or 'desenvolvimento'}",
                "level": "avancado",
                "duration": "60 horas",
                "category": category or "desenvolvimento",
                "rating": 4.8,
                "students": 890
            }
        ]
        
        return {
            "success": True,
            "courses": mock_courses,
            "message": f"Encontrados {len(mock_courses)} cursos para '{query}'",
            "filters": {
                "query": query,
                "category": category,
                "level": level,
                "duration": duration
            }
        }
        
    except Exception as e:
        print(f"Erro na busca de cursos: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erro na busca de cursos: {str(e)}"
        )
