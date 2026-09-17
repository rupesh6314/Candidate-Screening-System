import React from 'react';
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Eye,
  Trash2,
  CheckCircle2,
  BriefcaseBusiness,
  Award,
  Layers,
  Sparkles,
  Scale,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Student, Category } from '../api';

interface StudentTableProps {
  students: Student[];
  loading: boolean;
  selectedStudent: Student | null;
  onSelectStudent: (s: Student) => void;
  onDeleteStudent: (e: React.MouseEvent, id: number, name: string) => void;
  selectedIds: number[];
  onToggleSelectAll: () => void;
  onToggleSelectRow: (id: number) => void;
  onOpenComparison: () => void;
  onBulkMarkReviewed: (isReviewed: boolean) => void;
  sortBy: 'score' | 'cgpa' | 'name' | 'branch';
  sortOrder: 'asc' | 'desc';
  onSort: (column: 'score' | 'cgpa' | 'name' | 'branch') => void;
  page: number;
  pageSize: number;
  totalStudents: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  loading,
  selectedStudent,
  onSelectStudent,
  onDeleteStudent,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectRow,
  onOpenComparison,
  onBulkMarkReviewed,
  sortBy,
  sortOrder,
  onSort,
  page,
  pageSize,
  totalStudents,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(totalStudents / pageSize) || 1;
  const allSelected = students.length > 0 && students.every((s) => selectedIds.includes(s.id));

  const renderSortIcon = (column: 'score' | 'cgpa' | 'name' | 'branch') => {
    if (sortBy !== column) {
      return <ArrowUpDown size={13} className="sort-icon-idle" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUp size={13} className="sort-icon-active" />
    ) : (
      <ChevronDown size={13} className="sort-icon-active" />
    );
  };

  const getCategoryBadgeClass = (category: Category | string) => {
    if (category === 'STRONG') return 'badge-category strong';
    if (category === 'AVERAGE') return 'badge-category average';
    return 'badge-category needs';
  };

  const getCategoryLabel = (category: Category | string) => {
    if (category === 'STRONG') return 'Strong';
    if (category === 'AVERAGE') return 'Average';
    return 'Needs Improvement';
  };

  return (
    <div className="table-container-card">
      {/* Bulk Action Header Toolbar (when items selected) */}
      {selectedIds.length > 0 && (
        <div className="bulk-toolbar">
          <span className="bulk-count">
            <strong>{selectedIds.length}</strong> student(s) selected
          </span>
          <div className="bulk-btn-group">
            {selectedIds.length >= 2 && selectedIds.length <= 4 && (
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={onOpenComparison}
              >
                <Scale size={14} />
                <span>Compare Selected ({selectedIds.length})</span>
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => onBulkMarkReviewed(true)}
            >
              <CheckCircle2 size={14} />
              <span>Mark Reviewed</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => onBulkMarkReviewed(false)}
            >
              <span>Unmark Reviewed</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Student Directory Table */}
      <div className="table-responsive">
        <table className="student-table" aria-label="Placement Candidate Screening Directory">
          <thead>
            <tr>
              <th className="th-select" style={{ width: '40px' }}>
                <button
                  type="button"
                  className="btn-checkbox"
                  onClick={onToggleSelectAll}
                  aria-label="Select all students on page"
                >
                  {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
              </th>
              <th className="th-id" style={{ width: '70px' }}>ID</th>
              <th className="th-candidate" onClick={() => onSort('name')}>
                <div className="th-content">
                  <span>Candidate Profile</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th className="th-branch" onClick={() => onSort('branch')}>
                <div className="th-content">
                  <span>Branch</span>
                  {renderSortIcon('branch')}
                </div>
              </th>
              <th className="th-cgpa" onClick={() => onSort('cgpa')}>
                <div className="th-content">
                  <span>CGPA</span>
                  {renderSortIcon('cgpa')}
                </div>
              </th>
              <th className="th-skills">Technical Skills</th>
              <th className="th-projects">Projects</th>
              <th className="th-internships">Internships</th>
              <th className="th-certs">Certifications</th>
              <th className="th-score" onClick={() => onSort('score')}>
                <div className="th-content">
                  <span>Score (10)</span>
                  {renderSortIcon('score')}
                </div>
              </th>
              <th className="th-category">Tier Category</th>
              <th className="th-actions" style={{ width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={12} className="td-loading">
                  <div className="loading-spinner-wrap">
                    <div className="spinner" />
                    <span>Evaluating cohort candidate records...</span>
                  </div>
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={12} className="td-empty">
                  <div className="empty-state-wrap">
                    <Sparkles size={36} className="empty-icon" />
                    <h3>No Candidates Match Active Filters</h3>
                    <p>Try adjusting your search query, minimum CGPA slider, or technical skills.</p>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const isSelected = selectedIds.includes(student.id);
                const isDossierOpen = selectedStudent?.id === student.id;

                return (
                  <tr
                    key={student.id}
                    className={`student-row ${isDossierOpen ? 'row-active' : ''} ${isSelected ? 'row-selected' : ''}`}
                    onClick={() => onSelectStudent(student)}
                  >
                    {/* Checkbox */}
                    <td
                      className="td-checkbox"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelectRow(student.id);
                      }}
                    >
                      <button type="button" className="btn-checkbox" aria-label={`Select ${student.name}`}>
                        {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>

                    {/* External ID */}
                    <td className="td-id">
                      <span className="badge-id">#{student.externalId}</span>
                    </td>

                    {/* Candidate Name & Contact */}
                    <td className="td-candidate">
                      <div className="candidate-cell">
                        <span className="candidate-name">{student.name}</span>
                        <span className="candidate-email">{student.email}</span>
                        {student.phone && <span className="candidate-phone">{student.phone}</span>}
                      </div>
                    </td>

                    {/* Branch */}
                    <td className="td-branch">
                      <span className="branch-text">{student.branch}</span>
                    </td>

                    {/* CGPA */}
                    <td className="td-cgpa">
                      <span className={`cgpa-pill ${student.cgpa >= 8.5 ? 'high' : student.cgpa >= 7.0 ? 'mid' : 'low'}`}>
                        {Number(student.cgpa).toFixed(2)}
                      </span>
                    </td>

                    {/* Skills Pills */}
                    <td className="td-skills">
                      <div className="table-skill-tags">
                        {student.skills && student.skills.length > 0 ? (
                          <>
                            {student.skills.slice(0, 3).map((sk) => (
                              <span key={sk} className="table-skill-pill">
                                {sk}
                              </span>
                            ))}
                            {student.skills.length > 3 && (
                              <span className="table-skill-more" title={student.skills.slice(3).join(', ')}>
                                +{student.skills.length - 3}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-muted">None listed</span>
                        )}
                      </div>
                    </td>

                    {/* Projects */}
                    <td className="td-projects">
                      {student.projects && student.projects.length > 0 ? (
                        <div className="table-project-wrap">
                          <span className="project-count-badge">{student.projects.length} project(s)</span>
                          <span className="project-snippet" title={student.projects.join(', ')}>
                            {student.projects[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted">0 projects</span>
                      )}
                    </td>

                    {/* Internships */}
                    <td className="td-internships">
                      {student.internships && student.internships.length > 0 ? (
                        <div className="internship-badge-wrap">
                          <BriefcaseBusiness size={13} />
                          <span className="internship-text" title={student.internships.join(', ')}>
                            {student.internships[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    {/* Certifications */}
                    <td className="td-certs">
                      {student.certifications && student.certifications.length > 0 ? (
                        <div className="cert-badge-wrap">
                          <Award size={13} />
                          <span className="cert-text" title={student.certifications.join(', ')}>
                            {student.certifications.length} cert(s)
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>

                    {/* 10-Point Score Bar */}
                    <td className="td-score">
                      <div className="score-meter-cell">
                        <div className="score-num-wrap">
                          <span className="score-main">{student.score}</span>
                          <span className="score-max">/10</span>
                        </div>
                        <div className="score-bar-track">
                          <div
                            className={`score-bar-fill ${student.score >= 8 ? 'strong' : student.score >= 5 ? 'average' : 'needs'}`}
                            style={{ width: `${Math.min(100, (student.score / 10) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Category Tier Badge */}
                    <td className="td-category">
                      <div className="category-cell-wrap">
                        <span className={getCategoryBadgeClass(student.category)}>
                          {getCategoryLabel(student.category)}
                        </span>
                        {student.isOverridden && (
                          <span className="badge-overridden" title={`Manually overridden by ${student.overriddenBy || 'Admin'}: ${student.overrideReason}`}>
                            <Layers size={10} /> Overridden
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td
                      className="td-actions"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="row-action-btns">
                        <button
                          type="button"
                          className="btn-action-icon view"
                          onClick={() => onSelectStudent(student)}
                          title="Open Candidate Dossier"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn-action-icon delete"
                          onClick={(e) => onDeleteStudent(e, student.id, student.name)}
                          title="Delete Candidate Record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="pagination-footer">
        <div className="page-size-selector">
          <span>Rows per page:</span>
          <select
            className="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={15}>15 (All Official)</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="pagination-total-text">
            Showing {students.length} of {totalStudents} candidate(s)
          </span>
        </div>

        <div className="pagination-controls">
          <button
            type="button"
            className="btn-page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </button>
          <span className="page-indicator">
            Page <strong>{page}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            type="button"
            className="btn-page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
