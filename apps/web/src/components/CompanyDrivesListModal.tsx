import React, { useState } from 'react';
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
  Lock,
  Sparkles,
  Layers,
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
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');

  if (!isOpen) return null;

  const isDriveCompleted = (d: CompanyDrive) => {
    return Boolean(
      d.isDispatched ||
      d.stats?.isDispatched ||
      (d.stats?.dispatchedCount && d.stats.dispatchedCount > 0)
    );
  };

  const activeDrives = drives.filter((d) => !isDriveCompleted(d));
  const completedDrives = drives.filter((d) => isDriveCompleted(d));

  const renderDriveCard = (drive: CompanyDrive, isCompleted: boolean) => {
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
      dispatchedCount: 0,
      pendingResponseCount: 0,
      isDeadlinePassed: isExpired,
    };

    return (
      <div
        key={drive.id}
        className={`admin-drive-card ${isCompleted ? 'completed-drive-card' : ''}`}
      >
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
              {isCompleted && (
                <span className="dispatched-badge">
                  <Lock size={11} /> Dispatched to Company
                </span>
              )}
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
          {isCompleted ? (
            <button
              type="button"
              className="btn btn-locked-dispatched btn-full-width"
              onClick={() => {
                onClose();
                onSelectDrive(drive);
              }}
              title="Candidate dossier has been transmitted to company recruiters"
            >
              <CheckCircle2 size={15} />
              <span>
                View Dispatched Roster ({stats.dispatchedCount || stats.optedInCount} Candidates)
              </span>
            </button>
          ) : (
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
          )}
        </div>
      </div>
    );
  };

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
          {/* Top Actions & Filter Bar */}
          <div className="drives-list-actions-bar">
            <span className="total-drives-count">
              <strong>{drives.length}</strong> Total Campus Drives Published (
              <span className="text-primary font-semibold">{activeDrives.length} Active</span>,{' '}
              <span className="text-emerald-600 font-semibold">{completedDrives.length} Completed</span>)
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

          {/* Tab Navigation */}
          <div className="drives-filter-tabs">
            <button
              type="button"
              className={`drives-tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
              onClick={() => setActiveTab('ACTIVE')}
            >
              <Clock size={14} />
              <span>Active Campus Drives ({activeDrives.length})</span>
            </button>

            <button
              type="button"
              className={`drives-tab-btn completed ${activeTab === 'COMPLETED' ? 'active' : ''}`}
              onClick={() => setActiveTab('COMPLETED')}
            >
              <CheckCircle2 size={14} />
              <span>Completed Drives ({completedDrives.length})</span>
            </button>

            <button
              type="button"
              className={`drives-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveTab('ALL')}
            >
              <Building2 size={14} />
              <span>All Drives ({drives.length})</span>
            </button>
          </div>

          {drives.length === 0 ? (
            <div className="empty-state-wrap">
              <Building2 size={36} />
              <h3>No company drives posted yet</h3>
              <p>Click "Post New Campus Drive" to publish the first visiting company requirements.</p>
            </div>
          ) : (
            <div className="drives-content-container">
              {/* 1. Active Campus Drives Section */}
              {(activeTab === 'ACTIVE' || activeTab === 'ALL') && (
                <div className="drives-section-wrap">
                  <div className="drives-section-header">
                    <div className="drives-section-title-wrap">
                      <div className="section-dot blue" />
                      <h3>Active Campus Recruitment Drives</h3>
                      <span className="section-count-badge">{activeDrives.length} active</span>
                    </div>
                    <p className="section-subtitle">
                      Review incoming student applications, filter by CGPA, and dispatch finalized shortlists to company recruiters.
                    </p>
                  </div>

                  {activeDrives.length === 0 ? (
                    <div className="empty-state-wrap small">
                      <Building2 size={28} />
                      <h4>No Active Campus Drives Pending</h4>
                      <p>
                        All company drives have been completed and dispatched, or no new drives are currently active.
                      </p>
                    </div>
                  ) : (
                    <div className="admin-drives-grid">
                      {activeDrives.map((drive) => renderDriveCard(drive, false))}
                    </div>
                  )}
                </div>
              )}

              {/* 2. Completed Drives Section */}
              {(activeTab === 'COMPLETED' || activeTab === 'ALL') && (
                <div className="drives-section-wrap">
                  <div className="drives-section-header completed-header">
                    <div className="drives-section-title-wrap">
                      <div className="section-dot green" />
                      <h3>Completed Drives — Candidate Shortlists Dispatched</h3>
                      <span className="section-count-badge green">{completedDrives.length} completed</span>
                    </div>
                    <p className="section-subtitle">
                      Shortlisted candidate profiles have been finalized, verified, and transmitted to the visiting company recruitment team. These drives are locked.
                    </p>
                  </div>

                  {completedDrives.length === 0 ? (
                    <div className="empty-state-wrap small">
                      <CheckCircle2 size={28} style={{ color: '#10b981' }} />
                      <h4>No Completed Drives Yet</h4>
                      <p>
                        Once you approve and dispatch shortlisted candidates to a company recruiter, the drive will automatically move to this section.
                      </p>
                    </div>
                  ) : (
                    <div className="admin-drives-grid">
                      {completedDrives.map((drive) => renderDriveCard(drive, true))}
                    </div>
                  )}
                </div>
              )}
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
