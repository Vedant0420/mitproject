import { useApp } from '../context/AppContext.jsx';
import { useNavigate } from 'react-router-dom';
import {
  Building2, DoorOpen, FlaskConical, CalendarCheck,
  Users, TrendingUp, ArrowRight, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { FLOOR_LABELS, FLOORS } from '../utils/constants.js';
import { formatTimeRange } from '../utils/helpers.js';
import './Dashboard.css';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="card stat-card card-lift" style={{ '--accent': color }}>
      <div className="stat-icon" style={{ background: bg }}>
        <Icon size={22} color={color} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { rooms, faculty, subjects, allotments } = useApp();
  const navigate = useNavigate();

  const classrooms  = rooms.filter(r => r.type === 'classroom');
  const labs        = rooms.filter(r => r.type === 'lab');
  const available   = rooms.filter(r => r.status === 'available');
  const occupied    = rooms.filter(r => r.status === 'occupied');

  const floorData = FLOORS.map(f => {
    const floorRooms = rooms.filter(r => r.floor === f);
    const floorAllot = allotments.filter(a =>
      floorRooms.some(r => r.id === a.roomId)
    );
    return { floor: f, rooms: floorRooms.length, allotments: floorAllot.length };
  });

  const recentAllotments = [...allotments]
    .slice(-5)
    .reverse();

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="page-header">
        <h1>🏛️ Vyas Building</h1>
        <p>Classroom Allotment Management System — 8 Floors Overview</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon={DoorOpen}      label="Total Rooms"   value={rooms.length}    color="var(--blue-primary)" bg="rgba(79,140,255,0.12)" />
        <StatCard icon={FlaskConical}  label="Labs"          value={labs.length}     color="var(--teal)"         bg="rgba(0,212,170,0.12)" />
        <StatCard icon={CheckCircle}   label="Available"     value={available.length}color="var(--teal)"         bg="rgba(0,212,170,0.12)" />
        <StatCard icon={AlertCircle}   label="Occupied"      value={occupied.length} color="var(--rose)"         bg="rgba(255,107,107,0.12)" />
        <StatCard icon={CalendarCheck} label="Allotments"    value={allotments.length} color="var(--amber)"     bg="rgba(255,179,71,0.12)" />
        <StatCard icon={Users}         label="Faculty"       value={faculty.length}  color="var(--purple)"       bg="rgba(180,122,255,0.12)" />
      </div>

      <div className="dashboard-grid">
        {/* Floor Utilization */}
        <div className="card dashboard-card">
          <div className="dashboard-card-header">
            <h3><Building2 size={18} /> Floor Overview</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/floors/1')}
            >
              View Maps <ArrowRight size={14} />
            </button>
          </div>
          <div className="floor-utilization">
            {floorData.map(({ floor, rooms: rc, allotments: ac }) => {
              const pct = rc > 0 ? Math.round((ac / (rc * 5)) * 100) : 0;
              return (
                <div
                  key={floor}
                  className="floor-row"
                  onClick={() => navigate(`/floors/${floor}`)}
                >
                  <div className="floor-row-label">
                    <span className="floor-num">{floor}</span>
                    <span className="floor-name">{FLOOR_LABELS[floor]}</span>
                  </div>
                  <div className="floor-bar-wrap">
                    <div
                      className="floor-bar"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="floor-row-meta">
                    <span>{rc} rooms</span>
                    <span>{ac} slots</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Allotments */}
        <div className="card dashboard-card">
          <div className="dashboard-card-header">
            <h3><Clock size={18} /> Recent Allotments</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/allotments')}
            >
              View All <ArrowRight size={14} />
            </button>
          </div>
          {recentAllotments.length === 0 ? (
            <div className="empty-state">
              <CalendarCheck size={40} />
              <p>No allotments yet</p>
            </div>
          ) : (
            <div className="recent-list">
              {recentAllotments.map(a => {
                const room    = rooms.find(r => r.id === a.roomId);
                const subject = subjects.find(s => s.id === a.subjectId);
                const fac     = faculty.find(f => f.id === a.facultyId);
                return (
                  <div key={a.id} className="recent-item">
                    <div className="recent-dot" style={{ background: 'var(--blue-primary)' }} />
                    <div className="recent-info">
                      <div className="recent-title">
                        {room?.name || 'Unknown Room'}
                        <span className="badge badge-classroom" style={{ marginLeft: 8, fontSize: '0.7rem' }}>
                          {a.day}
                        </span>
                      </div>
                      <div className="recent-meta">
                        {subject?.name || '—'} · {fac?.name || '—'} · {formatTimeRange(a.startTime, a.endTime)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Room Type Breakdown */}
        <div className="card dashboard-card">
          <div className="dashboard-card-header">
            <h3><TrendingUp size={18} /> Room Breakdown</h3>
          </div>
          <div className="breakdown-list">
            {[
              { label: 'Classrooms',    count: classrooms.length,                      color: 'var(--blue-primary)' },
              { label: 'Labs',          count: labs.length,                            color: 'var(--teal)' },
              { label: 'Seminar Halls', count: rooms.filter(r=>r.type==='seminar_hall').length, color: 'var(--amber)' },
              { label: 'Faculty Cabins',count: rooms.filter(r=>r.type==='faculty_cabin').length,color: 'var(--purple)' },
            ].map(({ label, count, color }) => (
              <div key={label} className="breakdown-item">
                <div className="breakdown-dot" style={{ background: color }} />
                <span className="breakdown-label">{label}</span>
                <span className="breakdown-count font-mono">{count}</span>
                <div className="breakdown-bar-wrap">
                  <div
                    className="breakdown-bar"
                    style={{
                      width: rooms.length ? `${(count/rooms.length)*100}%` : '0%',
                      background: color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card dashboard-card">
          <div className="dashboard-card-header">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="quick-actions">
            {[
              { label: 'Add Room',        icon: DoorOpen,      path: '/rooms',       color: 'var(--blue-primary)' },
              { label: 'New Allotment',   icon: CalendarCheck, path: '/allotments',  color: 'var(--teal)' },
              { label: 'View Timetable',  icon: Clock,         path: '/timetable',   color: 'var(--amber)' },
              { label: 'Manage Faculty',  icon: Users,         path: '/manage',      color: 'var(--purple)' },
            ].map(({ label, icon: Icon, path, color }) => (
              <button
                key={label}
                className="quick-action-btn"
                onClick={() => navigate(path)}
                style={{ '--qa-color': color }}
              >
                <div className="qa-icon">
                  <Icon size={20} color={color} />
                </div>
                <span>{label}</span>
                <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
