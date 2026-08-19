import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const ALLOWED_DOMAIN = 'mitwpu.edu.in';

const ADMIN_EMAIL = 'vedant.khedkar@mitwpu.edu.in';

// Hardcoded user accounts — swap with DB calls later
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
    password: 'test@1234',
    name: 'Test Faculty',
    role: 'faculty',
    department: 'Computer Science',
  },
];

function sanitize(user) {
  // Return user without password
  const { password, ...safe } = user;
  return safe;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('vyas_auth_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [error, setError] = useState(null);

  const login = (email, password) => {
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();

    // Domain check
    const domain = trimmedEmail.split('@')[1];
    if (domain !== ALLOWED_DOMAIN) {
      setError(`Access denied. Only @${ALLOWED_DOMAIN} email addresses are allowed.`);
      return false;
    }

    // Find user
    const user = USERS.find(
      u => u.email.toLowerCase() === trimmedEmail && u.password === password
    );

    if (!user) {
      setError('Invalid email or password. Please try again.');
      return false;
    }

    const safeUser = sanitize(user);
    setCurrentUser(safeUser);
    localStorage.setItem('vyas_auth_user', JSON.stringify(safeUser));
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vyas_auth_user');
  };

  const isAdmin = currentUser?.role === 'admin';
  const isFaculty = currentUser?.role === 'faculty';

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAdmin,
      isFaculty,
      login,
      logout,
      error,
      setError,
      ADMIN_EMAIL,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
