import React from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useUIStore } from '../store/uiStore';

const fadeUp = { initial: { opacity: 0, y: 15 }, animate: { opacity: 1, y: 0 } };

export const Notifications: React.FC = () => {
  const { notifications, markNotificationRead } = useUIStore();

  return (
    <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.1 } } }} className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-main pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-main italic">Alert <span className="text-accent underline decoration-4 underline-offset-8 decoration-accent/30">Intelligence</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted mt-2">Clinical Updates & System Messages</p>
        </div>
        <button 
          onClick={() => notifications.forEach(n => markNotificationRead(n.id))}
          className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-main transition-colors border-2 border-accent/20 px-6 py-3 rounded-sm"
        >
          Acknowledge All
        </button>
      </header>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-6">
        {notifications.length === 0 ? (
          <Card className="text-center py-20 border-2 border-dashed border-main bg-card shadow-main rounded-sm grayscale opacity-40">
            <Bell size={64} className="mx-auto text-main mb-6 opacity-30" />
            <p className="text-[10px] font-black uppercase tracking-widest text-main">System queue clear</p>
          </Card>
        ) : (
          notifications.map(n => (
            <Card key={n.id} className={`!p-8 rounded-sm border-2 transition-all relative group overflow-hidden ${n.read ? 'bg-main border-main text-secondary opacity-60' : 'bg-card border-accent/40 text-main shadow-main cursor-pointer hover:border-accent'}`}>
              <div className="flex gap-8 relative z-10">
                <div className={`mt-1 ${n.read ? 'text-muted' : 'text-accent'}`}>
                  {n.read ? <CheckCircle size={22} /> : <div className="w-4 h-4 rounded-full bg-accent shadow-[0_0_15px_rgba(124,58,237,0.5)] mt-1 animate-pulse" />}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase tracking-tighter italic leading-none">{n.title}</h3>
                  <p className="text-sm font-bold leading-relaxed">{n.message}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted mt-4">Automated Protocol • {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              {!n.read && <div className="absolute inset-0 bg-accent/5 -z-0" />}
            </Card>
          ))
        )}
      </motion.div>
    </motion.div>
  );
};
