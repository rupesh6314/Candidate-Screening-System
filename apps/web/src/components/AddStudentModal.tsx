import React, { useState } from 'react';
import {
  X,
  UserPlus,
  GraduationCap,
  Sparkles,
  BookOpen,
  BriefcaseBusiness,
  Award,
  Mail,
  Phone,
  Hash,
} from 'lucide-react';
import { api } from '../api';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded: (name: string) => void;
  availableBranches: string[];
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onStudentAdded,
  availableBranches,
}) => {
  const [formData, setFormData] = useState({
    externalId: '',
    name: '',
    email: '',
    phone: '',
    branch: 'Computer Science',
    cgpa: '8.5',
    skills: '',
    projects: '',
    internships: '',
    certifications: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload = {
        externalId: formData.externalId.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        branch: formData.branch.trim(),
        cgpa: parseFloat(formData.cgpa),
        skills: formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        projects: formData.projects ? formData.projects.split(';').map((s) => s.trim()).filter(Boolean) : [],
        internships: formData.internships ? formData.internships.split(';').map((s) => s.trim()).filter(Boolean) : [],
        certifications: formData.certifications ? formData.certifications.split(';').map((s) => s.trim()).filter(Boolean) : [],
      };

      await api.post('/api/students', payload);
      onStudentAdded(formData.name);
      onClose();
      setFormData({
        externalId: '',
        name: '',
        email: '',
        phone: '',
        branch: 'Computer Science',
        cgpa: '8.5',
        skills: '',
        projects: '',
        internships: '',
        certifications: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add student candidate profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="modal-title">Add New Candidate Profile</h2>
              <p className="modal-subtitle">
                Register a new student for placement scoring and automated categorization.
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
          <div className="modal-body" style={{ overflowY: 'auto', flex: '1 1 auto', maxHeight: 'calc(85vh - 130px)' }}>
            {error && <div className="alert-box error mb-4">{error}</div>}

            <div className="form-section-title">
              <GraduationCap size={15} />
              <span>Primary Identification & Academics</span>
            </div>

            <div className="form-grid-2col mb-4">
              <div className="form-group">
                <label className="form-label">
                  <Hash size={13} /> Student Roll / Registration ID *
                </label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g. CS2026-099"
                  required
                  value={formData.externalId}
                  onChange={(e) => setFormData({ ...formData, externalId: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Candidate Name *</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g. John Doe"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail size={13} /> Official Email Address *
                </label>
                <input
                  type="email"
                  className="filter-input"
                  placeholder="e.g. student@campus.edu"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={13} /> Contact Phone Number
                </label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g. +91 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Engineering Branch *</label>
                <select
                  className="filter-select"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  required
                >
                  {availableBranches.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                  {!availableBranches.includes('Computer Science') && (
                    <option value="Computer Science">Computer Science</option>
                  )}
                  {!availableBranches.includes('Information Technology') && (
                    <option value="Information Technology">Information Technology</option>
                  )}
                  {!availableBranches.includes('Electronics') && (
                    <option value="Electronics">Electronics</option>
                  )}
                  {!availableBranches.includes('Mechanical') && (
                    <option value="Mechanical">Mechanical</option>
                  )}
                  {!availableBranches.includes('Civil') && (
                    <option value="Civil">Civil</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Academic CGPA (0.00 - 10.00) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  className="filter-input"
                  placeholder="e.g. 8.75"
                  required
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                />
              </div>
            </div>

            <div className="form-section-title">
              <Sparkles size={15} />
              <span>Technical Competency & Experience</span>
            </div>

            <div className="form-group mb-3">
              <label className="form-label">
                <Sparkles size={13} /> Technical Skills (Comma-separated)
              </label>
              <input
                type="text"
                className="filter-input"
                placeholder="e.g. React, Node.js, Python, PostgreSQL, Docker, AWS"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
              <span className="form-hint">
                Technical skills earn up to 30 pts. Non-technical entries (e.g. Word, Excel) are automatically filtered out.
              </span>
            </div>

            <div className="form-group mb-3">
              <label className="form-label">
                <BookOpen size={13} /> Portfolio Projects (Semicolon-separated ;)
              </label>
              <input
                type="text"
                className="filter-input"
                placeholder="e.g. E-Commerce Platform; AI Chatbot with RAG; Real-time Collaboration Tool"
                value={formData.projects}
                onChange={(e) => setFormData({ ...formData, projects: e.target.value })}
              />
              <span className="form-hint">
                Separate multiple projects with semicolons (;)
              </span>
            </div>

            <div className="form-grid-2col">
              <div className="form-group">
                <label className="form-label">
                  <BriefcaseBusiness size={13} /> Internships (Semicolon-separated ;)
                </label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g. SDE Intern at Amazon; Frontend Trainee at Startup"
                  value={formData.internships}
                  onChange={(e) => setFormData({ ...formData, internships: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Award size={13} /> Certifications (Semicolon-separated ;)
                </label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g. AWS Certified Solutions Architect; Meta React Specialist"
                  value={formData.certifications}
                  onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <UserPlus size={15} />
              <span>{saving ? 'Evaluating & Adding...' : 'Add Candidate Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
