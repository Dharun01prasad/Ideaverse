import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { useAppointmentStore } from '../store/appointmentStore';

const fadeUp = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 } };

export const ConsultationsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getAppointmentsByPatient } = useAppointmentStore();
  
  const appointments = user ? getAppointmentsByPatient(user.id) : [];

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.1 } } }} className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-main pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-main italic">My <span className="text-accent underline decoration-4 underline-offset-8 decoration-accent/30">Consultations</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted mt-2">Clinical Archive & Scheduling</p>
        </div>
        <button onClick={() => navigate('/appointments')} className="lando-button">New Appointment</button>
      </header>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6">
        {appointments.length === 0 ? (
          <Card className="text-center py-20 border-2 border-dashed border-main bg-card shadow-main rounded-sm grayscale opacity-40">
            <Calendar size={64} className="mx-auto text-main mb-6 opacity-30" />
            <p className="text-[10px] font-black uppercase tracking-widest text-main">No clinical sessions found in archive</p>
          </Card>
        ) : (
          appointments.map(apt => (
            <Card key={apt.id} className="!p-8 border-2 border-main bg-card shadow-main rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:-translate-y-1 transition-all">
              <div className="flex gap-8 items-center">
                <Avatar name={apt.doctorName} size="lg" className="shadow-lg ring-2 ring-main" />
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-black text-main uppercase tracking-tighter italic">{apt.doctorName}</h3>
                    <Badge variant={apt.status === 'confirmed' ? 'confirmed' : apt.status === 'completed' ? 'completed' : 'pending'}>{apt.status.toUpperCase()}</Badge>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent">{apt.doctorSpecialization}</p>
                  <div className="flex gap-6 text-[10px] font-bold text-muted uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Calendar size={14} className="text-accent"/> {new Date(apt.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-2"><Clock size={14} className="text-accent"/> {apt.timeSlot}</span>
                  </div>
                </div>
              </div>
              {apt.status === 'confirmed' && (
                <button 
                  onClick={() => navigate(`/consultation/${apt.id}`)}
                  className="lando-button flex items-center gap-3"
                >
                  <Video size={18} />
                  ACTIVATE SESSION
                </button>
              )}
            </Card>
          ))
        )}
      </motion.div>
    </motion.div>
  );
};
