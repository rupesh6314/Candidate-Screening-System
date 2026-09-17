import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  User,
  GraduationCap,
  ShieldCheck,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { api, Student } from '../api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any, student?: Student) => void;
  currentUser: any;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUser,
}) => {
  if (!isOpen) return null;

  const [roleTab, setRoleTab] = useState<'ADMIN' | 'STUDENT'>('ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTabChange = (role: 'ADMIN' | 'STUDENT') => {
    setRoleTab(role);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitCredentials(email, password, roleTab);
  };

  const handleSubmitCredentials = async (
    loginEmail: string,
    loginPass: string,
    _role: 'ADMIN' | 'STUDENT'
  ) => {
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', {
        email: loginEmail.trim(),
        password: loginPass.trim(),
      });

      onLoginSuccess(res.data.user, res.data.student);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <KeyRound size={22} />
            </div>
            <div>
              <h2 className="modal-title">Sign In / Switch Dashboard</h2>
              <p className="modal-subtitle">
                Access your personalized Placement Coordinator or Student dashboard.
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && <div className="alert-box error mb-4">{error}</div>}

          {/* Role Tabs */}
          <div className="auth-role-tabs mb-4">
            <button
              type="button"
              className={`auth-role-btn ${roleTab === 'ADMIN' ? 'active' : ''}`}
              onClick={() => handleTabChange('ADMIN')}
            >
              <ShieldCheck size={16} />
              <span>Placement Coordinator</span>
            </button>
            <button
              type="button"
              className={`auth-role-btn ${roleTab === 'STUDENT' ? 'active student' : ''}`}
              onClick={() => handleTabChange('STUDENT')}
            >
              <GraduationCap size={16} />
              <span>Student Candidate</span>
            </button>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group mb-3">
              <label className="form-label">
                {roleTab === 'ADMIN' ? 'Coordinator Email Address' : 'Student Email Address or ID'}
              </label>
              <input
                type="text"
                className="filter-input"
                placeholder={roleTab === 'ADMIN' ? 'admin@placement.edu' : 'e.g. aarav.g@gmail.com or ID 1'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="filter-input"
                placeholder="Enter your password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full-width" disabled={loading}>
              <Lock size={15} />
              <span>
                {loading
                  ? 'Authenticating...'
                  : roleTab === 'ADMIN'
                  ? 'Login to Coordinator Dashboard'
                  : 'Login to Student Placement Portal'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
