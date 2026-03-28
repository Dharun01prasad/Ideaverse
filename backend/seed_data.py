"""
Seed script to populate the database with demo data.
Run: python seed_data.py
"""

import uuid
import sys
import os
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.appointment import Appointment
from app.models.availability import DoctorAvailability, TimeSlot
from app.models.consultation import Consultation, MedicalReport
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Clear existing
        db.query(TimeSlot).delete()
        db.query(DoctorAvailability).delete()
        db.query(MedicalReport).delete()
        db.query(Consultation).delete()
        db.query(Appointment).delete()
        db.query(User).delete()
        db.commit()

        # Users
        password_hash = pwd_context.hash("password123")

        patients = [
            User(id="p1", name="Alex Rivera", email="alex@demo.com",
                 password_hash=password_hash, role="patient", phone="+1 555-0101"),
            User(id="p2", name="Jordan Kim", email="jordan@demo.com",
                 password_hash=password_hash, role="patient", phone="+1 555-0102"),
        ]

        doctors = [
            User(id="d1", name="Dr. Sarah Chen", email="sarah@demo.com",
                 password_hash=password_hash, role="doctor",
                 specialization="General Medicine", experience=12,
                 bio="Board-certified physician specializing in accessible healthcare."),
        ]

        db.add_all(patients + doctors)
        db.commit()

        # Availability for Dr. Sarah Chen
        avails = [
            DoctorAvailability(id="av1", doctor_id="d1", day_of_week=1,
                               start_time="09:00", end_time="17:00"),
            DoctorAvailability(id="av2", doctor_id="d1", day_of_week=3,
                               start_time="09:00", end_time="17:00"),
            DoctorAvailability(id="av3", doctor_id="d1", day_of_week=5,
                               start_time="10:00", end_time="16:00"),
        ]
        db.add_all(avails)
        db.commit()

        # Time slots
        slot_id = 1
        for avail in avails:
            hours = [("09:00", "09:30"), ("09:30", "10:00"), ("10:00", "10:30"),
                     ("10:30", "11:00"), ("11:00", "11:30"),
                     ("14:00", "14:30"), ("14:30", "15:00"), ("15:00", "15:30"),
                     ("15:30", "16:00")]
            for start, end in hours:
                db.add(TimeSlot(
                    id=f"s{slot_id}",
                    availability_id=avail.id,
                    start_time=start,
                    end_time=end,
                    is_booked=False,
                ))
                slot_id += 1
        db.commit()

        # Appointments
        appointments = [
            Appointment(id="apt-1", patient_id="p1", doctor_id="d1",
                        date=datetime.strptime("2026-03-28", "%Y-%m-%d").date(), time_slot="10:00 - 10:30",
                        status="confirmed", notes="Recurring headaches for the past week"),
            Appointment(id="apt-3", patient_id="p2", doctor_id="d1",
                        date=datetime.strptime("2026-03-27", "%Y-%m-%d").date(), time_slot="09:00 - 09:30",
                        status="pending", notes="Annual checkup, vision concerns"),
        ]
        db.add_all(appointments)
        db.commit()

        print("✅ Database seeded successfully!")
        print(f"   Patients: {len(patients)}")
        print(f"   Doctors: {len(doctors)}")
        print(f"   Availability: {len(avails)}")
        print(f"   Time Slots: {slot_id - 1}")
        print(f"   Appointments: {len(appointments)}")

    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
