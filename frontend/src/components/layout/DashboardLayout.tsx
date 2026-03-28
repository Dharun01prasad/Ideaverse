import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/Toast';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { useAppointmentStore } from '../../store/appointmentStore';
import { useTheme } from '../../theme';
import { Sun, Moon } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { sidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  const { fetchAppointments } = useAppointmentStore();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (user) {
      fetchAppointments(user.id, user.role);
    }
  }, [user, fetchAppointments]);

  return (
    <div className="min-h-screen bg-main text-main transition-colors duration-300">
      <Sidebar />
      <ToastContainer />
      <motion.main
        animate={{ marginLeft: sidebarOpen ? 260 : 76 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className="min-h-screen flex flex-col"
      >
        {/* Theme Switcher */}
        <div className="flex justify-end items-center pt-6 pr-6">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-2 rounded-full border border-primary-600/30 bg-primary-600/10 text-primary-600 hover:bg-primary-600/20 transition-all"
            aria-label="Toggle light/dark mode"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-[10px] font-black uppercase tracking-widest">{theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
          </button>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};
