import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, FileText, Bell, Video,
  ChevronRight, Plus, RefreshCw
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { useAppointmentStore } from '../store/appointmentStore';
import { useUIStore } from '../store/uiStore';
import type { AppointmentStatus } from '../types';

const statusMap: Record<AppointmentStatus, { variant: 'pending' | 'confirmed' | 'live' | 'completed' | 'rejected'; label: string }> = {
  pending: { variant: 'pending', label: 'In Review' },
  confirmed: { variant: 'confirmed', label: 'Confirmed' },
  completed: { variant: 'completed', label: 'Completed' },
  rejected: { variant: 'rejected', label: 'Rejected' },
  cancelled: { variant: 'rejected', label: 'Cancelled' },
};

const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
};

export const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getUpcoming, getAppointmentsByPatient } = useAppointmentStore();
  const { notifications, addToast } = useUIStore();

  const upcomingAppointments = user ? getUpcoming(user.id, 'patient') : [];
  const allAppointments = user ? getAppointmentsByPatient(user.id) : [];
  const completedAppointments = allAppointments.filter(a => a.status === 'completed');
  const unreadNotifications = notifications.filter(n => !n.read);

  const handleJoin = (appointmentId: string) => {
    addToast('info', 'Connecting to clinical suite...');
    navigate(`/consultation/${appointmentId}`);
  };

  return (
    <div className="space-y-12 min-h-screen bg-gradient-hero bg-main/90">
      <motion.div
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-12"
      >
        {/* Header Section */}
        <motion.div variants={fadeUp} className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b-2 border-main pb-10 glass-strong">
          <div className="space-y-4">
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-tight text-dynamic italic text-glow">
              Welcome back, <span className="text-accent underline decoration-4 underline-offset-8 decoration-accent/30 block sm:inline">{user?.name?.split(' ')[0]}</span>
            </h1>
            <div className="flex items-center gap-4 text-secondary font-bold text-[10px] uppercase tracking-[0.4em]">
              <div className="w-12 h-1 bg-accent/20" />
              Clinical Health Overview • {new Date().toLocaleDateString('en-GB')}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button 
                onClick={() => window.location.reload()}
                className="w-12 h-12 bg-card border-2 border-main text-main rounded-sm hover:border-accent hover:text-accent transition-all flex items-center justify-center group shadow-main relative overflow-hidden glass"
                title="Synchronize Patient Portal"
            >
                <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700 relative z-10" />
                <div className="absolute inset-0 bg-accent/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
            <button 
              onClick={() => navigate('/appointments')}
              className="lando-button !px-10 !py-4 text-xs font-black flex items-center gap-3 shadow-main"
            >
              <Plus size={16} />
              BOOK CONSULTATION
            </button>
          </div>
        </motion.div>

        {/* Dynamic Stats Grid */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Calendar, label: 'Upcoming', value: upcomingAppointments.length, color: 'text-primary-600' },
            { icon: Clock, label: 'Pending', value: allAppointments.filter(a => a.status === 'pending').length, color: 'text-amber-600' },
            { icon: FileText, label: 'Clinical Reports', value: completedAppointments.length, color: 'text-violet-600' },
            { icon: Bell, label: 'Notifications', value: unreadNotifications.length, color: 'text-accent' },
          ].map((stat) => (
            <Card key={stat.label} padding="sm" className="relative group overflow-hidden border-2 border-main bg-card hover:border-accent/40 glass">
              <div className="relative z-10 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-sm bg-primary-600/10 flex items-center justify-center shadow-inner`}>
                  <stat.icon size={22} className={stat.color} />
                </div>
                <div>
                   <p className="text-3xl font-black text-dynamic tracking-tighter leading-none">{stat.value}</p>
                   <p className="text-[10px] text-muted font-black uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* Upcoming Consultations Content */}
            <motion.div variants={fadeUp}>
              <Card padding="none" className="overflow-hidden border-2 border-main bg-card shadow-2xl shadow-primary-600/5 glass-strong">
                <div className="px-10 py-8 border-b border-main flex items-center justify-between bg-gradient-primary-soft">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-dynamic">Consultation Queue</h2>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Confirmed clinical sessions</p>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline">Full History</button>
                </div>

                <div className="p-10 space-y-6">
                  {upcomingAppointments.length === 0 ? (
                    <div className="text-center py-20 opacity-20">
                       <Calendar size={48} className="mx-auto mb-4" />
                       <p className="text-sm font-black uppercase tracking-widest">No Active Appointments</p>
                    </div>
                  ) : (
                    upcomingAppointments.map((apt) => (
                      <div key={apt.id} className="p-8 border-2 border-main rounded-sm bg-main/30 hover:border-accent hover:bg-primary-600/[0.02] transition-all group glass">
                         <div className="flex flex-col md:flex-row gap-8 items-start">
                            <Avatar name={apt.doctorName} size="xl" className="rounded-sm" />
                            <div className="flex-1 space-y-6">
                               <div className="flex items-center justify-between">
                                  <div>
                                     <h4 className="text-2xl font-black uppercase tracking-tighter text-dynamic">{apt.doctorName}</h4>
                                     <div className="flex items-center gap-3 mt-2">
                                        <Badge variant={statusMap[apt.status].variant} className="text-[9px] font-black tracking-widest">
                                           {statusMap[apt.status].label.toUpperCase()}
                                        </Badge>
                                        <p className="text-[10px] font-black text-muted uppercase tracking-widest">{apt.doctorSpecialization}</p>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-xl font-black text-accent leading-none">{apt.timeSlot}</p>
                                     <p className="text-[9px] font-black text-muted uppercase tracking-widest mt-1">{apt.date}</p>
                                  </div>
                               </div>

                               <div className="flex items-center gap-4">
                                  {apt.status === 'confirmed' ? (
                                    <button 
                                      className="bg-accent text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl shadow-primary-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2" 
                                      onClick={() => handleJoin(apt.id)}
                                    >
                                       <Video size={14} /> Enter Room
                                    </button>
                                  ) : (
                                    <div className="px-6 py-2 bg-main/50 border border-main rounded-sm text-[9px] font-black text-muted uppercase tracking-widest">
                                       Pending Doctor Approval
                                    </div>
                                  )}
                                  <button className="text-muted text-[10px] font-black uppercase tracking-widest hover:text-red-500 hover:underline">
                                     Reschedule
                                  </button>
                               </div>
                            </div>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            {/* Recent Notifications */}
            <motion.div variants={fadeUp}>
              <Card className="border-2 border-main bg-card space-y-8 !p-8 glass">
                 <h3 className="text-sm font-black uppercase tracking-widest text-dynamic flex items-center justify-between">
                    Alerts Center
                    {unreadNotifications.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                    )}
                 </h3>
                 <div className="space-y-6">
                    {notifications.slice(0, 3).map((n) => (
                      <div key={n.id} className="p-4 border-2 border-main rounded-sm bg-main/30 group hover:border-accent/40 transition-all">
                        <p className="text-[11px] font-black uppercase tracking-tight text-dynamic">{n.title}</p>
                        <p className="text-[10px] font-bold text-muted mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                    <button 
                      onClick={() => navigate('/notifications')}
                      className="w-full text-center text-[10px] font-black uppercase tracking-[0.2em] text-accent pt-4 border-t border-main hover:underline"
                    >
                       View All Alerts
                    </button>
                 </div>
              </Card>
            </motion.div>

            {/* Quick Record Access */}
            <motion.div variants={fadeUp}>
              <Card className="border-2 border-main bg-card space-y-8 !p-8 glass">
                 <h3 className="text-sm font-black uppercase tracking-widest text-dynamic">Health Records</h3>
                 <div className="space-y-6">
                    {completedAppointments.slice(0, 2).map((apt) => (
                      <div key={apt.id} className="flex items-center justify-between group cursor-pointer border-b border-main pb-4 last:border-0 last:pb-0">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-sm bg-primary-600/10 flex items-center justify-center text-accent">
                               <FileText size={18} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-dynamic">{apt.doctorName}</p>
                               <p className="text-[9px] font-bold text-muted uppercase tracking-widest">{apt.date}</p>
                            </div>
                         </div>
                         <ChevronRight size={14} className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                      </div>
                    ))}
                    <button 
                      onClick={() => navigate('/reports')}
                      className="w-full text-center text-[10px] font-black uppercase tracking-[0.2em] text-accent pt-4 border-t border-main hover:underline"
                    >
                       Archive Folder
                    </button>
                 </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
