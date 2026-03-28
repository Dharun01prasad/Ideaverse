from sqlalchemy import Column, String, Integer, Date, Enum, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum


class AppointmentStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    rejected = "rejected"
    completed = "completed"
    cancelled = "cancelled"


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String(36), primary_key=True)
    patient_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    doctor_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    time_slot = Column(String(20), nullable=False)
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.pending)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
