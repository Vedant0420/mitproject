import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import Navbar from './components/Sidebar.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FloorMap from './pages/FloorMap.jsx';
import RoomManagement from './pages/RoomManagement.jsx';
import Allotments from './pages/Allotments.jsx';
import Timetable from './pages/Timetable.jsx';
import FacultySubjects from './pages/FacultySubjects.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import LiveDashboard from './pages/LiveDashboard.jsx';

function AppInner() {
  const { loadAll } = useApp();
  const { currentUser } = useAuth();

  useEffect(() => { loadAll(); }, [loadAll]);

  return (
    <div className="app-layout">
      {/* Navbar only when logged in */}
      {currentUser && <Navbar />}

      <main className="main-content fade-in">
        <Routes>
          {/* Public */}
          <Route path="/login" element={
            currentUser ? <Navigate to="/" replace /> : <Login />
          } />

          {/* Protected — all roles */}
          <Route path="/" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/floors/:floor" element={
            <ProtectedRoute><FloorMap /></ProtectedRoute>
          } />
          <Route path="/floors" element={<Navigate to="/floors/1" replace />} />
          <Route path="/rooms" element={
            <ProtectedRoute><RoomManagement /></ProtectedRoute>
          } />
          <Route path="/allotments" element={
            <ProtectedRoute><Allotments /></ProtectedRoute>
          } />
          <Route path="/timetable" element={
            <ProtectedRoute><Timetable /></ProtectedRoute>
          } />

          {/* Admin-only */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>
          } />
          <Route path="/live" element={
            <ProtectedRoute adminOnly><LiveDashboard /></ProtectedRoute>
          } />
          <Route path="/manage" element={
            <ProtectedRoute adminOnly><FacultySubjects /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <BrowserRouter>
            <AppInner />
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
