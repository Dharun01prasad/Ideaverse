import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { RequestAppointment } from './pages/RequestAppointment';
import { Consultation } from './pages/Consultation';
import { Reports } from './pages/Reports';
import { Notifications } from './pages/Notifications';
import { ConsultationsList } from './pages/ConsultationsList';
import { ScheduleList } from './pages/ScheduleList';
import { RequestsList } from './pages/RequestsList';
import { PatientsHistory } from './pages/PatientsHistory';
import { AfterCallFollowUp } from './pages/AfterCallFollowUp';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { useAuthStore } from './store/authStore';
import { ThemeProvider } from './theme';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const DashboardRouter: React.FC = () => {
  const { user } = useAuthStore();
  if (user?.role === 'doctor') return <DoctorDashboard />;
  return <PatientDashboard />;
};

function App() {
  const { user } = useAuthStore();
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard */}
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/appointments" element={<RequestAppointment />} />
            <Route path="/consultations" element={user?.role === 'doctor' ? <Navigate to="/schedule" /> : <ConsultationsList />} />
            <Route path="/schedule" element={<ScheduleList />} />
            <Route path="/requests" element={<RequestsList />} />
            <Route path="/patients" element={<PatientsHistory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Consultation (full screen, outside layout) */}
          <Route path="/consultation/:id" element={
            <ProtectedRoute><Consultation /></ProtectedRoute>
          } />
          <Route path="/consultation/:id/follow-up" element={
            <ProtectedRoute><AfterCallFollowUp /></ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
