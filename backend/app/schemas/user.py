from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    nombre: Optional[str] = None
    rol: Optional[str] = "usuario"

class UserCreate(UserBase):
    email: EmailStr
    password: str
    nombre: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: int
    twoFactorEnabled: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[int] = None
