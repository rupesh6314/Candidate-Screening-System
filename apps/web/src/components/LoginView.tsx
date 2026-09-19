import React, { useState } from 'react';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api, Student } from '../api';

interface LoginViewProps {
  onLoginSuccess: (user: any, student?: Student, token?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [roleTab, setRoleTab] = useState<'COORDINATOR' | 'STUDENT'>('COORDINATOR');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (role: 'COORDINATOR' | 'STUDENT') => {
    setRoleTab(role);
    setError('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitCredentials(email, password, roleTab);
  };

  const handleSubmitCredentials = async (
    loginEmail: string,
    loginPass: string,
    _role: 'COORDINATOR' | 'STUDENT'
  ) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', {
        email: loginEmail.trim(),
        password: loginPass,
      });

      onLoginSuccess(res.data.user, res.data.student, res.data.token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card-wrapper">
        {/* Left / Top Brand Hero */}
        <div className="login-hero-header">
          <div className="login-brand-icon">
            <GraduationCap size={32} />
          </div>
          <h1 className="login-app-title">Campus Placement & Screening Portal</h1>
          <p className="login-app-subtitle">
            Deterministic 10-Point Evaluation Engine & Company Recruitment Hub
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="login-role-tabs">
          <button
            type="button"
            className={`login-role-tab ${roleTab === 'COORDINATOR' ? 'active' : ''}`}
            onClick={() => handleTabChange('COORDINATOR')}
          >
            <ShieldCheck size={16} />
            <span>Placement Coordinator Login</span>
          </button>
          <button
            type="button"
            className={`login-role-tab ${roleTab === 'STUDENT' ? 'active student' : ''}`}
            onClick={() => handleTabChange('STUDENT')}
          >
            <GraduationCap size={16} />
            <span>Student Candidate Login</span>
          </button>
        </div>

        <div className="login-card-body">
          {error && <div className="alert-box error mb-4">{error}</div>}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group mb-3">
              <label className="form-label">
                {roleTab === 'COORDINATOR' ? 'Coordinator Email Address' : 'Student Registered Email'}
              </label>
              <input
                type="text"
                className="filter-input"
                placeholder={
                  roleTab === 'COORDINATOR' ? 'admin@placement.edu' : 'e.g. aarav.g@gmail.com'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="filter-input"
                  style={{ paddingRight: '42px' }}
                  placeholder="Enter your password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                {roleTab === 'STUDENT'
                  ? 'Use the temporary password received in your email (or your updated password).'
                  : 'Enter coordinator administrative credentials.'}
              </span>
            </div>

            <button type="submit" className="btn btn-primary btn-full-width login-submit-btn" disabled={loading}>
              <Lock size={16} />
              <span>
                {loading
                  ? 'Signing In...'
                  : roleTab === 'COORDINATOR'
                  ? 'Access Coordinator Dashboard'
                  : 'Access My Student Placement Portal'}
              </span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <div className="login-card-footer">
          <span>Protected Campus Placement System • Placement Season 2026</span>
        </div>
      </div>
    </div>
  );
};
