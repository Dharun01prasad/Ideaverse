import { create } from 'zustand';
import type { Notification } from '../types';

interface UIState {
  sidebarOpen: boolean;
  toasts: { id: string; type: 'success' | 'error' | 'info'; message: string }[];
  notifications: Notification[];
  highContrastMode: boolean;
  fontScale: number;

  toggleSidebar: () => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  removeToast: (id: string) => void;
  addNotification: (n: Notification) => void;
  markNotificationRead: (id: string) => void;
  toggleHighContrast: () => void;
  setFontScale: (scale: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toasts: [],
  notifications: [
    {
      id: 'n1',
      type: 'appointment_accepted',
      title: 'Appointment Confirmed',
      message: 'Dr. Sarah Chen accepted your appointment for March 28.',
      read: false,
      createdAt: '2026-03-25T10:00:00Z',
    },
    {
      id: 'n2',
      type: 'report_ready',
      title: 'Report Ready',
      message: 'Your consultation report from March 20 is available.',
      read: false,
      createdAt: '2026-03-24T14:00:00Z',
    },
  ],
  highContrastMode: false,
  fontScale: 1,

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),

  addToast: (type, message) => {
    const id = `toast-${Date.now()}`;
    set(state => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 4000);
  },

  removeToast: (id) =>
    set(state => ({ toasts: state.toasts.filter(t => t.id !== id) })),

  addNotification: (n) =>
    set(state => ({ notifications: [n, ...state.notifications] })),

  markNotificationRead: (id) =>
    set(state => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  toggleHighContrast: () =>
    set(state => ({ highContrastMode: !state.highContrastMode })),

  setFontScale: (scale) => set({ fontScale: scale }),
}));
