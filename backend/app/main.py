import logging
import os
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import assessments, auth, premium
from app.core.config import settings

logger = logging.getLogger("mindguard")

# Configurar logging básico para el backend
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting MindGuard IA API...")
    yield
    logger.info("Stopping MindGuard IA API...")


app = FastAPI(title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json", lifespan=lifespan)

# Configuración de CORS segura (no permite comodines '*' si allow_credentials es True)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Agregar coincidencia para Render
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception caught: {exc}", exc_info=True)

    # Solo mostrar el error crudo si estamos en pruebas o desarrollo
    is_dev = "pytest" in sys.modules or os.getenv("ENV") == "development"
    detail_msg = str(exc) if is_dev else "Internal Server Error"

    response = JSONResponse(
        status_code=500,
        content={"detail": detail_msg},
    )

    origin = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response


logger.info("SISTEMA MINDGUARD CARGADO - CORS CONFIGURADO - RUTAS ACTIVAS")

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
