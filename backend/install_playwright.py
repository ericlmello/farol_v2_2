#!/usr/bin/env python3
"""
Script para instalar browsers do Playwright no Render
"""
import subprocess
import sys
import os

def install_playwright_browsers():
    """Instala os browsers do Playwright"""
    try:
        print("🔄 Instalando browsers do Playwright...")
        
        # Instalar browsers do Playwright
        result = subprocess.run([
            sys.executable, "-m", "playwright", "install", "chromium"
        ], capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Browsers do Playwright instalados com sucesso")
            return True
        else:
            print(f"❌ Erro ao instalar browsers: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao instalar browsers: {e}")
        return False

if __name__ == "__main__":
    success = install_playwright_browsers()
    sys.exit(0 if success else 1)
