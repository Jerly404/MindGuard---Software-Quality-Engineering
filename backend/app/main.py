from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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

# Configuración de CORS ultra-permisiva
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Aseguramos que los errores 500 también tengan cabeceras CORS
    response = JSONResponse(
        status_code=500,
        content={"detail": str(exc) if settings.SECRET_KEY == "your-super-secret-key-for-dev-only" else "Internal Server Error"},
    )
    response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

print("\n" + "="*50)
print("SISTEMA MINDGUARD CARGADO - CORS CONFIGURADO - RUTAS ACTIVAS")
print("="*50 + "\n")

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(assessments.router, prefix=f"{settings.API_V1_STR}/assessments", tags=["assessments"])
app.include_router(premium.router, prefix=f"{settings.API_V1_STR}/premium", tags=["premium"])

# Configuración global para evitar 404 por slashes
for route in app.routes:
    if hasattr(route, "endpoint"):
        app.router.redirect_slashes = False


@app.get("/")
def root():
    return {"message": "Welcome to MindGuard IA API"}
