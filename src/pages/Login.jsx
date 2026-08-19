import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle, LogIn, Info } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    // Small artificial delay for UX
    await new Promise(r => setTimeout(r, 400));
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <Building2 size={24} color="#fff" />
          </div>
          <div className="login-brand-text">
            <div className="login-brand-title">Vyas Building</div>
            <div className="login-brand-sub">MIT-WPU · Allotment System</div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="login-heading">Sign In</h1>
        <p className="login-subtext">
          Access the Classroom Allotment Management System with your institutional credentials.
        </p>

        {/* Error */}
        {error && (
          <div className="login-error" style={{ marginBottom: '20px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="login-input-group">
            <label className="login-label" htmlFor="login-email">Institutional Email</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">
                <Mail size={15} />
              </span>
              <input
                id="login-email"
                className="login-input"
                type="email"
                placeholder="yourname@mitwpu.edu.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          {/* Domain note */}
          <div className="login-domain-note">
            <Info size={13} />
            Only @mitwpu.edu.in accounts are authorised to access this system.
          </div>

          {/* Password */}
          <div className="login-input-group">
            <label className="login-label" htmlFor="login-password">Password</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">
                <Lock size={15} />
              </span>
              <input
                id="login-password"
                className="login-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: '42px' }}
              />
              <button
                type="button"
                className="login-input-action"
                onClick={() => setShowPass(s => !s)}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'loginSpin 0.7s linear infinite'
                }} />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={17} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          MIT World Peace University · Vyas Building<br />
          For access issues, contact the system administrator.
        </div>
      </div>

      <style>{`
        @keyframes loginSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
