import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hand, MessageSquareText, Video, Brain, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
};

const SquiggleBackground: React.FC = () => (
  <div className="squiggle-container opacity-[0.08] absolute inset-0">
    <svg width="100%" height="100%" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="absolute inset-0">
       {[
         "M-100,200 C150,150 250,350 450,300 S750,100 1100,250",
         "M-50,400 C300,300 500,600 700,500 S900,200 1050,450",
         "M-200,600 C100,500 300,800 500,700 S800,400 1200,650",
         "M0,800 C250,750 450,950 650,850 S850,600 1000,800",
         "M100,100 C400,0 600,300 800,200 S1100,0 1200,100",
         "M-150,900 C100,850 400,1000 600,950 S900,750 1150,900"
       ].map((path, i) => (
         <motion.path 
           key={i}
           d={path}
           className="squiggle" 
           stroke="#7c3aed"
           strokeWidth="2"
           fill="none"
           initial={{ pathLength: 0, opacity: 0 }}
           animate={{ 
             pathLength: 1, 
             opacity: i % 2 === 0 ? 0.2 : 0.1,
             x: [0, 20, -10, 0],
             y: [0, -15, 10, 0]
           }}
           transition={{ 
             duration: 15 + (i * 2), 
             repeat: Infinity, 
             ease: "linear" 
           }}
         />
       ))}
    </svg>
  </div>
);

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen topo-bg text-slate-100 selection:bg-primary-600 selection:text-white relative bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900/20">
      <SquiggleBackground />

      {/* Simple Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-24 flex items-center px-10 bg-slate-900/80 backdrop-blur-xl border-b border-primary-600/20">
        <div className="max-w-[1800px] mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-primary-600 flex items-center justify-center rounded-sm">
               <Hand size={20} className="text-white" />
            </div>
            <span className="text-xl font-black uppercase tracking-tighter text-white antialiased">SignBridge</span>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-400 hidden md:flex">
              <a href="#features" className="hover:text-primary-500 transition-colors">Capabilities</a>
              <a href="#how" className="hover:text-primary-500 transition-colors">How It Works</a>
            </div>
            <div className="flex items-center gap-4">
               <Button 
                 variant="ghost" 
                 className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary-500" 
                 onClick={() => navigate('/login?action=login')}
               >
                 Sign In
               </Button>
               <button 
                 onClick={() => navigate('/login?action=signup')}
                 className="bg-primary-600 text-white text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/30 active:scale-95"
               >
                 Get Started
               </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative pt-32 px-10 pb-32 z-10">
        <div className="max-w-[1200px] mx-auto">
          
          {/* Hero Section */}
          <div className="min-h-[80vh] flex flex-col items-center justify-center text-center mb-32">
            <motion.div
              initial="initial"
              animate="animate"
              variants={{ animate: { transition: { staggerChildren: 0.15 } } }}
              className="w-full space-y-12"
            >
              <motion.div variants={fadeUp} className="inline-block">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600/10 border border-primary-600/30 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Clinical Grade Access</span>
                </div>
              </motion.div>

              <motion.h1 
                variants={fadeUp}
                className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-tight text-white"
              >
                Communication
                <br/>
                <span className="text-primary-500 italic">Without Barriers</span>
              </motion.h1>

              <motion.p 
                variants={fadeUp} 
                className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 font-medium leading-relaxed"
              >
                Instant Sign Language Translation and High-Accuracy Captions for Healthcare Providers
              </motion.p>

              <motion.div 
                variants={fadeUp} 
                className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
              >
                <button 
                  onClick={() => navigate('/login?action=signup')}
                  className="lando-button flex items-center justify-center gap-3 text-sm"
                >
                  Get Started Now <ArrowRight size={18} />
                </button>
                <button 
                  onClick={() => navigate('/login?action=login')}
                  className="px-8 py-4 border-2 border-primary-600/50 text-primary-400 font-bold uppercase tracking-widest rounded-sm hover:bg-primary-600/10 hover:border-primary-500 transition-all text-sm"
                >
                  Explore Features
                </button>
              </motion.div>
            </motion.div>
          </div>

          {/* Key Metrics */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-32 bg-slate-800/40 p-8 border border-primary-600/20 rounded-sm"
          >
            {[
              { label: "Signal Latency", value: "<300ms" },
              { label: "Accuracy", value: "99.2%" },
              { label: "HIPAA Secure", value: "Level 5" },
              { label: "24/7 Support", value: "Always On" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-2xl md:text-4xl font-black text-primary-500 mb-2">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Features Grid */}
          <section id="features" className="mb-32">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight text-white mb-6">
                Powerful Capabilities
              </h2>
              <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
                Built for modern healthcare delivery with accessibility at its core
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  title: "Live Translation", 
                  icon: MessageSquareText, 
                  desc: "Real-time sign language to text and speech conversion powered by neural ASR" 
                },
                { 
                  title: "Secure Video", 
                  icon: Video, 
                  desc: "HIPAA-compliant encrypted sessions with medical-grade WebRTC protocol" 
                },
                { 
                  title: "Auto Summary", 
                  icon: Brain, 
                  desc: "AI-powered clinical notes and diagnostic extraction from consultations" 
                },
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-slate-800/50 p-8 border border-primary-600/20 rounded-sm hover:bg-slate-800/80 hover:border-primary-600/50 transition-all"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary-600/20 rounded-sm flex items-center justify-center group-hover:bg-primary-600/30 transition-colors">
                      <feature.icon size={24} className="text-primary-500 group-hover:text-primary-400 transition-colors" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">{feature.title}</h3>
                  </div>
                  <p className="text-slate-400 leading-relaxed font-medium text-sm">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section id="how" className="mb-32">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-tight text-white mb-6">
                Simple Integration
              </h2>
              <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
                Seamlessly integrate accessibility into your healthcare workflow
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Connect", desc: "Start a consultation with built-in video signaling" },
                { step: "2", title: "Communicate", desc: "Real-time translation handles sign language and speech" },
                { step: "3", title: "Document", desc: "Auto-generated summaries for patient records" },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="text-6xl font-black text-primary-600/30 mb-4">{item.step}</div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 font-medium">{item.desc}</p>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-12 -right-4 text-3xl text-primary-600/20">→</div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary-600/20 to-primary-600/5 border border-primary-600/30 rounded-sm p-16 text-center"
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-8">
              Ready to Transform Healthcare Access?
            </h2>
            <p className="text-xl text-slate-300 font-medium mb-12 max-w-2xl mx-auto">
              Join healthcare providers building a more accessible future for all patients
            </p>
            <button 
              onClick={() => navigate('/login?action=signup')}
              className="lando-button flex items-center justify-center gap-3 mx-auto text-sm"
            >
              Start Your Journey <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm py-16 px-10 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-600 flex items-center justify-center rounded-sm">
                  <Hand size={16} className="text-white" />
                </div>
                <span className="text-2xl font-black uppercase tracking-tighter text-white">SignBridge</span>
              </div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Accessible Healthcare</p>
            </div>
            
            <div className="flex items-center gap-12 text-xs font-bold uppercase tracking-widest text-slate-500">
              <a href="#" className="hover:text-primary-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary-500 transition-colors">Compliance</a>
              <a href="#" className="hover:text-primary-500 transition-colors">Docs</a>
            </div>
            
            <div className="text-xs font-bold opacity-40 text-slate-400">
              © 2026 SignBridge. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
