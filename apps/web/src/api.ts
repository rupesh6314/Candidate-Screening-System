/// <reference types="vite/client" />
import axios from 'axios';

export const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || '',
  withCredentials: true,
});

export type Category = 'STRONG' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';

export interface ScoreItemBreakdown {
  score: number;
  max: number;
  label: string;
  details: string;
  count?: number;
}

export interface ScoreBreakdown {
  cgpa: ScoreItemBreakdown;
  skills: ScoreItemBreakdown;
  projects: ScoreItemBreakdown;
  internships: ScoreItemBreakdown;
  certifications: ScoreItemBreakdown;
}

export interface Student {
  id: number;
  externalId: string;
  name: string;
  email: string;
  phone?: string | null;
  branch: string;
  cgpa: number;
  skills: string[];
  projects: string[];
  internships: string[];
  certifications: string[];
  score: number;
  maxScore?: number;
  calculatedCategory?: Category;
  category: Category;
  isOverridden?: boolean;
  overrideCategory?: Category | null;
  overrideReason?: string | null;
  overriddenBy?: string | null;
  overriddenAt?: string | null;
  isReviewed?: boolean;
  breakdown?: ScoreBreakdown;
  summaryReason?: string;
  formulaString?: string;
  strengths?: string[];
  recommendations?: string[];
  technicalSkillsCount?: number;
  nonTechnicalSkillsCount?: number;
  mustChangePassword?: boolean;
  profileImage?: string;
  resumeUrl?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BranchStat {
  branch: string;
  total: number;
  strong: number;
  average: number;
  needsImprovement: number;
}

export interface SkillStat {
  skill: string;
  count: number;
}

export interface DashboardSummary {
  totalCohortCount: number;
  total: number;
  isFiltered: boolean;
  strong: number;
  strongPct: number;
  average: number;
  avgPct: number;
  needsImprovement: number;
  needsPct: number;
  averageCgpa: number;
  maxCgpa: number;
  minCgpa: number;
  withInternship: number;
  internshipRate: number;
  withCertification: number;
  certificationRate: number;
  overriddenCount?: number;
  reviewedCount?: number;
  topSkills: SkillStat[];
  branches: BranchStat[];
  cgpaHistogram?: Record<string, number>;
  rules: {
    id: string;
    version: number;
    strongThreshold: number;
    averageThreshold: number;
    maxScore: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'COORDINATOR' | 'STUDENT';
}

export interface RulesetConfig {
  id: string;
  name: string;
  version: number;
  cgpaMax: number;
  skillsMax: number;
  projectsMax: number;
  internshipMax: number;
  certificationMax: number;
  strongThreshold: number;
  averageThreshold: number;
  nonTechnicalSkills: string[];
}

export interface ImpactPreviewItem {
  id?: number;
  externalId: string;
  name: string;
  currentScore: number;
  currentCategory: string;
  newScore: number;
  newCategory: string;
  scoreDelta: number;
  categoryChanged: boolean;
}

export interface CohortImpactPreview {
  currentRules: RulesetConfig;
  previewRules: RulesetConfig;
  totalStudents: number;
  strongDelta: number;
  averageDelta: number;
  needsImprovementDelta: number;
  students: ImpactPreviewItem[];
}

export interface JobRequirement {
  jobTitle: string;
  companyName: string;
  minCgpa: number;
  mandatorySkills: string[];
  optionalSkills: string[];
  internshipRequired: boolean;
  eligibleBranches: string[];
}

export interface CandidateJobMatch {
  candidate: Student;
  matchScore: number;
  tier: 'EXCELLENT_FIT' | 'GOOD_FIT' | 'PARTIAL_FIT' | 'NOT_ELIGIBLE';
  cgpaMatched: boolean;
  branchMatched: boolean;
  internshipMatched: boolean;
  mandatorySkillsMatched: string[];
  mandatorySkillsMissing: string[];
  optionalSkillsMatched: string[];
  matchReason: string;
}

export interface RowIngestIssue {
  field: string;
  severity: 'WARNING' | 'ERROR';
  message: string;
  originalValue: string;
  resolvedValue: any;
}

export interface RowIngestReport {
  rowNumber: number;
  externalId: string;
  name: string;
  status: 'ACCEPTED' | 'WARNING' | 'REJECTED';
  issues: RowIngestIssue[];
  data?: Student;
}

export interface IngestionSummaryReport {
  totalRows: number;
  acceptedCount: number;
  warningCount: number;
  rejectedCount: number;
  validStudents: any[];
  rowReports: RowIngestReport[];
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface CompanyDrive {
  id: string;
  companyName: string;
  logoUrl?: string;
  role: string;
  jobType: 'FULL_TIME' | 'INTERNSHIP' | 'INTERNSHIP_PPO';
  ctc: string;
  stipend: string;
  location: string;
  minCgpa: number;
  allowedBranches: string[];
  requiredSkills: string[];
  description: string;
  selectionProcess: string[];
  serviceAgreement: string;
  startDate: string;
  deadline: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  stats?: {
    eligibleCount: number;
    optedInCount: number;
    optedOutCount: number;
    shortlistedCount: number;
    pendingResponseCount: number;
    isDeadlinePassed: boolean;
  };
  studentResponse?: {
    status: 'OPTED_IN' | 'OPTED_OUT';
    responseAt: string;
    isShortlisted: boolean;
  } | null;
  isExpired?: boolean;
  timeRemainingMs?: number;
}

export interface DriveApplication {
  id: string;
  driveId: string;
  studentId: number;
  studentExternalId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentBranch: string;
  studentCgpa: number;
  studentSkills: string[];
  studentResumeUrl: string;
  studentAvatarUrl: string;
  status: 'OPTED_IN' | 'OPTED_OUT';
  responseAt: string;
  isShortlistedByCoordinator: boolean;
  coordinatorNotes?: string;
  sharedWithCompanyAt?: string | null;
  student?: Student;
}

export interface DriveNotification {
  id: string;
  studentId: number;
  studentEmail: string;
  driveId: string;
  companyName: string;
  subject: string;
  message: string;
  minCgpa: number;
  deadline: string;
  isRead: boolean;
  sentAt: string;
}

export interface StudentFeedsResponse {
  student: Student;
  feeds: {
    active: CompanyDrive[];
    notOptedIn: CompanyDrive[];
    all: CompanyDrive[];
  };
  counts: {
    active: number;
    notOptedIn: number;
    all: number;
  };
}

// Drive API Functions
export const fetchCompanyDrives = async (): Promise<CompanyDrive[]> => {
  const res = await api.get('/api/drives');
  return res.data.drives;
};

export const createCompanyDrive = async (driveData: Partial<CompanyDrive>): Promise<{ drive: CompanyDrive; eligibleStudentsCount: number; message: string }> => {
  const res = await api.post('/api/drives', driveData);
  return res.data;
};

export const fetchDriveApplicants = async (driveId: string): Promise<{
  drive: CompanyDrive;
  optedIn: DriveApplication[];
  optedOut: DriveApplication[];
  shortlisted: DriveApplication[];
  summary: { totalOptedIn: number; totalOptedOut: number; totalShortlisted: number };
}> => {
  const res = await api.get(`/api/drives/${driveId}/applicants`);
  return res.data;
};

export const updateApplicantShortlist = async (
  driveId: string,
  studentId: number,
  isShortlisted: boolean,
  coordinatorNotes?: string
): Promise<DriveApplication> => {
  const res = await api.patch(`/api/drives/${driveId}/applicants/${studentId}`, {
    isShortlisted,
    coordinatorNotes,
  });
  return res.data.application;
};

export const shareDriveWithCompany = async (driveId: string): Promise<{
  success: boolean;
  message: string;
  dispatchedCount: number;
  candidates: DriveApplication[];
  sharedAt: string;
}> => {
  const res = await api.post(`/api/drives/${driveId}/share-with-company`);
  return res.data;
};

export const fetchStudentDriveFeeds = async (studentId: number): Promise<StudentFeedsResponse> => {
  const res = await api.get(`/api/drives/student/${studentId}`);
  return res.data;
};

export const submitStudentDriveResponse = async (
  studentId: number,
  driveId: string,
  status: 'OPTED_IN' | 'OPTED_OUT'
): Promise<{ success: boolean; message: string; application: DriveApplication }> => {
  const res = await api.post(`/api/drives/student/${studentId}/respond`, { driveId, status });
  return res.data;
};

export const fetchStudentNotifications = async (studentId: number): Promise<DriveNotification[]> => {
  const res = await api.get(`/api/drives/student/${studentId}/notifications`);
  return res.data.notifications;
};

export const updateStudentProfile = async (
  studentId: number,
  profileData: Partial<Student> & { profileImage?: string; resumeUrl?: string; bio?: string }
): Promise<Student> => {
  const res = await api.put(`/api/drives/student/${studentId}/profile`, profileData);
  return res.data.student;
};

export const changeStudentPassword = async (
  studentId: number,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string; mustChangePassword?: boolean }> => {
  const res = await api.post('/api/auth/change-password', {
    studentId,
    oldPassword,
    newPassword,
  });
  return res.data;
};



