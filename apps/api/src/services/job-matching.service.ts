export interface JobRequirement {
  jobTitle: string;
  companyName: string;
  minCgpa: number;
  mandatorySkills: string[];
  optionalSkills: string[];
  internshipRequired: boolean;
  eligibleBranches: string[];
}

export interface CandidateProfile {
  id?: number;
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
  category: string;
}

export interface CandidateJobMatch {
  candidate: CandidateProfile;
  matchScore: number; // 0 to 100
  tier: 'EXCELLENT_FIT' | 'GOOD_FIT' | 'PARTIAL_FIT' | 'NOT_ELIGIBLE';
  cgpaMatched: boolean;
  branchMatched: boolean;
  internshipMatched: boolean;
  mandatorySkillsMatched: string[];
  mandatorySkillsMissing: string[];
  optionalSkillsMatched: string[];
  matchReason: string;
}

/**
 * Calculates deterministic match percentage and fit classification for a candidate
 * against visiting company job criteria.
 */
export function matchCandidateToJob(
  candidate: CandidateProfile,
  job: JobRequirement
): CandidateJobMatch {
  const candidateSkillsLower = candidate.skills.map((s) => s.toLowerCase().trim());

  // 1. Branch match
  const eligibleBranchesLower = (job.eligibleBranches || []).map((b) => b.toLowerCase().trim());
  const branchMatched =
    eligibleBranchesLower.length === 0 ||
    eligibleBranchesLower.some((b) => candidate.branch.toLowerCase().includes(b) || b.includes(candidate.branch.toLowerCase()));

  // 2. CGPA match
  const cgpaMatched = Number(candidate.cgpa) >= Number(job.minCgpa || 0);

  // 3. Internship match
  const hasInternship = candidate.internships && candidate.internships.length > 0;
  const internshipMatched = !job.internshipRequired || hasInternship;

  // 4. Mandatory Skills match
  const mandatory = (job.mandatorySkills || []).map((s) => s.trim()).filter(Boolean);
  const mandatorySkillsMatched: string[] = [];
  const mandatorySkillsMissing: string[] = [];

  for (const reqSkill of mandatory) {
    const isPresent = candidateSkillsLower.some(
      (cs) => cs === reqSkill.toLowerCase() || cs.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(cs)
    );
    if (isPresent) {
      mandatorySkillsMatched.push(reqSkill);
    } else {
      mandatorySkillsMissing.push(reqSkill);
    }
  }

  // 5. Optional Skills match
  const optional = (job.optionalSkills || []).map((s) => s.trim()).filter(Boolean);
  const optionalSkillsMatched: string[] = [];

  for (const optSkill of optional) {
    const isPresent = candidateSkillsLower.some(
      (cs) => cs === optSkill.toLowerCase() || cs.includes(optSkill.toLowerCase()) || optSkill.toLowerCase().includes(cs)
    );
    if (isPresent) {
      optionalSkillsMatched.push(optSkill);
    }
  }

  // Scoring Weights (Total 100 points)
  // CGPA: 30 pts
  // Mandatory Skills: 40 pts
  // Internship: 15 pts
  // Optional Skills / General Skills: 15 pts
  let totalPoints = 0;

  // CGPA Points (max 30)
  if (cgpaMatched) {
    const cgpaSurplus = Math.min(1.0, (Number(candidate.cgpa) - Number(job.minCgpa)) / 2.0);
    totalPoints += 25 + Math.round(cgpaSurplus * 5);
  } else {
    // Partial CGPA credit if close (within 0.5)
    const gap = Number(job.minCgpa) - Number(candidate.cgpa);
    if (gap <= 0.5) totalPoints += 15;
    else if (gap <= 1.0) totalPoints += 5;
  }

  // Mandatory Skills Points (max 40)
  if (mandatory.length > 0) {
    const mandRatio = mandatorySkillsMatched.length / mandatory.length;
    totalPoints += Math.round(mandRatio * 40);
  } else {
    totalPoints += 40; // No specific mandatory skills required
  }

  // Internship Points (max 15)
  if (job.internshipRequired) {
    if (hasInternship) totalPoints += 15;
  } else {
    if (hasInternship) totalPoints += 15;
    else totalPoints += 10;
  }

  // Optional Skills Points (max 15)
  if (optional.length > 0) {
    const optRatio = optionalSkillsMatched.length / optional.length;
    totalPoints += Math.round(optRatio * 15);
  } else {
    // If no optional skills defined, award based on candidate score
    totalPoints += Math.min(15, Math.round((candidate.score / 10) * 15));
  }

  // Branch penalty if not eligible
  if (!branchMatched) {
    totalPoints = Math.round(totalPoints * 0.7);
  }

  const matchScore = Math.max(0, Math.min(100, totalPoints));

  // Determine Tier
  let tier: CandidateJobMatch['tier'] = 'NOT_ELIGIBLE';
  if (matchScore >= 80 && cgpaMatched && mandatorySkillsMissing.length === 0) {
    tier = 'EXCELLENT_FIT';
  } else if (matchScore >= 65 && branchMatched) {
    tier = 'GOOD_FIT';
  } else if (matchScore >= 45) {
    tier = 'PARTIAL_FIT';
  } else {
    tier = 'NOT_ELIGIBLE';
  }

  // Generate Match Explanation
  const reasons: string[] = [];
  if (cgpaMatched) reasons.push(`CGPA ${Number(candidate.cgpa).toFixed(1)} meets ≥${job.minCgpa} cutoff`);
  else reasons.push(`CGPA ${Number(candidate.cgpa).toFixed(1)} is below the ${job.minCgpa} cutoff`);

  if (mandatory.length > 0) {
    if (mandatorySkillsMissing.length === 0) {
      reasons.push(`Matches all ${mandatory.length} mandatory skill(s) (${mandatory.join(', ')})`);
    } else {
      reasons.push(`Missing mandatory skill(s): ${mandatorySkillsMissing.join(', ')}`);
    }
  }

  if (job.internshipRequired) {
    if (hasInternship) reasons.push('Verified internship requirement met');
    else reasons.push('Lacks required industry internship');
  }

  const matchReason = reasons.join(' • ');

  return {
    candidate,
    matchScore,
    tier,
    cgpaMatched,
    branchMatched,
    internshipMatched,
    mandatorySkillsMatched,
    mandatorySkillsMissing,
    optionalSkillsMatched,
    matchReason,
  };
}

/**
 * Evaluates an entire student cohort against a job requirement,
 * returning ranked shortlists.
 */
export function rankCandidatesForJob(
  candidates: CandidateProfile[],
  job: JobRequirement
): CandidateJobMatch[] {
  return candidates
    .map((c) => matchCandidateToJob(c, job))
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      if (b.candidate.score !== a.candidate.score) return b.candidate.score - a.candidate.score;
      return Number(b.candidate.cgpa) - Number(a.candidate.cgpa);
    });
}
