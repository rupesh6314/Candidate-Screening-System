try {
  process.loadEnvFile?.();
} catch (_) {}
import bcrypt from 'bcryptjs';

import { PrismaClient } from '@prisma/client';
import { categorize } from '../src/services/categorization.service.js';
import { DEFAULT_ASSESSMENT_STUDENTS } from '../src/routes/students.routes.js';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@placement.edu';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Placement2026!';
  const hash = await bcrypt.hash(adminPassword, 12);

  console.log(`Seeding admin user: ${adminEmail}...`);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hash, name: 'Placement Officer', role: 'ADMIN' },
    create: {
      email: adminEmail,
      passwordHash: hash,
      name: 'Placement Officer',
      role: 'ADMIN',
    },
  });

  console.log(`Seeding ${DEFAULT_ASSESSMENT_STUDENTS.length} assessment candidate records...`);
  for (const item of DEFAULT_ASSESSMENT_STUDENTS) {
    const evaluation = categorize({
      cgpa: item.cgpa,
      skills: item.skills,
      projects: item.projects,
      internships: item.internships,
      certifications: item.certifications,
    });

    const firstName = item.name.trim().split(' ')[0];
    const defaultPassword = `${firstName}@2020`;
    const studentPassHash = await bcrypt.hash(defaultPassword, 10);

    await prisma.student.upsert({
      where: { externalId: item.externalId },
      update: {
        name: item.name,
        email: item.email,
        phone: item.phone,
        branch: item.branch,
        cgpa: item.cgpa,
        skills: item.skills,
        projects: item.projects,
        internships: item.internships,
        certifications: item.certifications,
        score: evaluation.score,
        category: evaluation.category,
        passwordHash: studentPassHash,
        mustChangePassword: false,
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.name)}`,
        resumeUrl: `https://drive.google.com/file/d/sample-resume-${item.externalId}/view`,
        bio: `Final year ${item.branch} undergraduate candidate.`,
      },
      create: {
        externalId: item.externalId,
        name: item.name,
        email: item.email,
        phone: item.phone,
        branch: item.branch,
        cgpa: item.cgpa,
        skills: item.skills,
        projects: item.projects,
        internships: item.internships,
        certifications: item.certifications,
        score: evaluation.score,
        category: evaluation.category,
        passwordHash: studentPassHash,
        mustChangePassword: false,
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.name)}`,
        resumeUrl: `https://drive.google.com/file/d/sample-resume-${item.externalId}/view`,
        bio: `Final year ${item.branch} undergraduate candidate.`,
      },
    });
  }

  // Seed sample company drives
  const sampleDrives = [
    {
      id: 'drive-amazon-2026',
      companyName: 'Amazon',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg',
      role: 'Software Development Engineer - I (SDE-1)',
      jobType: 'FULL_TIME' as const,
      ctc: '₹28.5 - ₹32.0 LPA',
      stipend: '₹80,000 / month',
      location: 'Bangalore / Hyderabad / Chennai',
      minCgpa: 8.0,
      allowedBranches: ['Computer Science', 'Information Technology', 'Software Engineering'],
      requiredSkills: ['Data Structures & Algorithms', 'Java / C++', 'System Design', 'AWS Cloud Basics'],
      description: 'Amazon is hiring Tier-1 engineering talent for AWS and Retail Platforms.',
      selectionProcess: ['Online Coding Assessment', 'Technical Interview 1', 'Technical Interview 2', 'Bar Raiser Round'],
      serviceAgreement: 'None',
      startDate: new Date(),
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: 'Placement Coordinator',
    },
    {
      id: 'drive-microsoft-2026',
      companyName: 'Microsoft',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
      role: 'Azure Cloud & Core Systems Engineer',
      jobType: 'INTERNSHIP_PPO' as const,
      ctc: '₹26.0 LPA + PPO Conversion',
      stipend: '₹75,000 / month',
      location: 'Hyderabad / Noida / Remote',
      minCgpa: 8.5,
      allowedBranches: ['Computer Science', 'Information Technology', 'Software Engineering', 'Electronics'],
      requiredSkills: ['C# / C++ / Python', 'Distributed Systems', 'Azure', 'Operating Systems'],
      description: 'Join Microsoft Azure Core Infrastructure teams to engineer scalable cloud hypervisor virtualization.',
      selectionProcess: ['Online Coding Round', 'Technical Round 1', 'Technical Round 2', 'Managerial Round'],
      serviceAgreement: 'None',
      startDate: new Date(),
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdBy: 'Placement Coordinator',
    },
  ];

  for (const d of sampleDrives) {
    await (prisma as any).companyDrive?.upsert?.({
      where: { id: d.id },
      update: d,
      create: d,
    }).catch(() => {});
  }

  console.log('✅ Database seeding successfully completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

