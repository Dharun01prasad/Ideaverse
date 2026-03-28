import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Clock, FileText, Bell,
  LogOut, ChevronLeft, ChevronRight, Hand, Users
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Avatar } from '../ui/Avatar';

const patientNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/consultations', icon: Clock, label: 'Sessions' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
];

const doctorNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/requests', icon: Clock, label: 'Requests' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/reports', icon: FileText, label: 'Reports' },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const navItems = user?.role === 'doctor' ? doctorNav : patientNav;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 260 : 76 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r-2 border-main z-40 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.02)]"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-20 border-b-2 border-main">
        <div className="w-10 h-10 rounded-sm bg-accent flex items-center justify-center shrink-0 shadow-lg shadow-primary-600/20">
          <Hand size={20} className="text-white" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden"
            >
              <h1 className="text-lg font-black font-display uppercase tracking-widest text-main">Sign<span className="text-accent italic">Bridge</span></h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-10 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all duration-300 group
              ${isActive
                ? 'bg-accent text-white shadow-xl shadow-primary-600/20'
                : 'text-secondary hover:bg-main hover:text-accent border border-transparent hover:border-main'
              }`
            }
          >
            <item.icon size={20} className="shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* User Area */}
      <div className="border-t-2 border-main p-4 bg-main/10">
        <div className="flex items-center gap-4 px-3 py-3">
          <Avatar name={user?.name || 'User'} size="sm" className="rounded-sm border-2 border-main" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-[10px] font-black text-main uppercase tracking-tighter truncate leading-none">{user?.name}</p>
                <p className="text-[9px] font-black text-muted uppercase tracking-widest mt-1 capitalize">{user?.role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 w-full rounded-sm text-[10px] font-black uppercase tracking-widest text-secondary hover:bg-red-500/10 hover:text-red-500 transition-all mt-2 border border-transparent hover:border-red-500/20"
        >
          <LogOut size={18} className="shrink-0" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Log Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-24 w-7 h-7 bg-card border-2 border-main rounded-sm flex items-center justify-center shadow-lg hover:border-accent hover:text-accent transition-all z-50 text-secondary"
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </motion.aside>
  );
};
