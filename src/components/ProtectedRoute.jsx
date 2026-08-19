  import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ShieldX } from 'lucide-react';

/**
 * ProtectedRoute
 * - If not logged in → redirect to /login
 * - If adminOnly and user is faculty → show 403 page
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
      }}>
        <ShieldX size={56} color="var(--rose)" strokeWidth={1.5} />
        <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-primary)' }}>
          Access Denied
        </h2>
        <p style={{ margin: 0, maxWidth: '340px' }}>
          This area is restricted to administrators only. Please contact your admin if you believe this is a mistake.
        </p>
      </div>
    );
  }

  return children;
}
