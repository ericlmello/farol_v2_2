"""
Utilitário para inicialização segura do cliente OpenAI
"""
import os
import logging
from typing import Optional
from openai import OpenAI
import httpx

logger = logging.getLogger(__name__)

class OpenAIClientManager:
    """Gerenciador para inicialização segura do cliente OpenAI"""
    
    _instance: Optional[OpenAI] = None
    
    @classmethod
    def get_client(cls) -> OpenAI:
        """Obtém instância do cliente OpenAI com inicialização lazy e segura"""
        if cls._instance is None:
            cls._instance = cls._create_client()
        return cls._instance
    
    @classmethod
    def _create_client(cls) -> OpenAI:
        """Cria cliente OpenAI com fallbacks robustos"""
        api_key = cls._get_api_key()
        
        # Tentativa 1: Inicialização padrão
        try:
            logger.info("Tentando inicialização padrão do OpenAI...")
            return OpenAI(api_key=api_key)
        except Exception as e:
            logger.warning(f"Falha na inicialização padrão: {e}")
        
        # Tentativa 2: Com httpx.Client customizado
        try:
            logger.info("Tentando inicialização com httpx.Client...")
            return OpenAI(
                api_key=api_key,
                http_client=httpx.Client(
                    timeout=30.0,
                    limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
                )
            )
        except Exception as e:
            logger.warning(f"Falha na inicialização com httpx: {e}")
        
        # Tentativa 3: Com configurações mínimas
        try:
            logger.info("Tentando inicialização com configurações mínimas...")
            return OpenAI(
                api_key=api_key,
                timeout=30.0,
                max_retries=3
            )
        except Exception as e:
            logger.error(f"Falha em todas as tentativas de inicialização: {e}")
            raise RuntimeError(f"Não foi possível inicializar cliente OpenAI: {e}")
    
    @classmethod
    def _get_api_key(cls) -> str:
        """Obtém e valida a chave da API OpenAI"""
        api_key = os.getenv("OPENAI_API_KEY") or os.getenv("API_KEY")
        
        if not api_key:
            raise ValueError(
                "OPENAI_API_KEY não encontrada nas variáveis de ambiente. "
                "Configure a variável OPENAI_API_KEY no Render ou no arquivo .env"
            )
        
        if not api_key.startswith('sk-'):
            raise ValueError("Chave da API OpenAI inválida. Deve começar com 'sk-'")
        
        logger.info("Chave da API OpenAI validada com sucesso")
        return api_key
    
    @classmethod
    def reset_client(cls):
        """Reseta a instância do cliente (útil para testes)"""
        cls._instance = None

def get_openai_client() -> OpenAI:
    """Função de conveniência para obter cliente OpenAI"""
    return OpenAIClientManager.get_client()
