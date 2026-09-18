import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Send,
  UserCheck,
  Search,
  Filter,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import {
  CompanyDrive,
  DriveApplication,
  fetchDriveApplicants,
  updateApplicantShortlist,
  shareDriveWithCompany,
} from '../api';

interface DriveApplicantsModalProps {
  drive: CompanyDrive | null;
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DriveApplicantsModal: React.FC<DriveApplicantsModalProps> = ({
  drive,
  isOpen,
  onClose,
  onNotify,
}) => {
  if (!isOpen || !drive) return null;

  const [activeTab, setActiveTab] = useState<'OPTED_IN' | 'SHORTLISTED' | 'OPTED_OUT'>('OPTED_IN');
  const [optedIn, setOptedIn] = useState<DriveApplication[]>([]);
  const [optedOut, setOptedOut] = useState<DriveApplication[]>([]);
  const [shortlisted, setShortlisted] = useState<DriveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sharedSuccess, setSharedSuccess] = useState<string | null>(null);

  const loadApplicants = async () => {
    setLoading(true);
    try {
      const data = await fetchDriveApplicants(drive.id);
      setOptedIn(data.optedIn || []);
      setOptedOut(data.optedOut || []);
      setShortlisted(data.shortlisted || []);
    } catch (err) {
      console.error('Failed to load drive applicants', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, [drive.id]);

  const handleToggleShortlist = async (app: DriveApplication) => {
    const newStatus = !app.isShortlistedByCoordinator;
    try {
      await updateApplicantShortlist(drive.id, app.studentId, newStatus);
      setOptedIn((prev) =>
        prev.map((item) =>
          item.studentId === app.studentId ? { ...item, isShortlistedByCoordinator: newStatus } : item
        )
      );
      if (newStatus) {
        setShortlisted((prev) => [...prev, { ...app, isShortlistedByCoordinator: true }]);
      } else {
        setShortlisted((prev) => prev.filter((item) => item.studentId !== app.studentId));
      }
    } catch (err) {
      if (onNotify) onNotify('Failed to update candidate shortlist status', 'error');
    }
  };

  const handleShareWithCompany = async () => {
    const candidateCount = shortlisted.length > 0 ? shortlisted.length : optedIn.length;
    if (candidateCount === 0) {
      if (onNotify) onNotify('No opted-in candidate profiles available to dispatch.', 'error');
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to approve and dispatch ${candidateCount} verified candidate profiles (with CGPA, skills, and resumes) to ${drive.companyName} recruiters?`
      )
    ) {
      return;
    }

    setSharing(true);
    try {
      const res = await shareDriveWithCompany(drive.id);
      setSharedSuccess(res.message);
      if (onNotify) onNotify(res.message, 'success');
      loadApplicants();
    } catch (err: any) {
      if (onNotify) onNotify(err.response?.data?.error || 'Failed to dispatch candidate list', 'error');
    } finally {
      setSharing(false);
    }
  };

  const currentList =
    activeTab === 'OPTED_IN'
      ? optedIn
      : activeTab === 'SHORTLISTED'
      ? shortlisted
      : optedOut;

  const normalizedList = currentList.map((app) => {
    const s = (app as any).student;
    return {
      ...app,
      studentName: app.studentName || s?.name || `Candidate #${app.studentId}`,
      studentEmail: app.studentEmail || s?.email || '',
      studentPhone: app.studentPhone || s?.phone || '',
      studentBranch: app.studentBranch || s?.branch || 'Computer Science',
      studentCgpa: Number(app.studentCgpa ?? s?.cgpa ?? 0),
      studentSkills: Array.isArray(app.studentSkills) && app.studentSkills.length > 0
        ? app.studentSkills
        : Array.isArray(s?.skills)
        ? s.skills
        : [],
      studentResumeUrl: app.studentResumeUrl || s?.resumeUrl || '',
      studentAvatarUrl:
        app.studentAvatarUrl ||
        s?.profileImage ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(app.studentName || s?.name || String(app.studentId))}`,
      studentExternalId: app.studentExternalId || s?.externalId || String(app.studentId),
    };
  });

  const filteredList = normalizedList.filter((app) => {
    const q = searchQuery.toLowerCase();
    return (
      (app.studentName || '').toLowerCase().includes(q) ||
      (app.studentEmail || '').toLowerCase().includes(q) ||
      (app.studentBranch || '').toLowerCase().includes(q) ||
      (app.studentSkills || []).some((sk: string) => String(sk).toLowerCase().includes(q))
    );
  });

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
              <div className="company-header-title-row">
                <h2 className="modal-title">{drive.companyName} — Candidate Applications Desk</h2>
                <span className="job-type-pill full_time">{drive.role}</span>
              </div>
              <p className="modal-subtitle">
                Placement Coordinator verification & shortlisting portal for {drive.companyName} campus drive.
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {sharedSuccess && (
            <div className="alert-box success mb-4">
              <CheckCircle2 size={16} />
              <span>{sharedSuccess}</span>
            </div>
          )}

          {/* Drive Stats Bar */}
          <div className="applicants-summary-bar">
            <div className="app-summary-stat">
              <span className="stat-num">{optedIn.length}</span>
              <span className="stat-desc">Opted-In Students</span>
            </div>
            <div className="app-summary-stat shortlisted">
              <span className="stat-num">{shortlisted.length}</span>
              <span className="stat-desc">Coordinator Shortlisted</span>
            </div>
            <div className="app-summary-stat opted-out">
              <span className="stat-num">{optedOut.length}</span>
              <span className="stat-desc">Opted-Out Students</span>
            </div>
            <div className="app-summary-stat">
              <span className="stat-num">{drive.minCgpa}</span>
              <span className="stat-desc">Min. CGPA Cutoff</span>
            </div>
          </div>

          {/* Action Header & Tabs */}
          <div className="applicants-tabs-row">
            <div className="applicants-tabs">
              <button
                type="button"
                className={`app-tab-btn ${activeTab === 'OPTED_IN' ? 'active' : ''}`}
                onClick={() => setActiveTab('OPTED_IN')}
              >
                <CheckCircle2 size={15} />
                <span>Opted-In Candidates ({optedIn.length})</span>
              </button>
              <button
                type="button"
                className={`app-tab-btn ${activeTab === 'SHORTLISTED' ? 'active' : ''}`}
                onClick={() => setActiveTab('SHORTLISTED')}
              >
                <UserCheck size={15} />
                <span>Shortlisted for Company ({shortlisted.length})</span>
              </button>
              <button
                type="button"
                className={`app-tab-btn ${activeTab === 'OPTED_OUT' ? 'active' : ''}`}
                onClick={() => setActiveTab('OPTED_OUT')}
              >
                <XCircle size={15} />
                <span>Opted-Out ({optedOut.length})</span>
              </button>
            </div>

            <div className="applicants-search-wrap">
              <Search size={15} className="search-icon" />
              <input
                type="text"
                className="filter-input app-search-input"
                placeholder="Search candidate name, branch, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Candidates List / Grid */}
          {loading ? (
            <div className="empty-state-wrap">
              <p>Loading candidate applications...</p>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="empty-state-wrap">
              <UserCheck size={32} />
              <h3>No candidates found</h3>
              <p>
                {activeTab === 'OPTED_IN'
                  ? 'No students have opted-in for this drive yet.'
                  : activeTab === 'SHORTLISTED'
                  ? 'No candidates have been marked as shortlisted yet. Click the "Shortlist for Company" button on candidate cards.'
                  : 'No students have marked opted-out.'}
              </p>
            </div>
          ) : (
            <div className="applicants-cards-grid">
              {filteredList.map((app) => (
                <div
                  key={app.id}
                  className={`applicant-card ${app.isShortlistedByCoordinator ? 'shortlisted' : ''}`}
                >
                  <div className="applicant-header">
                    <img
                      src={
                        app.studentAvatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(app.studentName)}`
                      }
                      alt={app.studentName}
                      className="applicant-avatar"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=fallback`;
                      }}
                    />
                    <div className="applicant-details">
                      <div className="applicant-name-row">
                        <h4 className="applicant-name">{app.studentName}</h4>
                        <span className="applicant-id-chip">ID #{app.studentExternalId || app.studentId}</span>
                      </div>
                      <p className="applicant-meta">
                        <span>{app.studentBranch}</span> • <span>{app.studentEmail}</span>
                        {app.studentPhone && <span> • {app.studentPhone}</span>}
                      </p>
                    </div>

                    <div className="applicant-cgpa-box">
                      <span className="applicant-cgpa-val">{Number(app.studentCgpa).toFixed(2)}</span>
                      <span className="applicant-cgpa-lbl">CGPA</span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="applicant-skills-wrap">
                    <span className="skills-heading">Verified Skills:</span>
                    <div className="tags-wrap">
                      {app.studentSkills && app.studentSkills.length > 0 ? (
                        app.studentSkills.map((sk: string) => (
                          <span key={sk} className="app-skill-chip">
                            {sk}
                          </span>
                        ))
                      ) : (
                        <span className="text-muted">No skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* Footer with Resume Link & Shortlist Toggle */}
                  <div className="applicant-footer">
                    <div className="applicant-timestamp">
                      Applied on{' '}
                      {new Date(app.responseAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>

                    <div className="applicant-actions">
                      {app.studentResumeUrl ? (
                        <a
                          href={app.studentResumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-view-resume"
                          title="Open Student Resume in new tab"
                        >
                          <ExternalLink size={13} />
                          <span>View Resume</span>
                        </a>
                      ) : (
                        <span className="text-muted text-xs">No resume link</span>
                      )}

                      {app.status === 'OPTED_IN' && (
                        <button
                          type="button"
                          className={`btn-shortlist-toggle ${
                            app.isShortlistedByCoordinator ? 'shortlisted' : ''
                          }`}
                          onClick={() => handleToggleShortlist(app)}
                        >
                          <UserCheck size={14} />
                          <span>
                            {app.isShortlistedByCoordinator ? '✓ Shortlisted' : '+ Shortlist for Company'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer justify-between">
          <div className="footer-info-text">
            Coordinator has full authority to shortlist and dispatch verified profiles to{' '}
            <strong>{drive.companyName}</strong>.
          </div>

          <div className="drive-actions-group">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleShareWithCompany}
              disabled={sharing || optedIn.length === 0}
            >
              <Send size={15} />
              <span>
                {sharing
                  ? 'Dispatching Profiles...'
                  : shortlisted.length > 0
                  ? `Approve & Dispatch ${shortlisted.length} Shortlisted Candidates to ${drive.companyName}`
                  : `Approve & Dispatch All ${optedIn.length} Opted-In Candidates to ${drive.companyName}`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
