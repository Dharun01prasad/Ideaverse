from sqlalchemy import Column, String, Integer, Enum, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    patient = "patient"
    doctor = "doctor"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    phone = Column(String(20), nullable=True)
    specialization = Column(String(100), nullable=True)
    experience = Column(Integer, nullable=True)
    bio = Column(Text, nullable=True)
    avatar = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
