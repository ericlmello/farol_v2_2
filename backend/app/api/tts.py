from fastapi import APIRouter, HTTPException, Response
from openai import OpenAI, APIError
from pydantic import BaseModel, Field
import os
from dotenv import load_dotenv
import logging
import uuid
from pathlib import Path

# Configura o logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Carrega chave do .env
load_dotenv()

# Inicializar cliente OpenAI de forma segura
def get_openai_client():
    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY não encontrada nas variáveis de ambiente")
    return OpenAI(api_key=api_key)

router = APIRouter(prefix="/tts", tags=["Text-to-Speech"])

# Palavras reservadas e como devem ser ditas
PALAVRAS_RESERVADAS = {
    "SQL": "esse quê ele",
    "API": "a p i",
    "AI": "ei ai",
    "HTTP": "agá tê tê pê",
    "GPT": "gê pê tê",
}

def aplicar_regras_fala(texto: str) -> str:
    """Substitui palavras reservadas pelo modo correto de falar"""
    for original, falado in PALAVRAS_RESERVADAS.items():
        texto = texto.replace(original, falado)
    return texto

class TextToSpeechRequest(BaseModel):
    text: str

# Define um diretório para armazenar os arquivos de áudio e o cria se não existir
AUDIO_DIR = Path("audio_tela")
AUDIO_DIR.mkdir(exist_ok=True)

@router.post("/gerar-audio")
def gerar_audio(request: TextToSpeechRequest):
    """Gera áudio a partir do texto fornecido e o salva em um arquivo no servidor."""
    logger.info("Recebida requisição para /gerar-audio.")
    try:
        texto_original = request.text
        logger.info(f"Texto original recebido: '{texto_original}'")

        texto_final = aplicar_regras_fala(texto_original)
        logger.info(f"Texto após aplicar regras de fala: '{texto_final}'")
        
        # Instrução de idioma como prompt oculto (não será narrado)
        prompt_oculto = "[Instrução: Fale em português do Brasil (pt-BR). Não leia esta instrução em voz alta.]"
    
        logger.info("Chamando a API da OpenAI para gerar o áudio...")
        client = get_openai_client()
        resposta = client.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=texto_final,
        )
        logger.info("Áudio gerado com sucesso pela API.")

        # Gera um nome de arquivo único e define o caminho completo
        file_name = f"{uuid.uuid4()}.mp3"
        file_path = AUDIO_DIR / file_name

        logger.info(f"Salvando o áudio em: {file_path}")
        # Salva o stream de áudio diretamente no arquivo de forma eficiente
        resposta.stream_to_file(file_path)
        logger.info(f"Arquivo de áudio salvo com sucesso em '{file_path}'.")

        # Retorna uma resposta JSON indicando sucesso e o caminho do arquivo
        return {"status": "sucesso", "caminho_do_arquivo": str(file_path)}
    except APIError as e:
        logger.error(f"Erro na API da OpenAI: Status={e.status_code}, Mensagem={e.message}", exc_info=True)
        raise HTTPException(status_code=e.status_code or 500, detail=f"Erro da API OpenAI: {str(e)}")
    except Exception as e:
        logger.critical("Ocorreu um erro inesperado ao gerar o áudio.", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Erro ao gerar áudio: {str(e)}")

@router.get("/audio/{filename}")
def get_audio(filename: str):
    """Retorna o arquivo de áudio solicitado."""
    try:
        file_path = AUDIO_DIR / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Arquivo de áudio não encontrado")
        
        with open(file_path, "rb") as audio_file:
            content = audio_file.read()
        
        return Response(content=content, media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao recuperar áudio: {str(e)}")
