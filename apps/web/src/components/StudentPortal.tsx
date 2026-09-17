import React, { useState, useEffect } from 'react';
import {
  Building2,
  Briefcase,
  DollarSign,
  GraduationCap,
  Clock,
  CheckCircle2,
  XCircle,
  Bell,
  User,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Layers,
  ArrowRight,
  Edit3,
  Search,
} from 'lucide-react';
import {
  Student,
  CompanyDrive,
  DriveNotification,
  fetchStudentDriveFeeds,
  submitStudentDriveResponse,
  fetchStudentNotifications,
  updateStudentProfile,
} from '../api';
import { CompanyDetailModal } from './CompanyDetailModal';
import { StudentProfileModal } from './StudentProfileModal';

interface StudentPortalProps {
  currentStudent: Student;
  onUpdateStudent: (student: Student) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  currentStudent,
  onUpdateStudent,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'NOT_OPTED_IN' | 'ALL'>('ACTIVE');
  const [feeds, setFeeds] = useState<{
    active: CompanyDrive[];
    notOptedIn: CompanyDrive[];
    all: CompanyDrive[];
  }>({
    active: [],
    notOptedIn: [],
    all: [],
  });
  const [counts, setCounts] = useState({ active: 0, notOptedIn: 0, all: 0 });
  const [notifications, setNotifications] = useState<DriveNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<CompanyDrive | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [respondingDriveId, setRespondingDriveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [feedData, notifs] = await Promise.all([
        fetchStudentDriveFeeds(currentStudent.id),
        fetchStudentNotifications(currentStudent.id),
      ]);
      setFeeds(feedData.feeds);
      setCounts(feedData.counts);
      setNotifications(notifs || []);
    } catch (err) {
      console.error('Failed to load student feeds', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [currentStudent.id]);

  const handleRespond = async (driveId: string, status: 'OPTED_IN' | 'OPTED_OUT') => {
    setRespondingDriveId(driveId);
    // Optimistically update local drive list so the clicked button immediately highlights
    setFeeds((prev) => {
      const updateList = (list: CompanyDrive[]) =>
        list.map((d) =>
          d.id === driveId
            ? {
                ...d,
                studentResponse: {
                  status,
                  responseAt: new Date().toISOString(),
                  isShortlisted: d.studentResponse?.isShortlisted || false,
                },
              }
            : d
        );
      return {
        active: updateList(prev.active),
        notOptedIn: updateList(prev.notOptedIn),
        all: updateList(prev.all),
      };
    });

    if (selectedDrive && selectedDrive.id === driveId) {
      setSelectedDrive((prev) =>
        prev
          ? {
              ...prev,
              studentResponse: {
                status,
                responseAt: new Date().toISOString(),
                isShortlisted: prev.studentResponse?.isShortlisted || false,
              },
            }
          : null
      );
    }

    try {
      const res = await submitStudentDriveResponse(currentStudent.id, driveId, status);
      onNotify(res.message || (status === 'OPTED_IN' ? 'Opted In Successfully' : 'Opted Out Successfully'), status === 'OPTED_IN' ? 'success' : 'info');
      await loadStudentData();
    } catch (err: any) {
      onNotify(err.response?.data?.error || 'Failed to submit response', 'error');
      await loadStudentData();
    } finally {
      setRespondingDriveId(null);
    }
  };

  const handleSaveProfile = async (
    profileData: Partial<Student> & { profileImage?: string; resumeUrl?: string; bio?: string }
  ) => {
    const updated = await updateStudentProfile(currentStudent.id, profileData);
    onUpdateStudent(updated);
    onNotify('Your student profile was updated successfully!', 'success');
    loadStudentData();
  };

  const currentList =
    activeTab === 'ACTIVE'
      ? feeds.active
      : activeTab === 'NOT_OPTED_IN'
      ? feeds.notOptedIn
      : feeds.all;

  const filteredDrives = currentList.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.companyName.toLowerCase().includes(q) ||
      d.role.toLowerCase().includes(q) ||
      d.ctc.toLowerCase().includes(q) ||
      (d.requiredSkills || []).some((sk) => sk.toLowerCase().includes(q))
    );
  });

  const studentAvatar =
    (currentStudent as any).profileImage ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentStudent.name)}`;
  const resumeUrl =
    (currentStudent as any).resumeUrl ||
    `https://drive.google.com/file/d/sample-resume-${currentStudent.externalId || currentStudent.id}/view`;

  return (
    <div className="student-portal-wrapper">
      {/* Security Alert Banner for Temporary Password */}
      {currentStudent.mustChangePassword && (
        <div className="alert-box warning mb-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldAlert size={24} style={{ flexShrink: 0, color: 'var(--accent-warning, #f59e0b)' }} />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>Mandatory Security Notice: Temporary Password Active</strong>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
                You are currently using a temporary password assigned by the placement coordinator. For your safety and account protection, you must change your password now.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ whiteSpace: 'nowrap', padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}
            onClick={() => setIsProfileModalOpen(true)}
          >
            Change Password Now
          </button>
        </div>
      )}

      {/* 1. Student Personal Profile Header Banner */}
      <div className="student-hero-card">
        <div className="student-profile-main">
          <img
            src={studentAvatar}
            alt={currentStudent.name}
            className="student-hero-avatar"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=fallback`;
            }}
          />
          <div className="student-hero-info">
            <div className="student-hero-name-row">
              <h2 className="student-hero-name">{currentStudent.name}</h2>
              <span className="student-branch-badge">{currentStudent.branch}</span>
              <span className="student-cgpa-badge">
                <GraduationCap size={14} /> {Number(currentStudent.cgpa).toFixed(2)} CGPA
              </span>
            </div>
            <p className="student-hero-meta">
              <span>{currentStudent.email}</span>
              {currentStudent.phone && <span> • {currentStudent.phone}</span>}
              <span> • Candidate ID #{currentStudent.externalId || currentStudent.id}</span>
            </p>

            <div className="student-hero-skills">
              <span className="skills-lbl">My Technical Skills:</span>
              <div className="tags-wrap">
                {currentStudent.skills && currentStudent.skills.length > 0 ? (
                  currentStudent.skills.map((sk) => (
                    <span key={sk} className="student-skill-chip">
                      {sk}
                    </span>
                  ))
                ) : (
                  <span className="text-muted">No skills added</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="student-hero-actions">
          <div className="student-hero-buttons">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-resume"
              title="Open your verified resume link"
            >
              <ExternalLink size={14} />
              <span>View My Resume</span>
            </a>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsProfileModalOpen(true)}
              title="Update your photo, skills, CGPA, and resume link"
            >
              <Edit3 size={14} />
              <span>Edit My Profile</span>
            </button>

            {/* Notification Bell with Badge */}
            <div className="notification-bell-container">
              <button
                type="button"
                className={`btn-notification-bell ${notifications.length > 0 ? 'has-alerts' : ''}`}
                onClick={() => setShowNotifications(!showNotifications)}
                title="View Placement Alerts & Email Dispatches"
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span className="notif-badge">{notifications.length}</span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="notifications-dropdown-menu">
                  <div className="notif-dropdown-header">
                    <h4>
                      <Bell size={15} /> Placement Email Alerts ({notifications.length})
                    </h4>
                    <button
                      type="button"
                      className="btn-close-notifs"
                      onClick={() => setShowNotifications(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="notif-dropdown-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                        <p style={{ margin: 0, fontSize: '13px' }}>No placement alerts yet.</p>
                      </div>
                    ) : (
                      notifications.map((n, idx) => (
                        <div key={n.id || `notif-${idx}`} className="notif-item">
                          <div className="notif-item-header">
                            <span className="notif-company">{n.companyName || 'Campus Placement Cell'}</span>
                            <span className="notif-time">
                              {n.sentAt
                                ? new Date(n.sentAt).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : 'Recent'}
                            </span>
                          </div>
                          <h5 className="notif-subject">{n.subject}</h5>
                          <p className="notif-body" style={{ whiteSpace: 'pre-line', margin: '4px 0 0 0', lineHeight: 1.45 }}>{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs & Search Toolbar */}
      <div className="student-feed-toolbar">
        <div className="feed-nav-tabs">
          <button
            type="button"
            className={`feed-tab-btn ${activeTab === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setActiveTab('ACTIVE')}
          >
            <span className="tab-indicator green" />
            <span className="tab-title">Active Company Drives</span>
            <span className="tab-count-badge">{counts.active}</span>
          </button>

          <button
            type="button"
            className={`feed-tab-btn ${activeTab === 'NOT_OPTED_IN' ? 'active' : ''}`}
            onClick={() => setActiveTab('NOT_OPTED_IN')}
          >
            <span className="tab-indicator amber" />
            <span className="tab-title">Not Opted-In List</span>
            <span className="tab-count-badge">{counts.notOptedIn}</span>
          </button>

          <button
            type="button"
            className={`feed-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            <span className="tab-indicator blue" />
            <span className="tab-title">All Eligible Companies</span>
            <span className="tab-count-badge">{counts.all}</span>
          </button>
        </div>

        <div className="feed-search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="filter-input feed-search-input"
            placeholder="Search company name, role, skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Row-by-Row Scrollable Company Drive Feed */}
      <div className="student-drives-feed">
        {loading ? (
          <div className="empty-state-wrap">
            <p>Loading company recruitment drives...</p>
          </div>
        ) : filteredDrives.length === 0 ? (
          <div className="empty-state-wrap">
            <Building2 size={36} />
            <h3>No company drives found</h3>
            <p>
              {activeTab === 'ACTIVE'
                ? 'There are currently no active drives matching your eligibility. New drives will appear here once announced!'
                : activeTab === 'NOT_OPTED_IN'
                ? 'No expired un-opted drives in this category.'
                : 'No companies found matching your search.'}
            </p>
          </div>
        ) : (
          <div className="drives-rows-container">
            {filteredDrives.map((drive) => {
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
              const isResponding = respondingDriveId === drive.id;

              return (
                <div
                  key={drive.id}
                  className={`drive-row-card ${isExpired ? 'expired-row' : ''} ${
                    responseStatus === 'OPTED_IN' ? 'opted-in-row' : ''
                  }`}
                  onClick={() => {
                    setSelectedDrive(drive);
                    setIsDetailModalOpen(true);
                  }}
                >
                  {/* Left: Company Logo & Identity */}
                  <div className="drive-row-identity">
                    <div className="drive-row-logo-box">
                      {drive.logoUrl ? (
                        <img
                          src={drive.logoUrl}
                          alt={drive.companyName}
                          className="drive-row-logo-img"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Building2 size={24} />
                      )}
                    </div>
                    <div className="drive-row-titles">
                      <div className="drive-row-company-row">
                        <h3 className="drive-row-company-name">{drive.companyName}</h3>
                        <span className={`job-type-pill small ${drive.jobType.toLowerCase()}`}>
                          {drive.jobType === 'FULL_TIME'
                            ? 'FTE'
                            : drive.jobType === 'INTERNSHIP_PPO'
                            ? 'Intern + PPO'
                            : 'Intern'}
                        </span>
                      </div>
                      <p className="drive-row-role">{drive.role}</p>
                      <div className="drive-row-skills">
                        {drive.requiredSkills?.slice(0, 4).map((sk) => (
                          <span key={sk} className="drive-row-skill-tag">
                            {sk}
                          </span>
                        ))}
                        {drive.requiredSkills && drive.requiredSkills.length > 4 && (
                          <span className="text-muted text-xs">
                            +{drive.requiredSkills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Compensation & Eligibility */}
                  <div className="drive-row-metrics">
                    <div className="drive-metric-pill">
                      <span className="metric-lbl">CTC Package</span>
                      <span className="metric-val ctc">{drive.ctc}</span>
                    </div>
                    <div className="drive-metric-pill">
                      <span className="metric-lbl">Stipend</span>
                      <span className="metric-val stipend">{drive.stipend}</span>
                    </div>
                    <div className="drive-metric-pill">
                      <span className="metric-lbl">Min. CGPA</span>
                      <span className="metric-val cgpa">≥ {Number(drive.minCgpa).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Right: Deadline & Action Buttons */}
                  <div className="drive-row-deadline-action" onClick={(e) => e.stopPropagation()}>
                    <div className="drive-deadline-box">
                      <span className="deadline-lbl">
                        <Clock size={13} /> Apply before:
                      </span>
                      <span className={`deadline-val ${isExpired ? 'expired' : ''}`}>
                        {formattedDeadline}
                      </span>
                    </div>

                    {/* Status Badge */}
                    {responseStatus ? (
                      <div className={`drive-response-badge ${responseStatus.toLowerCase()}`}>
                        {responseStatus === 'OPTED_IN' ? (
                          <>
                            <CheckCircle2 size={14} />
                            <span>Opted-In</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            <span>Opted-Out</span>
                          </>
                        )}
                      </div>
                    ) : isExpired ? (
                      <div className="drive-response-badge expired">
                        <ShieldAlert size={14} />
                        <span>Deadline Closed</span>
                      </div>
                    ) : (
                      <div className="drive-response-badge pending">
                        <span>Not Responded</span>
                      </div>
                    )}

                    {/* Quick Opt-In / Opt-Out Action Buttons */}
                    {!isExpired && (
                      <div className="drive-quick-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className={`btn-row-opt-out ${responseStatus === 'OPTED_OUT' ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRespond(drive.id, 'OPTED_OUT');
                          }}
                          disabled={isResponding}
                          title="Opt-out of this campus drive"
                        >
                          <XCircle size={14} />
                          <span>{responseStatus === 'OPTED_OUT' ? 'Opted-Out' : 'Opt-out'}</span>
                        </button>

                        <button
                          type="button"
                          className={`btn-row-opt-in ${responseStatus === 'OPTED_IN' ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRespond(drive.id, 'OPTED_IN');
                          }}
                          disabled={isResponding}
                          title="Opt-in and submit your profile & resume to placement coordinator"
                        >
                          <CheckCircle2 size={14} />
                          <span>{responseStatus === 'OPTED_IN' ? 'Opted-In' : 'Opt-in'}</span>
                        </button>
                      </div>
                    )}

                    <div className="drive-row-arrow" title="View Full Job Description">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Company Detail Modal */}
      <CompanyDetailModal
        drive={selectedDrive}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onRespond={handleRespond}
        studentCgpa={currentStudent.cgpa}
        loading={respondingDriveId !== null}
      />

      {/* 5. Student Profile Modal */}
      <StudentProfileModal
        student={currentStudent}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        onPasswordChanged={() => {
          onUpdateStudent({ ...currentStudent, mustChangePassword: false });
          onNotify('Password updated successfully! Your account is now secured.', 'success');
        }}
      />
    </div>
  );
};
