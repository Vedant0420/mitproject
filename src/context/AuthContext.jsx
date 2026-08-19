import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const ALLOWED_DOMAIN = 'mitwpu.edu.in';

// Hardcoded accounts — replace with DB calls in production
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
    id: 'usr-fac-001',
    email: 'faculty.test@mitwpu.edu.in',
    password: 'faculty@1234',
    name: 'Test Faculty',
    role: 'faculty',
    department: 'Computer Science',
  },
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('vyas_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (email, password) => {
    const trimmed = email.trim().toLowerCase();
    const domain = trimmed.split('@')[1];

    if (domain !== ALLOWED_DOMAIN) {
      return { success: false, error: `Only @${ALLOWED_DOMAIN} email addresses are permitted.` };
    }

    const user = USERS.find(
      u => u.email.toLowerCase() === trimmed && u.password === password
    );

    if (!user) {
      return { success: false, error: 'Invalid email or password. Please try again.' };
    }

    const { password: _pw, ...safeUser } = user;
    setCurrentUser(safeUser);
    localStorage.setItem('vyas_auth_user', JSON.stringify(safeUser));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vyas_auth_user');
  };

  const isAdmin   = currentUser?.role === 'admin';
  const isFaculty = currentUser?.role === 'faculty';

  return (
    <AuthContext.Provider value={{ currentUser, isAdmin, isFaculty, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
