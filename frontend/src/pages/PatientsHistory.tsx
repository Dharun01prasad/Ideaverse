import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, ChevronRight, Calendar, Search, History as HistoryIcon, User } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { useAppointmentStore } from '../store/appointmentStore';
import { Badge } from '../components/ui/Badge';

const fadeUp = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 } };

export const PatientsHistory: React.FC = () => {
  const { user } = useAuthStore();
  const { getAppointmentsByDoctor } = useAppointmentStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  
  const history = user ? getAppointmentsByDoctor(user.id).filter(a => a.status === 'completed') : [];

  // Group by patient
  const patientGroups = history.reduce((groups, apt) => {
    const pId = apt.patientId;
    if (!groups[pId]) {
      groups[pId] = {
        name: apt.patientName,
        visits: [],
        lastVisit: apt.date
      };
    }
    groups[pId].visits.push(apt);
    if (new Date(apt.date) > new Date(groups[pId].lastVisit)) {
      groups[pId].lastVisit = apt.date;
    }
    return groups;
  }, {} as Record<string, { name: string; visits: any[]; lastVisit: string }>);

  const filteredPatients = Object.entries(patientGroups).filter(([_, data]) => 
     data.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.1 } } }} className="space-y-8 max-w-5xl mx-auto">
      <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-text-primary tracking-tight italic">Patient Records</h1>
          <p className="text-text-secondary mt-1">Unified view of clinical history and consultation benchmarks</p>
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-surface-200 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all bg-white/50 backdrop-blur-sm shadow-sm"
          />
        </div>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4">
        {filteredPatients.length === 0 ? (
          <Card className="text-center py-20 border-dashed border-2 bg-transparent border-surface-300">
            <Users size={64} className="mx-auto text-text-muted mb-4 opacity-20" />
            <p className="text-xl font-semibold text-text-primary">No matching patients</p>
            <p className="text-text-secondary">Verify the search query or wait for new completions</p>
          </Card>
        ) : (
          filteredPatients.map(([pid, data]) => (
            <div key={pid} className="space-y-3">
              <Card 
                hover 
                onClick={() => setExpandedPatient(expandedPatient === pid ? null : pid)}
                className={`p-6 cursor-pointer transition-all border-l-4 ${expandedPatient === pid ? 'border-primary-500 shadow-xl scale-[1.01]' : 'border-transparent'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-5 items-center">
                    <Avatar name={data.name} size="xl" className="ring-4 ring-primary-500/10" />
                    <div>
                      <h3 className="text-xl font-bold text-text-primary">{data.name}</h3>
                      <div className="flex items-center gap-3 mt-1.5 text-sm">
                        <Badge variant="live" className="text-[10px]">{data.visits.length} VISITS</Badge>
                        <span className="text-text-muted flex items-center gap-1 font-medium">
                          <HistoryIcon size={14}/> Last activity: {new Date(data.lastVisit).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <motion.div animate={{ rotate: expandedPatient === pid ? 90 : 0 }} className="text-text-muted">
                    <ChevronRight size={24} />
                  </motion.div>
                </div>
              </Card>

              <AnimatePresence>
                {expandedPatient === pid && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-10 pr-2 space-y-3 border-l-2 border-surface-200 ml-8"
                  >
                    {data.visits.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(apt => (
                      <div key={apt.id} className="group relative flex items-center justify-between p-5 bg-white/60 backdrop-blur-sm rounded-2xl border border-surface-200 hover:border-primary-300 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center shadow-inner">
                             <Calendar size={20} />
                           </div>
                           <div>
                             <p className="text-sm font-black text-text-primary">{new Date(apt.date).toLocaleDateString()} • {apt.timeSlot}</p>
                             <p className="text-sm text-text-secondary mt-1 font-medium italic">"{apt.notes || 'No description provided'}"</p>
                           </div>
                        </div>
                        <Button variant="ghost" size="sm" icon={<FileText size={18}/>}>View Record</Button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
};
