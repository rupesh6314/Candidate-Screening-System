import React, { useState } from 'react';
import {
  X,
  Building2,
  Briefcase,
  DollarSign,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Layers,
  Send,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { CompanyDrive } from '../api';

interface PostDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (driveData: Partial<CompanyDrive>) => Promise<void>;
  totalStudentsCount: number;
}

export const PostDriveModal: React.FC<PostDriveModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  totalStudentsCount,
}) => {
  if (!isOpen) return null;

  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [jobType, setJobType] = useState<'FULL_TIME' | 'INTERNSHIP' | 'INTERNSHIP_PPO'>('FULL_TIME');
  const [ctc, setCtc] = useState('');
  const [stipend, setStipend] = useState('');
  const [location, setLocation] = useState('Bangalore / Hyderabad / Hybrid');
  const [minCgpa, setMinCgpa] = useState('7.5');
  const [allowedBranches, setAllowedBranches] = useState<string[]>([
    'Computer Science',
    'Information Technology',
    'Software Engineering',
  ]);
  const [skillsStr, setSkillsStr] = useState('Data Structures, Algorithms, React, Node.js, SQL');
  const [description, setDescription] = useState('');
  const [selectionProcessStr, setSelectionProcessStr] = useState(
    'Online Coding Round (2 hours), Technical Interview 1 (DSA), Technical Interview 2 (System Design), HR Round'
  );
  const [serviceAgreement, setServiceAgreement] = useState('None');
  // Default deadline 3 days from now at 09:00 AM
  const defaultDeadlineDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  defaultDeadlineDate.setHours(9, 0, 0, 0);
  const defaultDeadlineIso = defaultDeadlineDate.toISOString().slice(0, 16);
  const [deadline, setDeadline] = useState(defaultDeadlineIso);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const branchesList = [
    'Computer Science',
    'Information Technology',
    'Software Engineering',
    'Electronics',
    'Mechanical',
    'Civil',
    'Chemical',
  ];

  const toggleBranch = (b: string) => {
    if (allowedBranches.includes(b)) {
      setAllowedBranches(allowedBranches.filter((item) => item !== b));
    } else {
      setAllowedBranches([...allowedBranches, b]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !role.trim() || !ctc.trim() || !deadline) {
      setError('Company name, role, CTC, and application deadline are mandatory.');
      return;
    }

    const minCgpaNum = parseFloat(minCgpa);
    if (isNaN(minCgpaNum) || minCgpaNum < 0 || minCgpaNum > 10) {
      setError('Minimum CGPA must be between 0.00 and 10.00.');
      return;
    }

    const skills = skillsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const selectionProcess = selectionProcessStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        companyName: companyName.trim(),
        role: role.trim(),
        jobType,
        ctc: ctc.trim(),
        stipend: stipend.trim() || 'Not Disclosed',
        location: location.trim(),
        minCgpa: minCgpaNum,
        allowedBranches: allowedBranches.length > 0 ? allowedBranches : branchesList,
        requiredSkills: skills,
        description:
          description.trim() ||
          `${companyName} is visiting our campus for recruiting final year candidates for the role of ${role}.`,
        selectionProcess: selectionProcess.length > 0 ? selectionProcess : ['Online Assessment', 'Technical Interview', 'HR Interview'],
        serviceAgreement: serviceAgreement.trim() || 'None',
        deadline: new Date(deadline).toISOString(),
        isActive: true,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create company drive.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="modal-title">Announce Campus Placement Drive</h2>
              <p className="modal-subtitle">
                Publish a new company recruitment drive with custom deadlines and automated targeted email notifications.
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert-box error mb-4">{error}</div>}

            <div className="form-section-title">
              <Building2 size={16} /> Company & Role Details
            </div>

            <div className="form-grid-2col mb-4">
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g. Amazon, Google, Microsoft, Adobe"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hiring Role / Job Title *</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g. Software Development Engineer (SDE-1)"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Employment Type *</label>
                <select
                  className="filter-select"
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value as any)}
                  required
                >
                  <option value="FULL_TIME">Full-Time Employment (FTE)</option>
                  <option value="INTERNSHIP_PPO">Internship + PPO Conversion</option>
                  <option value="INTERNSHIP">Internship Only</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Job Location</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g. Bangalore / Hyderabad / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="form-section-title">
              <DollarSign size={16} /> Compensation & Application Deadline
            </div>

            <div className="form-grid-2col mb-4">
              <div className="form-group">
                <label className="form-label">Package / Annual CTC *</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g. ₹28.5 LPA or ₹14.0 - ₹18.0 LPA"
                  value={ctc}
                  onChange={(e) => setCtc(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Internship Stipend</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="e.g. ₹80,000 / month"
                  value={stipend}
                  onChange={(e) => setStipend(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Minimum CGPA Eligibility Cutoff *</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  className="filter-input"
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  required
                />
                <span className="form-hint">
                  Only students with CGPA ≥ {minCgpa} will receive email alerts and be eligible to Opt-In.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Application Deadline (Date & Time) *</label>
                <input
                  type="datetime-local"
                  className="filter-input"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
                <span className="form-hint">
                  Strict cut-off time (e.g. 20-09-2026, 09:00 AM). Drive closes automatically after this time.
                </span>
              </div>
            </div>

            <div className="form-section-title">
              <GraduationCap size={16} /> Eligible Engineering Branches
            </div>

            <div className="branch-selector-wrap mb-4">
              {branchesList.map((branch) => {
                const isSelected = allowedBranches.includes(branch);
                return (
                  <button
                    key={branch}
                    type="button"
                    className={`branch-select-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleBranch(branch)}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {branch}
                  </button>
                );
              })}
            </div>

            <div className="form-section-title">
              <Sparkles size={16} /> Skills, Selection Process & JD
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Required Technical Skills (comma-separated)</label>
              <input
                type="text"
                className="filter-input"
                placeholder="e.g. Data Structures, Java, AWS, System Design, SQL"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Selection Process Rounds (comma-separated)</label>
              <input
                type="text"
                className="filter-input"
                placeholder="e.g. Online Assessment, Technical Round 1, System Design, HR Discussion"
                value={selectionProcessStr}
                onChange={(e) => setSelectionProcessStr(e.target.value)}
              />
            </div>

            <div className="form-group mb-3">
              <label className="form-label">Service Agreement / Bond (if any)</label>
              <input
                type="text"
                className="filter-input"
                placeholder="e.g. None or 1 Year"
                value={serviceAgreement}
                onChange={(e) => setServiceAgreement(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Job Description & Responsibilities</label>
              <textarea
                className="filter-input"
                rows={3}
                placeholder="Detailed JD, responsibilities, team information..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Send size={15} />
              <span>{submitting ? 'Publishing & Dispatching Emails...' : 'Publish Drive & Notify Eligible Students'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
