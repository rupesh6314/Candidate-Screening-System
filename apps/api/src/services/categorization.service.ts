export type CandidateInput = {
  cgpa: number | string;
  skills: string[] | string;
  projects: string[] | string;
  internships: string[] | string;
  certifications: string[] | string;
};

export type Category = 'STRONG' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';

export interface ScoreItemBreakdown {
  score: number;
  max: number;
  count?: number;
  label: string;
  details: string;
}

export interface ScoreBreakdown {
  cgpa: ScoreItemBreakdown;
  skills: ScoreItemBreakdown;
  projects: ScoreItemBreakdown;
  internships: ScoreItemBreakdown;
  certifications: ScoreItemBreakdown;
}

export interface CategorizationResult {
  score: number;
  maxScore: number;
  category: Category;
  breakdown: ScoreBreakdown;
  summaryReason: string;
  formulaString: string;
  strengths: string[];
  recommendations: string[];
  technicalSkillsCount: number;
  nonTechnicalSkillsCount: number;
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

export const DEFAULT_RULES: RulesetConfig = {
  id: 'ruleset-v1-default',
  name: 'Standard College Placement Rubric 2026',
  version: 1,
  cgpaMax: 4.0,
  skillsMax: 2.0,
  projectsMax: 2.0,
  internshipMax: 1.0,
  certificationMax: 1.0,
  strongThreshold: 8.0,
  averageThreshold: 5.0,
  nonTechnicalSkills: [
    'ms word',
    'ms excel',
    'ms office',
    'excel',
    'word',
    'powerpoint',
    'windows',
    'data entry',
    'basic computer',
    'typing',
    'internet browsing',
  ],
};

// Aliased for backward compatibility with existing tests and modules
export const RULES = {
  cgpa: [
    { min: 9.0, points: 4.0, label: 'Exceptional (≥9.0)' },
    { min: 8.0, points: 3.0, label: 'Strong (8.0–8.99)' },
    { min: 7.0, points: 2.0, label: 'Good (7.0–7.99)' },
    { min: 6.0, points: 1.0, label: 'Moderate (6.0–6.99)' },
    { min: 0.0, points: 0.0, label: 'At Risk (<6.0)' },
  ],
  skills: [
    { min: 5, points: 2.0, label: 'Comprehensive (5+ skills)' },
    { min: 3, points: 1.0, label: 'Adequate (3–4 skills)' },
    { min: 0, points: 0.0, label: 'Limited (0–2 skills)' },
  ],
  projects: [
    { min: 3, points: 2.0, label: 'Extensive (3+ projects)' },
    { min: 1, points: 1.0, label: 'Foundational (1–2 projects)' },
    { min: 0, points: 0.0, label: 'No Projects Listed' },
  ],
  internship: { points: 1.0, max: 1.0 },
  certification: { points: 1.0, max: 1.0 },
  thresholds: {
    strong: DEFAULT_RULES.strongThreshold,
    average: DEFAULT_RULES.averageThreshold,
  },
} as const;

/**
 * Robustly normalizes list inputs from CSV, arrays, or free text.
 * Strips "None", "N/A", "-", whitespace, and deduplicates.
 */
export function normalizeList(value: unknown): string[] {
  if (value == null) return [];
  const rawList = Array.isArray(value)
    ? value
    : String(value).split(/[,;|\n\r]+/);

  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of rawList) {
    const trimmed = String(item).trim();
    if (!trimmed) continue;
    // Discard empty/negative indicators
    if (/^(none|null|n\/a|na|-|nil|not applicable|no|n\.a\.|0)$/i.test(trimmed)) {
      continue;
    }
    const lower = trimmed.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(trimmed);
    }
  }

  return result;
}

/**
 * Sanitizes dirty CGPA inputs like "8.5/10", "9.2 ", "abc", null.
 */
export function sanitizeCgpa(value: unknown): { cgpa: number; isWarning: boolean; original: string } {
  const original = String(value ?? '').trim();
  if (!original || /^(none|null|n\/a|na|-)$/i.test(original)) {
    return { cgpa: 0, isWarning: true, original };
  }

  const isPureNumber = /^\d+(\.\d+)?$/.test(original);
  const isNegative = original.startsWith('-');

  const match = original.match(/(\d+(\.\d+)?)/);
  if (!match) {
    return { cgpa: 0, isWarning: true, original };
  }

  let num = parseFloat(match[0]);
  if (isNaN(num)) {
    return { cgpa: 0, isWarning: true, original };
  }

  let isWarning = !isPureNumber || isNegative;
  if (isNegative) {
    num = 0;
  } else if (num > 10) {
    if (num <= 100) {
      num = Number((num / 10).toFixed(2));
      isWarning = true;
    } else {
      num = 10;
      isWarning = true;
    }
  } else if (num < 0) {
    num = 0;
    isWarning = true;
  }

  return { cgpa: Number(num.toFixed(2)), isWarning, original };
}

/**
 * Evaluates academic CGPA score against configured max points.
 */
function evaluateCgpa(
  cgpa: number,
  cgpaMax: number
): { points: number; label: string; details: string } {
  const numericCgpa = Math.max(0, Math.min(10, Number(cgpa) || 0));
  let points = 0;
  let label = 'At Risk (<6.0)';

  if (numericCgpa >= 9.0) {
    points = cgpaMax;
    label = 'Exceptional (≥9.0)';
  } else if (numericCgpa >= 8.0) {
    points = Number((cgpaMax * 0.75).toFixed(2));
    label = 'Strong (8.0–8.99)';
  } else if (numericCgpa >= 7.0) {
    points = Number((cgpaMax * 0.5).toFixed(2));
    label = 'Good (7.0–7.99)';
  } else if (numericCgpa >= 6.0) {
    points = Number((cgpaMax * 0.25).toFixed(2));
    label = 'Moderate (6.0–6.99)';
  } else {
    points = 0;
    label = 'At Risk (<6.0)';
  }

  const details = `CGPA ${numericCgpa.toFixed(2)} earns ${points}/${cgpaMax} pts (${label}).`;
  return { points, label, details };
}

/**
 * Evaluates technical skills, distinguishing modern tech stacks from basic office tools.
 */
function evaluateSkills(
  skills: string[],
  skillsMax: number,
  nonTechnicalList: string[]
): {
  points: number;
  label: string;
  details: string;
  technicalCount: number;
  nonTechnicalCount: number;
} {
  const nonTechSet = new Set(nonTechnicalList.map((s) => s.toLowerCase().trim()));
  let technicalCount = 0;
  let nonTechnicalCount = 0;

  for (const s of skills) {
    if (nonTechSet.has(s.toLowerCase().trim())) {
      nonTechnicalCount++;
    } else {
      technicalCount++;
    }
  }

  let points = 0;
  let label = 'Limited (0–2 skills)';

  if (technicalCount >= 5) {
    points = skillsMax;
    label = 'Comprehensive (5+ skills)';
  } else if (technicalCount >= 3) {
    points = Number((skillsMax * 0.5).toFixed(2));
    label = 'Adequate (3–4 skills)';
  } else if (technicalCount >= 1) {
    points = Number((skillsMax * 0.25).toFixed(2));
    label = 'Basic (1–2 skills)';
  } else {
    points = 0;
    label = 'Non-technical only / None';
  }

  const details =
    technicalCount > 0
      ? `${technicalCount} relevant technical skill${technicalCount === 1 ? '' : 's'} listed earns ${points}/${skillsMax} pts (${label}).`
      : `${nonTechnicalCount > 0 ? `${nonTechnicalCount} non-technical tool(s) listed (0 pts). ` : ''}No core software engineering skills listed (0/${skillsMax} pts).`;

  return { points, label, details, technicalCount, nonTechnicalCount };
}

/**
 * Evaluates projects score points.
 */
function evaluateProjects(
  projects: string[],
  projectsMax: number
): { points: number; label: string; details: string } {
  const count = projects.length;
  let points = 0;
  let label = 'No Projects Listed';

  if (count >= 3) {
    points = projectsMax;
    label = 'Extensive (3+ projects)';
  } else if (count >= 1) {
    points = Number((projectsMax * 0.5).toFixed(2));
    label = 'Foundational (1–2 projects)';
  } else {
    points = 0;
    label = 'No Projects Listed';
  }

  const details =
    count > 0
      ? `${count} project${count === 1 ? '' : 's'} listed earns ${points}/${projectsMax} pts (${label}).`
      : `No verified practical projects listed (0/${projectsMax} pts).`;

  return { points, label, details };
}

/**
 * Evaluates internship experience.
 */
function evaluateInternships(
  internships: string[],
  internshipMax: number
): { points: number; label: string; details: string } {
  const count = internships.length;
  const hasInternship = count > 0;
  const points = hasInternship ? internshipMax : 0;
  const label = hasInternship ? 'Internship Verified' : 'No Internship Listed';
  const details = hasInternship
    ? `Demonstrated real-world industry experience with ${count} internship${count === 1 ? '' : 's'} (+${points}/${internshipMax} pts).`
    : `No verified industry internship recorded (0/${internshipMax} pts).`;

  return { points, label, details };
}

/**
 * Evaluates certifications.
 */
function evaluateCertifications(
  certifications: string[],
  certMax: number
): { points: number; label: string; details: string } {
  const count = certifications.length;
  const hasCert = count > 0;
  const points = hasCert ? certMax : 0;
  const label = hasCert ? 'Certified' : 'No Certifications Listed';
  const details = hasCert
    ? `Holds ${count} recognized professional credential${count === 1 ? '' : 's'} (+${points}/${certMax} pts).`
    : `No professional certifications recorded (0/${certMax} pts).`;

  return { points, label, details };
}

/**
 * Generates transparent explainability descriptions, strengths, and recommendations.
 */
function generateExplanations(
  input: { cgpa: number; skills: string[]; projects: string[]; internships: string[]; certifications: string[] },
  score: number,
  maxScore: number,
  category: Category,
  technicalCount: number
): { summaryReason: string; formulaString: string; strengths: string[]; recommendations: string[] } {
  const strengths: string[] = [];
  const recommendations: string[] = [];

  if (input.cgpa >= 8.5) {
    strengths.push(`High academic distinction (CGPA ${input.cgpa.toFixed(2)})`);
  } else if (input.cgpa >= 7.5) {
    strengths.push(`Good academic baseline (CGPA ${input.cgpa.toFixed(2)})`);
  }

  if (input.internships.length > 0) {
    strengths.push(`Industry internship experience (${input.internships[0]})`);
  }

  if (input.projects.length >= 2) {
    strengths.push(`Demonstrated project execution with ${input.projects.length} verified projects`);
  } else if (input.projects.length === 1) {
    strengths.push(`Practical project experience (${input.projects[0]})`);
  }

  if (technicalCount >= 3) {
    strengths.push(`Solid technical skill stack (${input.skills.slice(0, 3).join(', ')})`);
  }

  if (input.certifications.length > 0) {
    strengths.push(`Professional credentialing (${input.certifications[0]})`);
  }

  if (input.internships.length === 0) {
    recommendations.push('Target summer/winter industry internship or live client projects to build field experience.');
  }

  if (input.projects.length < 2) {
    recommendations.push('Develop 1–2 full-stack or domain-specific capstone projects with GitHub repositories.');
  }

  if (technicalCount < 3) {
    recommendations.push('Expand core stack proficiency (e.g. modern web frameworks, SQL/databases, cloud tools).');
  }

  if (input.certifications.length === 0) {
    recommendations.push('Pursue recognized industry certifications (AWS, Azure, Meta, Google, Oracle) to validate domain skills.');
  }

  if (input.cgpa < 6.5) {
    recommendations.push('Prioritize academic remediation to meet baseline eligibility criteria for tier-1 visiting recruiters.');
  }

  let summaryReason = '';
  if (category === 'STRONG') {
    const highlight =
      input.internships.length > 0 && input.cgpa >= 8.5
        ? `outstanding academic standing (CGPA ${input.cgpa.toFixed(1)}) and verified industry internship experience`
        : input.cgpa >= 8.5
        ? `exceptional academics (CGPA ${input.cgpa.toFixed(1)}) and a versatile technical portfolio`
        : `balanced profile with practical internship experience, projects, and strong skills`;
    summaryReason = `Classified as Strong (${score}/${maxScore}) due to ${highlight}.`;
  } else if (category === 'AVERAGE') {
    const gap =
      input.internships.length === 0 && input.projects.length < 2
        ? 'lacks internship experience and needs more hands-on projects'
        : input.internships.length === 0
        ? 'has solid baseline competency but lacks industry internship experience'
        : 'demonstrates capable baseline skills but has room to expand project and certification depth';
    summaryReason = `Classified as Average (${score}/${maxScore}) because candidate demonstrates competent foundational credentials (CGPA ${input.cgpa.toFixed(1)}) but ${gap}.`;
  } else {
    const deficit =
      input.cgpa < 6.0
        ? `a sub-6.0 CGPA (${input.cgpa.toFixed(1)}) and limited practical technical evidence`
        : `limited technical skill stack, no verified projects, and absence of internship credentials`;
    summaryReason = `Classified as Needs Improvement (${score}/${maxScore}) due to ${deficit}.`;
  }

  const skillSnippet = technicalCount > 0 ? `${technicalCount} skills` : 'no tech skills';
  const projSnippet = input.projects.length > 0 ? `${input.projects.length} project(s)` : '0 projects';
  const internSnippet = input.internships.length > 0 ? `internship at ${input.internships[0]}` : 'no internship';
  const certSnippet = input.certifications.length > 0 ? `${input.certifications.length} cert(s)` : '0 certs';

  const formulaString = `CGPA ${input.cgpa.toFixed(1)} + ${skillSnippet} + ${projSnippet} + ${internSnippet} + ${certSnippet} = ${score}/${maxScore} pts → ${category.replace('_', ' ')}`;

  return { summaryReason, formulaString, strengths, recommendations };
}

/**
 * Pure Deterministic Categorization Function.
 * Accepts candidate profile and optional dynamic ruleset configuration.
 */
export function categorize(
  input: CandidateInput,
  customRules?: Partial<RulesetConfig>
): CategorizationResult {
  const rules: RulesetConfig = { ...DEFAULT_RULES, ...customRules };
  const skills = normalizeList(input.skills);
  const projects = normalizeList(input.projects);
  const internships = normalizeList(input.internships);
  const certifications = normalizeList(input.certifications);
  const { cgpa } = sanitizeCgpa(input.cgpa);

  const cgpaEval = evaluateCgpa(cgpa, rules.cgpaMax);
  const skillsEval = evaluateSkills(skills, rules.skillsMax, rules.nonTechnicalSkills);
  const projectsEval = evaluateProjects(projects, rules.projectsMax);
  const internshipsEval = evaluateInternships(internships, rules.internshipMax);
  const certsEval = evaluateCertifications(certifications, rules.certificationMax);

  const score = Number(
    (
      cgpaEval.points +
      skillsEval.points +
      projectsEval.points +
      internshipsEval.points +
      certsEval.points
    ).toFixed(2)
  );

  const maxScore = Number(
    (
      rules.cgpaMax +
      rules.skillsMax +
      rules.projectsMax +
      rules.internshipMax +
      rules.certificationMax
    ).toFixed(2)
  );

  const category: Category =
    score >= rules.strongThreshold
      ? 'STRONG'
      : score >= rules.averageThreshold
      ? 'AVERAGE'
      : 'NEEDS_IMPROVEMENT';

  const breakdown: ScoreBreakdown = {
    cgpa: { score: cgpaEval.points, max: rules.cgpaMax, label: cgpaEval.label, details: cgpaEval.details },
    skills: {
      score: skillsEval.points,
      max: rules.skillsMax,
      count: skillsEval.technicalCount,
      label: skillsEval.label,
      details: skillsEval.details,
    },
    projects: {
      score: projectsEval.points,
      max: rules.projectsMax,
      count: projects.length,
      label: projectsEval.label,
      details: projectsEval.details,
    },
    internships: {
      score: internshipsEval.points,
      max: rules.internshipMax,
      count: internships.length,
      label: internshipsEval.label,
      details: internshipsEval.details,
    },
    certifications: {
      score: certsEval.points,
      max: rules.certificationMax,
      count: certifications.length,
      label: certsEval.label,
      details: certsEval.details,
    },
  };

  const { summaryReason, formulaString, strengths, recommendations } = generateExplanations(
    { cgpa, skills, projects, internships, certifications },
    score,
    maxScore,
    category,
    skillsEval.technicalCount
  );

  return {
    score,
    maxScore,
    category,
    breakdown,
    summaryReason,
    formulaString,
    strengths,
    recommendations,
    technicalSkillsCount: skillsEval.technicalCount,
    nonTechnicalSkillsCount: skillsEval.nonTechnicalCount,
  };
}
