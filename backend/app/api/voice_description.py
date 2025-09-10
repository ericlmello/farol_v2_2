from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from playwright.async_api import async_playwright
from openai import OpenAI
from PIL import Image
import os
import io
import uuid
import base64
import asyncio
from pathlib import Path
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Carrega chave do .env
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY") or os.getenv("API_KEY"))

router = APIRouter(prefix="/voice-description", tags=["Voice Description"])

# Diretórios
SCREENSHOT_DIR = Path("screenshots")
AUDIO_DIR = Path("audio_tela")
SCREENSHOT_DIR.mkdir(exist_ok=True)
AUDIO_DIR.mkdir(exist_ok=True)

class VoiceDescriptionRequest(BaseModel):
    url: HttpUrl

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

async def take_screenshot_async(url: str) -> str:
    """Tira screenshot da página"""
    logger.info(f"Tirando screenshot da URL: {url}")
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            await page.set_viewport_size({"width": 1920, "height": 1080})
            await page.goto(str(url), wait_until="networkidle", timeout=60000)
            await page.wait_for_timeout(2000)

            # Expande o container main se existir
            await page.evaluate("""
                () => {
                    const mainElement = document.querySelector('main');
                    const body = document.body;
                    const html = document.documentElement;

                    if (mainElement) {
                        const scrollHeight = mainElement.scrollHeight;
                        html.style.height = 'auto';
                        body.style.height = 'auto';
                        mainElement.style.height = `${scrollHeight}px`;
                        mainElement.style.overflow = 'visible';
                    }
                }
            """)

            file_name = f"{uuid.uuid4()}.png"
            file_path = SCREENSHOT_DIR / file_name
            await page.screenshot(path=str(file_path), full_page=True)
            await browser.close()
            
            logger.info(f"Screenshot salvo em: {file_path}")
            return str(file_name)
    except Exception as e:
        logger.exception("Erro ao tirar screenshot")
        raise HTTPException(status_code=500, detail=f"Erro ao tirar screenshot: {str(e)}")

def preprocess_image_bytes(path, max_width=1024, jpeg_quality=75):
    """Redimensiona e retorna bytes da imagem otimizada + mime."""
    img = Image.open(path).convert("RGB")
    w, h = img.size
    if w > max_width:
        new_h = int(max_width * h / w)
        img = img.resize((max_width, new_h), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=jpeg_quality, optimize=True)
    data = buf.getvalue()
    return data, "image/jpeg"

def descrever_imagem_com_llm(caminho_imagem: str) -> str:
    """Descreve a imagem usando LLM"""
    logger.info(f"Descrevendo imagem: {caminho_imagem}")
    try:
        img_bytes, mime = preprocess_image_bytes(caminho_imagem, max_width=1024, jpeg_quality=75)

        prompt = """
        Você é um audiodescritor especialista em acessibilidade digital. Sua missão é traduzir conteúdo visual em uma experiência verbal rica e funcional para um usuário cego.

        Analise a imagem de uma página da web e gere uma descrição textual detalhada e estruturada. O objetivo é permitir que um usuário cego forme um mapa mental preciso da página.

        Regras:
        1. Use linguagem objetiva e não-visual
        2. Seja específico e quantitativo
        3. Foque na função dos elementos
        4. Descreva na ordem lógica (topo para baixo)
        5. Identifique todos os elementos interativos

        Formato:
        - Resumo geral da página
        - Estrutura e layout
        - Navegação sequencial
        - Elementos interativos
        - Conteúdo visual

        Seja conciso mas completo. Máximo 500 palavras.
        """

        data_url = f"data:{mime};base64,{base64.b64encode(img_bytes).decode('utf-8')}"
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": data_url}},
                    ],
                }
            ],
            max_tokens=500,
            temperature=0.0,
        )

        descricao = response.choices[0].message.content
        logger.info(f"Descrição gerada: {len(descricao)} caracteres")
        return descricao
    except Exception as e:
        logger.exception("Erro ao descrever imagem")
        raise HTTPException(status_code=500, detail=f"Erro ao descrever imagem: {str(e)}")

def gerar_audio_com_openai(texto: str) -> str:
    """Gera áudio usando OpenAI TTS"""
    logger.info(f"Gerando áudio para texto de {len(texto)} caracteres")
    try:
        texto_final = aplicar_regras_fala(texto)
        
        resposta = client.audio.speech.create(
            model="tts-1",
            voice="nova",
            input=texto_final,
        )

        file_name = f"{uuid.uuid4()}.mp3"
        file_path = AUDIO_DIR / file_name
        resposta.stream_to_file(file_path)
        
        logger.info(f"Áudio salvo em: {file_path}")
        return str(file_name)
    except Exception as e:
        logger.exception("Erro ao gerar áudio")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar áudio: {str(e)}")

@router.post("/describe-page")
async def describe_page(request: VoiceDescriptionRequest):
    """Descreve uma página web e gera áudio da descrição"""
    logger.info(f"Recebida requisição para descrever página: {request.url}")
    
    try:
        # 1. Tirar screenshot
        screenshot_filename = await take_screenshot_async(str(request.url))
        screenshot_path = SCREENSHOT_DIR / screenshot_filename
        
        # 2. Descrever com LLM
        descricao = descrever_imagem_com_llm(str(screenshot_path))
        
        # 3. Gerar áudio
        audio_filename = gerar_audio_com_openai(descricao)
        
        return {
            "status": "sucesso",
            "screenshot": screenshot_filename,
            "descricao": descricao,
            "audio": audio_filename,
            "audio_url": f"/api/v1/voice-description/audio/{audio_filename}"
        }
    except Exception as e:
        logger.exception("Erro na descrição da página")
        raise HTTPException(status_code=500, detail=f"Erro ao descrever página: {str(e)}")

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

# Limpeza automática de arquivos antigos (executar a cada 10 minutos)
async def cleanup_old_files():
    """Remove arquivos de screenshot e áudio com mais de 10 minutos"""
    import time
    current_time = time.time()
    max_age = 600  # 10 minutos em segundos
    
    for directory in [SCREENSHOT_DIR, AUDIO_DIR]:
        for file_path in directory.iterdir():
            if file_path.is_file():
                file_age = current_time - file_path.stat().st_mtime
                if file_age > max_age:
                    try:
                        file_path.unlink()
                        logger.info(f"Arquivo antigo removido: {file_path}")
                    except Exception as e:
                        logger.error(f"Erro ao remover arquivo {file_path}: {e}")

# Inicia a limpeza automática em background
@router.on_event("startup")
async def startup_event():
    """Inicia a limpeza automática de arquivos"""
    async def cleanup_loop():
        while True:
            await cleanup_old_files()
            await asyncio.sleep(600)  # Executa a cada 10 minutos
    
    asyncio.create_task(cleanup_loop())
