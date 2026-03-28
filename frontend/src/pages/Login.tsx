import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Mail, Lock, ArrowRight, Eye, EyeOff, User, Stethoscope, AlertCircle } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';

const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
};

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const r = params.get('role');
    const a = params.get('action');
    if (r === 'doctor' || r === 'patient') setRole(r as UserRole);
    if (a === 'signup') setIsLogin(false);
    else if (a === 'login') setIsLogin(true);
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    let success = false;
    
    try {
        if (isLogin) {
          success = await login(email, password, role);
          if (!success) setError("Invalid email, password, or role combination.");
        } else {
          success = await signup(name, email, password, role, role === 'doctor' ? specialization : undefined);
          if (!success) setError("This email might already be registered. Try signing in.");
        }

        if (success) {
          navigate('/dashboard');
        }
    } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen topo-bg flex flex-col items-center justify-center p-6 relative bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/20">
      {/* Signature in Dark Mode */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black uppercase tracking-tighter opacity-[0.03] pointer-events-none select-none italic text-primary-500">
         SECURE
      </div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-sm bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
               <Hand size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black uppercase tracking-tighter text-white">SignBridge</span>
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-5xl font-black uppercase tracking-tighter leading-none mb-4 text-white">
             {isLogin ? "Welcome" : "Get started"} <br/>
             <span className="text-primary-500 italic">now</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-xs font-bold uppercase tracking-[0.4em] text-slate-400">
             The future of accessible medical care
          </motion.p>
        </div>

        <motion.div variants={fadeUp} className="bg-slate-800/60 rounded-sm shadow-[0_30px_60px_-15px_rgba(124,58,237,0.2)] border border-primary-600/30 overflow-hidden backdrop-blur-sm">
          <div className="flex bg-slate-700/40 border-b border-primary-600/20">
            {(['patient', 'doctor'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-6 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${
                  role === r ? 'text-primary-500 bg-slate-800/80' : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                {r === 'patient' ? '🧑 Patient' : '👩‍⚕️ Doctor'}
                {role === r && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600" />}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-12 space-y-8">
            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  <Input
                    label="Full Name"
                    className="lando-input"
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    icon={<User size={18} className="text-primary-400" />}
                  />
                  {role === 'doctor' && (
                    <Input
                      label="Specialization"
                      className="lando-input"
                      type="text"
                      required={role === 'doctor'}
                      placeholder="e.g. Neurologist"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      icon={<Stethoscope size={18} className="text-primary-400" />}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <Input
              label="Email Address"
              className="lando-input"
              type="email"
              required
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} className="text-primary-400" />}
            />

            <div className="relative">
              <Input
                label="Security Key"
                className="lando-input"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} className="text-primary-400" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-10 text-slate-500 hover:text-primary-500 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }} 
                 animate={{ opacity: 1, scale: 1 }}
                 className="p-4 bg-red-950/40 border border-red-600/50 rounded-sm flex items-center gap-3 text-red-400 text-xs font-bold leading-tight"
               >
                 <AlertCircle size={16} className="shrink-0" />
                 {error}
               </motion.div>
            )}

            <button type="submit" disabled={loading} className="lando-button w-full flex items-center justify-center gap-3 py-3 text-sm">
              {loading ? "Processing..." : isLogin ? "Authorize Session" : "Create Account"}
              <ArrowRight size={18} />
            </button>
          </form>

          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="w-full py-6 bg-slate-700/30 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-primary-500 hover:bg-slate-700/50 transition-all border-t border-primary-600/20"
          >
            {isLogin ? "Need a new account? Register" : "Have an account? Authorize"}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};
