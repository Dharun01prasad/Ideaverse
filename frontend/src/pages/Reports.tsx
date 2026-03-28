import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Eye, X, Activity, Brain, Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { useAppointmentStore } from '../store/appointmentStore';

const fadeUp = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 } };

export const Reports: React.FC = () => {
    const { user } = useAuthStore();
    const { appointments } = useAppointmentStore();
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);
  
    const downloadReport = (report: any) => {
      const pName = user?.role === 'patient' ? user.name : (report.patientName || 'Patient');
      const content = `MEDICAL REPORT - SIGNBRIDGE\n\n` +
        `Patient: ${pName}\n` +
        `Diagnosis: ${report.diagnosis}\n` +
        `Symptoms: ${report.symptoms.join(', ')}\n\n` +
        `SUMMARY:\n${report.summary}\n\n` +
        `PRESCRIPTIONS:\n${report.prescriptions.map((p: any) => `- ${p.medicine}: ${p.dosage}`).join('\n')}\n\n` +
        `FOLLOW UP NOTES:\n${report.follow_up_notes}`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Medical_Report_${pName.replace(/\s/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    };

    const pastAppointments = appointments.filter(a => a.status === 'completed' && (user?.role === 'doctor' ? a.doctorId === user?.id : a.patientId === user?.id));

  const viewReport = async (appointmentId: string, download: boolean = false) => {
    setLoading(true);
    try {
      const cRes = await fetch(`http://localhost:8000/api/consultations/appointment/${appointmentId}`);
      if (cRes.ok) {
        const cData = await cRes.json();
        const rRes = await fetch(`http://localhost:8000/api/reports/${cData.id}`);
        if (rRes.ok) {
           const report = await rRes.json();
           setSelectedReport(report);
           if (download) downloadReport(report);
        }
      }
    } catch (err) {}
    setLoading(false);
  };

  return (
    <div className="space-y-12">
      <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.1 } } }} className="space-y-12">
        <motion.div variants={fadeUp}>
          <h1 className="text-5xl font-black uppercase tracking-tighter leading-tight text-main">Clinical <span className="text-accent italic">Reports</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Complete consultation archive and summaries</p>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6">
          {pastAppointments.length === 0 ? (
            <Card className="text-center py-24 border-2 border-main bg-card opacity-30">
              <FileText size={48} className="mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-main">Archive Empty</p>
            </Card>
          ) : (
            pastAppointments.map(apt => (
              <Card key={apt.id} className="flex items-center justify-between p-8 border-2 border-main bg-card hover:border-accent/40 shadow-xl shadow-primary-600/5 group">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-sm bg-primary-600/10 text-accent flex items-center justify-center">
                    <FileText size={28} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-main group-hover:text-accent transition-colors">Consultation Summary</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                        With {user?.role === 'doctor' ? apt.patientName : apt.doctorName} • {new Date(apt.date).toLocaleDateString()} • {apt.timeSlot}
                    </p>
                  </div>
                </div>
                  <div className="flex items-center gap-4">
                  <button 
                    disabled={loading && !selectedReport}
                    onClick={() => viewReport(apt.id)}
                    className="px-6 py-3 border-2 border-main text-[10px] font-black uppercase tracking-widest rounded-sm hover:border-accent hover:text-accent transition-all flex items-center gap-2"
                  >
                     <Eye size={14}/> View Record
                  </button>
                  <button 
                    onClick={() => viewReport(apt.id, true)} 
                    className="p-3 border-2 border-main rounded-sm text-muted hover:border-accent hover:text-accent transition-all"
                    title="Download Report"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </Card>
            ))
          )}
        </motion.div>

        <AnimatePresence>
          {selectedReport && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12 overflow-hidden">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedReport(null)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                 animate={{ opacity: 1, scale: 1, y: 0 }} 
                 exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                 className="relative bg-card border-4 border-main rounded-sm shadow-[0_40px_100px_rgba(0,0,0,0.8)] w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] z-10"
               >
                  <div className="p-10 border-b-2 border-main flex items-center justify-between bg-main/40 relative">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-accent text-white rounded-sm flex items-center justify-center shadow-2xl shadow-primary-600/40 transform rotate-3"><Brain size={32}/></div>
                        <div>
                           <h2 className="text-4xl font-black uppercase tracking-tighter text-main italic leading-none">Diagnostic <span className="text-accent">Record</span></h2>
                           <p className="text-[10px] font-black text-muted uppercase tracking-[0.4em] mt-3">SignBridge • Clinical Authorization No. {selectedReport.id?.slice(-6)}</p>
                        </div>
                     </div>
                     <button onClick={() => setSelectedReport(null)} className="w-12 h-12 border-2 border-main hover:border-accent rounded-sm text-muted hover:text-accent transition-all flex items-center justify-center"><X size={24}/></button>
                  </div>

                  <div className="p-10 md:p-16 overflow-y-auto space-y-16 bg-main/5 relative">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Preliminary Clinician Impression</p>
                          <p className="text-3xl font-black uppercase tracking-tighter text-main leading-tight italic decoration-accent/30 underline decoration-2">{selectedReport.diagnosis}</p>
                        </div>
                        <div className="space-y-4">
                          <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">Presenting Symptomatology</p>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {selectedReport.symptoms.map((s: string, i: number) => (
                               <span key={i} className="px-3 py-1.5 bg-main border-2 border-main text-[10px] font-black uppercase tracking-widest text-secondary rounded-sm hover:border-accent transition-all cursor-default">{s}</span>
                            ))}
                          </div>
                        </div>
                     </div> 

                     <div className="space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-0.5 bg-accent/30" />
                           <p className="text-[11px] font-black uppercase tracking-widest text-accent flex items-center gap-3">
                              <Activity size={18}/>
                              Clinical Observation Context
                           </p>
                        </div>
                        <div className="relative">
                          <p className="text-main font-bold text-lg leading-relaxed p-10 bg-card border-2 border-main rounded-sm italic shadow-inner relative z-10">
                             "{selectedReport.summary}"
                          </p>
                          <div className="absolute top-4 left-4 w-full h-full bg-accent/5 rounded-sm -z-0" />
                          <Activity size={120} className="absolute -right-10 -bottom-10 text-accent/5 -z-0 pointer-events-none" />
                        </div>
                     </div>

                     <div className="space-y-10">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-main flex items-center gap-4">
                           <div className="p-2 bg-main border border-main rounded-sm"><FileText size={16} className="text-accent"/></div>
                           Prescription Matrix
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {selectedReport.prescriptions.map((p: any, i: number) => (
                             <div key={i} className="flex justify-between items-center p-6 border-2 border-main bg-card rounded-sm hover:border-accent/40 transition-all shadow-main group">
                                <span className="text-sm font-black uppercase tracking-widest text-main italic group-hover:text-accent transition-colors">{p.medicine}</span>
                                <span className="text-[10px] font-black px-4 py-2 bg-accent text-white rounded-sm shadow-lg shadow-primary-600/20">{p.dosage}</span>
                             </div>
                          ))}
                        </div>
                     </div>
                  </div>

                  <div className="p-10 border-t-2 border-main bg-main/40 flex justify-end gap-6 relative z-10">
                     <button 
                       onClick={() => downloadReport(selectedReport)}
                       className="px-10 py-4 bg-main border-2 border-main text-[11px] font-black uppercase tracking-[0.2em] text-main rounded-sm hover:border-accent hover:text-accent transition-all flex items-center gap-3"
                     >
                        <Download size={18} />
                        EXPORT ARCHIVE
                     </button>
                     <button 
                       onClick={() => setSelectedReport(null)}
                       className="lando-button !px-12 !py-4 flex items-center gap-3"
                     >
                        <Check size={20} />
                        ACKNOWLEDGE RECORD
                     </button>
                  </div>
                  
                  <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 -z-10 translate-x-1/2 -skew-x-12" />
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
