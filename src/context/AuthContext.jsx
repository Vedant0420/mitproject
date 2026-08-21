import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient.js';

const AuthContext = createContext(null);

// ── Config ─────────────────────────────────────────────────────────────
export const ALLOWED_DOMAIN = 'mitwpu.edu.in';

// Only these emails get full Admin access
// eslint-disable-next-line react-refresh/only-export-components
export const ADMIN_EMAILS = [
  'vedant.khedkar@mitwpu.edu.in',
  'admin.test@mitwpu.edu.in'
];

// Roles:
//   'admin'  — full access (admin panel, live, faculty management, etc.)
//   'viewer' — read-only (timetable, floor maps, free rooms view)

// ── Helpers ────────────────────────────────────────────────────────────
function resolveRole(email) {
  if (!email) return 'viewer';
  const lower = email.trim().toLowerCase();
  if (ADMIN_EMAILS.includes(lower)) return 'admin';
  return 'viewer';
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          role: resolveRole(session.user.email),
          name: session.user.user_metadata?.name || 'User',
        });
      }
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          email: session.user.email,
          role: resolveRole(session.user.email),
          name: session.user.user_metadata?.name || 'User',
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Login ────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const trimmed = email.trim().toLowerCase();
    const domain  = trimmed.split('@')[1];

    if (domain !== ALLOWED_DOMAIN) {
      return {
        success: false,
        error: `Access restricted. Only @${ALLOWED_DOMAIN} institutional email addresses are permitted.`,
      };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: trimmed,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  // ── Register ─────────────────────────────────────────────────────
  const register = async (name, email, password) => {
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

    const { error } = await supabase.auth.signUp({
      email: trimmed,
      password,
      options: {
        data: {
          name: name.trim(),
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin  = currentUser?.role === 'admin';
  const isViewer = currentUser?.role === 'viewer';

  return (
    <AuthContext.Provider value={{
      currentUser, isAdmin, isViewer, login, register, logout, ALLOWED_DOMAIN,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
