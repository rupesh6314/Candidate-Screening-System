import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Award,
  TrendingUp,
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Layers,
  Save,
  RotateCcw,
  UserCheck,
} from 'lucide-react';
import { Student, Category } from '../api';

interface StudentDossierProps {
  student: Student;
  onClose: () => void;
  onSaveOverride: (studentId: number, category: Category, reason: string) => Promise<void>;
  onClearOverride: (studentId: number) => Promise<void>;
}

export const StudentDossier: React.FC<StudentDossierProps> = ({
  student,
  onClose,
  onSaveOverride,
  onClearOverride,
}) => {
  const [overrideCategory, setOverrideCategory] = useState<Category>(
    student.overrideCategory || student.category
  );
  const [overrideReason, setOverrideReason] = useState<string>(
    student.overrideReason || ''
  );
  const [savingOverride, setSavingOverride] = useState(false);
  const [overrideError, setOverrideError] = useState('');

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim() || overrideReason.trim().length < 5) {
      setOverrideError('A detailed justification reason (at least 5 characters) is mandatory for coordinator overrides.');
      return;
    }
    setOverrideError('');
    setSavingOverride(true);
    try {
      await onSaveOverride(student.id, overrideCategory, overrideReason.trim());
    } catch (err: any) {
      setOverrideError(err.response?.data?.error || 'Failed to apply category override.');
    } finally {
      setSavingOverride(false);
    }
  };

  const handleClearOverride = async () => {
    if (!window.confirm('Restore category to deterministic system calculation?')) return;
    setSavingOverride(true);
    try {
      await onClearOverride(student.id);
      setOverrideReason('');
    } catch (err: any) {
      setOverrideError('Failed to clear override.');
    } finally {
      setSavingOverride(false);
    }
  };

  const breakdown = student.breakdown;
  const maxScore = student.maxScore || 10;
  const scorePct = Math.min(100, Math.round((student.score / maxScore) * 100));

  return (
    <div className="dossier-overlay" onClick={onClose}>
      <div className="dossier-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="dossier-header">
          <div className="dossier-candidate-info">
            <div className="dossier-avatar">{student.name.charAt(0)}</div>
            <div>
              <div className="dossier-title-row">
                <h2 className="dossier-name">{student.name}</h2>
                <span className="dossier-id-badge">ID #{student.externalId}</span>
              </div>
              <p className="dossier-meta">
                <span>{student.branch}</span> • <span>{student.email}</span>
                {student.phone && <span> • {student.phone}</span>}
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-dossier" onClick={onClose} aria-label="Close dossier">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="dossier-body">
          {/* Score & Category Hero Banner */}
          <div className={`dossier-hero ${student.category === 'STRONG' ? 'strong' : student.category === 'AVERAGE' ? 'average' : 'needs'}`}>
            <div className="dossier-hero-score">
              <div className="score-big-circle">
                <span className="score-big-val">{student.score}</span>
                <span className="score-big-denom">/{maxScore}</span>
              </div>
              <div className="dossier-hero-tier">
                <span className="tier-tag">Placement Readiness Tier</span>
                <h3 className="tier-title">
                  {student.category === 'STRONG'
                    ? 'Strong (Tier-1 Ready)'
                    : student.category === 'AVERAGE'
                    ? 'Average (Competent)'
                    : 'Needs Improvement'}
                </h3>
                {student.isOverridden && (
                  <span className="dossier-override-chip">
                    <Layers size={12} /> Manually Overridden by {student.overriddenBy || 'Admin'}
                  </span>
                )}
              </div>
            </div>

            {/* 1-Sentence Explainability Statement */}
            <div className="dossier-summary-card">
              <span className="summary-label">🎯 Coordinator Plain-English Rationale:</span>
              <p className="summary-text">{student.summaryReason}</p>
              {student.formulaString && (
                <div className="formula-box">
                  <code>{student.formulaString}</code>
                </div>
              )}
            </div>
          </div>

          {/* Itemized 10-Point Breakdown */}
          {breakdown && (
            <div className="dossier-section">
              <h4 className="dossier-section-title">
                <BookOpen size={16} />
                <span>Itemized 10-Point Criteria Breakdown</span>
              </h4>

              <div className="criteria-cards-grid">
                {/* CGPA */}
                <div className="criteria-card">
                  <div className="criteria-header">
                    <div className="criteria-title-wrap">
                      <GraduationCap size={16} />
                      <span className="criteria-name">Academic CGPA</span>
                    </div>
                    <span className="criteria-points">{breakdown.cgpa.score} / {breakdown.cgpa.max} pts</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill cgpa"
                      style={{ width: `${(breakdown.cgpa.score / breakdown.cgpa.max) * 100}%` }}
                    />
                  </div>
                  <p className="criteria-desc">{breakdown.cgpa.details}</p>
                </div>

                {/* Technical Skills */}
                <div className="criteria-card">
                  <div className="criteria-header">
                    <div className="criteria-title-wrap">
                      <Sparkles size={16} />
                      <span className="criteria-name">Technical Skills</span>
                    </div>
                    <span className="criteria-points">{breakdown.skills.score} / {breakdown.skills.max} pts</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill skills"
                      style={{ width: `${(breakdown.skills.score / breakdown.skills.max) * 100}%` }}
                    />
                  </div>
                  <p className="criteria-desc">{breakdown.skills.details}</p>
                  <div className="dossier-tags">
                    {student.skills && student.skills.length > 0 ? (
                      student.skills.map((sk) => <span key={sk} className="dossier-tag">{sk}</span>)
                    ) : (
                      <span className="text-muted">No skills listed</span>
                    )}
                  </div>
                </div>

                {/* Practical Projects */}
                <div className="criteria-card">
                  <div className="criteria-header">
                    <div className="criteria-title-wrap">
                      <BookOpen size={16} />
                      <span className="criteria-name">Practical Projects</span>
                    </div>
                    <span className="criteria-points">{breakdown.projects.score} / {breakdown.projects.max} pts</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill projects"
                      style={{ width: `${(breakdown.projects.score / breakdown.projects.max) * 100}%` }}
                    />
                  </div>
                  <p className="criteria-desc">{breakdown.projects.details}</p>
                  <div className="dossier-tags">
                    {student.projects && student.projects.length > 0 ? (
                      student.projects.map((pr) => <span key={pr} className="dossier-tag project">{pr}</span>)
                    ) : (
                      <span className="text-muted">No verified projects listed</span>
                    )}
                  </div>
                </div>

                {/* Industry Internships */}
                <div className="criteria-card">
                  <div className="criteria-header">
                    <div className="criteria-title-wrap">
                      <BriefcaseBusiness size={16} />
                      <span className="criteria-name">Industry Internships</span>
                    </div>
                    <span className="criteria-points">{breakdown.internships.score} / {breakdown.internships.max} pts</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill intern"
                      style={{ width: `${(breakdown.internships.score / breakdown.internships.max) * 100}%` }}
                    />
                  </div>
                  <p className="criteria-desc">{breakdown.internships.details}</p>
                  <div className="dossier-tags">
                    {student.internships && student.internships.length > 0 ? (
                      student.internships.map((inExp) => <span key={inExp} className="dossier-tag intern">{inExp}</span>)
                    ) : (
                      <span className="text-muted">No industry internship on record</span>
                    )}
                  </div>
                </div>

                {/* Professional Certifications */}
                <div className="criteria-card">
                  <div className="criteria-header">
                    <div className="criteria-title-wrap">
                      <Award size={16} />
                      <span className="criteria-name">Certifications</span>
                    </div>
                    <span className="criteria-points">{breakdown.certifications.score} / {breakdown.certifications.max} pts</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill cert"
                      style={{ width: `${(breakdown.certifications.score / breakdown.certifications.max) * 100}%` }}
                    />
                  </div>
                  <p className="criteria-desc">{breakdown.certifications.details}</p>
                  <div className="dossier-tags">
                    {student.certifications && student.certifications.length > 0 ? (
                      student.certifications.map((cert) => <span key={cert} className="dossier-tag cert">{cert}</span>)
                    ) : (
                      <span className="text-muted">No professional credentials listed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Strengths & Improvement Action Plan */}
          <div className="dossier-section dossier-split">
            {/* Strengths */}
            <div className="strength-box">
              <h4 className="box-title positive">
                <CheckCircle2 size={16} />
                <span>Verified Candidate Strengths</span>
              </h4>
              <ul className="strength-list">
                {student.strengths && student.strengths.length > 0 ? (
                  student.strengths.map((s, idx) => <li key={idx}>{s}</li>)
                ) : (
                  <li>Candidate demonstrates baseline entry qualifications.</li>
                )}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="remediation-box">
              <h4 className="box-title negative">
                <AlertCircle size={16} />
                <span>Actionable Recommendations</span>
              </h4>
              <ul className="remediation-list">
                {student.recommendations && student.recommendations.length > 0 ? (
                  student.recommendations.map((r, idx) => <li key={idx}>{r}</li>)
                ) : (
                  <li>Maintain current portfolio and prepare for technical domain interviews.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Coordinator Manual Category Override */}
          <div className="dossier-section override-section">
            <div className="override-header">
              <div className="override-title-wrap">
                <Layers size={18} />
                <div>
                  <h4 className="override-title">Coordinator Manual Category Override</h4>
                  <p className="override-sub">
                    Override the deterministic algorithm tier when exceptional context exists. A mandatory audit rationale is required.
                  </p>
                </div>
              </div>
            </div>

            {overrideError && (
              <div className="alert-box error" style={{ marginBottom: '12px' }}>
                <AlertCircle size={15} />
                <span>{overrideError}</span>
              </div>
            )}

            {student.isOverridden && (
              <div className="current-override-banner">
                <div className="current-override-info">
                  <strong>Active Override Applied:</strong> Tier set to <strong>{student.overrideCategory}</strong> by {student.overriddenBy || 'Coordinator'} on {student.overriddenAt ? new Date(student.overriddenAt).toLocaleDateString() : 'N/A'}.
                  <p className="override-logged-reason">"{student.overrideReason}"</p>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={handleClearOverride}
                  disabled={savingOverride}
                >
                  <RotateCcw size={13} />
                  <span>Restore System Calculation</span>
                </button>
              </div>
            )}

            <form className="override-form" onSubmit={handleSaveOverride}>
              <div className="form-row">
                <div className="form-group span-1">
                  <label className="form-label">Override Category To</label>
                  <select
                    className="filter-select"
                    value={overrideCategory}
                    onChange={(e) => setOverrideCategory(e.target.value as Category)}
                  >
                    <option value="STRONG">Strong (Tier-1 Ready)</option>
                    <option value="AVERAGE">Average (Domain Competent)</option>
                    <option value="NEEDS_IMPROVEMENT">Needs Improvement</option>
                  </select>
                </div>

                <div className="form-group span-2">
                  <label className="form-label">Mandatory Audit Justification Reason</label>
                  <input
                    type="text"
                    className="filter-input"
                    placeholder="e.g. Hackathon winner, published IEEE research paper, or verified GitHub project"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="override-form-footer">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingOverride}
                >
                  <Save size={15} />
                  <span>{savingOverride ? 'Saving Override...' : 'Save Manual Override'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
