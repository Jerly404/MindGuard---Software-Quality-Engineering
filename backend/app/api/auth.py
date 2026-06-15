import os
from datetime import timedelta
from typing import Any, List, Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.base import Usuario
from app.schemas.user import Msg, NewPassword, Token, User, UserCreate, UserSignup
from app.services.email import email_service
from app.services.business_services import UserService

router = APIRouter()

@router.post("/password-recovery/{email}", response_model=Msg)
async def recover_password(
    email: str,
    user_service: Annotated[UserService, Depends(deps.get_user_service)]
) -> Any:
    """
    Password recovery
    """
    user = await user_service.get_by_email(email)

    # Evitamos la enumeración de usuarios: siempre respondemos con éxito
    if user:
        password_reset_token = security.create_password_reset_token(email=email)
        await email_service.send_recovery_email(email_to=user.email, token=password_reset_token)

    return {"msg": "Password recovery email sent"}

@router.post("/reset-password/", response_model=Msg)
async def reset_password(
    new_password: NewPassword,
    user_service: Annotated[UserService, Depends(deps.get_user_service)],
) -> Any:
    """
    Reset password
    """
    email = security.verify_password_reset_token(new_password.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token")

    user = await user_service.get_by_email(email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system.",
        )

    user.password_hash = security.get_password_hash(new_password.new_password)
    # Guardamos los cambios usando la base de datos indirectamente (a través de commit de SQLAlchemy)
    # Para mantener la cohesión, el servicio o el commit directo se encarga
    # Aquí como manejamos base.py directamente podemos realizar commit o delegar
    await user_service.repo.create(user) # UserRepository.create realiza commit & refresh
    return {"msg": "Password updated successfully"}

@router.post("/login/access-token", response_model=Token)
async def login_access_token(
    response: Response,
    user_service: Annotated[UserService, Depends(deps.get_user_service)],
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = await user_service.get_by_email(form_data.username)

    # Evitamos side-channel attacks y user enumeration
    dummy_hash = "$2b$12$eImiTXuWV5j7ae9D.aW.D.mB9Bv1tK/H0Fq1i6P7Y8s9d0f1g2h3i"
    valid = False
    if user:
        valid = security.verify_password(form_data.password, user.password_hash)
    else:
        security.verify_password(form_data.password, dummy_hash)

    if not user or not valid:
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    token = security.create_access_token(user.id, role=user.rol, expires_delta=access_token_expires)

    # Configuración de Cookie Segura HttpOnly
    is_secure = os.getenv("ENV") == "production"
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=is_secure,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }

@router.post("/logout", response_model=Msg)
async def logout(response: Response) -> Any:
    response.delete_cookie(key="access_token")
    return {"msg": "Successfully logged out"}

@router.post("/signup", response_model=User)
async def create_user(
    *, 
    user_service: Annotated[UserService, Depends(deps.get_user_service)], 
    user_in: UserSignup
) -> Any:
    # El rol "usuario" es forzado dentro de signup_user
    return await user_service.signup_user(
        nombre=user_in.nombre,
        email=user_in.email,
        password=user_in.password
    )

@router.post("/create-professional", response_model=User)
async def create_professional(
    *,
    user_service: Annotated[UserService, Depends(deps.get_user_service)],
    user_in: UserCreate,
    current_user: Annotated[Usuario, Depends(deps.get_current_user)],
) -> Any:
    """Permite a un administrador crear una cuenta de profesional."""
    if current_user.rol not in ["admin", "administrador"]:
        raise HTTPException(
            status_code=403,
            detail="No tienes permisos suficientes para realizar esta acción.",
        )

    return await user_service.create_professional(user_in)

@router.get("/users/", response_model=List[User])
async def read_users(
    user_service: Annotated[UserService, Depends(deps.get_user_service)],
    current_user: Annotated[Usuario, Depends(deps.get_current_user)]
) -> Any:
    """Listar todos los usuarios (Solo Admin)."""
    if current_user.rol not in ["admin", "administrador"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return await user_service.list_all()

@router.delete("/users/{user_id}/", response_model=Msg)
async def delete_user(
    user_id: int,
    user_service: Annotated[UserService, Depends(deps.get_user_service)],
    current_user: Annotated[Usuario, Depends(deps.get_current_user)]
) -> Any:
    """Eliminar un usuario (Solo Admin)."""
    if current_user.rol not in ["admin", "administrador"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete current admin user")

    await user_service.delete_user(user_id)
    return {"msg": "User deleted successfully"}
