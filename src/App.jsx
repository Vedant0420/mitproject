import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FloorMap from './pages/FloorMap.jsx';
import RoomManagement from './pages/RoomManagement.jsx';
import Allotments from './pages/Allotments.jsx';
import Timetable from './pages/Timetable.jsx';
import FacultySubjects from './pages/FacultySubjects.jsx';

function AppInner() {
  const { loadAll } = useApp();
  useEffect(() => { loadAll(); }, [loadAll]);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content fade-in">
        <Routes>
          <Route path="/"           element={<Dashboard />} />
          <Route path="/floors/:floor" element={<FloorMap />} />
          <Route path="/floors"     element={<Navigate to="/floors/1" replace />} />
          <Route path="/rooms"      element={<RoomManagement />} />
          <Route path="/allotments" element={<Allotments />} />
          <Route path="/timetable"  element={<Timetable />} />
          <Route path="/manage"     element={<FacultySubjects />} />
        </Routes>
      </main>
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AppProvider>
  );
}
