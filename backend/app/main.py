from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.models.base import Base
from app.api import deps
from contextlib import asynccontextmanager

from app.api import auth, assessments, premium

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Configuración de CORS ultra-permisiva DEBE ir antes de las rutas
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("\n" + "="*50)
print("SISTEMA MINDGUARD CARGADO - CORS CONFIGURADO - RUTAS ACTIVAS")
print("="*50 + "\n")

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(assessments.router, prefix=f"{settings.API_V1_STR}/assessments", tags=["assessments"])
app.include_router(premium.router, prefix=f"{settings.API_V1_STR}/premium", tags=["premium"])

@app.get("/")
def root():
    return {"message": "Welcome to MindGuard IA API"}
