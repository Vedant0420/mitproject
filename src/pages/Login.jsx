import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  Building2, Mail, Lock, Eye, EyeOff,
  AlertCircle, LogIn, Info, Sun, Moon
} from 'lucide-react';
import './Login.css';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const { login }    = useAuth();
  const { theme, toggle } = useTheme();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your institutional email and password.');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 380));
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="auth-page">
      {/* Top floating bar */}
      <div className="auth-topbar">
        <div className="auth-topbar-brand">
          <div className="auth-topbar-icon">
            <Building2 size={15} color="#fff" />
          </div>
          Vyas Building
        </div>
        <div className="auth-topbar-sep" />
        <Link to="/signup" className="auth-topbar-link">
          <LogIn size={13} />
          Register
        </Link>
        <button className="auth-theme-btn" onClick={toggle} title="Toggle theme">
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* Card */}
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Building2 size={26} color="#fff" />
          </div>
          <div className="auth-logo-title">MIT World Peace University</div>
          <div className="auth-logo-sub">Vyas Building · Allotment System</div>
        </div>

        <h1 className="auth-heading">Welcome Back</h1>
        <p className="auth-subtext">Sign in to your institutional account</p>

        {/* Error */}
        {error && (
          <div className="auth-error" style={{ marginBottom: 16 }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Email Address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><Mail size={15} /></span>
              <input
                id="login-email"
                className="auth-input"
                type="email"
                placeholder="yourname@mitwpu.edu.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-pass">Password *</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><Lock size={15} /></span>
              <input
                id="login-pass"
                className="auth-input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                className="auth-input-toggle"
                onClick={() => setShowPass(s => !s)}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Domain note */}
          <div className="auth-domain-note">
            <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            Only @mitwpu.edu.in institutional email addresses are permitted.
          </div>

          {/* Submit */}
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading
              ? <><span className="auth-spinner" />Signing in...</>
              : <>Login</>
            }
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
