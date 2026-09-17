import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  api,
  Student,
  DashboardSummary,
  User,
  Category,
  RulesetConfig,
  CompanyDrive,
  fetchCompanyDrives,
  createCompanyDrive,
} from './api';
import { Navbar } from './components/Navbar';
import { DashboardMetrics } from './components/DashboardMetrics';
import { FilterBar } from './components/FilterBar';
import { StudentTable } from './components/StudentTable';
import { StudentDossier } from './components/StudentDossier';
import { CsvImportModal } from './components/CsvImportModal';
import { JobMatcherModal } from './components/JobMatcherModal';
import { ComparisonModal } from './components/ComparisonModal';
import { RulesConfigModal } from './components/RulesConfigModal';
import { DataQualityModal } from './components/DataQualityModal';
import { AuditLogModal } from './components/AuditLogModal';
import { AddStudentModal } from './components/AddStudentModal';
import { StudentPortal } from './components/StudentPortal';
import { PostDriveModal } from './components/PostDriveModal';
import { DriveApplicantsModal } from './components/DriveApplicantsModal';
import { CompanyDrivesListModal } from './components/CompanyDrivesListModal';
import { EmailConfigModal } from './components/EmailConfigModal';
import { LoginView } from './components/LoginView';

export default function App() {
  // Authentication State: Default to null so Login View is always displayed first
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('screening_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentStudent, setCurrentStudent] = useState<Student | null>(() => {
    try {
      const saved = localStorage.getItem('screening_student');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [drives, setDrives] = useState<CompanyDrive[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activeRules, setActiveRules] = useState<RulesetConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [minCgpa, setMinCgpa] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillsMatchMode, setSkillsMatchMode] = useState<'AND' | 'OR'>('AND');
  const [category, setCategory] = useState('');
  const [branch, setBranch] = useState('');
  const [hasInternship, setHasInternship] = useState<boolean>(false);
  const [hasCertification, setHasCertification] = useState<boolean>(false);
  const [isOverriddenOnly, setIsOverriddenOnly] = useState<boolean>(false);

  // Sorting & Pagination State
  const [sortBy, setSortBy] = useState<'score' | 'cgpa' | 'name' | 'branch'>('cgpa');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Selection for bulk / comparison
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals & Drawer State
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<Student | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isJobMatcherOpen, setIsJobMatcherOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isDataQualityOpen, setIsDataQualityOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Company Drive & Email Modals
  const [isPostDriveOpen, setIsPostDriveOpen] = useState(false);
  const [isDrivesListOpen, setIsDrivesListOpen] = useState(false);
  const [isEmailConfigOpen, setIsEmailConfigOpen] = useState(false);
  const [selectedDriveForReview, setSelectedDriveForReview] = useState<CompanyDrive | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Build query params
  const buildQueryParams = useCallback(() => {
    const params: Record<string, any> = {};
    if (search.trim()) params.search = search.trim();
    if (minCgpa) params.minCgpa = minCgpa;
    if (selectedSkills.length > 0) {
      params.skills = selectedSkills.join(',');
      params.skillsMatchMode = skillsMatchMode;
    }
    if (category) params.category = category;
    if (branch) params.branch = branch;
    if (hasInternship) params.hasInternship = 'true';
    if (hasCertification) params.hasCertification = 'true';
    if (isOverriddenOnly) params.isOverridden = 'true';
    params.sortBy = sortBy;
    params.sortOrder = sortOrder;
    return params;
  }, [
    search,
    minCgpa,
    selectedSkills,
    skillsMatchMode,
    category,
    branch,
    hasInternship,
    hasCertification,
    isOverriddenOnly,
    sortBy,
    sortOrder,
  ]);

  // Fetch Core Candidate and Dashboard Data
  const fetchData = useCallback(async (overrideParams?: Record<string, any>) => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const baseParams = overrideParams || buildQueryParams();
      const params = { ...baseParams, _t: Date.now() };
      const [studentsRes, summaryRes, rulesRes, drivesRes] = await Promise.all([
        api.get('/api/students', { params }),
        api.get('/api/dashboard/summary', { params }),
        api.get('/api/rules', { params: { _t: Date.now() } }).catch(() => ({ data: { rules: null } })),
        fetchCompanyDrives().catch(() => []),
      ]);

      const fetchedStudents = studentsRes.data.students || [];
      setStudents(fetchedStudents);
      setSummary(summaryRes.data);
      setDrives(drivesRes || []);

      if (rulesRes.data?.rules) {
        setActiveRules(rulesRes.data.rules);
      }

      if (currentUser.role === 'STUDENT' && !currentStudent) {
        const matchingStudent = fetchedStudents.find(
          (s: Student) => s.id === Number(currentUser.id) || s.email.toLowerCase() === currentUser.email.toLowerCase()
        );
        if (matchingStudent) {
          setCurrentStudent(matchingStudent);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch candidate data');
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams, currentUser, currentStudent]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [fetchData, currentUser]);

  // Login handler
  const handleLoginSuccess = (authUser: any, authStudent?: Student) => {
    const formattedUser: User = {
      id: String(authUser.id),
      email: authUser.email,
      name: authUser.name,
      role: authUser.role === 'STUDENT' ? ('STUDENT' as any) : 'COORDINATOR',
    };
    setCurrentUser(formattedUser);
    try {
      localStorage.setItem('screening_user', JSON.stringify(formattedUser));
    } catch (_) {}

    if (authUser.role === 'STUDENT') {
      const st =
        authStudent ||
        students.find(
          (s) => s.id === Number(authUser.id) || s.email.toLowerCase() === authUser.email.toLowerCase()
        );
      if (st) {
        setCurrentStudent(st);
        try {
          localStorage.setItem('screening_student', JSON.stringify(st));
        } catch (_) {}
      }
      showToast(`Welcome ${authUser.name}! Logged in to your Student Placement Portal.`, 'success');
    } else {
      setCurrentStudent(null);
      try {
        localStorage.removeItem('screening_student');
      } catch (_) {}
      showToast(`Welcome ${authUser.name}! Logged in to Placement Coordinator Dashboard.`, 'success');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout').catch(() => {});
    } finally {
      setCurrentUser(null);
      setCurrentStudent(null);
      try {
        localStorage.removeItem('screening_user');
        localStorage.removeItem('screening_student');
      } catch (_) {}
      showToast('You have been signed out successfully.', 'info');
    }
  };

  // Available skills & branches for filters
  const availableSkills = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.skills?.forEach((sk) => set.add(sk)));
    return Array.from(set).sort();
  }, [students]);

  const availableBranches = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.branch) set.add(s.branch);
    });
    return Array.from(set).sort();
  }, [students]);

  const activeFilterCount =
    (search ? 1 : 0) +
    (minCgpa ? 1 : 0) +
    selectedSkills.length +
    (category ? 1 : 0) +
    (branch ? 1 : 0) +
    (hasInternship ? 1 : 0) +
    (hasCertification ? 1 : 0) +
    (isOverriddenOnly ? 1 : 0);

  // Real-time Reactive Dashboard Metrics computed instantaneously from students
  const liveSummary = useMemo<DashboardSummary | null>(() => {
    if (!students || students.length === 0) {
      return summary || null;
    }

    const total = students.length;
    let strong = 0;
    let average = 0;
    let needsImprovement = 0;
    let withInternship = 0;
    let withCertification = 0;
    let overriddenCount = 0;
    let cgpaSum = 0;
    let maxCgpa = 0;
    let minCgpa = total > 0 ? (Number(students[0]?.cgpa) || 10) : 0;

    const cgpaHistogram: Record<string, number> = {
      '<6.0': 0,
      '6.0–6.9': 0,
      '7.0–7.9': 0,
      '8.0–8.9': 0,
      '9.0–10.0': 0,
    };

    for (const s of students) {
      const cat = (s.isOverridden && s.overrideCategory) ? s.overrideCategory : s.category;
      if (cat === 'STRONG') strong++;
      else if (cat === 'AVERAGE') average++;
      else needsImprovement++;

      if (s.isOverridden) overriddenCount++;

      const numCgpa = Number(s.cgpa) || 0;
      cgpaSum += numCgpa;
      if (numCgpa > maxCgpa) maxCgpa = numCgpa;
      if (numCgpa < minCgpa) minCgpa = numCgpa;

      if (numCgpa < 6.0) cgpaHistogram['<6.0']++;
      else if (numCgpa < 7.0) cgpaHistogram['6.0–6.9']++;
      else if (numCgpa < 8.0) cgpaHistogram['7.0–7.9']++;
      else if (numCgpa < 9.0) cgpaHistogram['8.0–8.9']++;
      else cgpaHistogram['9.0–10.0']++;

      if (s.internships && s.internships.length > 0) withInternship++;
      if (s.certifications && s.certifications.length > 0) withCertification++;
    }

    const strongPct = total > 0 ? Math.round((strong / total) * 100) : 0;
    const avgPct = total > 0 ? Math.round((average / total) * 100) : 0;
    const needsPct = total > 0 ? Math.round((needsImprovement / total) * 100) : 0;
    const internshipRate = total > 0 ? Math.round((withInternship / total) * 100) : 0;
    const certificationRate = total > 0 ? Math.round((withCertification / total) * 100) : 0;
    const averageCgpa = total > 0 ? Number((cgpaSum / total).toFixed(2)) : 0;

    return {
      totalCohortCount: summary?.totalCohortCount ? Math.max(summary.totalCohortCount, total) : total,
      total,
      isFiltered: activeFilterCount > 0,
      strong,
      strongPct,
      average,
      avgPct,
      needsImprovement,
      needsPct,
      averageCgpa,
      maxCgpa: total > 0 ? maxCgpa : 0,
      minCgpa: total > 0 ? minCgpa : 0,
      withInternship,
      internshipRate,
      withCertification,
      certificationRate,
      overriddenCount,
      cgpaHistogram,
      topSkills: summary?.topSkills || [],
      branches: summary?.branches || [],
      rules: summary?.rules || {
        id: 'ruleset-default',
        version: 1,
        strongThreshold: 8,
        averageThreshold: 5,
        maxScore: 10,
      },
    };
  }, [students, summary, activeFilterCount]);

  const handleClearFilters = () => {
    setSearch('');
    setMinCgpa('');
    setSelectedSkills([]);
    setSkillsMatchMode('AND');
    setCategory('');
    setBranch('');
    setHasInternship(false);
    setHasCertification(false);
    setIsOverriddenOnly(false);
    setPage(1);
  };

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedStudents.length && paginatedStudents.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedStudents.map((s) => s.id));
    }
  };

  const handleToggleSelectRow = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSort = (column: 'score' | 'cgpa' | 'name' | 'branch') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'name' ? 'asc' : 'desc');
    }
    setPage(1);
  };

  // Manual Override Actions
  const handleSaveOverride = async (studentId: number, newCat: Category, reason: string) => {
    try {
      const res = await api.post(`/api/students/${studentId}/override`, {
        overrideCategory: newCat,
        overrideReason: reason,
        userName: currentUser?.name || 'Coordinator',
      });
      showToast(`Manual category override saved for candidate #${studentId}`);
      if (selectedStudentForDossier && selectedStudentForDossier.id === studentId) {
        setSelectedStudentForDossier(res.data.student);
      }
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to apply category override', 'error');
      throw err;
    }
  };

  const handleClearOverride = async (studentId: number) => {
    try {
      const res = await api.delete(`/api/students/${studentId}/override`);
      showToast(`Manual override cleared. Candidate restored to calculated score.`);
      if (selectedStudentForDossier && selectedStudentForDossier.id === studentId) {
        setSelectedStudentForDossier(res.data.student);
      }
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to clear override', 'error');
      throw err;
    }
  };

  // Bulk Actions
  const handleBulkMarkReviewed = async (isReviewed: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      await api.post('/api/students/bulk-action', {
        action: isReviewed ? 'MARK_REVIEWED' : 'UNMARK_REVIEWED',
        studentIds: selectedIds,
      });
      showToast(`Updated review status for ${selectedIds.length} candidate(s)`);
      setSelectedIds([]);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to execute bulk action', 'error');
    }
  };

  // Delete Candidate
  const handleDeleteStudent = async (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation();
    if (!window.confirm(`Delete candidate ${name} (#${id})?`)) return;
    try {
      await api.delete(`/api/students/${id}`);
      showToast(`Candidate ${name} deleted successfully`);
      if (selectedStudentForDossier?.id === id) setSelectedStudentForDossier(null);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete student', 'error');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const params = buildQueryParams();
    const queryStr = new URLSearchParams(params).toString();
    window.open(`/api/students/export?${queryStr}`, '_blank');
    showToast('Exporting candidate dataset to CSV...', 'info');
  };

  // Reset Sample Dataset
  const handleResetDataset = async () => {
    if (!window.confirm('Reset database to the benchmark 15-candidate dataset?')) return;
    try {
      setIsResetting(true);
      await api.post('/api/students/reset-sample');
      showToast('Benchmark cohort dataset restored successfully!');
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to reset dataset', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Post Drive Handler
  const handleCreateDrive = async (driveData: Partial<CompanyDrive>) => {
    const res = await createCompanyDrive(driveData);
    showToast(res.message, 'success');
    fetchData();
  };

  // Paginated Students Slice
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * pageSize;
    return students.slice(start, start + pageSize);
  }, [students, page, pageSize]);

  // Selected candidates for comparison modal
  const comparisonCandidates = useMemo(() => {
    return students.filter((s) => selectedIds.includes(s.id));
  }, [students, selectedIds]);

  // 1. IF NOT LOGGED IN -> Show Dedicated Login Screen
  if (!currentUser) {
    return (
      <div className="app-layout">
        {toastMessage && (
          <div className={`toast-notification toast-${toastMessage.type}`}>
            <span>{toastMessage.text}</span>
            <button type="button" className="btn-close-toast" onClick={() => setToastMessage(null)}>
              ×
            </button>
          </div>
        )}
        <LoginView onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  // 2. IF LOGGED IN AS STUDENT -> Show Pure Student Placement Portal
  if (currentUser.role === 'STUDENT') {
    const activeStudentObj =
      currentStudent ||
      students.find((s) => s.id === Number(currentUser.id) || s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      students[0];

    return (
      <div className="app-layout">
        {toastMessage && (
          <div className={`toast-notification toast-${toastMessage.type}`}>
            <span>{toastMessage.text}</span>
            <button type="button" className="btn-close-toast" onClick={() => setToastMessage(null)}>
              ×
            </button>
          </div>
        )}

        <Navbar
          user={currentUser}
          activeRules={activeRules}
          onOpenJobMatcher={() => {}}
          onOpenComparison={() => {}}
          onOpenRulesConfig={() => {}}
          onOpenDataQuality={() => {}}
          onOpenAuditLog={() => {}}
          onOpenImportModal={() => {}}
          onOpenAddModal={() => {}}
          onOpenPostDriveModal={() => {}}
          onOpenDrivesListModal={() => {}}
          onExportCsv={() => {}}
          onResetDataset={() => {}}
          onLogout={handleLogout}
          isResetting={isResetting}
          selectedCount={0}
          drivesCount={drives.length}
        />

        {activeStudentObj ? (
          <StudentPortal
            currentStudent={activeStudentObj}
            onUpdateStudent={(updated) => {
              setCurrentStudent(updated);
              fetchData();
            }}
            onNotify={showToast}
          />
        ) : (
          <div className="main-container">
            <div className="empty-state-wrap">
              <p>Loading your student profile...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. IF LOGGED IN AS COORDINATOR / ADMIN -> Show Coordinator Dashboard
  return (
    <div className="app-layout">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`toast-notification toast-${toastMessage.type}`}>
          <span>{toastMessage.text}</span>
          <button type="button" className="btn-close-toast" onClick={() => setToastMessage(null)}>
            ×
          </button>
        </div>
      )}

      {/* Clean Navbar */}
      <Navbar
        user={currentUser}
        activeRules={activeRules}
        onOpenJobMatcher={() => setIsJobMatcherOpen(true)}
        onOpenComparison={() => {
          if (selectedIds.length < 2) {
            showToast('Select 2 to 4 candidates in the table to compare them side-by-side.', 'info');
          }
          setIsComparisonOpen(true);
        }}
        onOpenRulesConfig={() => setIsRulesModalOpen(true)}
        onOpenDataQuality={() => setIsDataQualityOpen(true)}
        onOpenAuditLog={() => setIsAuditLogOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenPostDriveModal={() => setIsPostDriveOpen(true)}
        onOpenDrivesListModal={() => setIsDrivesListOpen(true)}
        onOpenEmailConfigModal={() => setIsEmailConfigOpen(true)}
        onExportCsv={handleExportCsv}
        onResetDataset={handleResetDataset}
        onLogout={handleLogout}
        isResetting={isResetting}
        selectedCount={selectedIds.length}
        drivesCount={drives.length}
      />

      <div className="main-container">
        {/* Dynamic Live-Filtered Dashboard KPI Cards & Visual Charts */}
        <DashboardMetrics
          summary={liveSummary}
          onClearFilters={handleClearFilters}
          isFiltered={activeFilterCount > 0}
        />

        {/* Multi-Dimensional Filter Toolbar */}
        <FilterBar
          search={search}
          setSearch={(v) => {
            setSearch(v);
            setPage(1);
          }}
          minCgpa={minCgpa}
          setMinCgpa={(v) => {
            setMinCgpa(v);
            setPage(1);
          }}
          selectedSkills={selectedSkills}
          onToggleSkill={(sk) => {
            handleToggleSkill(sk);
            setPage(1);
          }}
          skillsMatchMode={skillsMatchMode}
          setSkillsMatchMode={(m) => {
            setSkillsMatchMode(m);
            setPage(1);
          }}
          category={category}
          setCategory={(c) => {
            setCategory(c);
            setPage(1);
          }}
          branch={branch}
          setBranch={(b) => {
            setBranch(b);
            setPage(1);
          }}
          hasInternship={hasInternship}
          setHasInternship={(h) => {
            setHasInternship(h);
            setPage(1);
          }}
          hasCertification={hasCertification}
          setHasCertification={(c) => {
            setHasCertification(c);
            setPage(1);
          }}
          isOverriddenOnly={isOverriddenOnly}
          setIsOverriddenOnly={(o) => {
            setIsOverriddenOnly(o);
            setPage(1);
          }}
          availableBranches={availableBranches}
          availableSkills={availableSkills}
          onClearFilters={handleClearFilters}
          activeFilterCount={activeFilterCount}
        />

        {error && <div className="alert-box error mb-4">{error}</div>}

        {/* Student Roster Table */}
        <StudentTable
          students={paginatedStudents}
          loading={loading}
          selectedStudent={selectedStudentForDossier}
          onSelectStudent={(st) => setSelectedStudentForDossier(st)}
          onDeleteStudent={handleDeleteStudent}
          selectedIds={selectedIds}
          onToggleSelectAll={handleToggleSelectAll}
          onToggleSelectRow={handleToggleSelectRow}
          onOpenComparison={() => setIsComparisonOpen(true)}
          onBulkMarkReviewed={handleBulkMarkReviewed}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          page={page}
          pageSize={pageSize}
          totalStudents={students.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {/* Student Dossier Drawer (Slide Out From Right) */}
      {selectedStudentForDossier && (
        <StudentDossier
          student={selectedStudentForDossier}
          onClose={() => setSelectedStudentForDossier(null)}
          onSaveOverride={handleSaveOverride}
          onClearOverride={handleClearOverride}
        />
      )}

      {/* Post New Campus Drive Modal */}
      <PostDriveModal
        isOpen={isPostDriveOpen}
        onClose={() => setIsPostDriveOpen(false)}
        onSubmit={handleCreateDrive}
        totalStudentsCount={students.length}
      />

      {/* Company Drives Overview Modal */}
      <CompanyDrivesListModal
        drives={drives}
        isOpen={isDrivesListOpen}
        onClose={() => setIsDrivesListOpen(false)}
        onSelectDrive={(drive) => setSelectedDriveForReview(drive)}
        onOpenPostModal={() => setIsPostDriveOpen(true)}
      />

      {/* Drive Applicants Review & Shortlist Desk Modal */}
      <DriveApplicantsModal
        drive={selectedDriveForReview}
        isOpen={selectedDriveForReview !== null}
        onClose={() => setSelectedDriveForReview(null)}
        onNotify={showToast}
      />

      {/* SMTP Email Configuration Modal */}
      <EmailConfigModal
        isOpen={isEmailConfigOpen}
        onClose={() => setIsEmailConfigOpen(false)}
      />

      {/* CSV Ingestion Modal */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() => {
          showToast('CSV batch imported successfully!');
          fetchData();
        }}
      />

      {/* Recruiter Job Matcher Modal */}
      <JobMatcherModal
        isOpen={isJobMatcherOpen}
        onClose={() => setIsJobMatcherOpen(false)}
        availableBranches={availableBranches}
      />

      {/* Side-by-Side Comparison Matrix Modal */}
      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        candidates={comparisonCandidates}
      />

      {/* Scoring Weight & Threshold Config Modal */}
      {isRulesModalOpen && (
        <RulesConfigModal
          onClose={() => setIsRulesModalOpen(false)}
          onRulesUpdated={() => {
            fetchData();
            showToast('Scoring model updated and cohort scores recalculated!');
          }}
        />
      )}

      {/* Data Quality & Profile Completeness Modal */}
      {isDataQualityOpen && (
        <DataQualityModal
          students={students}
          onClose={() => setIsDataQualityOpen(false)}
          onSelectStudent={(st) => setSelectedStudentForDossier(st)}
        />
      )}

      {/* Audit Log Modal */}
      {isAuditLogOpen && <AuditLogModal onClose={() => setIsAuditLogOpen(false)} />}

      {/* Add Single Candidate Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStudentAdded={(newStudentOrName: any) => {
          const studentObj = typeof newStudentOrName === 'object' && newStudentOrName?.id ? newStudentOrName : null;
          const candidateName = studentObj ? studentObj.name : String(newStudentOrName || 'Candidate');
          showToast(`Candidate ${candidateName} added & evaluated successfully!`);

          if (studentObj) {
            setStudents((prev) => {
              const filtered = prev.filter((s) => s.id !== studentObj.id);
              const updated = [studentObj, ...filtered].sort((a, b) => {
                const diff = (Number(b.cgpa) || 0) - (Number(a.cgpa) || 0);
                if (diff !== 0) return diff;
                return (a.name || '').localeCompare(b.name || '');
              });
              return updated;
            });
          }

          setSearch('');
          setCategory('');
          setBranch('');
          setSelectedSkills([]);
          setMinCgpa('');
          setHasInternship(false);
          setHasCertification(false);
          setIsOverriddenOnly(false);
          setSortBy('cgpa');
          setSortOrder('desc');
          setPage(1);
          // Pass clean parameters immediately so both roster and dashboard metrics refresh synchronously
          fetchData({ sortBy: 'cgpa', sortOrder: 'desc' });
        }}
        availableBranches={availableBranches}
      />
    </div>
  );
}
