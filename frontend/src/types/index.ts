export type UserRole = 'patient' | 'doctor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  specialization?: string;
  phone?: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
export type ConsultationStatus = 'scheduled' | 'doctor_joined' | 'patient_joined' | 'in_progress' | 'completed';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slots: TimeSlot[];
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  doctorSpecialization?: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface Consultation {
  id: string;
  appointmentId: string;
  appointment: Appointment;
  status: ConsultationStatus;
  startedAt?: string;
  endedAt?: string;
  transcript: TranscriptEntry[];
  summary?: MedicalSummary;
}

export interface TranscriptEntry {
  id: string;
  speaker: 'doctor' | 'patient';
  text: string;
  timestamp: string;
  source: 'asr' | 'slr' | 'text';
}

export interface MedicalSummary {
  id: string;
  consultationId: string;
  summary: string;
  symptoms: string[];
  diagnosis: string;
  prescriptions: Prescription[];
  followUpDate?: string;
  followUpNotes?: string;
}

export interface Prescription {
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface Notification {
  id: string;
  type: 'appointment_accepted' | 'appointment_rejected' | 'consultation_reminder' | 'report_ready' | 'follow_up';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialization: string;
  experience: number;
  rating: number;
  availability: DoctorAvailability[];
  bio?: string;
}
