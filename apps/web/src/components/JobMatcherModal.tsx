import React, { useState } from 'react';
import {
  X,
  BriefcaseBusiness,
  Download,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Award,
} from 'lucide-react';
import { api, CandidateJobMatch, JobRequirement } from '../api';

interface JobMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBranches: string[];
}

export const JobMatcherModal: React.FC<JobMatcherModalProps> = ({
  isOpen,
  onClose,
  availableBranches,
}) => {
  const [job, setJob] = useState<JobRequirement>({
    jobTitle: 'Software Development Engineer (SDE-1)',
    companyName: 'Amazon Web Services',
    minCgpa: 8.5,
    mandatorySkills: ['React', 'Node.js'],
    optionalSkills: ['AWS', 'Docker'],
    internshipRequired: true,
    eligibleBranches: ['Computer Science', 'Information Technology', 'Software Engineering'],
  });

  const [matches, setMatches] = useState<CandidateJobMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasCalculated, setHasCalculated] = useState(false);

  if (!isOpen) return null;

  const applyPreset = (preset: 'AMAZON' | 'GOOGLE' | 'FINTECH' | 'CONSULTING') => {
    if (preset === 'AMAZON') {
      setJob({
        jobTitle: 'Software Development Engineer',
        companyName: 'Amazon',
        minCgpa: 8.5,
        mandatorySkills: ['React', 'Node.js'],
        optionalSkills: ['AWS', 'MERN'],
        internshipRequired: true,
        eligibleBranches: ['Computer Science', 'Information Technology', 'Software Engineering'],
      });
    } else if (preset === 'GOOGLE') {
      setJob({
        jobTitle: 'Software Engineer (SWE)',
        companyName: 'Google',
        minCgpa: 9.0,
        mandatorySkills: ['Python', 'Django'],
        optionalSkills: ['React', 'SQL'],
        internshipRequired: true,
        eligibleBranches: ['Computer Science', 'Information Technology'],
      });
    } else if (preset === 'FINTECH') {
      setJob({
        jobTitle: 'Backend Platform Engineer',
        companyName: 'Goldman Sachs',
        minCgpa: 8.0,
        mandatorySkills: ['Java', 'Spring Boot'],
        optionalSkills: ['SQL', 'React'],
        internshipRequired: false,
        eligibleBranches: ['Computer Science', 'Software Engineering', 'Information Technology', 'Electronics'],
      });
    } else {
      setJob({
        jobTitle: 'Associate Software Consultant',
        companyName: 'Deloitte Tech',
        minCgpa: 7.0,
        mandatorySkills: ['JavaScript', 'SQL'],
        optionalSkills: ['Python', 'HTML'],
        internshipRequired: false,
        eligibleBranches: availableBranches,
      });
    }
  };

  const handleCalculateMatches = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/jobs/match', job);
      setMatches(res.data.matches || []);
      setHasCalculated(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to match candidates.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportShortlist = async () => {
    try {
      const res = await api.post('/api/jobs/export-shortlist', job, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${job.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_Shortlist_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export job shortlist CSV.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container extra-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Building2 size={22} />
            <div>
              <h2>Visiting Company Matcher & Shortlist Generator</h2>
              <p className="modal-subtitle">
                Define company hiring criteria, calculate Fit % match scores, and produce exportable ranked shortlists.
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Preset Selector */}
          <div className="preset-bar">
            <span className="preset-label">Quick Recruiter Presets:</span>
            <button type="button" className="preset-btn" onClick={() => applyPreset('AMAZON')}>
              Amazon SDE (≥8.5 CGPA, React/Node)
            </button>
            <button type="button" className="preset-btn" onClick={() => applyPreset('GOOGLE')}>
              Google SWE (≥9.0 CGPA, Python)
            </button>
            <button type="button" className="preset-btn" onClick={() => applyPreset('FINTECH')}>
              Goldman Java (≥8.0 CGPA, Java)
            </button>
            <button type="button" className="preset-btn" onClick={() => applyPreset('CONSULTING')}>
              Deloitte Tech (≥7.0 CGPA)
            </button>
          </div>

          {/* Job Requirement Form */}
          <form className="job-form-grid" onSubmit={handleCalculateMatches}>
            <div className="form-group">
              <label className="form-label">Visiting Company Name</label>
              <input
                type="text"
                className="filter-input"
                value={job.companyName}
                onChange={(e) => setJob({ ...job, companyName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Job Role</label>
              <input
                type="text"
                className="filter-input"
                value={job.jobTitle}
                onChange={(e) => setJob({ ...job, jobTitle: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Minimum CGPA Cutoff</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                className="filter-input"
                value={job.minCgpa}
                onChange={(e) => setJob({ ...job, minCgpa: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mandatory Skills (Comma-separated)</label>
              <input
                type="text"
                className="filter-input"
                placeholder="e.g. React, Node.js"
                value={job.mandatorySkills.join(', ')}
                onChange={(e) =>
                  setJob({
                    ...job,
                    mandatorySkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </div>

            <div className="form-group span-2">
              <label className="form-label">Optional / Bonus Skills (Comma-separated)</label>
              <input
                type="text"
                className="filter-input"
                placeholder="e.g. AWS, Docker, Next.js"
                value={job.optionalSkills.join(', ')}
                onChange={(e) =>
                  setJob({
                    ...job,
                    optionalSkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </div>

            <div className="form-group span-2">
              <label className="toggle-checkbox-label" style={{ marginTop: '6px' }}>
                <input
                  type="checkbox"
                  checked={job.internshipRequired}
                  onChange={(e) => setJob({ ...job, internshipRequired: e.target.checked })}
                />
                <BriefcaseBusiness size={15} />
                <span>Mandatory Prior Industry Internship Experience Required</span>
              </label>
            </div>

            <div className="form-group span-2" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Sparkles size={16} />
                <span>{loading ? 'Evaluating Cohort...' : 'Calculate Ranked Shortlist'}</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="alert-box error" style={{ margin: '12px 0' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Ranked Shortlist Results Table */}
          {hasCalculated && (
            <div className="job-results-section">
              <div className="job-results-header">
                <div>
                  <h3 className="job-results-title">
                    Ranked Shortlist for <strong>{job.companyName}</strong> ({matches.length} Candidates Evaluated)
                  </h3>
                  <span className="job-results-sub">
                    Sorted by Fit Match Percentage descending • Minimum CGPA: {job.minCgpa}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleExportShortlist}
                >
                  <Download size={15} />
                  <span>Export Company Shortlist CSV</span>
                </button>
              </div>

              <div className="table-responsive" style={{ maxHeight: '360px' }}>
                <table className="student-table">
                  <thead>
                    <tr>
                      <th style={{ width: '60px' }}>Rank</th>
                      <th style={{ width: '130px' }}>Fit Match %</th>
                      <th>Candidate</th>
                      <th>Branch</th>
                      <th>CGPA</th>
                      <th>Mandatory Skills</th>
                      <th>Overall Score</th>
                      <th>Match Rationale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m, idx) => (
                      <tr key={m.candidate.id || idx} className={`match-row ${m.tier.toLowerCase()}`}>
                        <td>
                          <span className="rank-badge">#{idx + 1}</span>
                        </td>
                        <td>
                          <div className="match-score-cell">
                            <div className="match-score-bar-wrap">
                              <span className="match-pct-text">{m.matchScore}%</span>
                              <span className={`fit-tier-badge ${m.tier.toLowerCase()}`}>
                                {m.tier.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="progress-track" style={{ height: '6px' }}>
                              <div
                                className={`progress-fill ${m.matchScore >= 80 ? 'strong' : m.matchScore >= 65 ? 'average' : 'needs'}`}
                                style={{ width: `${m.matchScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="candidate-cell">
                            <span className="candidate-name">{m.candidate.name}</span>
                            <span className="candidate-email">{m.candidate.email}</span>
                          </div>
                        </td>
                        <td>{m.candidate.branch}</td>
                        <td>
                          <span className={`cgpa-pill ${m.cgpaMatched ? 'high' : 'low'}`}>
                            {Number(m.candidate.cgpa).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <div className="table-skill-tags">
                            {m.mandatorySkillsMatched.map((sk) => (
                              <span key={sk} className="table-skill-pill matched">
                                ✓ {sk}
                              </span>
                            ))}
                            {m.mandatorySkillsMissing.map((sk) => (
                              <span key={sk} className="table-skill-pill missing">
                                ✗ {sk}
                              </span>
                            ))}
                            {m.mandatorySkillsMatched.length === 0 && m.mandatorySkillsMissing.length === 0 && (
                              <span className="text-muted">None specified</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <strong>{m.candidate.score}/10</strong> ({m.candidate.category})
                        </td>
                        <td>
                          <span className="match-rationale-text">{m.matchReason}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
