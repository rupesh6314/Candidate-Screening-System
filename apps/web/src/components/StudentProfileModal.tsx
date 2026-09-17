import React, { useState } from 'react';
import {
  X,
  User,
  GraduationCap,
  Sparkles,
  FileText,
  Phone,
  BookOpen,
  Save,
  CheckCircle,
  ExternalLink,
  Lock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { Student, changeStudentPassword } from '../api';

interface StudentProfileModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Student> & { profileImage?: string; resumeUrl?: string; bio?: string }) => Promise<void>;
  onPasswordChanged?: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  isOpen,
  onClose,
  onSave,
  onPasswordChanged,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'PROFILE' | 'SECURITY'>(
    student.mustChangePassword ? 'SECURITY' : 'PROFILE'
  );

  const [name, setName] = useState(student.name || '');
  const [phone, setPhone] = useState(student.phone || '');
  const [branch, setBranch] = useState(student.branch || 'Computer Science');
  const [cgpa, setCgpa] = useState(String(student.cgpa || 8.0));
  const [skillsStr, setSkillsStr] = useState((student.skills || []).join(', '));
  const [resumeUrl, setResumeUrl] = useState(
    (student as any).resumeUrl || `https://drive.google.com/file/d/sample-resume-${student.externalId || student.id}/view`
  );
  const [profileImage, setProfileImage] = useState(
    (student as any).profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name)}`
  );
  const [bio, setBio] = useState(
    (student as any).bio || `Final year ${student.branch} student passionate about building scalable web solutions.`
  );

  // Security / Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Student name is required.');
      return;
    }
    const parsedCgpa = parseFloat(cgpa);
    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      setError('CGPA must be a valid number between 0.00 and 10.00.');
      return;
    }
    if (!resumeUrl.trim()) {
      setError('A valid resume link (Google Drive, GitHub, or Portfolio) is mandatory.');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const skillsArr = skillsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await onSave({
        name: name.trim(),
        phone: phone.trim(),
        branch,
        cgpa: parsedCgpa,
        skills: skillsArr,
        resumeUrl: resumeUrl.trim(),
        profileImage: profileImage.trim(),
        bio: bio.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword.trim()) {
      setError('Current / Temporary password is required.');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and Confirm password do not match.');
      return;
    }

    setError('');
    setPassSuccess('');
    setChangingPass(true);
    try {
      const res = await changeStudentPassword(student.id, oldPassword, newPassword);
      setPassSuccess(res.message || 'Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onPasswordChanged) onPasswordChanged();
      setTimeout(() => {
        setPassSuccess('');
        setActiveTab('PROFILE');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              {activeTab === 'SECURITY' ? <KeyRound size={22} /> : <User size={22} />}
            </div>
            <div>
              <h2 className="modal-title">My Placement Account</h2>
              <p className="modal-subtitle">
                Manage your verification profile, contact info, and login security credentials.
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="auth-role-tabs px-4 pt-3 pb-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <button
            type="button"
            className={`auth-role-btn ${activeTab === 'PROFILE' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('PROFILE');
              setError('');
            }}
          >
            <User size={15} />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            className={`auth-role-btn ${activeTab === 'SECURITY' ? 'active student' : ''}`}
            onClick={() => {
              setActiveTab('SECURITY');
              setError('');
            }}
          >
            <Lock size={15} />
            <span>Security & Change Password {student.mustChangePassword && '⚠️'}</span>
          </button>
        </div>

        {activeTab === 'PROFILE' ? (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="alert-box error mb-4">{error}</div>}
              {savedSuccess && (
                <div className="alert-box success mb-4">
                  <CheckCircle size={16} /> Profile saved successfully!
                </div>
              )}

              {/* Profile Avatar & Preview Row */}
              <div className="profile-preview-card mb-4">
                <img
                  src={profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'student')}`}
                  alt={name}
                  className="profile-preview-avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=fallback`;
                  }}
                />
                <div className="profile-preview-info">
                  <h3 className="profile-preview-name">{name || 'Your Name'}</h3>
                  <span className="profile-preview-meta">
                    {branch} • {cgpa} CGPA • ID #{student.externalId || student.id}
                  </span>
                  <span className="profile-preview-email">{student.email}</span>
                </div>
              </div>

              {/* Personal & Academic Details */}
              <div className="form-section-title">
                <GraduationCap size={16} /> Personal & Academic Information
              </div>

              <div className="form-grid-2col mb-4">
                <div className="form-group">
                  <label className="form-label">Full Candidate Name *</label>
                  <input
                    type="text"
                    className="filter-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone Number</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Engineering Branch *</label>
                  <select
                    className="filter-select"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                    <option value="Civil">Civil</option>
                    <option value="Chemical">Chemical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Verified CGPA (0.00 - 10.00) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="filter-input"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Technical Skills & Resume */}
              <div className="form-section-title">
                <Sparkles size={16} /> Skills, Credentials & Online Resume
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Technical Skills (comma-separated) *</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g. React, Node.js, Python, AWS, SQL, Data Structures"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  required
                />
                <span className="form-hint">List languages, frameworks, databases, and core skills.</span>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Online Resume Link (Google Drive / GitHub / PDF URL) *</label>
                <div className="input-with-button">
                  <input
                    type="url"
                    className="filter-input"
                    placeholder="https://drive.google.com/file/d/..."
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    required
                  />
                  {resumeUrl && (
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-input-action"
                      title="Test Open Resume Link"
                    >
                      <ExternalLink size={15} />
                    </a>
                  )}
                </div>
                <span className="form-hint">Make sure link permissions are set to "Anyone with link can view".</span>
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Profile Avatar / Photo URL</label>
                <input
                  type="url"
                  className="filter-input"
                  placeholder="https://api.dicebear.com/7.x/avataaars/svg?seed=..."
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brief Professional Bio</label>
                <textarea
                  className="filter-input"
                  rows={2}
                  placeholder="Share your technical interests and career aspirations..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={15} />
                <span>{saving ? 'Saving Profile...' : 'Save & Update Profile'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Security / Change Password Form */
          <form onSubmit={handlePasswordSubmit}>
            <div className="modal-body">
              {error && <div className="alert-box error mb-4">{error}</div>}
              {passSuccess && (
                <div className="alert-box success mb-4">
                  <CheckCircle size={16} /> {passSuccess}
                </div>
              )}

              {student.mustChangePassword && (
                <div className="alert-box warning mb-4">
                  <ShieldAlert size={18} />
                  <div>
                    <strong>Mandatory Security Notice:</strong>
                    <p className="m-0 text-sm">
                      You are logged in with a temporary password sent by the placement coordinator. For your safety and account protection, you must change your password now.
                    </p>
                  </div>
                </div>
              )}

              <div className="form-section-title">
                <KeyRound size={16} /> Update Account Password
              </div>

              <div className="form-group mb-3">
                <label className="form-label">Current / Temporary Password *</label>
                <input
                  type="password"
                  className="filter-input"
                  placeholder="Enter current or temporary password..."
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label className="form-label">New Secure Password (min. 6 characters) *</label>
                <input
                  type="password"
                  className="filter-input"
                  placeholder="Enter new password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group mb-4">
                <label className="form-label">Confirm New Password *</label>
                <input
                  type="password"
                  className="filter-input"
                  placeholder="Re-enter new password..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={onClose} disabled={changingPass}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={changingPass}>
                <ShieldCheck size={15} />
                <span>{changingPass ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
