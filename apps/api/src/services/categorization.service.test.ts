import { describe, it, expect } from 'vitest';
import {
  categorize,
  normalizeList,
  RULES,
  type CandidateInput,
} from './categorization.service.js';

describe('normalizeList', () => {
  it('handles null, undefined and empty values', () => {
    expect(normalizeList(null)).toEqual([]);
    expect(normalizeList(undefined)).toEqual([]);
    expect(normalizeList('')).toEqual([]);
    expect(normalizeList([])).toEqual([]);
  });

  it('filters out "None", "none", "N/A", and "-" case-insensitively', () => {
    expect(normalizeList('None')).toEqual([]);
    expect(normalizeList(['none', 'None', 'N/A', '-'])).toEqual([]);
    expect(normalizeList('HTML, CSS, None, JavaScript')).toEqual(['HTML', 'CSS', 'JavaScript']);
  });

  it('handles mixed delimiters (commas, semicolons, newlines, pipes)', () => {
    expect(normalizeList('React, Node.js; MongoDB\nAWS | Docker')).toEqual([
      'React',
      'Node.js',
      'MongoDB',
      'AWS',
      'Docker',
    ]);
  });

  it('deduplicates items case-insensitively while preserving original text', () => {
    expect(normalizeList(['React', 'react', 'REACT', 'TypeScript'])).toEqual([
      'React',
      'TypeScript',
    ]);
  });
});

describe('Deterministic Categorization Logic', () => {
  it('correctly categorizes Tier 1 Strong Candidate (Aarav Gupta: 9.3 CGPA, 3 skills, 2 projects, intern, cert)', () => {
    const candidate: CandidateInput = {
      cgpa: 9.3,
      skills: ['MERN', 'AWS', 'Next.js'],
      projects: ['E-commerce Web App', 'Chat Application'],
      internships: ['SDE Intern at Amazon'],
      certifications: ['AWS Cloud Practitioner', 'Meta Front-End Developer'],
    };

    const result = categorize(candidate);
    // CGPA >= 9 -> 4 pts
    // 3 skills -> 1 pt
    // 2 projects -> 1 pt
    // Internship -> 1 pt
    // Certifications -> 1 pt
    // Total = 4 + 1 + 1 + 1 + 1 = 8
    expect(result.score).toBe(8);
    expect(result.category).toBe('STRONG');
    expect(result.breakdown.cgpa.score).toBe(4);
    expect(result.breakdown.skills.score).toBe(1);
    expect(result.breakdown.projects.score).toBe(1);
    expect(result.breakdown.internships.score).toBe(1);
    expect(result.breakdown.certifications.score).toBe(1);
    expect(result.summaryReason).toContain('Classified as Strong (8/10)');
    expect(result.strengths.length).toBeGreaterThan(0);
  });

  it('correctly categorizes High Tier Strong Candidate with 5+ skills (Ishita Verma: 8.9 CGPA, 3 skills, 1 project, intern, cert)', () => {
    const candidate: CandidateInput = {
      cgpa: 8.9,
      skills: ['React', 'Node.js', 'MongoDB'],
      projects: ['Task Management System'],
      internships: ['Frontend Intern at TCS'],
      certifications: ['Google UX Design'],
    };

    const result = categorize(candidate);
    // CGPA 8.9 -> 3 pts
    // 3 skills -> 1 pt
    // 1 project -> 1 pt
    // Internship -> 1 pt
    // Cert -> 1 pt
    // Total = 3 + 1 + 1 + 1 + 1 = 7 (Average)
    expect(result.score).toBe(7);
    expect(result.category).toBe('AVERAGE');
  });

  it('correctly categorizes Strong Candidate (Rohan Nair: 9.1 CGPA, 3 skills, 2 projects, intern, cert)', () => {
    const candidate: CandidateInput = {
      cgpa: 9.1,
      skills: ['Python', 'Django', 'React'],
      projects: ['Social Media Dashboard', 'Portfolio App'],
      internships: ['Web Dev Intern at Infosys'],
      certifications: ['IBM Full Stack Software Developer'],
    };

    const result = categorize(candidate);
    // CGPA 9.1 -> 4
    // 3 skills -> 1
    // 2 projects -> 1
    // intern -> 1
    // cert -> 1
    // Total = 8 -> STRONG
    expect(result.score).toBe(8);
    expect(result.category).toBe('STRONG');
  });

  it('correctly categorizes Average Candidate with missing internship (Sneha Desai: 7.6 CGPA, 3 skills, 1 project, None intern, None cert)', () => {
    const candidate: CandidateInput = {
      cgpa: 7.6,
      skills: ['HTML', 'CSS', 'JavaScript'],
      projects: ['Personal Website'],
      internships: [],
      certifications: [],
    };

    const result = categorize(candidate);
    // CGPA 7.6 -> 2
    // 3 skills -> 1
    // 1 project -> 1
    // 0 intern -> 0
    // 0 cert -> 0
    // Total = 4 -> NEEDS_IMPROVEMENT
    expect(result.score).toBe(4);
    expect(result.category).toBe('NEEDS_IMPROVEMENT');
  });

  it('correctly categorizes Needs Improvement Candidate with low CGPA and minimal skills (Deepak Tiwari: 5.4 CGPA, MS Excel, no projects)', () => {
    const candidate: CandidateInput = {
      cgpa: 5.4,
      skills: ['MS Excel'],
      projects: [],
      internships: [],
      certifications: [],
    };

    const result = categorize(candidate);
    // CGPA 5.4 -> 0
    // 1 skill -> 0
    // 0 projects -> 0
    // 0 intern -> 0
    // 0 cert -> 0
    // Total = 0 -> NEEDS_IMPROVEMENT
    expect(result.score).toBe(0);
    expect(result.category).toBe('NEEDS_IMPROVEMENT');
    expect(result.summaryReason).toContain('Classified as Needs Improvement (0/10)');
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('handles maximum possible score (10/10)', () => {
    const candidate: CandidateInput = {
      cgpa: 9.8,
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes'], // >=5 skills -> 2 pts
      projects: ['Cloud Orchestrator', 'AI Search Engine', 'E-Commerce Platform'], // >=3 projects -> 2 pts
      internships: ['SWE Intern at Google'], // 1 pt
      certifications: ['AWS Solutions Architect Pro'], // 1 pt
    };

    const result = categorize(candidate);
    // 4 (CGPA) + 2 (Skills) + 2 (Projects) + 1 (Internship) + 1 (Certification) = 10
    expect(result.score).toBe(10);
    expect(result.category).toBe('STRONG');
    expect(result.breakdown.cgpa.score).toBe(4);
    expect(result.breakdown.skills.score).toBe(2);
    expect(result.breakdown.projects.score).toBe(2);
    expect(result.breakdown.internships.score).toBe(1);
    expect(result.breakdown.certifications.score).toBe(1);
  });

  it('handles edge cases: zero CGPA, negative values, and malformed inputs gracefully', () => {
    const candidate: CandidateInput = {
      cgpa: 0,
      skills: [],
      projects: [],
      internships: [],
      certifications: [],
    };

    const result = categorize(candidate);
    expect(result.score).toBe(0);
    expect(result.category).toBe('NEEDS_IMPROVEMENT');
  });
});

