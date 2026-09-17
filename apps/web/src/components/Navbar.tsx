import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  BriefcaseBusiness,
  Scale,
  SlidersHorizontal,
  History,
  ShieldCheck,
  RefreshCw,
  LogOut,
  Upload,
  Download,
  Plus,
  Building2,
  Users,
  ChevronDown,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { User, RulesetConfig } from '../api';

interface NavbarProps {
  user: User | null;
  activeRules: RulesetConfig | null;
  onOpenJobMatcher: () => void;
  onOpenComparison: () => void;
  onOpenRulesConfig: () => void;
  onOpenDataQuality: () => void;
  onOpenAuditLog: () => void;
  onOpenImportModal: () => void;
  onOpenAddModal: () => void;
  onOpenPostDriveModal: () => void;
  onOpenDrivesListModal: () => void;
  onExportCsv: () => void;
  onResetDataset: () => void;
  onLogout: () => void;
  isResetting: boolean;
  selectedCount: number;
  drivesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeRules,
  onOpenJobMatcher,
  onOpenComparison,
  onOpenRulesConfig,
  onOpenDataQuality,
  onOpenAuditLog,
  onOpenImportModal,
  onOpenAddModal,
  onOpenPostDriveModal,
  onOpenDrivesListModal,
  onExportCsv,
  onResetDataset,
  onLogout,
  isResetting,
  selectedCount,
  drivesCount,
}) => {
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isStudent = user?.role === 'STUDENT';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFeaturesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Header */}
        <div className="header-brand">
          <div className="brand-icon">
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">
                {isStudent ? 'Student Placement Portal' : 'Smart Candidate Screening System'}
              </h1>
              <span className="badge-official">
                {isStudent ? 'Candidate Portal' : 'Coordinator Desk'}
              </span>
            </div>
            <p className="brand-subtitle">
              {isStudent
                ? 'Campus Recruitment Drives • Opt-In Applications • Placement Alerts'
                : 'Deterministic 10-Point Scoring Engine & Campus Placement Hub'}
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="header-actions">
          {!isStudent ? (
            <>
              {/* 1. Company Drives Manager */}
              <button
                type="button"
                className="btn btn-header btn-drives-list"
                onClick={onOpenDrivesListModal}
                title="Manage active company drives and student applicant responses"
              >
                <Building2 size={15} />
                <span>Company Drives ({drivesCount})</span>
              </button>

              {/* 2. Post Campus Drive */}
              <button
                type="button"
                className="btn btn-header btn-post-drive"
                onClick={onOpenPostDriveModal}
                title="Publish a new campus drive with targeted student email alerts"
              >
                <Plus size={15} />
                <span>Post Drive</span>
              </button>

              {/* 3. Add Student */}
              <button
                type="button"
                className="btn btn-header btn-add"
                onClick={onOpenAddModal}
                title="Add candidate profile manually"
              >
                <Plus size={15} />
                <span>Add Student</span>
              </button>

              {/* 4. Features Dropdown */}
              <div className="features-dropdown-container" ref={dropdownRef}>
                <button
                  type="button"
                  className={`btn btn-header btn-features ${isFeaturesOpen ? 'active' : ''}`}
                  onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                  title="Access evaluation tools, scoring rules, comparisons, and audit logs"
                >
                  <Sparkles size={15} />
                  <span>Features</span>
                  <ChevronDown size={14} className={`arrow-icon ${isFeaturesOpen ? 'rotated' : ''}`} />
                </button>

                {isFeaturesOpen && (
                  <div className="features-menu-dropdown">
                    <div className="features-menu-section-title">Evaluation & Screening</div>

                    <button
                      type="button"
                      className="features-menu-item"
                      onClick={() => {
                        setIsFeaturesOpen(false);
                        onOpenJobMatcher();
                      }}
                    >
                      <BriefcaseBusiness size={15} />
                      <div className="menu-item-text">
                        <strong>Match Job Requirements</strong>
                        <span>Filter cohort against custom company JD</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="features-menu-item"
                      onClick={() => {
                        setIsFeaturesOpen(false);
                        onOpenComparison();
                      }}
                    >
                      <Scale size={15} />
                      <div className="menu-item-text">
                        <strong>Side-by-Side Comparison</strong>
                        <span>Compare selected candidates {selectedCount > 0 ? `(${selectedCount})` : ''}</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="features-menu-item"
                      onClick={() => {
                        setIsFeaturesOpen(false);
                        onOpenRulesConfig();
                      }}
                    >
                      <SlidersHorizontal size={15} />
                      <div className="menu-item-text">
                        <strong>Scoring Weights & Rules</strong>
                        <span>Configure 10-point scoring algorithm (v{activeRules?.version || 1})</span>
                      </div>
                    </button>

                    <div className="features-menu-divider" />
                    <div className="features-menu-section-title">Data & Compliance</div>

                    <button
                      type="button"
                      className="features-menu-item"
                      onClick={() => {
                        setIsFeaturesOpen(false);
                        onOpenDataQuality();
                      }}
                    >
                      <ShieldCheck size={15} />
                      <div className="menu-item-text">
                        <strong>Data Quality & Completeness</strong>
                        <span>Inspect missing fields and dirty data logs</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="features-menu-item"
                      onClick={() => {
                        setIsFeaturesOpen(false);
                        onOpenAuditLog();
                      }}
                    >
                      <History size={15} />
                      <div className="menu-item-text">
                        <strong>System Audit Trail</strong>
                        <span>View timeline of manual overrides and drive dispatches</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="features-menu-item"
                      onClick={() => {
                        setIsFeaturesOpen(false);
                        onOpenImportModal();
                      }}
                    >
                      <Upload size={15} />
                      <div className="menu-item-text">
                        <strong>Import Cohort CSV</strong>
                        <span>Bulk ingest student records with schema recovery</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="features-menu-item"
                      onClick={() => {
                        setIsFeaturesOpen(false);
                        onExportCsv();
                      }}
                    >
                      <Download size={15} />
                      <div className="menu-item-text">
                        <strong>Export Filtered Dataset</strong>
                        <span>Download currently filtered table to CSV</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className="features-menu-item text-amber"
                      onClick={() => {
                        setIsFeaturesOpen(false);
                        onResetDataset();
                      }}
                      disabled={isResetting}
                    >
                      <RefreshCw size={15} className={isResetting ? 'spin' : ''} />
                      <div className="menu-item-text">
                        <strong>Reset Benchmark Cohort</strong>
                        <span>Restore official 15-student assessment dataset</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : null}

          {/* User Profile Badge & Logout */}
          <div className="user-profile-badge">
            <div className="user-avatar">{isStudent ? '🎓' : user?.name.charAt(0) || 'P'}</div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">
                {isStudent ? 'STUDENT CANDIDATE' : 'PLACEMENT COORDINATOR'}
              </span>
            </div>

            <button
              type="button"
              className="btn-logout"
              onClick={onLogout}
              title="Sign Out of Placement System"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
