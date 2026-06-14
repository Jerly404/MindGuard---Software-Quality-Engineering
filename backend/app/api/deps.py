from typing import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.models.base import Usuario
from app.schemas.user import TokenPayload

connect_args = {}
if settings.SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = async_sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession, expire_on_commit=False
)


async def get_db() -> AsyncGenerator:
    async with SessionLocal() as db:
        yield db


reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login/access-token")


async def get_current_user(db: AsyncSession = Depends(get_db), token: str = Depends(reusable_oauth2)) -> Usuario:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        token_data = TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        ) from None

    result = await db.execute(select(Usuario).where(Usuario.id == token_data.sub))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
