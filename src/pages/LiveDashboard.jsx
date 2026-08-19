import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { Clock, Activity, CheckCircle, AlertCircle, Users, Calendar } from 'lucide-react';
import './LiveDashboard.css';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export default function LiveDashboard() {
  const { rooms, allotments, subjects, faculty, updateAllotment } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const currentDay     = DAYS[currentTime.getDay()];
  const currentDateStr = currentTime.toLocaleDateString('en-CA');
  const currentMins    = currentTime.getHours() * 60 + currentTime.getMinutes();

  const handleCancel = async (allotment) => {
    if (!confirm('Cancel this class for today?')) return;
    const canceledDates = allotment.canceledDates || [];
    if (!canceledDates.includes(currentDateStr)) {
      await updateAllotment(allotment.id, {
        canceledDates: [...canceledDates, currentDateStr],
      });
    }
  };

  const todayAllotments = allotments.filter(a => {
    if (a.day !== currentDay) return false;
    if ((a.canceledDates || []).includes(currentDateStr)) return false;
    return true;
  });

  const active = todayAllotments.filter(a => {
    const start = getMinutes(a.startTime);
    const end   = getMinutes(a.endTime);
    return currentMins >= start && currentMins < end;
  });

  const upcoming = todayAllotments.filter(a => {
    const start = getMinutes(a.startTime);
    return currentMins < start;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  const available = rooms.filter(r => r.status === 'available');
  const occupied  = rooms.filter(r => r.status === 'occupied');

  const timeStr = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="ld-header">
        <div className="page-header-row">
          <div className="page-header" style={{ marginBottom: 0 }}>
            <h1>Live Status</h1>
            <p>Real-time room occupancy across Vyas Building</p>
          </div>
        </div>
        <div className="ld-clock">
          <span className="ld-pulse" />
          <Clock size={13} />
          {currentDay}, {currentTime.toLocaleDateString()} — {timeStr}
        </div>
      </div>

      {/* Stats */}
      <div className="ld-stats">
        {[
          { icon: CheckCircle, label: 'Available', value: available.length, color: 'var(--teal)',         bg: 'rgba(0,212,170,0.10)' },
          { icon: AlertCircle, label: 'Occupied',  value: occupied.length,  color: 'var(--rose)',         bg: 'rgba(255,107,107,0.10)' },
          { icon: Activity,    label: 'Active Now', value: active.length,    color: 'var(--blue-primary)', bg: 'rgba(79,140,255,0.10)' },
          { icon: Calendar,    label: "Today's Classes", value: todayAllotments.length, color: 'var(--amber)', bg: 'rgba(255,179,71,0.10)' },
          { icon: Users,       label: 'Total Rooms', value: rooms.length,   color: 'var(--purple)',       bg: 'rgba(180,122,255,0.10)' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="card ld-stat card-lift" style={{ '--acc': color }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} color={color} />
            </div>
            <div className="ld-stat-val" style={{ color }}>{value}</div>
            <div className="ld-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Cards grid */}
      <div className="ld-grid">
        {/* Active Classes */}
        <div className="card ld-card">
          <div className="ld-card-header">
            <div className="ld-card-title">
              <span className="ld-pulse" />
              Active Classes
            </div>
            <span className="badge badge-available">{active.length} live</span>
          </div>
          {active.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <Activity size={36} />
              <p style={{ marginTop: 8 }}>No active classes right now</p>
            </div>
          ) : (
            active.map(a => {
              const room    = rooms.find(r => r.id === a.roomId);
              const subject = subjects.find(s => s.id === a.subjectId);
              const fac     = faculty.find(f => f.id === a.facultyId);
              return (
                <div key={a.id} className="ld-item">
                  <div className="ld-item-dot" style={{ background: 'var(--teal)' }} />
                  <div className="ld-item-info">
                    <div className="ld-item-title">{room?.name} — {subject?.name}</div>
                    <div className="ld-item-meta">{fac?.name} · {a.startTime} – {a.endTime}</div>
                  </div>
                  <button className="ld-cancel-btn" onClick={() => handleCancel(a)}>
                    Cancel
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Upcoming Classes */}
        <div className="card ld-card">
          <div className="ld-card-header">
            <div className="ld-card-title">
              <Clock size={15} />
              Upcoming Today
            </div>
            <span className="badge badge-classroom">{upcoming.length} scheduled</span>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <Clock size={36} />
              <p style={{ marginTop: 8 }}>No more classes scheduled today</p>
            </div>
          ) : (
            upcoming.slice(0, 8).map(a => {
              const room    = rooms.find(r => r.id === a.roomId);
              const subject = subjects.find(s => s.id === a.subjectId);
              const fac     = faculty.find(f => f.id === a.facultyId);
              return (
                <div key={a.id} className="ld-item">
                  <div className="ld-item-dot" style={{ background: 'var(--blue-primary)' }} />
                  <div className="ld-item-info">
                    <div className="ld-item-title">{room?.name} — {subject?.name}</div>
                    <div className="ld-item-meta">{fac?.name} · {a.startTime} – {a.endTime}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
