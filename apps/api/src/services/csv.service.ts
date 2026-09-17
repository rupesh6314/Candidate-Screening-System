import { parse } from 'csv-parse/sync';
import { categorize, normalizeList, sanitizeCgpa, RulesetConfig } from './categorization.service.js';

export interface ParsedStudentRow {
  externalId: string;
  name: string;
  email: string;
  phone: string | null;
  branch: string;
  cgpa: number;
  skills: string[];
  projects: string[];
  internships: string[];
  certifications: string[];
  score: number;
  category: 'STRONG' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
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
  data?: ParsedStudentRow;
}

export interface IngestionSummaryReport {
  totalRows: number;
  acceptedCount: number;
  warningCount: number;
  rejectedCount: number;
  validStudents: ParsedStudentRow[];
  rowReports: RowIngestReport[];
}

const REQUIRED_HEADERS = ['id', 'name', 'email', 'branch', 'cgpa'];

/**
 * Robustly parses CSV text with schema validation, dirty data recovery,
 * structured normalization, and per-row audit reporting.
 */
export function parseStudentsCsvWithReport(
  csvContent: string,
  customRules?: Partial<RulesetConfig>
): IngestionSummaryReport {
  if (!csvContent || !csvContent.trim()) {
    throw new Error('CSV file is empty.');
  }

  let records: any[] = [];
  try {
    records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      trim: true,
      relax_column_count: true,
      skip_records_with_error: false,
    });
  } catch (err: any) {
    throw new Error(`CSV Parsing Syntax Error: ${err.message}`);
  }

  if (records.length === 0) {
    throw new Error('CSV contains no data rows.');
  }

  // Header Validation
  const headerKeys = Object.keys(records[0] || {}).map((k) => k.toLowerCase().trim());
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !headerKeys.some((k) => k === h || k.includes(h)));
  if (missingHeaders.length > 0) {
    throw new Error(
      `Invalid CSV Template Schema. Missing required column headers: ${missingHeaders.join(', ').toUpperCase()}. Expected headers: ID, Name, Email, Phone, Branch, CGPA, Skills, Projects, Internships, Certifications.`
    );
  }

  const seenIds = new Set<string>();
  const seenEmails = new Set<string>();

  const validStudents: ParsedStudentRow[] = [];
  const rowReports: RowIngestReport[] = [];

  let acceptedCount = 0;
  let warningCount = 0;
  let rejectedCount = 0;

  for (let i = 0; i < records.length; i++) {
    const raw = records[i];
    const rowNumber = i + 2; // 1-indexed accounting for header row
    const issues: RowIngestIssue[] = [];

    // Helper to extract field case-insensitively
    const getField = (pattern: RegExp, fallback = '') => {
      for (const [k, v] of Object.entries(raw)) {
        if (pattern.test(k)) return String(v ?? '').trim();
      }
      return fallback;
    };

    const rawId = getField(/^id$/i) || getField(/id/i, `STU-${rowNumber}`);
    const rawName = getField(/^name$/i) || getField(/name/i, 'Unknown Candidate');
    const rawEmail = getField(/^email$/i) || getField(/email/i, '');
    const rawPhone = getField(/^phone$/i) || getField(/phone|mobile|contact/i, '');
    const rawBranch = getField(/^branch$/i) || getField(/branch|dept|department/i, 'General Engineering');
    const rawCgpa = getField(/^cgpa$/i) || getField(/cgpa|gpa|percentage/i, '0');
    const rawSkills = getField(/^skills?$/i) || getField(/skills/i, '');
    const rawProjects = getField(/^projects?$/i) || getField(/projects/i, '');
    const rawInternships = getField(/^internships?$/i) || getField(/intern/i, '');
    const rawCertifications = getField(/^certifications?$/i) || getField(/cert/i, '');

    // 1. External ID
    let externalId = rawId.trim();
    if (!externalId) {
      externalId = `STU-${rowNumber}`;
      issues.push({
        field: 'ID',
        severity: 'WARNING',
        message: `Empty ID; auto-assigned ${externalId}`,
        originalValue: rawId,
        resolvedValue: externalId,
      });
    } else if (seenIds.has(externalId.toLowerCase())) {
      const uniqueId = `${externalId}-dup${rowNumber}`;
      issues.push({
        field: 'ID',
        severity: 'WARNING',
        message: `Duplicate ID '${externalId}' detected; converted to '${uniqueId}'`,
        originalValue: externalId,
        resolvedValue: uniqueId,
      });
      externalId = uniqueId;
    }
    seenIds.add(externalId.toLowerCase());

    // 2. Name
    const name = rawName.trim();
    if (!name || name === 'Unknown Candidate') {
      issues.push({
        field: 'Name',
        severity: 'WARNING',
        message: 'Name was missing or blank',
        originalValue: rawName,
        resolvedValue: name || 'Unnamed Candidate',
      });
    }

    // 3. Email
    let email = rawEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      const generatedEmail = `student_${externalId.toLowerCase().replace(/[^a-z0-9]/g, '')}@placement.edu`;
      issues.push({
        field: 'Email',
        severity: 'WARNING',
        message: `Invalid or missing email '${rawEmail}'; generated fallback '${generatedEmail}'`,
        originalValue: rawEmail,
        resolvedValue: generatedEmail,
      });
      email = generatedEmail;
    } else if (seenEmails.has(email)) {
      const uniqueEmail = `dup_${rowNumber}_${email}`;
      issues.push({
        field: 'Email',
        severity: 'WARNING',
        message: `Duplicate email '${email}' detected; adjusted to '${uniqueEmail}'`,
        originalValue: email,
        resolvedValue: uniqueEmail,
      });
      email = uniqueEmail;
    }
    seenEmails.add(email);

    // 4. Phone
    const phone = rawPhone.trim() ? rawPhone.trim() : null;

    // 5. Branch
    const branch = rawBranch.trim() || 'General Engineering';

    // 6. CGPA Sanitization
    const cgpaResult = sanitizeCgpa(rawCgpa);
    if (cgpaResult.isWarning) {
      issues.push({
        field: 'CGPA',
        severity: 'WARNING',
        message: `Dirty/unformatted CGPA value '${rawCgpa}' was safely parsed as ${cgpaResult.cgpa}`,
        originalValue: rawCgpa,
        resolvedValue: cgpaResult.cgpa,
      });
    }

    // 7. Structured Normalization
    const skills = normalizeList(rawSkills);
    if (!skills.length && rawSkills && !/^(none|null|n\/a|na|-)$/i.test(rawSkills.trim())) {
      issues.push({
        field: 'Skills',
        severity: 'WARNING',
        message: `Skills input '${rawSkills}' contained negative or unparseable indicators and was normalized to empty list`,
        originalValue: rawSkills,
        resolvedValue: [],
      });
    }

    const projects = normalizeList(rawProjects);
    const internships = normalizeList(rawInternships);
    const certifications = normalizeList(rawCertifications);

    // 8. Categorization Evaluation
    const evaluation = categorize(
      {
        cgpa: cgpaResult.cgpa,
        skills,
        projects,
        internships,
        certifications,
      },
      customRules
    );

    const parsedStudent: ParsedStudentRow = {
      externalId,
      name: name || 'Unnamed Candidate',
      email,
      phone,
      branch,
      cgpa: cgpaResult.cgpa,
      skills,
      projects,
      internships,
      certifications,
      score: evaluation.score,
      category: evaluation.category,
    };

    const isRejected = false; // We successfully recover all rows with clear warnings
    const status: 'ACCEPTED' | 'WARNING' | 'REJECTED' = isRejected
      ? 'REJECTED'
      : issues.length > 0
      ? 'WARNING'
      : 'ACCEPTED';

    if (status === 'ACCEPTED') acceptedCount++;
    else if (status === 'WARNING') warningCount++;
    else rejectedCount++;

    validStudents.push(parsedStudent);
    rowReports.push({
      rowNumber,
      externalId,
      name: parsedStudent.name,
      status,
      issues,
      data: parsedStudent,
    });
  }

  return {
    totalRows: records.length,
    acceptedCount,
    warningCount,
    rejectedCount,
    validStudents,
    rowReports,
  };
}

/**
 * Backward compatible parser function.
 */
export function parseStudentsCsv(csv: string): ParsedStudentRow[] {
  const result = parseStudentsCsvWithReport(csv);
  return result.validStudents;
}


