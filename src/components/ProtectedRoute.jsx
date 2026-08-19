import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldX } from 'lucide-react';

/**
 * ProtectedRoute
 * - Not logged in  → redirect to /login
 * - adminOnly + faculty → Access Denied screen
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
        minHeight: '60vh',
        gap: '16px',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        padding: '40px',
      }}>
        <ShieldX size={56} color="var(--rose)" strokeWidth={1.5} />
        <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>Access Restricted</h2>
        <p style={{ margin: 0, maxWidth: '340px', lineHeight: 1.6 }}>
          This section is restricted to administrators only. Please contact your system administrator if you require access.
        </p>
      </div>
    );
  }

  return children;
}
