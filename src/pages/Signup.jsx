import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth(); // Assuming login for now, as there isn't a register in AuthContext
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Mock signup, usually you'd call a register function
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
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 100px)', backgroundColor: 'transparent' }}>
      <div className="card border-0 shadow-sm" style={{ width: '100%', maxWidth: '420px', backgroundColor: '#FFFFFF', borderRadius: '8px' }}>
        <div className="card-body p-4 p-md-5">
          
          {/* Logo Section */}
          <div className="text-center mb-4 pb-2 border-bottom">
            <h4 className="fw-bold mb-1" style={{ color: '#0b4d8c', letterSpacing: '-0.5px' }}>MIT WORLD PEACE</h4>
            <h6 className="fw-bold" style={{ color: '#0b4d8c', letterSpacing: '1px' }}>UNIVERSITY</h6>
            <div className="small text-muted" style={{ fontSize: '0.65rem' }}>PUNE, INDIA</div>
          </div>

          {/* Heading */}
          <div className="mb-4">
            <h4 className="fw-bold mb-1" style={{ color: '#111827' }}>Create Account</h4>
            <p className="small mb-0" style={{ color: '#6B7280' }}>Sign up for a new account</p>
          </div>

          {/* Actual Error Alert */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show py-2 px-3 small border-0" style={{ borderRadius: '6px' }} role="alert">
              {error}
              <button type="button" className="btn-close" style={{ padding: '0.75rem', fontSize: '0.7rem' }} onClick={() => setError('')} aria-label="Close"></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <div className="mb-3">
              <label className="form-label fw-medium mb-1" style={{ fontSize: '0.85rem', color: '#374151' }}>Full Name</label>
              <input 
                type="text" 
                className="form-control px-3 py-2" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                style={{ fontSize: '0.9rem', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', color: '#111827' }}
              />
            </div>
            
            {/* Email Field */}
            <div className="mb-3">
              <label className="form-label fw-medium mb-1" style={{ fontSize: '0.85rem', color: '#374151' }}>Email Address</label>
              <input 
                type="email" 
                className="form-control px-3 py-2" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@mitwpu.edu.in"
                required
                style={{ fontSize: '0.9rem', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', color: '#111827' }}
              />
            </div>
            
            {/* Password Field */}
            <div className="mb-4">
              <label className="form-label fw-medium mb-1" style={{ fontSize: '0.85rem', color: '#374151' }}>Password*</label>
              <div className="position-relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-control px-3 py-2 pe-5" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ fontSize: '0.9rem', borderRadius: '6px', border: '1px solid #D1D5DB', backgroundColor: '#FFFFFF', color: '#111827' }}
                />
                <button 
                  type="button"
                  className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted text-decoration-none"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ padding: '0.5rem', zIndex: 10 }}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} style={{ fontSize: '1rem' }}></i>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn w-100 py-2 fw-medium text-white mb-4"
              disabled={loading}
              style={{ background: '#0b4d8c', border: 'none', borderRadius: '6px', fontSize: '0.95rem' }}
            >
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Sign Up'}
            </button>
          </form>
          
          {/* Footer Links */}
          <div className="d-flex flex-column gap-2">
            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              Already have an account? <Link to="/login" className="text-decoration-none fw-medium" style={{ color: '#0b4d8c' }}>Login</Link>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
              Are you a Faculty Member? <a href="#" className="text-decoration-none fw-medium" style={{ color: '#0b4d8c' }}>Click here</a>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
