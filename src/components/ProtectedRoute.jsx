import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldX } from 'lucide-react';

/**
 * ProtectedRoute
 * - Not logged in         → /login
 * - adminOnly + viewer    → Access Denied screen
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, isAdmin } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '55vh',
        gap: '16px',
        textAlign: 'center',
        padding: '40px 24px',
        color: 'var(--text-secondary)',
      }}>
        <div style={{
          width: 72, height: 72,
          borderRadius: '50%',
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ShieldX size={36} color="var(--rose)" strokeWidth={1.5} />
        </div>
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.3rem' }}>
          Access Restricted
        </h2>
        <p style={{ margin: 0, maxWidth: '360px', lineHeight: 1.65, fontSize: '0.88rem' }}>
          This section is restricted to authorised administrators only.
          Please contact your system administrator if you require access.
        </p>
      </div>
    );
  }

  return children;
}
