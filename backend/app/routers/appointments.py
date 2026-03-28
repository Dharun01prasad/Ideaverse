import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.appointment import Appointment
from app.models.user import User
from app.schemas.schemas import AppointmentCreate, AppointmentUpdate, AppointmentResponse

router = APIRouter()


@router.get("/", response_model=List[AppointmentResponse])
def list_appointments(
    user_id: str = None,
    role: str = None,
    status: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(Appointment)
    if user_id and role:
        if role == "patient":
            query = query.filter(Appointment.patient_id == user_id)
        elif role == "doctor":
            query = query.filter(Appointment.doctor_id == user_id)
    if status:
        query = query.filter(Appointment.status == status)
    appointments = query.order_by(Appointment.created_at.desc()).all()
    responses = []
    for a in appointments:
        patient = db.query(User).filter(User.id == a.patient_id).first()
        doctor = db.query(User).filter(User.id == a.doctor_id).first()
        responses.append(AppointmentResponse(
            id=a.id,
            patient_id=a.patient_id,
            doctor_id=a.doctor_id,
            patient_name=patient.name if patient else "Unknown",
            doctor_name=doctor.name if doctor else "Unknown",
            doctor_specialization=doctor.specialization if doctor else "",
            date=str(a.date),
            time_slot=a.time_slot,
            status=a.status.value if hasattr(a.status, 'value') else a.status,
            notes=a.notes,
            created_at=a.created_at,
        ))
    return responses


@router.post("/", response_model=AppointmentResponse)
def create_appointment(
    data: AppointmentCreate,
    patient_id: str = "demo-patient",
    db: Session = Depends(get_db),
):
    appointment = Appointment(
        id=str(uuid.uuid4()),
        patient_id=patient_id,
        doctor_id=data.doctor_id,
        date=datetime.strptime(data.date, "%Y-%m-%d").date(),
        time_slot=data.time_slot,
        status="pending",
        notes=data.notes,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    patient = db.query(User).filter(User.id == appointment.patient_id).first()
    doctor = db.query(User).filter(User.id == appointment.doctor_id).first()
    return AppointmentResponse(
        id=appointment.id,
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        patient_name=patient.name if patient else "Unknown",
        doctor_name=doctor.name if doctor else "Unknown",
        doctor_specialization=doctor.specialization if doctor else "",
        date=str(appointment.date),
        time_slot=appointment.time_slot,
        status=appointment.status.value if hasattr(appointment.status, 'value') else appointment.status,
        notes=appointment.notes,
        created_at=appointment.created_at,
    )


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: str,
    data: AppointmentUpdate,
    db: Session = Depends(get_db),
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    appointment.status = data.status.value
    db.commit()
    db.refresh(appointment)
    patient = db.query(User).filter(User.id == appointment.patient_id).first()
    doctor = db.query(User).filter(User.id == appointment.doctor_id).first()
    return AppointmentResponse(
        id=appointment.id,
        patient_id=appointment.patient_id,
        doctor_id=appointment.doctor_id,
        patient_name=patient.name if patient else "Unknown",
        doctor_name=doctor.name if doctor else "Unknown",
        doctor_specialization=doctor.specialization if doctor else "",
        date=str(appointment.date),
        time_slot=appointment.time_slot,
        status=appointment.status.value if hasattr(appointment.status, 'value') else appointment.status,
        notes=appointment.notes,
        created_at=appointment.created_at,
    )
