import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Map, DoorOpen, CalendarCheck,
  Clock, Users, ChevronRight, Building2
} from 'lucide-react';
import { FLOORS, FLOOR_LABELS } from '../utils/constants.js';
import { useState } from 'react';
import './Sidebar.css';

const navItems = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/rooms',       icon: DoorOpen,        label: 'Rooms' },
  { to: '/allotments',  icon: CalendarCheck,   label: 'Allotments' },
  { to: '/timetable',   icon: Clock,           label: 'Timetable' },
  { to: '/manage',      icon: Users,           label: 'Faculty & Subjects' },
];

export default function Sidebar() {
  const [floorsOpen, setFloorsOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Building2 size={22} />
        </div>
        <div>
          <div className="sidebar-logo-title">Vyas Building</div>
          <div className="sidebar-logo-sub">Allotment System</div>
        </div>
      </div>

      <div className="sidebar-divider" />

      {/* Main Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-divider" />

      {/* Floor Nav */}
      <div className="sidebar-floors">
        <button
          className="sidebar-section-label sidebar-floors-toggle"
          onClick={() => setFloorsOpen(o => !o)}
        >
          <Map size={14} />
          <span>Floor Maps</span>
          <ChevronRight
            size={14}
            style={{
              marginLeft: 'auto',
              transform: floorsOpen ? 'rotate(90deg)' : 'rotate(0)',
              transition: 'transform 0.2s'
            }}
          />
        </button>
        {floorsOpen && (
          <div className="sidebar-floor-list">
            {FLOORS.map(f => (
              <NavLink
                key={f}
                to={`/floors/${f}`}
                className={({ isActive }) =>
                  `sidebar-floor-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="floor-num">{f}</span>
                <span>{FLOOR_LABELS[f]}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-text">8 Floors · Vyas Building</div>
      </div>
    </aside>
  );
}
