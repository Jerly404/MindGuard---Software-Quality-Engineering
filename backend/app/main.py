from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.models.base import Base
from app.api import deps
from contextlib import asynccontextmanager

from app.api import auth, assessments, premium

@asynccontextmanager
async def lifespan(app: FastAPI):
    # En producción las migraciones se corren externas o aquí
    # Por ahora solo iniciamos la app
    yield
    # Clean up (if needed)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set all CORS enabled origins
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(assessments.router, prefix=f"{settings.API_V1_STR}/assessments", tags=["assessments"])
app.include_router(premium.router, prefix=f"{settings.API_V1_STR}/premium", tags=["premium"])

@app.get("/")
def root():
    return {"message": "Welcome to MindGuard IA API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
