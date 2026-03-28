from sqlalchemy import Column, String, Enum, DateTime, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from app.database import Base
import enum


class ConsultationStatus(str, enum.Enum):
    scheduled = "scheduled"
    doctor_joined = "doctor_joined"
    patient_joined = "patient_joined"
    in_progress = "in_progress"
    completed = "completed"


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(String(36), primary_key=True)
    appointment_id = Column(String(36), ForeignKey("appointments.id"), nullable=False)
    status = Column(Enum(ConsultationStatus), default=ConsultationStatus.scheduled)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(String(36), primary_key=True)
    consultation_id = Column(String(36), ForeignKey("consultations.id"), nullable=False, index=True)
    speaker = Column(String(20), nullable=False)  # 'doctor' or 'patient'
    text = Column(Text, nullable=False)
    timestamp = Column(String(20), nullable=False)
    source = Column(String(10), nullable=False)  # 'asr' or 'slr'
    created_at = Column(DateTime, server_default=func.now())


class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id = Column(String(36), primary_key=True)
    consultation_id = Column(String(36), ForeignKey("consultations.id"), nullable=False, unique=True)
    summary = Column(Text, nullable=True)
    symptoms = Column(JSON, nullable=True)  # list of strings
    diagnosis = Column(Text, nullable=True)
    prescriptions = Column(JSON, nullable=True)  # list of dicts
    follow_up_date = Column(DateTime, nullable=True)
    follow_up_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
