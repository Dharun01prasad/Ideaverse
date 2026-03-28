import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Check,
  Star, Clock, Calendar, Send, Search, Filter
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { useAuthStore } from '../store/authStore';
import { useAppointmentStore } from '../store/appointmentStore';
import { useUIStore } from '../store/uiStore';
import { useEffect } from 'react';
import type { Doctor, TimeSlot } from '../types';

const STEPS = ['Select Doctor', 'Choose Date', 'Pick Time', 'Add Notes', 'Confirm'];

const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
};

export const RequestAppointment: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createAppointment, fetchDoctors, doctors } = useAppointmentStore();
  const { addToast } = useUIStore();

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const [step, setStep] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startDay = first.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [currentMonth]);

  const fallbackAvailability = [1, 2, 3, 4, 5]; // Mon-Fri
  const fallbackSlots = [
    { id: '1', startTime: '09:00', endTime: '09:30', isBooked: false },
    { id: '2', startTime: '10:00', endTime: '10:30', isBooked: false },
    { id: '3', startTime: '14:00', endTime: '14:30', isBooked: false }
  ];

  const availableDaysOfWeek = useMemo(() => {
    if (!selectedDoctor) return [];
    if (!selectedDoctor.availability || selectedDoctor.availability.length === 0) {
      return fallbackAvailability;
    }
    return selectedDoctor.availability.map((a: any) => a.dayOfWeek);
  }, [selectedDoctor]);

  const availableSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    if (!selectedDoctor.availability || selectedDoctor.availability.length === 0) {
      return fallbackAvailability.includes(dayOfWeek) ? fallbackSlots : [];
    }
    const avail = selectedDoctor.availability.find((a: any) => a.dayOfWeek === dayOfWeek);
    return avail?.slots?.filter((s: any) => !s.isBooked) || [];
  }, [selectedDoctor, selectedDate]);

  const isDayAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    return availableDaysOfWeek.includes(date.getDay());
  };

  const handleSubmit = async () => {
    if (!user || !selectedDoctor || !selectedDate || !selectedSlot) return;
    setSubmitting(true);

    const success = await createAppointment({
      doctorId: selectedDoctor.id,
      date: selectedDate.toISOString().split('T')[0],
      timeSlot: `${selectedSlot.startTime} - ${selectedSlot.endTime}`,
      notes,
    }, user.id);

    if (success) {
       addToast('success', `Appointment requested with ${selectedDoctor.name}`);
       navigate('/dashboard');
    } else {
       addToast('error', `Failed to request appointment`);
    }
    setSubmitting(false);
  };

  const canNext = () => {
    if (step === 0) return !!selectedDoctor;
    if (step === 1) return !!selectedDate;
    if (step === 2) return !!selectedSlot;
    return true;
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center gap-6 border-b-2 border-main pb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-12 h-12 rounded-sm border-2 border-main flex items-center justify-center text-main hover:border-accent hover:text-accent transition-all group overflow-hidden relative shadow-main"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <div className="absolute inset-0 bg-accent/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-main italic leading-none">
             Book <span className="text-accent underline decoration-4 underline-offset-8 decoration-accent/30">Specialist</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted mt-2">Clinical Consultation Entry Point</p>
        </div>
      </motion.div>

      {/* Stepper */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto mb-12">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-3 flex-1 relative">
                <div className={`w-10 h-10 rounded-sm flex items-center justify-center text-xs font-black transition-all duration-500 shadow-xl ${
                  i < step ? 'bg-emerald-500 text-white' :
                  i === step ? 'bg-accent text-white shadow-primary-600/30 -translate-y-1' :
                  'bg-main border border-main text-muted'
                }`}>
                  {i < step ? <Check size={18} /> : i + 1}
                </div>
                <span className={`hidden md:block text-[9px] font-black uppercase tracking-widest ${
                  i <= step ? 'text-main' : 'text-muted'
                }`}>
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`absolute left-[calc(50%+1.5rem)] right-[-1rem] top-5 h-[2px] ${
                    i < step ? 'bg-emerald-500' : 'bg-main border-y border-main'
                  }`} />
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Step 0: Select Doctor */}
        {step === 0 && (
          <motion.div key="doctors" {...fadeUp} className="space-y-10">
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-card border-2 border-main p-6 rounded-sm shadow-main">
              <div className="relative flex-1 w-full">
                <Input
                  placeholder="SEARCH CLINICIANS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search size={18} className="text-accent" />}
                  className="!rounded-sm !border-main !bg-main !text-main font-black uppercase tracking-widest text-[10px]"
                />
              </div>
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-accent">
                   <Filter size={18} />
                </div>
                <select
                  value={specializationFilter}
                  onChange={(e) => setSpecializationFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-sm border-2 border-main bg-main text-main font-black uppercase tracking-widest text-[10px] focus:outline-none focus:border-accent transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Specialties</option>
                  {Array.from(new Set(doctors.map(d => d.specialization))).map(spec => spec && (
                    <option key={spec} value={spec} className="bg-main text-main font-bold">{spec}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {doctors.filter(d => 
                d.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
                (specializationFilter ? d.specialization === specializationFilter : true)
              ).map((doctor: any) => (
              <Card
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor)}
                className={`cursor-pointer transition-all border-2 rounded-sm !p-8 bg-card shadow-main relative group overflow-hidden ${
                  selectedDoctor?.id === doctor.id
                    ? 'border-accent -translate-y-2'
                    : 'border-main hover:border-accent/40'
                }`}
              >
                <div className="flex items-start gap-6 relative z-10">
                  <Avatar name={doctor.name} size="lg" className="ring-2 ring-main shadow-lg" />
                  <div className="flex-1">
                    <p className="font-black text-main uppercase tracking-tighter text-lg leading-tight italic">{doctor.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent mt-1">{doctor.specialization}</p>
                    <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-muted uppercase tracking-widest">
                      <span className="flex items-center gap-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        {doctor.rating}
                      </span>
                      <span>{doctor.experience}Y EXP</span>
                    </div>
                  </div>
                  {selectedDoctor?.id === doctor.id && (
                    <div className="w-8 h-8 rounded-sm bg-accent text-white flex items-center justify-center shadow-lg shadow-primary-600/30">
                      <Check size={18} />
                    </div>
                  )}
                </div>
                
                {doctor.bio && (
                  <p className="text-[11px] font-bold text-secondary mt-5 leading-relaxed italic border-l-2 border-accent/20 pl-4">{doctor.bio}</p>
                )}
                
                <div className="flex gap-2 mt-6 flex-wrap relative z-10">
                  {(doctor.availability?.length ? doctor.availability : [{ id: 1, dayOfWeek: 1 }, { id: 2, dayOfWeek: 3 }, { id: 3, dayOfWeek: 5 }]).map((a: any) => {
                    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
                    return (
                      <span key={a.id} className="text-[9px] px-2 py-1 bg-main border border-main text-main font-black uppercase tracking-widest rounded-sm">
                        {days[a.dayOfWeek]}
                      </span>
                    );
                  })}
                </div>

                <div className={`absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              </Card>
            ))}
            </div>
          </motion.div>
        )}

        {/* Step 1: Choose Date */}
        {step === 1 && (
          <motion.div key="calendar" {...fadeUp} className="max-w-xl mx-auto">
            <Card className="!p-10 border-2 border-main bg-card shadow-main rounded-sm">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-main">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="w-10 h-10 rounded-sm border border-main flex items-center justify-center text-main hover:border-accent transition-all"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={20} />
                </button>
                <h3 className="text-xl font-black uppercase tracking-tighter italic text-main">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="w-10 h-10 rounded-sm border border-main flex items-center justify-center text-main hover:border-accent transition-all"
                  aria-label="Next month"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-muted py-3 tracking-widest">
                    {d}
                  </div>
                ))}
                {daysInMonth.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} />;
                  const available = isDayAvailable(day);
                  const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
                  const isToday = day.toDateString() === new Date().toDateString();

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => available && setSelectedDate(day)}
                      disabled={!available}
                      className={`
                        aspect-square rounded-sm text-sm font-black transition-all relative flex flex-col items-center justify-center
                        ${available
                          ? isSelected
                            ? 'bg-accent text-white shadow-lg shadow-primary-600/30 -translate-y-1'
                            : 'hover:border-accent/40 border border-transparent text-main'
                          : 'text-muted/20 cursor-not-allowed'
                        }
                        ${isToday && !isSelected ? 'border-2 border-accent/20' : ''}
                      `}
                    >
                      {day.getDate()}
                      {available && !isSelected && (
                        <span className="w-1 h-1 rounded-full bg-accent mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-6 mt-10 pt-6 border-t border-main text-[9px] font-black uppercase tracking-widest text-muted">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" /> Available
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-main border border-main" /> Unavailable
                </span>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Pick Time */}
        {step === 2 && (
          <motion.div key="timeslots" {...fadeUp} className="max-w-xl mx-auto">
            <Card className="!p-10 border-2 border-main bg-card shadow-main rounded-sm">
              <div className="mb-10">
                <h3 className="text-xl font-black uppercase tracking-tighter italic text-main">
                  Select <span className="text-accent">Interval</span>
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mt-2">
                  {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {availableSlots.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-main rounded-sm grayscale opacity-30">
                  <Clock size={40} className="mx-auto mb-4 text-main" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-main">No available intervals for this date</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`
                        py-4 px-4 rounded-sm text-xs font-black uppercase tracking-widest transition-all border-2
                        ${selectedSlot?.id === slot.id
                          ? 'bg-accent text-white border-transparent shadow-lg shadow-primary-600/30 -translate-y-1'
                          : 'border-main hover:border-accent/40 bg-main text-main'
                        }
                      `}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Step 3: Add Notes */}
        {step === 3 && (
          <motion.div key="notes" {...fadeUp} className="max-w-xl mx-auto">
            <Card className="!p-10 border-2 border-main bg-card shadow-main rounded-sm">
              <div className="mb-10">
                <h3 className="text-xl font-black uppercase tracking-tighter italic text-main">
                  Clinical <span className="text-accent">Context</span>
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mt-2">
                  OPTIONAL SYMPTOM DESCRIPTION FOR THE CLINICIAN
                </p>
              </div>
              <Textarea
                placeholder="E.G., RECURRING HEADACHES IN THE EVENING..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="!bg-main !border-2 !border-main !rounded-sm !p-6 !text-main font-bold text-sm min-h-[200px]"
              />
            </Card>
          </motion.div>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <motion.div key="confirm" {...fadeUp} className="max-w-2xl mx-auto">
            <Card className="!p-10 border-2 border-main bg-card shadow-main rounded-sm relative overflow-hidden">
              <div className="mb-10 relative z-10">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic text-main">
                  Action <span className="text-accent">Authorization</span>
                </h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mt-2">VERIFY BOOKING PARAMETERS BEFORE SUBMISSION</p>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-6 p-6 rounded-sm bg-main border-2 border-main">
                  <Avatar name={selectedDoctor?.name || ''} size="lg" className="shadow-lg" />
                  <div>
                    <p className="font-black text-main uppercase tracking-tighter text-lg leading-none italic">{selectedDoctor?.name}</p>
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mt-2">{selectedDoctor?.specialization}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 rounded-sm bg-main border-2 border-main">
                    <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em] mb-3">SCHEDULED DATE</p>
                    <p className="text-sm font-black text-main flex items-center gap-3 italic uppercase tracking-tighter">
                      <Calendar size={18} className="text-accent" />
                      {selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="p-6 rounded-sm bg-main border-2 border-main">
                    <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em] mb-3">TIME INTERVAL</p>
                    <p className="text-sm font-black text-main flex items-center gap-3 italic uppercase tracking-tighter">
                      <Clock size={18} className="text-accent" />
                      {selectedSlot?.startTime} - {selectedSlot?.endTime}
                    </p>
                  </div>
                </div>

                {notes && (
                  <div className="p-6 rounded-sm bg-main border-2 border-main">
                    <p className="text-[9px] font-black text-muted uppercase tracking-[0.2em] mb-3">CLINICAL NOTES</p>
                    <p className="text-xs font-bold text-secondary leading-relaxed italic">{notes}</p>
                  </div>
                )}
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <motion.div variants={fadeUp} className="flex justify-between items-center max-w-2xl mx-auto pt-10 border-t-2 border-main">
        <Button
          variant="secondary"
          onClick={() => step > 0 ? setStep(step - 1) : navigate('/dashboard')}
          icon={<ArrowLeft size={16} />}
          className="!rounded-sm !px-10 !py-4 font-black uppercase tracking-widest text-[10px]"
        >
          {step === 0 ? 'BACK' : 'PREVIOUS'}
        </Button>
        {step < 4 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
            icon={<ArrowRight size={16} />}
            className="lando-button !px-12 !py-4"
          >
            NEXT PHASE
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            loading={submitting}
            icon={<Send size={16} />}
            className="lando-button !px-12 !py-4"
          >
            AUTHORIZE BOOKING
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
};
