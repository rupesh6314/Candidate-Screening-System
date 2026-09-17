import { describe, it, expect } from 'vitest';
import { parseStudentsCsvWithReport } from './csv.service.js';

describe('CSV Ingestion Layer & Dirty Data Resilience', () => {
  it('successfully parses clean 15-student CSV format', () => {
    const csv = `ID,Name,Email,Phone,Branch,CGPA,Skills,Projects,Internships,Certifications
1,Aarav Gupta,aarav@gmail.com,9876543210,Computer Science,9.3,"MERN, AWS, Next.js","E-commerce Web App, Chat App",SDE Intern at Amazon,"AWS Cloud Practitioner, Meta Front-End"
2,Ishita Verma,ishita@gmail.com,8765432109,Information Technology,8.9,"React, Node.js, MongoDB",Task Management System,Frontend Intern at TCS,Google UX Design`;

    const report = parseStudentsCsvWithReport(csv);
    expect(report.totalRows).toBe(2);
    expect(report.acceptedCount).toBe(2);
    expect(report.warningCount).toBe(0);
    expect(report.validStudents[0].name).toBe('Aarav Gupta');
    expect(report.validStudents[0].score).toBe(8);
    expect(report.validStudents[0].category).toBe('STRONG');
  });

  it('rejects files with missing mandatory header columns', () => {
    const badHeaderCsv = `Candidate,Contact,Course,Grade
Aarav,aarav@gmail.com,CSE,9.3`;

    expect(() => parseStudentsCsvWithReport(badHeaderCsv)).toThrow(/Missing required column headers/i);
  });

  it('survives dirty data: "None", "N/A", text CGPA, duplicate IDs, and extra whitespace', () => {
    const dirtyCsv = `ID,Name,Email,Phone,Branch,CGPA,Skills,Projects,Internships,Certifications
101,Rajesh Kumar,rajesh@gmail.com,9999999999,Computer Science,8.5/10,React; Node.js,Portfolio,None,N/A
101,Priya Sharma,invalid-email,8888888888,Mechanical,abc,None,-,Nil,Nil
103,Vikram Singh,vikram@gmail.com,7777777777,ECE,-2.5,"Python, Django, AWS",,,AWS Certified`;

    const report = parseStudentsCsvWithReport(dirtyCsv);
    expect(report.totalRows).toBe(3);
    expect(report.warningCount).toBe(3); // All 3 had sanitizable issues
    expect(report.validStudents.length).toBe(3);

    // Row 1: "8.5/10" CGPA parsed as 8.5, "None" & "N/A" stripped
    expect(report.validStudents[0].cgpa).toBe(8.5);
    expect(report.validStudents[0].internships).toEqual([]);
    expect(report.validStudents[0].certifications).toEqual([]);

    // Row 2: Duplicate ID handled, invalid email fixed, "abc" CGPA clamped to 0
    expect(report.validStudents[1].externalId).toContain('101-dup');
    expect(report.validStudents[1].cgpa).toBe(0);
    expect(report.validStudents[1].email).toContain('@placement.edu');

    // Row 3: Negative CGPA clamped to 0
    expect(report.validStudents[2].cgpa).toBe(0);
    expect(report.validStudents[2].skills).toEqual(['Python', 'Django', 'AWS']);
    expect(report.validStudents[2].certifications).toEqual(['AWS Certified']);
  });
});
