import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: string, specialization?: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password, role) => {
        try {
          const res = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
          });
          const data = await res.json();
          if (res.ok) {
             set({ user: data.user, token: data.access_token, isAuthenticated: true });
             return true;
          }
          throw new Error(data.detail || 'Login failed');
        } catch(e: any) { 
          console.error("Login Error:", e.message);
          return false; 
        }
      },

      signup: async (name, email, password, role, specialization) => {
        try {
          const res = await fetch('http://localhost:8000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role, specialization })
          });
          const data = await res.json();
          if (res.ok) {
             set({ user: data.user, token: data.access_token, isAuthenticated: true });
             return true;
          }
          // Store the error message in a way the UI can access or throw it
          throw new Error(data.detail || 'Registration failed');
        } catch(e: any) { 
          console.error("Signup Error:", e.message);
          return false; 
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);
