from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


# --- Auth ---
class UserRole(str, Enum):
    patient = "patient"
    doctor = "doctor"


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: UserRole
    phone: Optional[str] = None
    specialization: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str
    role: UserRole


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    phone: Optional[str] = None
    specialization: Optional[str] = None
    experience: Optional[int] = None
    bio: Optional[str] = None
    avatar: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Appointment ---
class AppointmentStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    rejected = "rejected"
    completed = "completed"
    cancelled = "cancelled"


class AppointmentCreate(BaseModel):
    doctor_id: str
    date: str
    time_slot: str
    notes: Optional[str] = None


class AppointmentUpdate(BaseModel):
    status: AppointmentStatus


class AppointmentResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_specialization: Optional[str] = None
    date: str
    time_slot: str
    status: AppointmentStatus
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Consultation ---
class ConsultationStatus(str, Enum):
    scheduled = "scheduled"
    doctor_joined = "doctor_joined"
    patient_joined = "patient_joined"
    in_progress = "in_progress"
    completed = "completed"


class TranscriptEntry(BaseModel):
    speaker: str
    text: str
    timestamp: str
    source: str  # 'asr' or 'slr'


class MedicalReportCreate(BaseModel):
    consultation_id: str
    summary: Optional[str] = None
    symptoms: Optional[List[str]] = None
    diagnosis: Optional[str] = None
    prescriptions: Optional[List[dict]] = None
    follow_up_date: Optional[str] = None
    follow_up_notes: Optional[str] = None


class MedicalReportResponse(BaseModel):
    id: str
    consultation_id: str
    summary: Optional[str] = None
    symptoms: Optional[List[str]] = None
    diagnosis: Optional[str] = None
    prescriptions: Optional[List[dict]] = None
    follow_up_date: Optional[datetime] = None
    follow_up_notes: Optional[str] = None

    class Config:
        from_attributes = True


# --- Availability ---
class TimeSlotSchema(BaseModel):
    id: str
    start_time: str
    end_time: str
    is_booked: bool = False


class AvailabilitySchema(BaseModel):
    id: str
    doctor_id: str
    day_of_week: int
    start_time: str
    end_time: str
    slots: List[TimeSlotSchema] = []


class DoctorDetail(UserResponse):
    experience: Optional[int] = None
    rating: Optional[float] = None
    bio: Optional[str] = None
    availability: List[AvailabilitySchema] = []


# --- AI ---
class SLRRequest(BaseModel):
    landmarks: List[dict]  # MediaPipe landmark data


class SLRResponse(BaseModel):
    gesture: str
    confidence: float
    text: str


class ASRRequest(BaseModel):
    audio_data: str  # base64 encoded audio


class ASRResponse(BaseModel):
    text: str
    speaker: str
    confidence: float


class SummarizationRequest(BaseModel):
    transcript: List[TranscriptEntry]


class SummarizationResponse(BaseModel):
    summary: str
    symptoms: List[str]
    diagnosis: str
    prescriptions: List[dict]


class TranslationRequest(BaseModel):
    text: str
    target_language: str


class TranslationResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str
