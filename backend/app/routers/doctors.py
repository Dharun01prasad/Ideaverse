from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.availability import DoctorAvailability, TimeSlot
from app.schemas.schemas import DoctorDetail, UserResponse, AvailabilitySchema, TimeSlotSchema

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
def list_doctors(db: Session = Depends(get_db)):
    doctors = db.query(User).filter(User.role == "doctor").all()
    return [UserResponse.model_validate(d) for d in doctors]


@router.get("/{doctor_id}", response_model=DoctorDetail)
def get_doctor(doctor_id: str, db: Session = Depends(get_db)):
    doctor = db.query(User).filter(User.id == doctor_id, User.role == "doctor").first()
    if not doctor:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Doctor not found")

    availability_records = db.query(DoctorAvailability).filter(
        DoctorAvailability.doctor_id == doctor_id
    ).all()

    availability = []
    for avail in availability_records:
        slots = db.query(TimeSlot).filter(TimeSlot.availability_id == avail.id).all()
        availability.append(AvailabilitySchema(
            id=avail.id,
            doctor_id=avail.doctor_id,
            day_of_week=avail.day_of_week,
            start_time=avail.start_time,
            end_time=avail.end_time,
            slots=[TimeSlotSchema(
                id=s.id,
                start_time=s.start_time,
                end_time=s.end_time,
                is_booked=s.is_booked,
            ) for s in slots],
        ))

    return DoctorDetail(
        id=doctor.id,
        name=doctor.name,
        email=doctor.email,
        role=doctor.role.value,
        specialization=doctor.specialization,
        experience=doctor.experience,
        bio=doctor.bio,
        availability=availability,
    )
