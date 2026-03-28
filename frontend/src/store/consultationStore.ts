import { create } from 'zustand';
import type { ConsultationStatus, TranscriptEntry } from '../types';

interface ConsultationState {
  isActive: boolean;
  status: ConsultationStatus;
  consultationId: string | null;
  transcript: TranscriptEntry[];
  signOutput: string;
  isCaptionsOn: boolean;
  isSignDetectionOn: boolean;
  isMicOn: boolean;
  isCameraOn: boolean;
  elapsedTime: number;
  aiSummary: string;
  aiSymptoms: string[];

  startConsultation: (id: string) => void;
  endConsultation: () => void;
  setStatus: (status: ConsultationStatus) => void;
  addTranscriptEntry: (entry: TranscriptEntry) => void;
  setSignOutput: (text: string) => void;
  toggleCaptions: () => void;
  toggleSignDetection: () => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  setElapsedTime: (t: number) => void;
  setAiSummary: (summary: string) => void;
  setAiSymptoms: (symptoms: string[]) => void;
}

export const useConsultationStore = create<ConsultationState>((set) => ({
  isActive: false,
  status: 'scheduled',
  consultationId: null,
  transcript: [],
  signOutput: '',
  isCaptionsOn: true,
  isSignDetectionOn: true,
  isMicOn: true,
  isCameraOn: true,
  elapsedTime: 0,
  aiSummary: '',
  aiSymptoms: [],

  startConsultation: async (id) => {
    set({ isActive: true, consultationId: null, status: 'in_progress', transcript: [], elapsedTime: 0 });
    try {
      const res = await fetch(`http://localhost:8000/api/consultations/${id}/start`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        set({ consultationId: data.consultation_id });
      }
    } catch(e) {}
  },

  endConsultation: () =>
    set({ isActive: false, status: 'completed', consultationId: null }),

  setStatus: (status) => set({ status }),

  addTranscriptEntry: (entry) =>
    set(state => ({ transcript: [...state.transcript, entry] })),

  setSignOutput: (text) => set({ signOutput: text }),
  toggleCaptions: () => set(state => ({ isCaptionsOn: !state.isCaptionsOn })),
  toggleSignDetection: () => set(state => ({ isSignDetectionOn: !state.isSignDetectionOn })),
  toggleMic: () => set(state => ({ isMicOn: !state.isMicOn })),
  toggleCamera: () => set(state => ({ isCameraOn: !state.isCameraOn })),
  setElapsedTime: (t) => set({ elapsedTime: t }),
  setAiSummary: (summary) => set({ aiSummary: summary }),
  setAiSymptoms: (symptoms) => set({ aiSymptoms: symptoms }),
}));
