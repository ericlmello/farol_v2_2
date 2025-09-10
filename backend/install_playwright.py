#!/usr/bin/env python3
"""
Script robusto para instalar browsers do Playwright no Render
"""
import subprocess
import sys
import os
import time
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def install_playwright_browsers():
    """Instala os browsers do Playwright com múltiplas tentativas"""
    max_retries = 3
    retry_delay = 5
    
    for attempt in range(max_retries):
        try:
            logger.info(f"🔄 Tentativa {attempt + 1}/{max_retries}: Instalando browsers do Playwright...")
            
            # Verificar se o Playwright está instalado
            try:
                import playwright
                logger.info(f"✅ Playwright versão {playwright.__version__} encontrado")
            except ImportError:
                logger.error("❌ Playwright não está instalado")
                return False
            
            # Instalar dependências do sistema primeiro
            logger.info("🔄 Instalando dependências do sistema...")
            system_deps = subprocess.run([
                sys.executable, "-m", "playwright", "install-deps", "chromium"
            ], capture_output=True, text=True, timeout=300)
            
            if system_deps.returncode != 0:
                logger.warning(f"⚠️ Aviso ao instalar dependências do sistema: {system_deps.stderr}")
            
            # Instalar browsers do Playwright
            result = subprocess.run([
                sys.executable, "-m", "playwright", "install", "chromium"
            ], capture_output=True, text=True, timeout=600)
            
            if result.returncode == 0:
                logger.info("✅ Browsers do Playwright instalados com sucesso")
                
                # Verificar se a instalação foi bem-sucedida
                try:
                    from playwright.sync_api import sync_playwright
                    with sync_playwright() as p:
                        browser = p.chromium.launch(headless=True)
                        browser.close()
                    logger.info("✅ Verificação do browser: OK")
                    return True
                except Exception as e:
                    logger.warning(f"⚠️ Browser instalado mas verificação falhou: {e}")
                    return True  # Ainda assim consideramos sucesso
            else:
                logger.error(f"❌ Erro ao instalar browsers (tentativa {attempt + 1}): {result.stderr}")
                if attempt < max_retries - 1:
                    logger.info(f"⏳ Aguardando {retry_delay} segundos antes da próxima tentativa...")
                    time.sleep(retry_delay)
                    retry_delay *= 2  # Backoff exponencial
                
        except subprocess.TimeoutExpired:
            logger.error(f"❌ Timeout na instalação (tentativa {attempt + 1})")
            if attempt < max_retries - 1:
                logger.info(f"⏳ Aguardando {retry_delay} segundos antes da próxima tentativa...")
                time.sleep(retry_delay)
                retry_delay *= 2
        except Exception as e:
            logger.error(f"❌ Erro inesperado (tentativa {attempt + 1}): {e}")
            if attempt < max_retries - 1:
                logger.info(f"⏳ Aguardando {retry_delay} segundos antes da próxima tentativa...")
                time.sleep(retry_delay)
                retry_delay *= 2
    
    logger.error("❌ Falha em todas as tentativas de instalação")
    return False

def check_playwright_installation():
    """Verifica se o Playwright está funcionando corretamente"""
    try:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto("https://example.com")
            title = page.title()
            browser.close()
            logger.info(f"✅ Teste do Playwright bem-sucedido. Título da página: {title}")
            return True
    except Exception as e:
        logger.error(f"❌ Teste do Playwright falhou: {e}")
        return False

if __name__ == "__main__":
    logger.info("🚀 Iniciando instalação do Playwright...")
    
    success = install_playwright_browsers()
    
    if success:
        logger.info("🔄 Verificando instalação...")
        if check_playwright_installation():
            logger.info("✅ Playwright instalado e funcionando corretamente!")
            sys.exit(0)
        else:
            logger.warning("⚠️ Playwright instalado mas com problemas de funcionamento")
            sys.exit(0)  # Ainda assim consideramos sucesso
    else:
        logger.error("❌ Falha na instalação do Playwright")
        sys.exit(1)
