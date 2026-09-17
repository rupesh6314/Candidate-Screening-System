import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  CheckCircle2,
  AlertCircle,
  Send,
  Lock,
  Server,
  Sparkles,
  Info,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { api } from '../api';

interface EmailConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailConfigModal: React.FC<EmailConfigModalProps> = ({ isOpen, onClose }) => {
  const [provider, setProvider] = useState<'GMAIL' | 'CUSTOM' | 'OUTLOOK'>('GMAIL');
  const [host, setHost] = useState('smtp.gmail.com');
  const [port, setPort] = useState(465);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [fromName, setFromName] = useState('Campus Placement Cell');
  const [fromEmail, setFromEmail] = useState('');

  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ configured: boolean; user?: string; host?: string; mode: string } | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/api/email/status');
      setStatus(res.data);
      if (res.data.configured && res.data.user) {
        setFromEmail(res.data.user);
      }
    } catch (_) {}
  };

  const handleProviderChange = (newProvider: 'GMAIL' | 'CUSTOM' | 'OUTLOOK') => {
    setProvider(newProvider);
    if (newProvider === 'GMAIL') {
      setHost('smtp.gmail.com');
      setPort(465);
    } else if (newProvider === 'OUTLOOK') {
      setHost('smtp.office365.com');
      setPort(587);
    } else {
      setHost('');
      setPort(587);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.trim()) {
      setMessage({ text: 'Please enter your SMTP Username / Sender Email address.', type: 'error' });
      return;
    }
    if (!pass.trim()) {
      setMessage({ text: 'Please enter your SMTP / Google App Password (16-character code).', type: 'error' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        host: host || (provider === 'GMAIL' ? 'smtp.gmail.com' : 'smtp.office365.com'),
        port: Number(port) || (provider === 'GMAIL' ? 465 : 587),
        user: user.trim(),
        pass: pass.trim(),
        fromName: fromName.trim() || 'Campus Placement Cell',
        fromEmail: (fromEmail || user).trim(),
      };
      const res = await api.post('/api/email/config', payload);
      setMessage({ text: res.data.message || 'SMTP Configuration saved successfully!', type: 'success' });
      fetchStatus();
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Failed to save SMTP configuration', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim() || !testEmail.includes('@')) {
      setMessage({ text: 'Please enter a valid recipient email address (e.g. name@domain.com) to test.', type: 'error' });
      return;
    }
    if (!status?.configured && (!user.trim() || !pass.trim())) {
      setMessage({ text: 'Please enter your email and password above and click "Save SMTP Credentials" before sending a test.', type: 'error' });
      return;
    }
    setTesting(true);
    setMessage(null);
    try {
      const res = await api.post('/api/email/test', { to: testEmail.trim() });
      setMessage({ text: res.data.message || 'Test email dispatched successfully! Check recipient inbox.', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'SMTP Test failed. Please verify credentials.', type: 'error' });
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Mail size={22} />
            </div>
            <div>
              <h2 className="modal-title">Email Dispatch & SMTP Configuration</h2>
              <p className="modal-subtitle">
                Configure SMTP credentials to automatically send candidate credentials and placement alerts directly to student inboxes.
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {message && (
            <div className={`alert-box ${message.type === 'success' ? 'success' : 'error'} mb-4`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Current Status Badge */}
          <div className="email-status-card mb-4" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: status?.configured ? '#10b981' : '#f59e0b' }} />
                <strong>Email Service Status:</strong>
                <span style={{ color: status?.configured ? '#059669' : '#d97706', fontWeight: 600 }}>
                  {status?.configured ? 'Live SMTP Dispatched Active (Real Inboxes)' : 'In-App Notification Mode (Configure SMTP for real emails)'}
                </span>
              </div>
              {status?.configured && (
                <span className="badge-tag" style={{ background: '#ecfdf5', color: '#047857', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600 }}>
                  Verified Host: {status.host}
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-section-title">
              <Server size={16} /> SMTP Provider & Credentials
            </div>

            {/* Provider Selection */}
            <div className="form-group mb-3">
              <label className="form-label">Email Provider</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  className={`btn ${provider === 'GMAIL' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleProviderChange('GMAIL')}
                >
                  Gmail (App Password)
                </button>
                <button
                  type="button"
                  className={`btn ${provider === 'OUTLOOK' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleProviderChange('OUTLOOK')}
                >
                  Outlook / Office 365
                </button>
                <button
                  type="button"
                  className={`btn ${provider === 'CUSTOM' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => handleProviderChange('CUSTOM')}
                >
                  Custom SMTP Server
                </button>
              </div>
            </div>

            {/* Gmail Helper Callout */}
            {provider === 'GMAIL' && (
              <div className="alert-box info mb-3" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '12px 16px', borderRadius: '8px', fontSize: '13px' }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>How to connect Gmail in 2 minutes:</strong>
                  <ol style={{ margin: '6px 0 0 18px', padding: 0, lineHeight: 1.5 }}>
                    <li>Go to your <strong>Google Account → Security</strong>.</li>
                    <li>Ensure <strong>2-Step Verification</strong> is ON.</li>
                    <li>Search for <strong>"App Passwords"</strong> (or go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>myaccount.google.com/apppasswords</a>).</li>
                    <li>Create an app named <em>Placement Portal</em> and paste the 16-character password below.</li>
                  </ol>
                </div>
              </div>
            )}

            <div className="form-grid-2col mb-3">
              <div className="form-group">
                <label className="form-label">SMTP Username / Sender Email *</label>
                <input
                  type="email"
                  className="filter-input"
                  placeholder="e.g. placements.college@gmail.com"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">SMTP / Google App Password *</label>
                <input
                  type="password"
                  className="filter-input"
                  placeholder="16-character App Password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  required
                />
              </div>
            </div>

            {provider === 'CUSTOM' && (
              <div className="form-grid-2col mb-3">
                <div className="form-group">
                  <label className="form-label">SMTP Host Server</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="e.g. smtp.sendgrid.net or smtp.mailgun.org"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">SMTP Port</label>
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="587 or 465"
                    value={port}
                    onChange={(e) => setPort(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-grid-2col mb-4">
              <div className="form-group">
                <label className="form-label">Display Sender Name</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g. Campus Placement Cell"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sender Email Address</label>
                <input
                  type="email"
                  className="filter-input"
                  placeholder="e.g. placements@campus.edu"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <ShieldCheck size={16} />
                <span>{saving ? 'Saving...' : 'Save SMTP Credentials'}</span>
              </button>
            </div>
          </form>

          {/* Test Email Section */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
            <div className="form-section-title">
              <Send size={16} /> Send Test Email to Verify Real Inbox Delivery
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '10px' }}>
              Send an actual test email right now to verify that your credentials can connect to SMTP and deliver to student inboxes.
            </p>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="email"
                className="filter-input"
                placeholder="Enter any recipient email to test (e.g. your personal Gmail)"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleTestEmail}
                disabled={testing}
                style={{ whiteSpace: 'nowrap' }}
              >
                <Send size={15} />
                <span>{testing ? 'Sending Test...' : 'Send Live Test Email'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
