import React from 'react';
import {
  X,
  Building2,
  Briefcase,
  DollarSign,
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  FileText,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { CompanyDrive } from '../api';

interface CompanyDetailModalProps {
  drive: CompanyDrive | null;
  isOpen: boolean;
  onClose: () => void;
  onRespond?: (driveId: string, status: 'OPTED_IN' | 'OPTED_OUT') => Promise<void>;
  studentCgpa?: number;
  loading?: boolean;
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({
  drive,
  isOpen,
  onClose,
  onRespond,
  studentCgpa,
  loading = false,
}) => {
  if (!isOpen || !drive) return null;

  const deadlineDate = new Date(drive.deadline);
  const isExpired = deadlineDate.getTime() < Date.now();
  const formattedDeadline = deadlineDate.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const responseStatus = drive.studentResponse?.status;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="company-logo-badge">
              {drive.logoUrl ? (
                <img
                  src={drive.logoUrl}
                  alt={drive.companyName}
                  className="company-logo-img"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Building2 size={24} />
              )}
            </div>
            <div>
              <div className="company-header-title-row">
                <h2 className="modal-title">{drive.companyName}</h2>
                <span className={`job-type-pill ${drive.jobType.toLowerCase()}`}>
                  {drive.jobType === 'FULL_TIME'
                    ? 'Full Time (FTE)'
                    : drive.jobType === 'INTERNSHIP_PPO'
                    ? 'Internship + PPO'
                    : 'Internship'}
                </span>
              </div>
              <p className="modal-subtitle">{drive.role}</p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body company-detail-body">
          {/* Key Compensation & Deadline Banner */}
          <div className="comp-hero-banner">
            <div className="comp-hero-stat">
              <span className="stat-label">
                <DollarSign size={15} /> Full-Time CTC
              </span>
              <span className="stat-val ctc">{drive.ctc}</span>
            </div>
            <div className="comp-hero-stat">
              <span className="stat-label">
                <Briefcase size={15} /> Monthly Stipend
              </span>
              <span className="stat-val stipend">{drive.stipend}</span>
            </div>
            <div className="comp-hero-stat">
              <span className="stat-label">
                <GraduationCap size={15} /> Min. CGPA
              </span>
              <span className="stat-val cgpa">≥ {Number(drive.minCgpa).toFixed(1)} CGPA</span>
            </div>
            <div className="comp-hero-stat">
              <span className="stat-label">
                <Clock size={15} /> Application Deadline
              </span>
              <span className={`stat-val deadline ${isExpired ? 'expired' : ''}`}>
                {formattedDeadline}
              </span>
            </div>
          </div>

          {/* Response Status Banner */}
          {responseStatus && (
            <div className={`response-status-banner ${responseStatus.toLowerCase()}`}>
              {responseStatus === 'OPTED_IN' ? (
                <>
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>You have Opted-In for this drive.</strong> Your profile, CGPA, and resume link have been submitted to the placement coordinator.
                  </div>
                </>
              ) : (
                <>
                  <XCircle size={18} />
                  <div>
                    <strong>You have Opted-Out of this drive.</strong> You can change your mind and Opt-in before the deadline.
                  </div>
                </>
              )}
            </div>
          )}

          {isExpired && !responseStatus && (
            <div className="response-status-banner expired">
              <ShieldAlert size={18} />
              <div>
                <strong>Application Window Closed:</strong> The deadline ({formattedDeadline}) for this campus drive has passed. No new applications can be accepted.
              </div>
            </div>
          )}

          {/* Job Details & Description */}
          <div className="detail-section">
            <h4 className="detail-section-title">
              <FileText size={16} /> About Role & Job Description
            </h4>
            <p className="detail-text">{drive.description}</p>
          </div>

          {/* Required Skills & Eligible Branches */}
          <div className="detail-grid-2col">
            <div className="detail-card">
              <h5 className="detail-card-title">
                <Sparkles size={15} /> Required Technical Skills
              </h5>
              <div className="tags-wrap">
                {drive.requiredSkills && drive.requiredSkills.length > 0 ? (
                  drive.requiredSkills.map((sk) => (
                    <span key={sk} className="skill-pill-active">
                      {sk}
                    </span>
                  ))
                ) : (
                  <span className="text-muted">General Software Engineering</span>
                )}
              </div>
            </div>

            <div className="detail-card">
              <h5 className="detail-card-title">
                <GraduationCap size={15} /> Eligible Branches
              </h5>
              <div className="tags-wrap">
                {drive.allowedBranches && drive.allowedBranches.length > 0 ? (
                  drive.allowedBranches.map((br) => (
                    <span key={br} className="branch-pill-active">
                      {br}
                    </span>
                  ))
                ) : (
                  <span className="branch-pill-active">All Engineering Branches</span>
                )}
              </div>
            </div>
          </div>

          {/* Selection Process & Additional Info */}
          <div className="detail-grid-2col">
            <div className="detail-card">
              <h5 className="detail-card-title">
                <Layers size={15} /> Campus Selection Process
              </h5>
              <ol className="process-list">
                {drive.selectionProcess && drive.selectionProcess.length > 0 ? (
                  drive.selectionProcess.map((step, idx) => (
                    <li key={idx}>
                      <span className="step-num">{idx + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))
                ) : (
                  <li>Standard Online Assessment & Technical Interviews</li>
                )}
              </ol>
            </div>

            <div className="detail-card">
              <h5 className="detail-card-title">
                <MapPin size={15} /> Location & Terms
              </h5>
              <div className="terms-list">
                <div className="term-item">
                  <span className="term-label">Job Location:</span>
                  <span className="term-val">{drive.location}</span>
                </div>
                <div className="term-item">
                  <span className="term-label">Service Agreement / Bond:</span>
                  <span className="term-val">{drive.serviceAgreement || 'None'}</span>
                </div>
                <div className="term-item">
                  <span className="term-label">Drive Start Date:</span>
                  <span className="term-val">
                    {new Date(drive.startDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Opt-In / Opt-Out Actions */}
        <div className="modal-footer justify-between">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>

          {onRespond && !isExpired && (
            <div className="drive-actions-group">
              <button
                type="button"
                className={`btn btn-opt-out ${responseStatus === 'OPTED_OUT' ? 'active' : ''}`}
                onClick={() => onRespond(drive.id, 'OPTED_OUT')}
                disabled={loading}
              >
                <XCircle size={16} />
                <span>{responseStatus === 'OPTED_OUT' ? 'Opted-Out' : 'Opt-out'}</span>
              </button>

              <button
                type="button"
                className={`btn btn-opt-in ${responseStatus === 'OPTED_IN' ? 'active' : ''}`}
                onClick={() => onRespond(drive.id, 'OPTED_IN')}
                disabled={loading}
              >
                <CheckCircle2 size={16} />
                <span>{responseStatus === 'OPTED_IN' ? 'Opted-In (Profile Shared)' : 'Opt-in for Drive'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
