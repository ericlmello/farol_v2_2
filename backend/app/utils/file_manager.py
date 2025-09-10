"""
Utilitário para gestão de arquivos temporários
"""
import os
import time
import logging
from pathlib import Path
from typing import List
import asyncio
import threading

logger = logging.getLogger(__name__)

class FileManager:
    """Gerenciador de arquivos temporários com limpeza automática"""
    
    def __init__(self, base_dirs: List[str], max_age_minutes: int = 10):
        self.base_dirs = [Path(d) for d in base_dirs]
        self.max_age_seconds = max_age_minutes * 60
        self.cleanup_running = False
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Garante que os diretórios existam"""
        for dir_path in self.base_dirs:
            dir_path.mkdir(parents=True, exist_ok=True)
            logger.info(f"📁 Diretório garantido: {dir_path}")
    
    def cleanup_old_files(self) -> int:
        """Remove arquivos antigos e retorna quantidade removida"""
        removed_count = 0
        current_time = time.time()
        
        for dir_path in self.base_dirs:
            if not dir_path.exists():
                continue
                
            try:
                for file_path in dir_path.iterdir():
                    if file_path.is_file():
                        file_age = current_time - file_path.stat().st_mtime
                        
                        if file_age > self.max_age_seconds:
                            try:
                                file_path.unlink()
                                removed_count += 1
                                logger.info(f"🗑️ Arquivo antigo removido: {file_path}")
                            except Exception as e:
                                logger.error(f"❌ Erro ao remover arquivo {file_path}: {e}")
            except Exception as e:
                logger.error(f"❌ Erro ao limpar diretório {dir_path}: {e}")
        
        if removed_count > 0:
            logger.info(f"🧹 Limpeza concluída: {removed_count} arquivos removidos")
        
        return removed_count
    
    def start_cleanup_scheduler(self):
        """Inicia o agendador de limpeza automática"""
        if self.cleanup_running:
            logger.warning("⚠️ Agendador de limpeza já está rodando")
            return
        
        self.cleanup_running = True
        
        def cleanup_loop():
            while self.cleanup_running:
                try:
                    self.cleanup_old_files()
                    time.sleep(60)  # Executa a cada minuto
                except Exception as e:
                    logger.error(f"❌ Erro no loop de limpeza: {e}")
                    time.sleep(60)
        
        # Executar em thread separada para não bloquear
        cleanup_thread = threading.Thread(target=cleanup_loop, daemon=True)
        cleanup_thread.start()
        logger.info("🔄 Agendador de limpeza iniciado")
    
    def stop_cleanup_scheduler(self):
        """Para o agendador de limpeza"""
        self.cleanup_running = False
        logger.info("⏹️ Agendador de limpeza parado")
    
    def get_directory_size(self, dir_path: Path) -> int:
        """Retorna o tamanho total de um diretório em bytes"""
        total_size = 0
        try:
            for file_path in dir_path.rglob('*'):
                if file_path.is_file():
                    total_size += file_path.stat().st_size
        except Exception as e:
            logger.error(f"❌ Erro ao calcular tamanho do diretório {dir_path}: {e}")
        return total_size
    
    def get_storage_info(self) -> dict:
        """Retorna informações sobre o uso de armazenamento"""
        info = {
            "directories": {},
            "total_files": 0,
            "total_size_bytes": 0
        }
        
        for dir_path in self.base_dirs:
            if dir_path.exists():
                dir_size = self.get_directory_size(dir_path)
                file_count = len(list(dir_path.rglob('*')))
                
                info["directories"][str(dir_path)] = {
                    "size_bytes": dir_size,
                    "file_count": file_count
                }
                info["total_files"] += file_count
                info["total_size_bytes"] += dir_size
        
        return info

# Instância global do gerenciador de arquivos
file_manager = FileManager(
    base_dirs=["screenshots", "audio_tela"],
    max_age_minutes=10
)
