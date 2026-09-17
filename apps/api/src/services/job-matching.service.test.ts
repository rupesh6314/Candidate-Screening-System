import { describe, it, expect } from 'vitest';
import {
  matchCandidateToJob,
  rankCandidatesForJob,
  JobRequirement,
  CandidateProfile,
} from './job-matching.service.js';

describe('Job Matching & Shortlisting Engine', () => {
  const job: JobRequirement = {
    jobTitle: 'Full-Stack SDE',
    companyName: 'TechCorp Global',
    minCgpa: 8.5,
    mandatorySkills: ['React', 'Node.js'],
    optionalSkills: ['AWS', 'Docker'],
    internshipRequired: true,
    eligibleBranches: ['Computer Science', 'Information Technology'],
  };

  const student1: CandidateProfile = {
    externalId: '1',
    name: 'Aarav Gupta',
    email: 'aarav@gmail.com',
    branch: 'Computer Science',
    cgpa: 9.3,
    skills: ['MERN', 'React', 'Node.js', 'AWS', 'Next.js'],
    projects: ['E-Commerce App', 'Chat App'],
    internships: ['Amazon SDE Intern'],
    certifications: ['AWS Cloud Practitioner'],
    score: 8,
    category: 'STRONG',
  };

  const student2: CandidateProfile = {
    externalId: '2',
    name: 'Pooja Patel',
    email: 'pooja@gmail.com',
    branch: 'Civil',
    cgpa: 7.4,
    skills: ['Python', 'Excel'],
    projects: ['Student DB'],
    internships: [],
    certifications: [],
    score: 3,
    category: 'NEEDS_IMPROVEMENT',
  };

  it('evaluates high match candidate as EXCELLENT_FIT', () => {
    const match = matchCandidateToJob(student1, job);
    expect(match.matchScore).toBeGreaterThanOrEqual(80);
    expect(match.tier).toBe('EXCELLENT_FIT');
    expect(match.cgpaMatched).toBe(true);
    expect(match.internshipMatched).toBe(true);
    expect(match.mandatorySkillsMissing).toEqual([]);
    expect(match.mandatorySkillsMatched).toEqual(['React', 'Node.js']);
  });

  it('evaluates unqualified candidate as NOT_ELIGIBLE', () => {
    const match = matchCandidateToJob(student2, job);
    expect(match.matchScore).toBeLessThan(50);
    expect(match.tier).toBe('NOT_ELIGIBLE');
    expect(match.cgpaMatched).toBe(false);
    expect(match.internshipMatched).toBe(false);
    expect(match.mandatorySkillsMissing).toEqual(['React', 'Node.js']);
  });

  it('correctly ranks candidates in descending order of fit', () => {
    const ranked = rankCandidatesForJob([student2, student1], job);
    expect(ranked[0].candidate.name).toBe('Aarav Gupta');
    expect(ranked[1].candidate.name).toBe('Pooja Patel');
  });
});
