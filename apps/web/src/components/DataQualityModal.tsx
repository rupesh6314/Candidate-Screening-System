import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  BookOpen,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Student } from '../api';

interface DataQualityModalProps {
  students: Student[];
  onClose: () => void;
  onSelectStudent: (student: Student) => void;
}

export const DataQualityModal: React.FC<DataQualityModalProps> = ({
  students,
  onClose,
  onSelectStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'contact' | 'projects' | 'skills' | 'cgpa' | 'overrides'>('all');

  // Compute quality issue metrics
  const missingPhone = students.filter(s => !s.phone || s.phone.trim() === '' || s.phone.toLowerCase() === 'none');
  const missingEmail = students.filter(s => !s.email || !s.email.includes('@'));
  const zeroProjects = students.filter(s => !s.projects || s.projects.length === 0);
  const lowSkills = students.filter(s => (s.technicalSkillsCount !== undefined ? s.technicalSkillsCount < 2 : s.skills.length < 2));
  const lowCgpa = students.filter(s => s.cgpa < 6.0);
  const overridden = students.filter(s => s.isOverridden);

  // Filter students based on active tab
  let filteredList: { student: Student; issues: string[] }[] = [];

  students.forEach(st => {
    const issues: string[] = [];
    if (!st.phone || st.phone.trim() === '' || st.phone.toLowerCase() === 'none') {
      issues.push('Missing contact phone number');
    }
    if (!st.email || !st.email.includes('@')) {
      issues.push('Invalid or missing email');
    }
    if (!st.projects || st.projects.length === 0) {
      issues.push('No portfolio projects recorded (0/20 pts)');
    }
    if ((st.technicalSkillsCount !== undefined ? st.technicalSkillsCount < 2 : st.skills.length < 2)) {
      issues.push('Low technical skill count (<2 technical skills)');
    }
    if (st.cgpa < 6.0) {
      issues.push(`Low CGPA alert (${st.cgpa.toFixed(2)})`);
    }
    if (st.isOverridden) {
      issues.push(`Manual category override active (${st.overrideReason || 'No reason logged'})`);
    }

    if (issues.length > 0) {
      if (activeTab === 'all') {
        filteredList.push({ student: st, issues });
      } else if (activeTab === 'contact' && (!st.phone || !st.email || !st.email.includes('@'))) {
        filteredList.push({ student: st, issues });
      } else if (activeTab === 'projects' && (!st.projects || st.projects.length === 0)) {
        filteredList.push({ student: st, issues });
      } else if (activeTab === 'skills' && (st.technicalSkillsCount !== undefined ? st.technicalSkillsCount < 2 : st.skills.length < 2)) {
        filteredList.push({ student: st, issues });
      } else if (activeTab === 'cgpa' && st.cgpa < 6.0) {
        filteredList.push({ student: st, issues });
      } else if (activeTab === 'overrides' && st.isOverridden) {
        filteredList.push({ student: st, issues });
      }
    }
  });

  const totalFlagged = new Set(
    [...missingPhone, ...missingEmail, ...zeroProjects, ...lowSkills, ...lowCgpa, ...overridden].map(s => s.id)
  ).size;

  const qualityScore = students.length > 0 
    ? Math.round(((students.length - totalFlagged) / students.length) * 100) 
    : 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container extra-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-badge quality">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="modal-title">Data Quality & Profile Completeness Audit</h2>
              <p className="modal-subtitle">
                Inspect missing contact fields, blank profiles, and score anomalies across {students.length} students.
              </p>
            </div>
          </div>
          <button type="button" className="btn-close-modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Top Score Banner */}
          <div className="quality-banner-card mb-4">
            <div className="quality-score-hero">
              <div className={`quality-score-gauge ${qualityScore >= 80 ? 'high' : qualityScore >= 60 ? 'mid' : 'low'}`}>
                {qualityScore}%
              </div>
              <div className="quality-score-info">
                <h3 className="quality-score-title">Cohort Health & Completeness Score</h3>
                <p className="quality-score-sub">
                  {totalFlagged} of {students.length} candidate profiles have 1 or more flagged quality/completeness items.
                </p>
              </div>
            </div>

            <div className="quality-stat-chips">
              <div className="quality-stat-chip">
                <Phone size={13} />
                <span>{missingPhone.length} missing phone</span>
              </div>
              <div className="quality-stat-chip">
                <BookOpen size={13} />
                <span>{zeroProjects.length} zero projects</span>
              </div>
              <div className="quality-stat-chip">
                <Layers size={13} />
                <span>{overridden.length} overrides</span>
              </div>
            </div>
          </div>

          {/* Issue Category Navigation Tabs */}
          <div className="modal-tab-bar mb-3">
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Flagged ({totalFlagged})
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveTab('contact')}
            >
              Missing Contact ({missingPhone.length + missingEmail.length})
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              Zero Projects ({zeroProjects.length})
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              Low Skills ({lowSkills.length})
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'cgpa' ? 'active' : ''}`}
              onClick={() => setActiveTab('cgpa')}
            >
              CGPA &lt; 6.0 ({lowCgpa.length})
            </button>
            <button
              type="button"
              className={`modal-tab-btn ${activeTab === 'overrides' ? 'active' : ''}`}
              onClick={() => setActiveTab('overrides')}
            >
              Manual Overrides ({overridden.length})
            </button>
          </div>

          {/* Flagged Candidates Table */}
          <div className="table-responsive" style={{ maxHeight: '340px' }}>
            <table className="student-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>ID</th>
                  <th>Student Profile</th>
                  <th>Branch</th>
                  <th>CGPA</th>
                  <th>Flagged Issues & Action Required</th>
                  <th style={{ width: '120px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-400)' }}>
                      🎉 No candidate profiles flagged under this category.
                    </td>
                  </tr>
                ) : (
                  filteredList.map(({ student, issues }) => (
                    <tr key={student.id} className="student-row">
                      <td>
                        <span className="badge-id">#{student.externalId}</span>
                      </td>
                      <td>
                        <div className="candidate-cell">
                          <span className="candidate-name">{student.name}</span>
                          <span className="candidate-email">{student.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="branch-text">{student.branch}</span>
                      </td>
                      <td>
                        <span className={`cgpa-pill ${student.cgpa >= 8.5 ? 'high' : student.cgpa >= 7.0 ? 'mid' : 'low'}`}>
                          {student.cgpa.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {issues.map((iss, i) => (
                            <span key={i} className="issue-flag-pill">
                              <AlertTriangle size={12} />
                              <span>{iss}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            onClose();
                            onSelectStudent(student);
                          }}
                        >
                          <span>Dossier</span>
                          <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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

