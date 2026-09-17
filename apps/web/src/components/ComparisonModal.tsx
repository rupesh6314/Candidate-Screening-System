import React from 'react';
import {
  X,
  Scale,
  GraduationCap,
  Sparkles,
  BookOpen,
  BriefcaseBusiness,
  Award,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Student } from '../api';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidates: Student[];
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  candidates,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container extra-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Scale size={22} />
            <div>
              <h2>Candidate Side-by-Side Comparison</h2>
              <p className="modal-subtitle">
                Comparing {candidates.length} candidate profiles across academics, technical skills, projects, and credentials.
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {candidates.length < 2 ? (
            <div className="empty-state-wrap">
              <Scale size={32} />
              <h3>Select at least 2 candidates from the table to compare</h3>
              <p>Check 2 to 4 student checkboxes on the directory table and click "Compare".</p>
            </div>
          ) : (
            <div className="comparison-grid" style={{ gridTemplateColumns: `repeat(${candidates.length}, 1fr)` }}>
              {candidates.map((c) => (
                <div key={c.id} className="comparison-col">
                  {/* Candidate Header */}
                  <div className="comp-header-box">
                    <div className="comp-avatar">{c.name.charAt(0)}</div>
                    <h3 className="comp-name">{c.name}</h3>
                    <span className="comp-branch">{c.branch}</span>
                    <span className="comp-email">{c.email}</span>

                    <div className="comp-score-row">
                      <div className="comp-score-badge">
                        <strong>{c.score}</strong>/10 pts
                      </div>
                      <span className={`badge-category ${c.category.toLowerCase()}`}>
                        {c.category === 'STRONG' ? 'Strong' : c.category === 'AVERAGE' ? 'Average' : 'Needs Imp.'}
                      </span>
                    </div>
                  </div>

                  {/* Academic CGPA */}
                  <div className="comp-metric-box">
                    <span className="comp-metric-label">
                      <GraduationCap size={14} /> Academic CGPA
                    </span>
                    <span className={`cgpa-pill ${c.cgpa >= 8.5 ? 'high' : c.cgpa >= 7.0 ? 'mid' : 'low'}`}>
                      {Number(c.cgpa).toFixed(2)} CGPA
                    </span>
                    <span className="comp-metric-sub">
                      {c.breakdown?.cgpa ? `${c.breakdown.cgpa.score}/${c.breakdown.cgpa.max} pts` : ''}
                    </span>
                  </div>

                  {/* Technical Skills */}
                  <div className="comp-metric-box">
                    <span className="comp-metric-label">
                      <Sparkles size={14} /> Technical Skills ({c.skills?.length || 0})
                    </span>
                    <div className="comp-tags-wrap">
                      {c.skills && c.skills.length > 0 ? (
                        c.skills.map((sk) => <span key={sk} className="table-skill-pill">{sk}</span>)
                      ) : (
                        <span className="text-muted">None</span>
                      )}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="comp-metric-box">
                    <span className="comp-metric-label">
                      <BookOpen size={14} /> Projects ({c.projects?.length || 0})
                    </span>
                    <ul className="comp-list">
                      {c.projects && c.projects.length > 0 ? (
                        c.projects.map((p, idx) => <li key={idx}>{p}</li>)
                      ) : (
                        <li className="text-muted">No projects listed</li>
                      )}
                    </ul>
                  </div>

                  {/* Internships */}
                  <div className="comp-metric-box">
                    <span className="comp-metric-label">
                      <BriefcaseBusiness size={14} /> Internships
                    </span>
                    <ul className="comp-list">
                      {c.internships && c.internships.length > 0 ? (
                        c.internships.map((i, idx) => <li key={idx} className="highlight">{i}</li>)
                      ) : (
                        <li className="text-muted">None</li>
                      )}
                    </ul>
                  </div>

                  {/* Certifications */}
                  <div className="comp-metric-box">
                    <span className="comp-metric-label">
                      <Award size={14} /> Certifications
                    </span>
                    <ul className="comp-list">
                      {c.certifications && c.certifications.length > 0 ? (
                        c.certifications.map((cert, idx) => <li key={idx}>{cert}</li>)
                      ) : (
                        <li className="text-muted">None</li>
                      )}
                    </ul>
                  </div>

                  {/* Coordinator Summary */}
                  <div className="comp-metric-box summary">
                    <span className="comp-metric-label">🎯 Coordinator Rationale</span>
                    <p className="comp-summary-text">{c.summaryReason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
