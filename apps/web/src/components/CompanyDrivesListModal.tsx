import React from 'react';
import {
  X,
  Building2,
  Users,
  Plus,
  Clock,
  Briefcase,
  CheckCircle2,
  UserCheck,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { CompanyDrive } from '../api';

interface CompanyDrivesListModalProps {
  drives: CompanyDrive[];
  isOpen: boolean;
  onClose: () => void;
  onSelectDrive: (drive: CompanyDrive) => void;
  onOpenPostModal: () => void;
}

export const CompanyDrivesListModal: React.FC<CompanyDrivesListModalProps> = ({
  drives,
  isOpen,
  onClose,
  onSelectDrive,
  onOpenPostModal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container extra-large" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="modal-title">Campus Company Recruitment Drives</h2>
              <p className="modal-subtitle">
                Manage active campus placement drives, review student opt-in responses, and dispatch candidate profiles to company recruiters.
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <div className="drives-list-actions-bar">
            <span className="total-drives-count">
              <strong>{drives.length}</strong> Total Campus Drives Published
            </span>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onOpenPostModal();
              }}
            >
              <Plus size={15} />
              <span>Post New Campus Drive</span>
            </button>
          </div>

          {drives.length === 0 ? (
            <div className="empty-state-wrap">
              <Building2 size={36} />
              <h3>No company drives posted yet</h3>
              <p>Click "Post New Campus Drive" to publish the first visiting company requirements.</p>
            </div>
          ) : (
            <div className="admin-drives-grid">
              {drives.map((drive) => {
                const deadlineDate = new Date(drive.deadline);
                const isExpired = deadlineDate.getTime() < Date.now();
                const formattedDeadline = deadlineDate.toLocaleString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const stats = drive.stats || {
                  eligibleCount: 0,
                  optedInCount: 0,
                  optedOutCount: 0,
                  shortlistedCount: 0,
                  pendingResponseCount: 0,
                  isDeadlinePassed: isExpired,
                };

                return (
                  <div key={drive.id} className="admin-drive-card">
                    <div className="admin-drive-header">
                      <div className="admin-drive-logo-box">
                        {drive.logoUrl ? (
                          <img
                            src={drive.logoUrl}
                            alt={drive.companyName}
                            className="admin-drive-logo-img"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Building2 size={24} />
                        )}
                      </div>
                      <div className="admin-drive-info">
                        <div className="admin-drive-title-row">
                          <h3 className="admin-drive-company">{drive.companyName}</h3>
                          <span className={`job-type-pill ${drive.jobType.toLowerCase()}`}>
                            {drive.jobType === 'FULL_TIME'
                              ? 'FTE'
                              : drive.jobType === 'INTERNSHIP_PPO'
                              ? 'Intern + PPO'
                              : 'Intern'}
                          </span>
                        </div>
                        <p className="admin-drive-role">{drive.role}</p>
                      </div>
                    </div>

                    <div className="admin-drive-meta-grid">
                      <div className="meta-box">
                        <span className="meta-lbl">Package (CTC)</span>
                        <span className="meta-val ctc">{drive.ctc}</span>
                      </div>
                      <div className="meta-box">
                        <span className="meta-lbl">Min. CGPA</span>
                        <span className="meta-val cgpa">≥ {Number(drive.minCgpa).toFixed(1)}</span>
                      </div>
                      <div className="meta-box span-2">
                        <span className="meta-lbl">
                          <Clock size={12} /> Application Deadline
                        </span>
                        <span className={`meta-val ${isExpired ? 'expired-text' : ''}`}>
                          {formattedDeadline} {isExpired ? '(Closed)' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Applicant Progress Tracker */}
                    <div className="admin-drive-applicant-stats">
                      <div className="stat-pill eligible">
                        <span className="pill-num">{stats.eligibleCount}</span>
                        <span className="pill-lbl">Eligible</span>
                      </div>
                      <div className="stat-pill opted-in">
                        <span className="pill-num">{stats.optedInCount}</span>
                        <span className="pill-lbl">Opted-In</span>
                      </div>
                      <div className="stat-pill shortlisted">
                        <span className="pill-num">{stats.shortlistedCount}</span>
                        <span className="pill-lbl">Shortlisted</span>
                      </div>
                      <div className="stat-pill opted-out">
                        <span className="pill-num">{stats.optedOutCount}</span>
                        <span className="pill-lbl">Opted-Out</span>
                      </div>
                    </div>

                    <div className="admin-drive-card-footer">
                      <button
                        type="button"
                        className="btn btn-primary btn-full-width"
                        onClick={() => {
                          onClose();
                          onSelectDrive(drive);
                        }}
                      >
                        <UserCheck size={15} />
                        <span>Review & Dispatch Applicants ({stats.optedInCount})</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
