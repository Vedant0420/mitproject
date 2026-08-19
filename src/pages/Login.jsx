import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="card shadow-lg border-0 rounded-4" style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-card)' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3" style={{ width: '64px', height: '64px', background: 'var(--mitwpu-blue, #0b4d8c)', color: 'white' }}>
              <i className="bi bi-building fs-2"></i>
            </div>
            <h3 className="fw-bold text-primary">Vyas Allocations</h3>
            <p className="text-muted small">Sign in to manage building schedules</p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 small border-0" role="alert">
              <i className="bi bi-exclamation-circle me-2"></i>{error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Email Address</label>
              <input 
                type="email" 
                className="form-control form-control-lg rounded-3" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vedant.khedkar@mitwpu.edu.in"
                required
                style={{ fontSize: '0.95rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">Password</label>
              <input 
                type="password" 
                className="form-control form-control-lg rounded-3" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ fontSize: '0.95rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-3 rounded-3 fw-bold text-uppercase"
              disabled={loading}
              style={{ background: 'var(--mitwpu-blue, #0b4d8c)', border: 'none', letterSpacing: '1px' }}
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Sign In'}
            </button>
          </form>
          
          <div className="text-center mt-4">
            <p className="small text-muted mb-0">Use test credentials for normal user.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
