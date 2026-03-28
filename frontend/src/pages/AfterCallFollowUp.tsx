import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Save, CheckCircle, FileText, Activity, ArrowRight, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';
import { useAppointmentStore } from '../store/appointmentStore';
import { useUIStore } from '../store/uiStore';

const fadeUp = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 } };

export const AfterCallFollowUp: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { appointments, updateStatus } = useAppointmentStore();
  const { addToast } = useUIStore();
  
  const appointment = appointments.find(a => a.id === id);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [summary, setSummary] = useState("");
  const [prescriptions, setPrescriptions] = useState("");
  const [suggestedData, setSuggestedData] = useState<any>(null);

  useEffect(() => {
    const fetchAIProposal = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const cRes = await fetch(`http://localhost:8000/api/consultations/appointment/${id}`);
        if (cRes.ok) {
           const cData = await cRes.json();
           const sRes = await fetch(`http://localhost:8000/api/consultations/${cData.id}/summarize`, { method: 'POST' });
           if (sRes.ok) {
              const sData = await sRes.json();
              setSummary(sData.summary);
              setSuggestedData(sData);
              const pStr = sData.prescriptions.map((p: any) => `${p.medicine}: ${p.dosage}`).join('\n');
              setPrescriptions(pStr);
           }
        }
      } catch (err) {
          console.error("Failed to fetch AI summary:", err);
      }
      setLoading(false);
    };
    fetchAIProposal();
  }, [id]);

  const handleSave = async () => {
     if (!id || !user) return;
     setLoading(true);
     try {
       const cRes = await fetch(`http://localhost:8000/api/consultations/appointment/${id}`);
       if (cRes.ok) {
          const cData = await cRes.json();
          const pList = prescriptions.split('\n').filter(line => line.includes(':')).map(line => {
             const [m, d] = line.split(':');
             return { medicine: m.trim(), dosage: d.trim() };
          });

          const res = await fetch('http://localhost:8000/api/reports/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              consultation_id: cData.id,
              summary: summary,
              symptoms: suggestedData?.symptoms || [], 
              diagnosis: suggestedData?.diagnosis || 'Follow-up Required',
              prescriptions: pList,
              follow_up_notes: "Prescribed via SignBridge AI"
            })
          });

          if (res.ok) {
            await updateStatus(id, 'completed');
            setSaved(true);
            addToast('success', 'Medical report finalized and saved.');
            setTimeout(() => navigate('/dashboard'), 2000);
          }
       }
     } catch(e) {
         addToast('error', 'Failed to save report. Please try again.');
     }
     setLoading(false);
  };

  if (user?.role !== 'doctor') {
    return (
       <div className="min-h-screen bg-main flex items-center justify-center p-6 topographic-bg">
          <motion.div initial="initial" animate="animate" className="max-w-md w-full text-center space-y-8">
            <div className="w-20 h-20 bg-accent rounded-sm mx-auto flex items-center justify-center shadow-2xl shadow-primary-600/20">
               <CheckCircle size={40} className="text-white" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black uppercase tracking-tighter text-main italic">Consultation <span className="text-accent">Ended</span></h1>
              <p className="text-secondary font-bold text-sm leading-relaxed">Your doctor is generating the digital health report. It will be available in your clinical archive shortly.</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="lando-button w-full"
            >
              Back to Health Suite
            </button>
          </motion.div>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-main topographic-bg p-8 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-main pb-10">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <Badge variant="completed">Post-Call Processing</Badge>
                <div className="flex items-center gap-2 text-muted text-[10px] font-black uppercase tracking-widest">
                   <Activity size={12} className="text-accent" />
                   Reviewing Session {id?.slice(0, 8)}
                </div>
             </div>
             <h1 className="text-5xl font-black uppercase tracking-tighter text-main italic">Report <span className="text-accent">Finalization</span></h1>
             <p className="text-secondary font-bold text-sm">Validating clinical data for <span className="text-main">{appointment?.patientName}</span></p>
          </div>
          <button 
            disabled={loading || saved}
            onClick={handleSave}
            className={`lando-button flex items-center gap-3 ${saved ? 'bg-emerald-500' : ''}`}
          >
            {saved ? <CheckCircle size={18} /> : <Save size={18} />}
            {saved ? 'Report Saved' : 'Complete & Authorize'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           {/* Main Editor */}
           <div className="lg:col-span-2 space-y-8">
              <Card padding="none" className="border-2 border-main overflow-hidden bg-card shadow-main">
                 <div className="px-8 py-6 border-b-2 border-main bg-main/5 flex items-center gap-3">
                    <FileText size={20} className="text-accent" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-main">Consultation Summary</h3>
                 </div>
                 <div className="p-8">
                    <textarea 
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Enter clinical findings..."
                      className="w-full h-64 bg-transparent text-main font-bold text-lg leading-relaxed outline-none resize-none placeholder:text-muted"
                    />
                 </div>
              </Card>

              <Card padding="none" className="border-2 border-main overflow-hidden bg-card shadow-main">
                 <div className="px-8 py-6 border-b-2 border-main bg-main/5 flex items-center gap-3">
                    <Activity size={20} className="text-accent" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-main">Digital Prescriptions</h3>
                 </div>
                 <div className="p-8">
                    <textarea 
                      value={prescriptions}
                      onChange={(e) => setPrescriptions(e.target.value)}
                      placeholder="Amoxicillin: 500mg daily..."
                      className="w-full h-32 bg-transparent text-main font-bold text-sm leading-relaxed outline-none resize-none font-mono placeholder:text-muted"
                    />
                 </div>
              </Card>
           </div>

           {/* Sidebar AI Insights */}
           <div className="space-y-8">
              <Card className="bg-accent border-none !p-8 shadow-2xl shadow-primary-600/20 relative overflow-hidden group">
                 <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-2">
                       <Brain size={20} className="text-white" />
                       <h3 className="text-sm font-black uppercase tracking-widest text-white">AI Intelligence</h3>
                    </div>
                    
                    {loading ? (
                       <div className="flex items-center gap-3 text-white/60 py-10">
                          <RefreshCw size={18} className="animate-spin" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Analyzing Sessions...</span>
                       </div>
                    ) : (
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Provisional Diagnosis</p>
                             <p className="text-white font-bold text-lg leading-tight uppercase tracking-tighter italic">{suggestedData?.diagnosis || 'Pending Review'}</p>
                          </div>
                          
                          <div className="space-y-3">
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Identified Symptoms</p>
                             <div className="flex flex-wrap gap-2">
                                {suggestedData?.symptoms?.map((s: string) => (
                                   <span key={s} className="px-2 py-1 bg-white/10 rounded-sm text-[8px] font-black text-white uppercase tracking-widest border border-white/10">
                                      {s}
                                   </span>
                                ))}
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
                 <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
              </Card>

              <Card className="border-2 border-main bg-card !p-8 space-y-6">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-muted">Clinical Actions</h3>
                 <div className="space-y-3">
                    <button className="w-full py-4 px-6 border border-main rounded-sm text-[10px] font-black uppercase tracking-widest text-secondary hover:border-accent hover:text-accent transition-all flex items-center justify-between group">
                       Export Data <ArrowRight size={14} className="group-hover:translate-x-1 transition-all" />
                    </button>
                    <button className="w-full py-4 px-6 border border-main rounded-sm text-[10px] font-black uppercase tracking-widest text-secondary hover:border-accent hover:text-accent transition-all flex items-center justify-between group">
                       Audit Log <ArrowRight size={14} className="group-hover:translate-x-1 transition-all" />
                    </button>
                 </div>
              </Card>
           </div>
        </div>
      </div>
    </div>
  );
};
