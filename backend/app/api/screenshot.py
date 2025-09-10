from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from playwright.async_api import async_playwright
from pathlib import Path
from urllib.parse import urlparse, urlunparse
import os, uuid, logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/screenshot", tags=["Screenshot"])

SCREENSHOT_DIR = Path(os.getenv("SCREENSHOT_DIR", "/app/screenshots"))
SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)

# Mapeamentos internos (ajustáveis por env)
BACKEND_INTERNAL_URL = os.getenv("BACKEND_INTERNAL_URL", "http://backend:8000")
FRONTEND_INTERNAL_URL = os.getenv("FRONTEND_INTERNAL_URL", "http://frontend:8501")
HOST_GATEWAY = os.getenv("HOST_GATEWAY", "host.docker.internal")

class ScreenshotRequest(BaseModel):
    url: HttpUrl

def _resolve_url_for_container(raw: str) -> str:
    u = urlparse(raw)
    host = (u.hostname or "").lower()
    port = u.port
    scheme = u.scheme or "http"
    path = u.path or "/"

    # Se veio localhost/127.0.0.1, resolva para alvos visíveis no Docker
    if host in ("localhost", "127.0.0.1", "0.0.0.0"):
        # Heurística: 8011 é a porta do backend no host; 8501 é o Streamlit no host.
        if port == 8011:
            base = BACKEND_INTERNAL_URL  # ex: http://backend:8000
        elif port == 8501:
            base = FRONTEND_INTERNAL_URL # ex: http://frontend:8501
        else:
            # Acessar a porta do host diretamente
            # (precisa do extra_hosts no compose, veja abaixo)
            base = f"{scheme}://{HOST_GATEWAY}:{port or (443 if scheme=='https' else 80)}"
        b = urlparse(base)
        return urlunparse((b.scheme, b.netloc, path, "", u.query, ""))
    return raw

async def take_screenshot_async(url: str) -> str:
    target = _resolve_url_for_container(url)
    logger.info(f"URL solicitada: {url} | URL resolvida no container: {target}")
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            # 1. Define um viewport grande para começar
            await page.set_viewport_size({"width": 1920, "height": 1080})

            # 2. Navega e espera a página ficar estável
            await page.goto(target, wait_until="networkidle", timeout=60000)
            await page.wait_for_timeout(2000) # Aumentei a pausa para garantir renderização

            # 3. Executa o script para encontrar e expandir o container <main>
            logger.info("Executando script para expandir o contêiner <main>...")
            
            # Este script encontra a tag <main>, remove restrições de altura
            # dos pais e expande a <main> para sua altura total de conteúdo.
            await page.evaluate("""
                () => {
                    const mainElement = document.querySelector('main#conteudo-principal');
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
            
            logger.info("Contêiner expandido. Tirando o screenshot da página completa.")

            file_name = f"{uuid.uuid4()}.png"
            file_path = SCREENSHOT_DIR / file_name
            await page.screenshot(path=str(file_path), full_page=True)
            await browser.close()
            return str(file_name)
    except Exception as e:
        logger.exception("Erro no take_screenshot_async")
        raise HTTPException(status_code=500, detail=f"Erro ao tirar screenshot: {str(e)}")

@router.post("/tirar-print")
async def tirar_print(request: ScreenshotRequest):
    logger.info(f"Recebida requisição para tirar print da URL: {request.url}")
    try:
        file_path = await take_screenshot_async(str(request.url))
        return {"status": "sucesso", "caminho_do_arquivo": file_path}
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro inesperado: {str(e)}")
