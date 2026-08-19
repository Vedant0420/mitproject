import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Map, DoorOpen, CalendarCheck,
  Clock, Users, Building2, ChevronDown,
  Sun, Moon, LogOut, ShieldCheck, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { FLOORS, FLOOR_LABELS } from '../utils/constants.js';
import './Sidebar.css';

export default function Navbar() {
  const { currentUser, isAdmin, logout } = useAuth();
  const { theme, toggle }                = useTheme();
  const navigate                         = useNavigate();
  const [floorOpen, setFloorOpen]        = useState(false);
  const dropRef                          = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setFloorOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Initials from name
  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      <nav className="navbar">
        {/* Brand */}
        <NavLink to="/" className="nav-brand">
          <div className="nav-brand-icon">
            <Building2 size={18} color="#fff" />
          </div>
          <div>
            <div className="nav-brand-title">Vyas Building</div>
            <div className="nav-brand-sub">MIT-WPU · Allotment System</div>
          </div>
        </NavLink>

        <div className="nav-divider" />

        {/* Navigation Links */}
        <div className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link admin-link${isActive ? ' active' : ''}`}
            >
              <ShieldCheck size={15} />
              <span>Admin Panel</span>
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/live"
              className={({ isActive }) => `nav-link admin-link${isActive ? ' active' : ''}`}
            >
              <Activity size={15} />
              <span>Live Status</span>
            </NavLink>
          )}

          <NavLink
            to="/rooms"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <DoorOpen size={15} />
            <span>Rooms</span>
          </NavLink>

          <NavLink
            to="/allotments"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <CalendarCheck size={15} />
            <span>Allotments</span>
          </NavLink>

          <NavLink
            to="/timetable"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Clock size={15} />
            <span>Timetable</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/manage"
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Users size={15} />
              <span>Faculty</span>
            </NavLink>
          )}

          {/* Floor Dropdown */}
          <div className="nav-dropdown" ref={dropRef}>
            <button
              className={`nav-link${floorOpen ? ' active' : ''}`}
              onClick={() => setFloorOpen(o => !o)}
            >
              <Map size={15} />
              <span>Floors</span>
              <ChevronDown size={13} style={{
                marginLeft: 2,
                transition: 'transform 0.2s',
                transform: floorOpen ? 'rotate(180deg)' : 'rotate(0deg)'
              }} />
            </button>

            {floorOpen && (
              <div className="nav-dropdown-menu">
                {FLOORS.map(f => (
                  <NavLink
                    key={f}
                    to={`/floors/${f}`}
                    className={({ isActive }) =>
                      `nav-dropdown-item${isActive ? ' active' : ''}`
                    }
                    onClick={() => setFloorOpen(false)}
                  >
                    <span className="nav-floor-num">{f}</span>
                    <span>{FLOOR_LABELS[f]}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="nav-right">
          {/* Theme Toggle */}
          <button
            className="nav-icon-btn"
            onClick={toggle}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark'
              ? <Sun size={16} />
              : <Moon size={16} />
            }
          </button>

          {/* User Pill */}
          <div className="nav-user">
            <div className="nav-avatar">{initials}</div>
            <div className="nav-user-info">
              <span className="nav-user-name">{currentUser?.name}</span>
              <span className={`nav-role-badge nav-role-${currentUser?.role}`}>
                {currentUser?.role}
              </span>
            </div>

            {/* Logout */}
            <button
              className="nav-logout"
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer so content doesn't hide under fixed navbar */}
      <div className="navbar-spacer" />
    </>
  );
}
