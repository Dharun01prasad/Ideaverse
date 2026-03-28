from sqlalchemy import Column, String, Integer, Time, ForeignKey, Boolean
from app.database import Base


class DoctorAvailability(Base):
    __tablename__ = "doctor_availability"

    id = Column(String(36), primary_key=True)
    doctor_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False)  # 0=Sun, 1=Mon, ..., 6=Sat
    start_time = Column(String(10), nullable=False)
    end_time = Column(String(10), nullable=False)


class TimeSlot(Base):
    __tablename__ = "time_slots"

    id = Column(String(36), primary_key=True)
    availability_id = Column(String(36), ForeignKey("doctor_availability.id"), nullable=False, index=True)
    start_time = Column(String(10), nullable=False)
    end_time = Column(String(10), nullable=False)
    is_booked = Column(Boolean, default=False)
