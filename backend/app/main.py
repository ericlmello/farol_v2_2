# 1º: Todos os imports necessários
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.routing import APIRouter

from .api.auth import router as auth_router
from .api.profile import router as profile_router
from .api.jobs import router as jobs_router
from .api.company import router as company_router
from .api.hub import router as hub_router
from .api.simulation import router as simulation_router
from .api.matches import router as matches_router
from .api.interviews import router as interviews_router
from .api.voice import router as voice_router

# 2º: Criação da instância principal
app = FastAPI(
    title="Plataforma Farol API",
    description="API para plataforma de empregabilidade acessível para PCDs",
    version="1.0.0"
)

# 3º: Definição da lista origins
origins = [
    "http://localhost:3000",  # Frontend local
    "http://127.0.0.1:3000",  # Frontend local alternativo
    "http://frontend:3000",   # Frontend no Docker
    "http://localhost",       # Desenvolvimento
    "http://127.0.0.1",      # Desenvolvimento alternativo
]

# 4º: Aplicação do CORSMiddleware PRIMEIRO
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# 5º: Criação do api_router com prefixo global
api_router = APIRouter(prefix="/api/v1")

# 6º: TODAS as chamadas api_router.include_router para TODOS os módulos
api_router.include_router(auth_router)
api_router.include_router(profile_router, prefix="/profile")
api_router.include_router(jobs_router)
api_router.include_router(company_router)
api_router.include_router(hub_router)
api_router.include_router(simulation_router, tags=["Simulations"])
api_router.include_router(matches_router, tags=["Matches"])
api_router.include_router(interviews_router, tags=["Interviews"])
api_router.include_router(voice_router, prefix="/voice", tags=["Voice Assistant"])

# 7º: Chamada final app.include_router
app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "Bem-vindo à Plataforma Farol API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
