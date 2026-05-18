from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.base import Usuario
from app.schemas.user import Token, UserCreate, User, Msg, NewPassword
from app.services.email import email_service

router = APIRouter()

@router.post("/password-recovery/{email}", response_model=Msg)
async def recover_password(email: str, db: AsyncSession = Depends(deps.get_db)) -> Any:
    """
    Password recovery
    """
    result = await db.execute(select(Usuario).where(Usuario.email == email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system.",
        )
    password_reset_token = security.create_password_reset_token(email=email)
    email_sent = await email_service.send_recovery_email(
        email_to=user.email, token=password_reset_token
    )
    if not email_sent:
        raise HTTPException(
            status_code=500,
            detail="Failed to send recovery email. Check server logs for the recovery code.",
        )
    return {"msg": "Password recovery email sent"}

@router.post("/reset-password/", response_model=Msg)
async def reset_password(
    new_password: NewPassword,
    db: AsyncSession = Depends(deps.get_db),
) -> Any:
    """
    Reset password
    """
    email = security.verify_password_reset_token(new_password.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")
    
    result = await db.execute(select(Usuario).where(Usuario.email == email))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system.",
        )
    
    user.password_hash = security.get_password_hash(new_password.new_password)
    db.add(user)
    await db.commit()
    return {"msg": "Password updated successfully"}

@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    db: AsyncSession = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    result = await db.execute(select(Usuario).where(Usuario.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, role=user.rol, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/signup", response_model=User)
async def create_user(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserCreate
) -> Any:
    result = await db.execute(select(Usuario).where(Usuario.email == user_in.email))
    user = result.scalars().first()
    
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    db_obj = Usuario(
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        nombre=user_in.nombre,
        rol=user_in.rol,
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.post("/create-professional", response_model=User)
async def create_professional(
    *,
    db: AsyncSession = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    """Permite a un administrador crear una cuenta de profesional."""
    if current_user.rol not in ["admin", "administrador"]:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos suficientes para realizar esta acción.",
        )
    
    result = await db.execute(select(Usuario).where(Usuario.email == user_in.email))
    user = result.scalars().first()
    
    if user:
        raise HTTPException(
            status_code=400,
            detail="Ya existe un usuario con este correo electrónico.",
        )
    
    db_obj = Usuario(
        email=user_in.email,
        password_hash=security.get_password_hash(user_in.password),
        nombre=user_in.nombre,
        rol="profesional",
        colegiatura=user_in.colegiatura,
        especialidad=user_in.especialidad
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

@router.get("/users", response_model=List[User])
async def read_users(
    db: AsyncSession = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    """Listar todos los usuarios (Solo Admin)."""
    if current_user.rol not in ["admin", "administrador"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    result = await db.execute(select(Usuario))
    return result.scalars().all()

@router.delete("/users/{user_id}", response_model=Msg)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: Usuario = Depends(deps.get_current_user)
) -> Any:
    """Eliminar un usuario (Solo Admin)."""
    if current_user.rol not in ["admin", "administrador"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    result = await db.execute(select(Usuario).where(Usuario.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # No permitir que el admin se borre a sí mismo accidentalmente
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete current admin user")

    await db.delete(user)
    await db.commit()
    return {"msg": "User deleted successfully"}
