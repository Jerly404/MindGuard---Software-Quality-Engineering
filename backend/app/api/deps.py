from typing import AsyncGenerator, Annotated, Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.models.base import Usuario
from app.schemas.user import TokenPayload
from app.services.business_services import UserService, EvaluationService, AssignmentService, AppointmentService

connect_args = {}
if settings.SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = async_sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as db:
        yield db

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login/access-token",
    auto_error=False
)

async def get_current_user(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    token_from_header: Annotated[Optional[str], Depends(reusable_oauth2)] = None
) -> Usuario:
    # 1. Intentar obtener el token desde cookies (HttpOnly, Secure, SameSite)
    token = request.cookies.get("access_token")
    
    # 2. Fallback al header Authorization para retrocompatibilidad con tests de integración
    if not token and token_from_header:
        token = token_from_header
    
    if not token:
        # Intentar leer manualmente el header Authorization si no pasó por reusable_oauth2
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

    result = await db.execute(select(Usuario).where(Usuario.id == token_data.sub))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# Service Layer dependency injectors
async def get_user_service(db: Annotated[AsyncSession, Depends(get_db)]) -> UserService:
    return UserService(db)

async def get_evaluation_service(db: Annotated[AsyncSession, Depends(get_db)]) -> EvaluationService:
    return EvaluationService(db)

async def get_assignment_service(db: Annotated[AsyncSession, Depends(get_db)]) -> AssignmentService:
    return AssignmentService(db)

async def get_appointment_service(db: Annotated[AsyncSession, Depends(get_db)]) -> AppointmentService:
    return AppointmentService(db)
