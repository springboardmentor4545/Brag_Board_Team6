# Backend/security.py
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.hash import argon2
from dotenv import load_dotenv
import os

# --- New Imports for get_current_user ---
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import models, schemas # Make sure schemas is imported
from .database import get_db # Make sure get_db is imported
# ----------------------------------------

# Load environment variables
load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

# --- ADD THIS ---
# OAuth2 scheme - defines how FastAPI finds the token
# The tokenUrl should match the path *relative to the base URL* where login happens
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
# --------------

# -------------------------
# 🔐 Password Hashing Utils
# -------------------------

def hash_password(password: str) -> str:
    """
    Hash a password using Argon2.
    """
    return argon2.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its Argon2 hash.
    """
    try:
        return argon2.verify(plain_password, hashed_password)
    except Exception:
        return False


# -------------------------
# 🔑 JWT Token Utils
# -------------------------

def create_access_token(data: dict) -> str:
    """
    Create a short-lived access token.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """
    Create a long-lived refresh token.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    # Optional: Add a claim to distinguish refresh tokens
    # to_encode.update({"type": "refresh"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- REMOVED old verify_token ---

# --- ADDED get_current_user ---
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Dependency function for protected routes.
    Decodes the access token, validates it, and fetches the user from the database.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # Assumes you store user's email in the 'sub' (subject) claim
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        # Ensure TokenData schema is defined in schemas.py
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user