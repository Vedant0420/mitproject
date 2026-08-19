import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// ── Config ─────────────────────────────────────────────────────────────
export const ALLOWED_DOMAIN = 'mitwpu.edu.in';

// Only these emails get full Admin access
export const ADMIN_EMAILS = [
  'vedant.khedkar@mitwpu.edu.in',
  // add more admin emails here as needed
];

// Roles:
//   'admin'  — full access (admin panel, live, faculty management, etc.)
//   'viewer' — read-only (timetable, floor maps, free rooms view)

// Hardcoded accounts — in production replace with a backend
const USERS = [
  {
    id: 'usr-admin-001',
    email: 'vedant.khedkar@mitwpu.edu.in',
    password: 'vedant@9973',
    name: 'Vedant Khedkar',
    role: 'admin',
    department: 'Administration',
  },
  {
    id: 'usr-viewer-001',
    email: 'faculty.test@mitwpu.edu.in',
    password: 'test@1234',
    name: 'Test User',
    role: 'viewer',
    department: 'Computer Science',
  },
];

// ── Helpers ────────────────────────────────────────────────────────────
function resolveRole(email) {
  const lower = email.trim().toLowerCase();
  if (ADMIN_EMAILS.includes(lower)) return 'admin';
  return 'viewer';
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const s = localStorage.getItem('vyas_auth_user');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });

  // ── Login (existing users list) ────────────────────────────────────
  const login = (email, password) => {
    const trimmed = email.trim().toLowerCase();
    const domain  = trimmed.split('@')[1];

    if (domain !== ALLOWED_DOMAIN) {
      return {
        success: false,
        error: `Access restricted. Only @${ALLOWED_DOMAIN} institutional email addresses are permitted.`,
      };
    }

    const user = USERS.find(
      u => u.email.toLowerCase() === trimmed && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid email or password. Please try again.' };
    }

    const { password: _pw, ...safe } = user;
    setCurrentUser(safe);
    localStorage.setItem('vyas_auth_user', JSON.stringify(safe));
    return { success: true };
  };

  // ── Register (any @mitwpu.edu.in — gets viewer role) ──────────────
  const register = (name, email, password) => {
    const trimmed = email.trim().toLowerCase();
    const domain  = trimmed.split('@')[1];

    if (domain !== ALLOWED_DOMAIN) {
      return {
        success: false,
        error: `Registration is restricted to @${ALLOWED_DOMAIN} institutional email addresses.`,
      };
    }

    if (!name.trim()) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    // In production, this would call an API. Here we create a session user.
    const role = resolveRole(trimmed);
    const newUser = {
      id: `usr-${Date.now()}`,
      email: trimmed,
      name: name.trim(),
      role,
      department: '',
    };

    // Persist and auto-login
    setCurrentUser(newUser);
    localStorage.setItem('vyas_auth_user', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vyas_auth_user');
  };

  const isAdmin  = currentUser?.role === 'admin';
  const isViewer = currentUser?.role === 'viewer';

  return (
    <AuthContext.Provider value={{
      currentUser, isAdmin, isViewer, login, register, logout, ALLOWED_DOMAIN,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
