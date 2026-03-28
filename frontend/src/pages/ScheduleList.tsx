import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { useAppointmentStore } from '../store/appointmentStore';

const fadeUp = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 } };

export const ScheduleList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getAppointmentsByDoctor } = useAppointmentStore();
  
  const schedules = user ? getAppointmentsByDoctor(user.id).filter(a => a.status === 'confirmed') : [];

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold font-display text-text-primary">My Schedule</h1>
        <p className="text-text-secondary">Your confirmed upcoming consultations</p>
      </motion.div>
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4">
        {schedules.length === 0 ? (
          <Card className="text-center py-12">
            <Calendar size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
            <p className="text-lg font-medium text-text-primary">No scheduled appointments</p>
          </Card>
        ) : (
          schedules.map(apt => (
            <Card key={apt.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex gap-4 items-center">
                <Avatar name={apt.patientName} size="lg" />
                <div>
                  <h3 className="font-semibold text-text-primary">{apt.patientName}</h3>
                  <div className="flex gap-3 text-sm text-text-secondary mt-1">
                    <span>{new Date(apt.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="font-medium text-text-primary">{apt.timeSlot}</span>
                  </div>
                </div>
              </div>
              <Button icon={<Video size={16} />} onClick={() => navigate(`/consultation/${apt.id}`)}>Start Call</Button>
            </Card>
          ))
        )}
      </motion.div>
    </motion.div>
  );
};
