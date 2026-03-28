import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { useAppointmentStore } from '../store/appointmentStore';
import { useUIStore } from '../store/uiStore';

const fadeUp = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 } };

export const RequestsList: React.FC = () => {
  const { user } = useAuthStore();
  const { getPendingRequests, updateStatus } = useAppointmentStore();
  const { addToast } = useUIStore();
  
  const pending = user ? getPendingRequests(user.id) : [];

  const handleAccept = (id: string) => {
    updateStatus(id, 'confirmed');
    addToast('success', 'Appointment accepted');
  };

  const handleReject = (id: string) => {
    updateStatus(id, 'rejected');
    addToast('info', 'Appointment declined');
  };

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold font-display text-text-primary">Pending Requests</h1>
        <p className="text-text-secondary">Review and respond to new appointment requests</p>
      </motion.div>
      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4">
        {pending.length === 0 ? (
          <Card className="text-center py-12">
            <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4 opacity-50" />
            <p className="text-lg font-medium text-text-primary">You're all caught up!</p>
          </Card>
        ) : (
          pending.map(apt => (
            <Card key={apt.id} className="p-5 flex items-start gap-4">
              <Avatar name={apt.patientName} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-text-primary">{apt.patientName}</h3>
                  <Badge variant="pending">Pending</Badge>
                </div>
                <div className="text-sm text-text-secondary mb-3">
                  <p>Requested for: {new Date(apt.date).toLocaleDateString()} at {apt.timeSlot}</p>
                  {apt.notes && <p className="mt-2 text-text-primary bg-surface-50 p-3 rounded-lg border border-surface-200">"{apt.notes}"</p>}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" icon={<CheckCircle size={16} />} onClick={() => handleAccept(apt.id)}>Accept</Button>
                  <Button size="sm" variant="danger" icon={<XCircle size={16} />} onClick={() => handleReject(apt.id)}>Decline</Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </motion.div>
    </motion.div>
  );
};
