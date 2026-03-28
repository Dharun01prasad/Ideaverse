import { create } from 'zustand';
import type { Appointment, AppointmentStatus, User } from '../types';

interface AppointmentState {
  appointments: Appointment[];
  doctors: User[];
  loading: boolean;
  fetchAppointments: (userId: string, role: string) => Promise<void>;
  fetchDoctors: () => Promise<void>;
  getAppointmentsByPatient: (patientId: string) => Appointment[];
  getAppointmentsByDoctor: (doctorId: string) => Appointment[];
  getPendingRequests: (doctorId: string) => Appointment[];
  getUpcoming: (userId: string, role: string) => Appointment[];
  createAppointment: (appointment: any, patientId: string) => Promise<boolean>;
  updateStatus: (id: string, status: AppointmentStatus) => Promise<boolean>;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  doctors: [],
  loading: false,

  fetchAppointments: async (userId, role) => {
    set({ loading: true });
    try {
      const res = await fetch(`http://localhost:8000/api/appointments?user_id=${userId}&role=${role}`);
      if (res.ok) {
         const data = await res.json();
         const mapped = data.map((item: any) => ({
            id: item.id,
            patientId: item.patient_id,
            doctorId: item.doctor_id,
            patientName: item.patient_name,
            doctorName: item.doctor_name,
            doctorSpecialization: item.doctor_specialization,
            date: item.date,
            timeSlot: item.time_slot,
            status: item.status,
            notes: item.notes,
         }));
         set({ appointments: mapped });
      }
    } catch(e) {}
    set({ loading: false });
  },

  fetchDoctors: async () => {
    try {
      const res = await fetch('http://localhost:8000/api/doctors');
      if (res.ok) {
         const data = await res.json();
         set({ doctors: data });
      }
    } catch(e) {}
  },

  getAppointmentsByPatient: (patientId: string) =>
    get().appointments.filter(a => a.patientId === patientId),

  getAppointmentsByDoctor: (doctorId: string) =>
    get().appointments.filter(a => a.doctorId === doctorId),

  getPendingRequests: (doctorId: string) =>
    get().appointments.filter(a => a.doctorId === doctorId && a.status === 'pending'),

  getUpcoming: (userId: string, role: string) =>
    get().appointments.filter(a => {
      const isUser = role === 'doctor' ? a.doctorId === userId : a.patientId === userId;
      return isUser && (a.status === 'confirmed' || a.status === 'pending');
    }),

  createAppointment: async (appointment, patientId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/appointments?patient_id=${patientId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           doctor_id: appointment.doctorId,
           date: appointment.date,
           time_slot: appointment.timeSlot,
           notes: appointment.notes
        })
      });
      if (res.ok) {
        // re-fetch instantly
        await get().fetchAppointments(patientId, 'patient');
        return true;
      }
      return false;
    } catch(e) { return false; }
  },

  updateStatus: async (id: string, status: AppointmentStatus) => {
    try {
      const res = await fetch(`http://localhost:8000/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        set(state => ({
          appointments: state.appointments.map(a => a.id === id ? { ...a, status } : a),
        }));
        return true;
      }
      return false;
    } catch(e) { return false; }
  },
}));
