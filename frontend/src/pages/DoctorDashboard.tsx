import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Users, CheckCircle,
  Video, RefreshCw, AlertCircle, ChevronRight
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { useAppointmentStore } from '../store/appointmentStore';
import { useUIStore } from '../store/uiStore';

const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
};

export const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getUpcoming, getPendingRequests, getAppointmentsByDoctor, updateStatus } = useAppointmentStore();
  const { addToast } = useUIStore();

  const upcoming = user ? getUpcoming(user.id, 'doctor') : [];
  const pending = user ? getPendingRequests(user.id) : [];
  const allAppointments = user ? getAppointmentsByDoctor(user.id) : [];
  const todayAppts = upcoming.filter(a => {
    const today = new Date().toISOString().split('T')[0];
    return a.date === today || a.status === 'confirmed';
  });

  const handleAccept = (id: string) => {
    updateStatus(id, 'confirmed');
    addToast('success', 'Appointment accepted successfully');
  };

  const handleReject = (id: string) => {
    updateStatus(id, 'rejected');
    addToast('info', 'Appointment declined');
  };

  const handleJoin = (aptId: string) => {
    navigate(`/consultation/${aptId}`);
  };

  return (
    <div className="space-y-12">
      <motion.div
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-12"
      >
        {/* Header Section */}
        <motion.div variants={fadeUp} className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b-2 border-main pb-10">
          <div className="space-y-4">
            <h1 className="text-5xl font-black uppercase tracking-tighter leading-tight text-main italic">
              Welcome back, <span className="text-accent underline decoration-4 underline-offset-8 decoration-accent/30 block sm:inline">Dr. {user?.name?.split(' ').pop()}</span>
            </h1>
            <div className="flex items-center gap-4 text-secondary font-bold text-[10px] uppercase tracking-[0.4em]">
              <div className="w-12 h-1 bg-accent/20" />
              Operational Dashboard • {new Date().toLocaleDateString('en-GB')}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => window.location.reload()}
              className="w-12 h-12 bg-main border-2 border-main text-main rounded-sm hover:border-accent hover:text-accent transition-all flex items-center justify-center group shadow-main relative overflow-hidden"
              title="Synchronize Data Room"
            >
              <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700 relative z-10" />
              <div className="absolute inset-0 bg-accent/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </button>
            <button className="lando-button !px-10 !py-4 text-[10px] font-black shadow-main flex items-center gap-3">
              <Calendar size={14} />
              CLINICAL SCHEDULE
            </button>
          </div>
        </motion.div>

        {/* Dynamic Stats Grid */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Calendar, label: "Today", value: todayAppts.length, color: 'text-primary-600' },
            { icon: AlertCircle, label: 'Pending', value: pending.length, color: 'text-amber-600' },
            { icon: Users, label: 'Patients', value: allAppointments.length, color: 'text-violet-600' },
            { icon: CheckCircle, label: 'Success', value: allAppointments.filter(a => a.status === 'completed').length, color: 'text-emerald-600' },
          ].map((stat) => (
            <Card key={stat.label} padding="sm" className="relative group overflow-hidden border-2 border-main bg-card">
              <div className="relative z-10 flex items-center gap-5">
                <div className={`w-14 h-14 rounded-sm bg-primary-600/10 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <div>
                  <p className="text-3xl font-black text-main tracking-tighter leading-none">{stat.value}</p>
                  <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em] mt-1">{stat.label}</p>
                </div>
              </div>
              <stat.icon size={80} className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none" />
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* Appointment Requests Content */}
            <motion.div variants={fadeUp}>
              <Card padding="none" className="overflow-hidden border-2 border-main bg-card">
                <div className="px-10 py-8 border-b border-main flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter text-main">Requests Queue</h2>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-1">Pending approval for today</p>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline">Archives</button>
                </div>

                <div className="p-10 space-y-8">
                  {pending.length === 0 ? (
                    <div className="text-center py-20 opacity-20">
                      <CheckCircle size={48} className="mx-auto mb-4" />
                      <p className="text-sm font-black uppercase tracking-widest">Inbox Zero</p>
                    </div>
                  ) : (
                    pending.map(apt => (
                      <div key={apt.id} className="p-8 border-2 border-main rounded-sm bg-main/30 hover:border-accent hover:bg-primary-600/[0.02] transition-all group">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                          <Avatar name={apt.patientName} size="xl" className="rounded-sm" />
                          <div className="flex-1 space-y-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-2xl font-black uppercase tracking-tighter text-main">{apt.patientName}</h4>
                                <div className="flex items-center gap-3 mt-2">
                                  <Badge variant="pending" className="text-[9px] font-black tracking-widest">URGENT</Badge>
                                  <span className="text-[9px] font-black text-muted uppercase tracking-widest flex items-center gap-1.5">
                                    <Calendar size={12} /> {apt.date}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-black text-accent leading-none">{apt.timeSlot}</p>
                                <p className="text-[9px] font-black text-muted uppercase tracking-widest mt-1">Confirmed Slot</p>
                              </div>
                            </div>

                            {apt.notes && (
                              <div className="p-6 bg-main/50 border-l-4 border-accent rounded-sm italic text-secondary font-bold text-sm">
                                "{apt.notes}"
                              </div>
                            )}

                            <div className="flex items-center gap-4">
                              <button
                                className="bg-accent text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-sm shadow-xl shadow-primary-600/20 hover:scale-105 active:scale-95 transition-all"
                                onClick={() => handleAccept(apt.id)}
                              >
                                Authorize Session
                              </button>
                              <button
                                className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline"
                                onClick={() => handleReject(apt.id)}
                              >
                                Decline
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
            {/* Live Queue / Active Rooms */}
            <motion.div variants={fadeUp}>
              <Card className="bg-accent border-none !p-8 relative overflow-hidden group shadow-2xl shadow-primary-600/30">
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white uppercase tracking-tighter">Live Session</h3>
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                  </div>

                  {upcoming.filter(a => a.status === 'confirmed').slice(0, 1).map(apt => (
                    <div key={apt.id} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar name={apt.patientName} size="md" className="rounded-sm ring-2 ring-white/30" />
                        <div>
                          <p className="font-black text-lg text-white leading-none uppercase tracking-tighter">{apt.patientName}</p>
                          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-1.5">{apt.timeSlot}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleJoin(apt.id)}
                        className="w-full py-4 bg-white text-primary-600 text-xs font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 rounded-sm"
                      >
                        <Video size={16} /> Enter Clinical Suite
                      </button>
                    </div>
                  ))}
                  {upcoming.filter(a => a.status === 'confirmed').length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">No active sessions</p>
                    </div>
                  )}
                </div>
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
              </Card>
            </motion.div>

            {/* Quick Metrics */}
            <motion.div variants={fadeUp}>
              <Card className="border-2 border-main bg-card space-y-8 !p-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-main">Consultation Hub</h3>
                <div className="space-y-6">
                  {allAppointments.filter(a => a.status === 'completed').slice(0, 3).map(apt => (
                    <div key={apt.id} className="flex items-center justify-between group cursor-pointer border-b border-main pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                        <Avatar name={apt.patientName} size="sm" className="rounded-sm" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-main">{apt.patientName}</p>
                          <p className="text-[9px] font-bold text-muted uppercase tracking-widest">{apt.date}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-muted group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                  <button className="w-full text-center text-[10px] font-black uppercase tracking-[0.2em] text-accent pt-4 border-t border-main">
                    Clinical Database
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
