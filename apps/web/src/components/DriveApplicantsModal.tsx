import React, { useState, useEffect, useMemo } from 'react';
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
  CheckSquare,
  Square,
  Lock,
  SlidersHorizontal,
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

  // Dynamic CGPA filter & Selection states
  const [minCgpaFilter, setMinCgpaFilter] = useState<number | string>(drive.minCgpa || 0);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<number>>(new Set());

  // Dispatch lock state
  const [isDispatched, setIsDispatched] = useState(false);
  const [dispatchedAt, setDispatchedAt] = useState<string | null>(null);
  const [dispatchedCount, setDispatchedCount] = useState<number>(0);

  const loadApplicants = async () => {
    setLoading(true);
    try {
      const data = await fetchDriveApplicants(drive.id);
      const inList = data.optedIn || [];
      const outList = data.optedOut || [];
      const shortList = data.shortlisted || [];

      setOptedIn(inList);
      setOptedOut(outList);
      setShortlisted(shortList);

      const anyDispatched = data.isDispatched || inList.some((a) => a.sharedWithCompanyAt != null);
      const count = data.dispatchedCount || inList.filter((a) => a.sharedWithCompanyAt != null).length;
      const latestAt = data.dispatchedAt || (inList.find((a) => a.sharedWithCompanyAt != null)?.sharedWithCompanyAt ? String(inList.find((a) => a.sharedWithCompanyAt != null)?.sharedWithCompanyAt) : null);

      setIsDispatched(anyDispatched);
      setDispatchedCount(count);
      setDispatchedAt(latestAt);
    } catch (err) {
      console.error('Failed to load drive applicants', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
    setMinCgpaFilter(drive.minCgpa || 0);
    setSelectedStudentIds(new Set());
    setSharedSuccess(null);
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

  const handleToggleSelectStudent = (studentId: number) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const currentList =
    activeTab === 'OPTED_IN'
      ? optedIn
      : activeTab === 'SHORTLISTED'
      ? shortlisted
      : optedOut;

  const normalizedList = useMemo(() => {
    return currentList.map((app) => {
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
  }, [currentList]);

  const numericMinCgpa = Number(minCgpaFilter) || 0;

  const filteredList = useMemo(() => {
    return normalizedList.filter((app) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (app.studentName || '').toLowerCase().includes(q) ||
        (app.studentEmail || '').toLowerCase().includes(q) ||
        (app.studentBranch || '').toLowerCase().includes(q) ||
        (app.studentSkills || []).some((sk: string) => String(sk).toLowerCase().includes(q));

      // Apply CGPA filter when viewing Opted-In or Shortlisted candidates
      const matchesCgpa =
        activeTab === 'OPTED_OUT' || numericMinCgpa <= 0 || app.studentCgpa >= numericMinCgpa;

      return matchesSearch && matchesCgpa;
    });
  }, [normalizedList, searchQuery, numericMinCgpa, activeTab]);

  const handleSelectAllFiltered = () => {
    const ids = new Set(selectedStudentIds);
    filteredList.forEach((app) => ids.add(app.studentId));
    setSelectedStudentIds(ids);
  };

  const handleClearSelection = () => {
    setSelectedStudentIds(new Set());
  };

  const handleBulkShortlistFiltered = async () => {
    const toShortlist = filteredList.filter((a) => !a.isShortlistedByCoordinator && a.status === 'OPTED_IN');
    if (toShortlist.length === 0) {
      if (onNotify) onNotify('All eligible filtered candidates are already shortlisted.', 'info');
      return;
    }

    try {
      await Promise.all(
        toShortlist.map((app) => updateApplicantShortlist(drive.id, app.studentId, true))
      );
      if (onNotify) onNotify(`Successfully shortlisted ${toShortlist.length} eligible candidates.`, 'success');
      loadApplicants();
    } catch (err) {
      if (onNotify) onNotify('Failed to bulk shortlist candidates', 'error');
    }
  };

  const handleShareWithCompany = async () => {
    if (isDispatched) {
      if (onNotify) onNotify(`Candidate dossier has already been dispatched to ${drive.companyName}.`, 'info');
      return;
    }

    // Determine target candidate count and list
    let targetCount = 0;
    let payload: { candidateIds?: number[]; minCgpa?: number } = {};

    if (selectedStudentIds.size > 0) {
      targetCount = selectedStudentIds.size;
      payload = { candidateIds: Array.from(selectedStudentIds) };
    } else if (numericMinCgpa > 0) {
      const eligible = optedIn.filter((a) => Number((a as any).studentCgpa ?? (a as any).student?.cgpa ?? 0) >= numericMinCgpa);
      targetCount = eligible.length;
      payload = { minCgpa: numericMinCgpa };
    } else if (shortlisted.length > 0) {
      targetCount = shortlisted.length;
      payload = { candidateIds: shortlisted.map((s) => s.studentId) };
    } else {
      targetCount = optedIn.length;
      payload = {};
    }

    if (targetCount === 0) {
      if (onNotify) onNotify('No eligible candidate profiles available to dispatch.', 'error');
      return;
    }

    const confirmMsg =
      selectedStudentIds.size > 0
        ? `Are you sure you want to approve and dispatch the ${targetCount} individually selected candidates to ${drive.companyName} recruiters? This action will finalize and lock the dispatch.`
        : numericMinCgpa > 0
        ? `Are you sure you want to approve and dispatch all ${targetCount} opted-in candidates with CGPA ≥ ${numericMinCgpa} to ${drive.companyName} recruiters? This action will finalize and lock the dispatch.`
        : `Are you sure you want to approve and dispatch ${targetCount} candidate profiles to ${drive.companyName} recruiters? This action will finalize and lock the dispatch.`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setSharing(true);
    try {
      const res = await shareDriveWithCompany(drive.id, payload);
      setSharedSuccess(res.message);
      setIsDispatched(true);
      setDispatchedCount(res.dispatchedCount);
      setDispatchedAt(res.sharedAt);
      if (onNotify) onNotify(res.message, 'success');
      loadApplicants();
    } catch (err: any) {
      if (onNotify) onNotify(err.response?.data?.error || 'Failed to dispatch candidate list', 'error');
    } finally {
      setSharing(false);
    }
  };

  const formattedDispatchedDate = dispatchedAt
    ? new Date(dispatchedAt).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }) + ' (IST)'
    : null;

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
                {isDispatched && (
                  <span className="job-type-pill" style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontWeight: 800 }}>
                    <Lock size={11} style={{ marginRight: 4, display: 'inline' }} />
                    DISPATCHED TO COMPANY
                  </span>
                )}
              </div>
              <p className="modal-subtitle">
                Placement Coordinator verification, CGPA filtering & candidate dispatch portal for {drive.companyName}.
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Permanent Dispatched Banner */}
          {isDispatched && (
            <div className="alert-box success mb-4" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#f0fdf4', border: '1px solid #86efac', padding: '12px 16px', borderRadius: 8 }}>
              <CheckCircle2 size={18} style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 13.5, color: '#166534', lineHeight: 1.5 }}>
                <strong>Recruiter Dossier Dispatched:</strong> {dispatchedCount} verified candidate profiles have been successfully transmitted to the <strong>{drive.companyName}</strong> recruitment team on {formattedDispatchedDate}.
                <div style={{ fontSize: 12, color: '#15803d', marginTop: 2 }}>
                  The candidate dispatch is completed and locked to prevent duplicate submissions.
                </div>
              </div>
            </div>
          )}

          {sharedSuccess && !isDispatched && (
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

          {/* CGPA Threshold & Dynamic Filtering Toolbar */}
          <div className="cgpa-filter-toolbar">
            <div className="cgpa-filter-left">
              <div className="cgpa-filter-label">
                <SlidersHorizontal size={14} className="text-primary-600" />
                <span>Filter by Minimum CGPA:</span>
              </div>
              <div className="cgpa-presets-group">
                <button
                  type="button"
                  className={`cgpa-preset-btn ${numericMinCgpa === Number(drive.minCgpa) ? 'active' : ''}`}
                  onClick={() => setMinCgpaFilter(Number(drive.minCgpa))}
                >
                  Drive Cutoff (≥ {Number(drive.minCgpa).toFixed(1)})
                </button>
                <button
                  type="button"
                  className={`cgpa-preset-btn ${numericMinCgpa === 7.5 ? 'active' : ''}`}
                  onClick={() => setMinCgpaFilter(7.5)}
                >
                  ≥ 7.5
                </button>
                <button
                  type="button"
                  className={`cgpa-preset-btn ${numericMinCgpa === 8.0 ? 'active' : ''}`}
                  onClick={() => setMinCgpaFilter(8.0)}
                >
                  ≥ 8.0
                </button>
                <button
                  type="button"
                  className={`cgpa-preset-btn ${numericMinCgpa === 8.5 ? 'active' : ''}`}
                  onClick={() => setMinCgpaFilter(8.5)}
                >
                  ≥ 8.5
                </button>
                <button
                  type="button"
                  className={`cgpa-preset-btn ${numericMinCgpa === 9.0 ? 'active' : ''}`}
                  onClick={() => setMinCgpaFilter(9.0)}
                >
                  ≥ 9.0
                </button>
                <button
                  type="button"
                  className={`cgpa-preset-btn ${numericMinCgpa === 0 ? 'active' : ''}`}
                  onClick={() => setMinCgpaFilter(0)}
                >
                  All (≥ 0.0)
                </button>
              </div>

              <div className="cgpa-input-wrap">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  className="filter-input cgpa-custom-input"
                  placeholder="Custom CGPA"
                  value={minCgpaFilter === 0 ? '' : minCgpaFilter}
                  onChange={(e) => setMinCgpaFilter(e.target.value === '' ? 0 : Number(e.target.value))}
                />
              </div>
            </div>

            {/* Quick Bulk Selection Tools */}
            {activeTab === 'OPTED_IN' && !isDispatched && (
              <div className="cgpa-filter-right">
                <button
                  type="button"
                  className="btn-filter-action"
                  onClick={handleSelectAllFiltered}
                  title="Select all currently visible filtered candidates"
                >
                  <CheckSquare size={13} />
                  <span>Select Filtered ({filteredList.length})</span>
                </button>

                {selectedStudentIds.size > 0 && (
                  <button
                    type="button"
                    className="btn-filter-action outline"
                    onClick={handleClearSelection}
                  >
                    <span>Clear ({selectedStudentIds.size})</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn-filter-action primary"
                  onClick={handleBulkShortlistFiltered}
                  title="Shortlist all eligible filtered candidates"
                >
                  <UserCheck size={13} />
                  <span>Shortlist All Filtered</span>
                </button>
              </div>
            )}
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
                <span>
                  Opted-In Candidates ({numericMinCgpa > 0 ? `${filteredList.length}/${optedIn.length}` : optedIn.length})
                </span>
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

          {/* Dynamic Filter Info Line */}
          {numericMinCgpa > 0 && activeTab === 'OPTED_IN' && (
            <div className="cgpa-filter-summary-note">
              Filtering opted-in candidates with <strong>CGPA ≥ {numericMinCgpa.toFixed(2)}</strong>. Showing <strong>{filteredList.length}</strong> of {optedIn.length} registered applicants.
            </div>
          )}

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
                  ? numericMinCgpa > 0
                    ? `No opted-in students meet the CGPA cutoff of ≥ ${numericMinCgpa.toFixed(2)}.`
                    : 'No students have opted-in for this drive yet.'
                  : activeTab === 'SHORTLISTED'
                  ? 'No candidates have been marked as shortlisted yet. Click the "Shortlist for Company" button on candidate cards.'
                  : 'No students have marked opted-out.'}
              </p>
            </div>
          ) : (
            <div className="applicants-cards-grid">
              {filteredList.map((app) => {
                const isSelected = selectedStudentIds.has(app.studentId);
                const wasShared = app.sharedWithCompanyAt != null;

                return (
                  <div
                    key={app.id}
                    className={`applicant-card ${app.isShortlistedByCoordinator ? 'shortlisted' : ''} ${
                      isSelected ? 'selected-for-dispatch' : ''
                    }`}
                  >
                    <div className="applicant-header">
                      {/* Individual Checkbox for selecting student */}
                      {activeTab === 'OPTED_IN' && !isDispatched && (
                        <button
                          type="button"
                          className="btn-candidate-select-check"
                          onClick={() => handleToggleSelectStudent(app.studentId)}
                          title={isSelected ? 'Deselect candidate' : 'Select candidate for company dispatch'}
                        >
                          {isSelected ? (
                            <CheckSquare size={18} className="text-primary-600" />
                          ) : (
                            <Square size={18} className="text-slate-400" />
                          )}
                        </button>
                      )}

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
                          {wasShared && (
                            <span className="dispatched-chip">
                              <CheckCircle2 size={10} style={{ marginRight: 2 }} /> Dispatched
                            </span>
                          )}
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

                        {app.status === 'OPTED_IN' && !isDispatched && (
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
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer justify-between">
          <div className="footer-info-text">
            {isDispatched ? (
              <span style={{ color: '#166534', fontWeight: 600 }}>
                ✓ Candidate profiles have been dispatched to {drive.companyName}.
              </span>
            ) : selectedStudentIds.size > 0 ? (
              <span>
                <strong>{selectedStudentIds.size}</strong> candidate profile(s) individually selected for dispatch.
              </span>
            ) : numericMinCgpa > 0 ? (
              <span>
                <strong>{filteredList.length}</strong> candidate(s) meet CGPA ≥ {numericMinCgpa.toFixed(2)} criteria.
              </span>
            ) : (
              <span>
                Coordinator has full authority to shortlist and dispatch verified profiles to{' '}
                <strong>{drive.companyName}</strong>.
              </span>
            )}
          </div>

          <div className="drive-actions-group">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Close
            </button>

            {isDispatched ? (
              <button
                type="button"
                className="btn btn-locked-dispatched"
                disabled={true}
                title={`Already dispatched on ${formattedDispatchedDate}`}
              >
                <CheckCircle2 size={16} />
                <span>✓ Dispatched to {drive.companyName} ({dispatchedCount} Candidates)</span>
              </button>
            ) : (
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
                    : selectedStudentIds.size > 0
                    ? `Approve & Dispatch ${selectedStudentIds.size} Selected Candidates to ${drive.companyName}`
                    : numericMinCgpa > 0
                    ? `Approve & Dispatch ${filteredList.length} Candidates (CGPA ≥ ${numericMinCgpa.toFixed(1)}) to ${drive.companyName}`
                    : shortlisted.length > 0
                    ? `Approve & Dispatch ${shortlisted.length} Shortlisted Candidates to ${drive.companyName}`
                    : `Approve & Dispatch All ${optedIn.length} Opted-In Candidates to ${drive.companyName}`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
