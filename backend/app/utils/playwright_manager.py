"""
Gerenciador para instalação e verificação do Playwright
"""
import subprocess
import sys
import os
import logging
import asyncio
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

class PlaywrightManager:
    """Gerenciador para instalação e verificação do Playwright"""
    
    _instance: Optional['PlaywrightManager'] = None
    _browsers_installed = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not hasattr(self, '_initialized'):
            self._initialized = True
            self._check_browsers()
    
    def _check_browsers(self):
        """Verifica se os browsers do Playwright estão instalados"""
        try:
            from playwright.sync_api import sync_playwright
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                browser.close()
            self._browsers_installed = True
            logger.info("✅ Browsers do Playwright verificados e funcionando")
        except Exception as e:
            logger.warning(f"⚠️ Browsers do Playwright não funcionando: {e}")
            self._browsers_installed = False
    
    def install_browsers(self) -> bool:
        """Instala os browsers do Playwright com retry"""
        if self._browsers_installed:
            return True
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                logger.info(f"🔄 Tentativa {attempt + 1}/{max_retries}: Instalando browsers do Playwright...")
                
                # Instalar dependências do sistema
                logger.info("🔄 Instalando dependências do sistema...")
                deps_result = subprocess.run([
                    sys.executable, "-m", "playwright", "install-deps", "chromium"
                ], capture_output=True, text=True, timeout=300)
                
                if deps_result.returncode != 0:
                    logger.warning(f"⚠️ Aviso ao instalar dependências: {deps_result.stderr}")
                
                # Instalar browsers
                install_result = subprocess.run([
                    sys.executable, "-m", "playwright", "install", "chromium"
                ], capture_output=True, text=True, timeout=600)
                
                if install_result.returncode == 0:
                    logger.info("✅ Browsers do Playwright instalados com sucesso")
                    
                    # Verificar se funcionam
                    self._check_browsers()
                    if self._browsers_installed:
                        return True
                else:
                    logger.error(f"❌ Erro na instalação: {install_result.stderr}")
                    
            except subprocess.TimeoutExpired:
                logger.error(f"❌ Timeout na instalação (tentativa {attempt + 1})")
            except Exception as e:
                logger.error(f"❌ Erro na instalação (tentativa {attempt + 1}): {e}")
        
        logger.error("❌ Falha em todas as tentativas de instalação do Playwright")
        return False
    
    async def get_browser(self):
        """Obtém uma instância do browser, instalando se necessário"""
        if not self._browsers_installed:
            logger.info("🔄 Browsers não instalados, tentando instalar...")
            if not self.install_browsers():
                raise RuntimeError("Não foi possível instalar browsers do Playwright")
        
        try:
            from playwright.async_api import async_playwright
            playwright = await async_playwright().start()
            browser = await playwright.chromium.launch(headless=True)
            return playwright, browser
        except Exception as e:
            logger.error(f"❌ Erro ao lançar browser: {e}")
            # Tentar reinstalar
            logger.info("🔄 Tentando reinstalar browsers...")
            self._browsers_installed = False
            if self.install_browsers():
                from playwright.async_api import async_playwright
                playwright = await async_playwright().start()
                browser = await playwright.chromium.launch(headless=True)
                return playwright, browser
            else:
                raise RuntimeError("Não foi possível instalar ou usar browsers do Playwright")
    
    def is_available(self) -> bool:
        """Verifica se o Playwright está disponível"""
        return self._browsers_installed

# Instância global
playwright_manager = PlaywrightManager()
