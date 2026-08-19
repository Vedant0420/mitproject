import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  Building2, Mail, Lock, Eye, EyeOff, User,
  AlertCircle, UserPlus, Info, Sun, Moon, CheckCircle
} from 'lucide-react';
import './Login.css'; // shared auth styles

export default function Signup() {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  const { register }     = useAuth();
  const { theme, toggle } = useTheme();
  const navigate          = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim())     return setError('Please enter your full name.');
    if (!email.trim())    return setError('Please enter your institutional email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const result = register(name, email, password);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 1200);
    } else {
      setError(result.error);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center', padding: '48px 40px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(0,212,170,0.1)',
            border: '1px solid rgba(0,212,170,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <CheckCircle size={32} color="var(--teal)" />
          </div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Account Created</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Redirecting you to the dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* Top bar */}
      <div className="auth-topbar">
        <div className="auth-topbar-brand">
          <div className="auth-topbar-icon">
            <Building2 size={15} color="#fff" />
          </div>
          Vyas Building
        </div>
        <div className="auth-topbar-sep" />
        <Link to="/login" className="auth-topbar-link">
          <UserPlus size={13} />
          Login
        </Link>
        <button className="auth-theme-btn" onClick={toggle}>
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

        <h1 className="auth-heading">Create Account</h1>
        <p className="auth-subtext">Register with your institutional email</p>

        {error && (
          <div className="auth-error" style={{ marginBottom: 16 }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-name">Full Name</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><User size={15} /></span>
              <input
                id="reg-name"
                className="auth-input"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">Institutional Email</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><Mail size={15} /></span>
              <input
                id="reg-email"
                className="auth-input"
                type="email"
                placeholder="yourname@mitwpu.edu.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Domain note */}
          <div className="auth-domain-note">
            <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              Only <strong>@mitwpu.edu.in</strong> addresses can register.
              Selected admin emails receive full system access.
            </span>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-pass">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><Lock size={15} /></span>
              <input
                id="reg-pass"
                className="auth-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
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

          {/* Confirm */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-confirm">Confirm Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon"><Lock size={15} /></span>
              <input
                id="reg-confirm"
                className="auth-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
            </div>
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading
              ? <><span className="auth-spinner" />Creating account...</>
              : <>Create Account</>
            }
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
