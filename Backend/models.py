import enum
from sqlalchemy import (Column, Integer, String, TIMESTAMP, Enum as SAEnum)
from sqlalchemy.sql import func
from .database import Base

# Defines the roles a user can have
class UserRole(str, enum.Enum):
    employee = "employee"
    admin = "admin"

# The User model that maps to your 'users' table in the database
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    # Storing a secure hash of the password, not the password itself
    hashed_password = Column(String(100), nullable=False) 
    department = Column(String(100))
    role = Column(SAEnum(UserRole, name="user_role"), nullable=False)
    joined_at = Column(TIMESTAMP, server_default=func.now())