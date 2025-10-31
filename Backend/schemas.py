from pydantic import BaseModel, EmailStr
from typing import Optional
from .models import UserRole # Import UserRole from your models

class UserBase(BaseModel):
    name: str
    email: EmailStr
    department: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: UserRole # Use the UserRole enum here

class User(UserBase): # Renamed from UserResponse for consistency
    id: int
    role: UserRole
    class Config:
        from_attributes = True # Use from_attributes instead of orm_mode

class Token(BaseModel):
    access_token: str
    refresh_token: str # Assuming you return refresh token on login
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- ADD THIS CLASS ---
class RefreshTokenRequest(BaseModel):
    refresh_token: str
# ------------------------