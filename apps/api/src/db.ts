import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { categorize } from './services/categorization.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'screening.json');

let rawPrisma: PrismaClient | null = null;
let useFallback = false;

try {
  rawPrisma = new PrismaClient();
} catch (_) {
  useFallback = true;
}


// Default 15 assessment students
const INITIAL_STUDENTS = [
  {
    id: 1,
    externalId: '1',
    name: 'Aarav Gupta',
    email: 'aarav.g@gmail.com',
    phone: '9876543210',
    branch: 'Computer Science',
    cgpa: 9.3,
    skills: ['MERN', 'AWS', 'Next.js'],
    projects: ['E-commerce Web App', 'Chat Application'],
    internships: ['SDE Intern at Amazon'],
    certifications: ['AWS Cloud Practitioner', 'Meta Front-End Developer'],
    score: 8,
    category: 'STRONG',
  },
  {
    id: 2,
    externalId: '2',
    name: 'Ishita Verma',
    email: 'ishita.v21@gmail.com',
    phone: '8765432109',
    branch: 'Information Technology',
    cgpa: 8.9,
    skills: ['React', 'Node.js', 'MongoDB'],
    projects: ['Task Management System'],
    internships: ['Frontend Intern at TCS'],
    certifications: ['Google UX Design'],
    score: 7,
    category: 'AVERAGE',
  },
  {
    id: 3,
    externalId: '3',
    name: 'Rohan Nair',
    email: 'rnair.dev@gmail.com',
    phone: '7654321098',
    branch: 'Computer Science',
    cgpa: 9.1,
    skills: ['Python', 'Django', 'React'],
    projects: ['Social Media Dashboard', 'Portfolio App'],
    internships: ['Web Dev Intern at Infosys'],
    certifications: ['IBM Full Stack Software Developer'],
    score: 8,
    category: 'STRONG',
  },
  {
    id: 4,
    externalId: '4',
    name: 'Megha Sharma',
    email: 'megha.sharma99@gmail.com',
    phone: '6543210987',
    branch: 'Software Engineering',
    cgpa: 8.5,
    skills: ['Java', 'Spring Boot', 'React'],
    projects: ['Inventory Management System'],
    internships: ['Java Developer Intern at Wipro'],
    certifications: ['Oracle Certified Associate'],
    score: 7,
    category: 'AVERAGE',
  },
  {
    id: 5,
    externalId: '5',
    name: 'Karthik Reddy',
    email: 'karthik.r@gmail.com',
    phone: '9012345678',
    branch: 'Computer Science',
    cgpa: 8.2,
    skills: ['JavaScript', 'Express', 'SQL'],
    projects: ['Weather App', 'Blog Platform'],
    internships: ['Software Intern at Tech Mahindra'],
    certifications: ['HackerRank JavaScript (Basic)'],
    score: 7,
    category: 'AVERAGE',
  },
  {
    id: 6,
    externalId: '6',
    name: 'Sneha Desai',
    email: 'snehad.22@gmail.com',
    phone: '8123456790',
    branch: 'Electronics',
    cgpa: 7.6,
    skills: ['HTML', 'CSS', 'JavaScript'],
    projects: ['Personal Website'],
    internships: [],
    certifications: [],
    score: 4,
    category: 'NEEDS_IMPROVEMENT',
  },
  {
    id: 7,
    externalId: '7',
    name: 'Aditya Kumar',
    email: 'aditya.k45@gmail.com',
    phone: '9123456781',
    branch: 'Mechanical',
    cgpa: 7.1,
    skills: ['Python', 'SQL'],
    projects: ['Data Analysis on Sales Data'],
    internships: [],
    certifications: ['Google Data Analytics'],
    score: 4,
    category: 'NEEDS_IMPROVEMENT',
  },
  {
    id: 8,
    externalId: '8',
    name: 'Neha Singh',
    email: 'nehasingh.01@gmail.com',
    phone: '7123456789',
    branch: 'Information Technology',
    cgpa: 7.8,
    skills: ['Java', 'HTML', 'CSS'],
    projects: ['Library Management System'],
    internships: ['Trainee at WebX'],
    certifications: [],
    score: 5,
    category: 'AVERAGE',
  },
  {
    id: 9,
    externalId: '9',
    name: 'Vivek Joshi',
    email: 'vivek.j@gmail.com',
    phone: '8234567890',
    branch: 'Computer Science',
    cgpa: 6.9,
    skills: ['C++', 'HTML'],
    projects: ['Calculator App'],
    internships: [],
    certifications: [],
    score: 2,
    category: 'NEEDS_IMPROVEMENT',
  },
  {
    id: 10,
    externalId: '10',
    name: 'Pooja Patel',
    email: 'poojap.tech@gmail.com',
    phone: '9345678901',
    branch: 'Civil',
    cgpa: 7.4,
    skills: ['Python', 'Excel'],
    projects: ['Student Database System'],
    internships: [],
    certifications: [],
    score: 3,
    category: 'NEEDS_IMPROVEMENT',
  },
  {
    id: 11,
    externalId: '11',
    name: 'Amit Chawla',
    email: 'amit.c00@gmail.com',
    phone: '9456789012',
    branch: 'Civil',
    cgpa: 5.9,
    skills: ['MS Word'],
    projects: [],
    internships: [],
    certifications: [],
    score: 0,
    category: 'NEEDS_IMPROVEMENT',
  },
  {
    id: 12,
    externalId: '12',
    name: 'Suman Rao',
    email: 'suman.rao1@gmail.com',
    phone: '8567890123',
    branch: 'Mechanical',
    cgpa: 6.1,
    skills: ['Windows', 'Data Entry'],
    projects: ['Basic HTML Page'],
    internships: [],
    certifications: [],
    score: 2,
    category: 'NEEDS_IMPROVEMENT',
  },
  {
    id: 13,
    externalId: '13',
    name: 'Deepak Tiwari',
    email: 'deepakt.77@gmail.com',
    phone: '7678901234',
    branch: 'Electronics',
    cgpa: 5.4,
    skills: ['MS Excel'],
    projects: [],
    internships: [],
    certifications: [],
    score: 0,
    category: 'NEEDS_IMPROVEMENT',
  },
  {
    id: 14,
    externalId: '14',
    name: 'Meera Reddy',
    email: 'meera.r3@gmail.com',
    phone: '9789012345',
    branch: 'Chemical',
    cgpa: 6.3,
    skills: ['Basic Computer'],
    projects: [],
    internships: [],
    certifications: [],
    score: 1,
    category: 'NEEDS_IMPROVEMENT',
  },
  {
    id: 15,
    externalId: '15',
    name: 'Rajeev Menon',
    email: 'rajeev.m9@gmail.com',
    phone: '8890123456',
    branch: 'Mechanical',
    cgpa: 5.2,
    skills: ['MS Office'],
    projects: [],
    internships: [],
    certifications: [],
    score: 0,
    category: 'NEEDS_IMPROVEMENT',
  },
];

const INITIAL_DRIVES = [
  {
    id: 'drive-amazon-2026',
    companyName: 'Amazon',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg',
    role: 'Software Development Engineer - I (SDE-1)',
    jobType: 'FULL_TIME',
    ctc: '₹28.5 - ₹32.0 LPA',
    stipend: '₹80,000 / month',
    location: 'Bangalore / Hyderabad / Chennai',
    minCgpa: 8.0,
    allowedBranches: ['Computer Science', 'Information Technology', 'Software Engineering'],
    requiredSkills: ['Data Structures & Algorithms', 'Java / C++', 'System Design', 'AWS Cloud Basics'],
    description: 'Amazon is hiring Tier-1 engineering talent for Amazon Web Services (AWS) and Retail Platforms. The role involves designing high-throughput distributed microservices, optimizing low-latency APIs, and deploying resilient cloud architectures.',
    selectionProcess: [
      'Online Coding Assessment (2 coding questions + Work Simulation)',
      'Technical Interview Round 1 (Data Structures, Algorithms & Problem Solving)',
      'Technical Interview Round 2 (Object-Oriented Design & System Architecture)',
      'Bar Raiser & Leadership Principles Round'
    ],
    serviceAgreement: 'None',
    startDate: '2026-09-17T09:00:00.000Z',
    deadline: '2026-09-20T09:00:00.000Z',
    isActive: true,
    createdBy: 'Placement Coordinator',
    createdAt: '2026-09-17T08:00:00.000Z',
    updatedAt: '2026-09-17T08:00:00.000Z',
  },
  {
    id: 'drive-microsoft-2026',
    companyName: 'Microsoft',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    role: 'Azure Cloud & Core Systems Engineer',
    jobType: 'INTERNSHIP_PPO',
    ctc: '₹26.0 LPA + PPO Conversion',
    stipend: '₹75,000 / month',
    location: 'Hyderabad / Noida / Remote',
    minCgpa: 8.5,
    allowedBranches: ['Computer Science', 'Information Technology', 'Software Engineering', 'Electronics'],
    requiredSkills: ['C# / C++ / Python', 'Distributed Systems', 'Azure', 'Operating Systems'],
    description: 'Join Microsoft Azure Core Infrastructure teams to engineer scalable cloud hypervisor virtualization, storage engines, and edge networking backbones.',
    selectionProcess: [
      'Online Coding Round (3 DSA questions on HackerEarth)',
      'Technical Round 1 (Concurrency, Threading & Memory Management)',
      'Technical Round 2 (Cloud Infrastructure & System Design)',
      'Managerial & Fitment Round'
    ],
    serviceAgreement: 'None',
    startDate: '2026-09-17T10:00:00.000Z',
    deadline: '2026-09-22T17:00:00.000Z',
    isActive: true,
    createdBy: 'Placement Coordinator',
    createdAt: '2026-09-17T08:30:00.000Z',
    updatedAt: '2026-09-17T08:30:00.000Z',
  },
  {
    id: 'drive-google-2026',
    companyName: 'Google',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    role: 'Associate Software Engineer (Google Cloud / Search)',
    jobType: 'FULL_TIME',
    ctc: '₹34.0 - ₹38.0 LPA',
    stipend: '₹1,10,000 / month',
    location: 'Bangalore / Hyderabad',
    minCgpa: 9.0,
    allowedBranches: ['Computer Science', 'Information Technology', 'Software Engineering'],
    requiredSkills: ['Advanced Algorithms', 'C++ / Go / Java', 'Distributed Computing', 'Linux Internals'],
    description: 'Build mission-critical systems and planetary-scale infrastructure powering billions of users. Work closely with world-class engineering teams across Google Search, Maps, and GCP.',
    selectionProcess: [
      'Google Online Challenge (GOC - 2 algorithmic problems)',
      'Technical Screening Round (DSA & Complexity Analysis)',
      'Onsite Round 1 (Dynamic Programming & Graph Algorithms)',
      'Onsite Round 2 (Scalable Distributed Systems)',
      'Googliness & Leadership Round'
    ],
    serviceAgreement: 'None',
    startDate: '2026-09-17T11:00:00.000Z',
    deadline: '2026-09-25T12:00:00.000Z',
    isActive: true,
    createdBy: 'Placement Coordinator',
    createdAt: '2026-09-17T09:00:00.000Z',
    updatedAt: '2026-09-17T09:00:00.000Z',
  },
  {
    id: 'drive-tcs-digital-2026',
    companyName: 'TCS Digital',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
    role: 'Digital Software Engineer & AI Specialist',
    jobType: 'FULL_TIME',
    ctc: '₹7.5 - ₹9.0 LPA',
    stipend: '₹25,000 / month',
    location: 'Pan India (Hyderabad, Pune, Chennai, Bangalore)',
    minCgpa: 7.0,
    allowedBranches: ['Computer Science', 'Information Technology', 'Software Engineering', 'Electronics', 'Mechanical', 'Civil'],
    requiredSkills: ['Full Stack Development', 'Python / Java', 'SQL Database', 'REST APIs'],
    description: 'TCS Digital cadre hiring for modern digital transformation initiatives spanning Enterprise Cloud, Generative AI, and Microservices.',
    selectionProcess: [
      'TCS National Qualifier Test (NQT) - Advanced Cognitive & Coding',
      'Technical Interview (Full Stack & Core Fundamentals)',
      'HR / MR Round'
    ],
    serviceAgreement: '1 Year',
    startDate: '2026-09-16T09:00:00.000Z',
    deadline: '2026-09-28T18:00:00.000Z',
    isActive: true,
    createdBy: 'Placement Coordinator',
    createdAt: '2026-09-16T08:00:00.000Z',
    updatedAt: '2026-09-16T08:00:00.000Z',
  },
  {
    id: 'drive-infosys-past-2026',
    companyName: 'Infosys (Specialist Programmer)',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
    role: 'Specialist Programmer (High-Performance Engineering)',
    jobType: 'FULL_TIME',
    ctc: '₹9.5 LPA',
    stipend: '₹30,000 / month',
    location: 'Mysore / Bangalore / Pune',
    minCgpa: 7.5,
    allowedBranches: ['Computer Science', 'Information Technology', 'Software Engineering', 'Electronics'],
    requiredSkills: ['Java', 'Spring Boot', 'React', 'Data Structures'],
    description: 'Specialist Programmer drive with challenging competitive programming rounds focusing on backend scale and enterprise frameworks.',
    selectionProcess: [
      'InfyTQ / HackWithInfy Finalist Assessment',
      'Technical Interview (DSA & Real-time Systems)',
      'HR Discussion'
    ],
    serviceAgreement: 'None',
    startDate: '2026-09-10T09:00:00.000Z',
    deadline: '2026-09-15T09:00:00.000Z', // Past deadline to demonstrate Expired / Not Opted In
    isActive: true,
    createdBy: 'Placement Coordinator',
    createdAt: '2026-09-10T08:00:00.000Z',
    updatedAt: '2026-09-10T08:00:00.000Z',
  }
];

export function getStudentDefaultPassword(name: string): string {
  const firstName = name.trim().split(' ')[0];
  return `${firstName}@2020`;
}

interface LocalDatabase {
  users: Array<{
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: 'ADMIN' | 'COORDINATOR';
    createdAt: string;
    updatedAt: string;
  }>;
  students: Array<any>;
  auditLogs: Array<any>;
  companyDrives: Array<any>;
  driveApplications: Array<any>;
  notifications: Array<any>;
}

let memoryDb: LocalDatabase | null = null;

function loadLocalData(): LocalDatabase {
  if (memoryDb) return memoryDb;
  let db: LocalDatabase | null = null;
  try {
    if (fs.existsSync(DATA_FILE)) {
      db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (_) {}

  if (!db) {
    db = {
      users: [
        {
          id: 'cuid-admin-1',
          email: 'admin.placementscollege@gmail.com',
          passwordHash: bcrypt.hashSync('admin', 10),
          name: 'Placement Officer',
          role: 'ADMIN',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      students: INITIAL_STUDENTS.map((s) => ({
        ...s,
        passwordHash: bcrypt.hashSync(getStudentDefaultPassword(s.name), 10),
        mustChangePassword: false,
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(s.name)}`,
        resumeUrl: `https://drive.google.com/file/d/sample-resume-${s.externalId}/view`,
        bio: `Final year ${s.branch} undergraduate passionate about software engineering and cloud technologies.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      auditLogs: [],
      companyDrives: INITIAL_DRIVES,
      driveApplications: [],
      notifications: [],
    };
    saveLocalData(db);
    memoryDb = db;
    return db;
  }

  // Ensure collections exist
  if (!db.companyDrives || db.companyDrives.length === 0) {
    db.companyDrives = INITIAL_DRIVES;
  }
  if (!db.driveApplications) {
    db.driveApplications = [];
  }
  if (!db.notifications) {
    db.notifications = [];
  }
  // Ensure students have passwordHash, mustChangePassword, profileImage, and resumeUrl
  let modified = false;
  db.students = (db.students || []).map((s) => {
    let changed = false;
    const defaultPass = getStudentDefaultPassword(s.name);
    const passwordHash = s.passwordHash || bcrypt.hashSync(defaultPass, 10);
    if (!s.passwordHash) changed = true;
    if (s.mustChangePassword === undefined) {
      s.mustChangePassword = false;
      changed = true;
    }
    if (!s.profileImage || !s.resumeUrl) {
      changed = true;
    }
    if (changed) {
      modified = true;
      return {
        ...s,
        passwordHash,
        mustChangePassword: s.mustChangePassword !== undefined ? s.mustChangePassword : false,
        profileImage: s.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(s.name)}`,
        resumeUrl: s.resumeUrl || `https://drive.google.com/file/d/sample-resume-${s.externalId}/view`,
        bio: s.bio || `Final year ${s.branch} undergraduate candidate.`,
      };
    }
    return s;
  });

  if (modified) {
    saveLocalData(db);
  }

  memoryDb = db;
  return db;
}

function saveLocalData(db: LocalDatabase) {
  memoryDb = db;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (_) {
    // Read-only filesystem in serverless environments
  }
}

// Local Database Adapter providing Prisma API
const localDb = {
  user: {
    async findUnique({ where }: any) {
      const db = loadLocalData();
      if (!where) return null;
      if (where.id) {
        return db.users.find((u) => u.id === where.id) || null;
      }
      if (where.email) {
        return db.users.find((u) => u.email && u.email.toLowerCase() === where.email.toLowerCase()) || null;
      }
      return null;
    },
    async findFirst({ where }: any) {
      const db = loadLocalData();
      if (!where) return db.users[0] || null;
      if (where.id) {
        return db.users.find((u) => u.id === where.id) || null;
      }
      if (where.email) {
        return db.users.find((u) => u.email && u.email.toLowerCase() === where.email.toLowerCase()) || null;
      }
      return null;
    },
    async upsert({ where, update, create }: any) {
      const db = loadLocalData();
      const email = where?.email ? where.email.toLowerCase() : '';
      const idx = db.users.findIndex((u) => (email && u.email.toLowerCase() === email) || (where?.id && u.id === where.id));
      if (idx >= 0) {
        db.users[idx] = { ...db.users[idx], ...update, updatedAt: new Date().toISOString() };
        saveLocalData(db);
        return db.users[idx];
      }
      const newUser = {
        id: `user-${Date.now()}`,
        ...create,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      saveLocalData(db);
      return newUser;
    },
  },
  student: {
    async findMany(args?: any) {
      const db = loadLocalData();
      let list = [...db.students];
      const where = args?.where;

      if (where) {
        if (where.id?.in && Array.isArray(where.id.in)) {
          const ids = where.id.in.map(Number);
          list = list.filter((s) => ids.includes(Number(s.id)));
        }
        if (where.cgpa?.gte !== undefined) list = list.filter((s) => Number(s.cgpa) >= where.cgpa.gte);
        if (where.cgpa?.lte !== undefined) list = list.filter((s) => Number(s.cgpa) <= where.cgpa.lte);
        if (where.category) {
          if (typeof where.category === 'string') {
            list = list.filter((s) => (s.overrideCategory || s.category) === where.category);
          } else if (where.category?.in && Array.isArray(where.category.in)) {
            list = list.filter((s) => where.category.in.includes(s.overrideCategory || s.category));
          }
        }
        if (where.branch?.contains) {
          const q = where.branch.contains.toLowerCase();
          list = list.filter((s) => (s.branch || '').toLowerCase().includes(q));
        }
        if (where.branch?.in && Array.isArray(where.branch.in)) {
          const branches = where.branch.in.map((b: string) => b.toLowerCase());
          list = list.filter((s) => branches.includes((s.branch || '').toLowerCase()));
        }
        if (where.skills?.has) {
          const q = where.skills.has.toLowerCase();
          list = list.filter((s) => Array.isArray(s.skills) && s.skills.some((sk: string) => sk && sk.toLowerCase() === q));
        }
        if (where.skills?.hasEvery && Array.isArray(where.skills.hasEvery)) {
          const required = where.skills.hasEvery.map((sk: string) => sk.toLowerCase().trim());
          list = list.filter((s) => {
            const studentSkills = (s.skills || []).map((sk: string) => sk.toLowerCase().trim());
            return required.every((req: string) =>
              studentSkills.some((sk: string) => sk === req || sk.includes(req) || req.includes(sk))
            );
          });
        }
        if (where.skills?.hasSome && Array.isArray(where.skills.hasSome)) {
          const options = where.skills.hasSome.map((sk: string) => sk.toLowerCase().trim());
          list = list.filter((s) => {
            const studentSkills = (s.skills || []).map((sk: string) => sk.toLowerCase().trim());
            return options.some((opt: string) =>
              studentSkills.some((sk: string) => sk === opt || sk.includes(opt) || opt.includes(sk))
            );
          });
        }
        if (where.internships?.isEmpty === true) list = list.filter((s) => !s.internships || s.internships.length === 0);
        if (where.internships?.isEmpty === false) list = list.filter((s) => s.internships && s.internships.length > 0);
        if (where.certifications?.isEmpty === true) list = list.filter((s) => !s.certifications || s.certifications.length === 0);
        if (where.certifications?.isEmpty === false) list = list.filter((s) => s.certifications && s.certifications.length > 0);
        if (where.isOverridden !== undefined) list = list.filter((s) => Boolean(s.isOverridden) === where.isOverridden);
        if (where.isReviewed !== undefined) list = list.filter((s) => Boolean(s.isReviewed) === where.isReviewed);
        if (where.OR && Array.isArray(where.OR)) {
          const q = (where.OR[0]?.name?.contains || '').toLowerCase();
          list = list.filter(
            (s) =>
              (s.name || '').toLowerCase().includes(q) ||
              (s.email || '').toLowerCase().includes(q) ||
              String(s.externalId || '').toLowerCase().includes(q) ||
              ((s.skills || []).some((sk: string) => sk.toLowerCase().includes(q)))
          );
        }
      }

      // OrderBy with numeric & alphabetical tie-breaking
      if (args?.orderBy) {
        const orderList = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy];
        list.sort((a, b) => {
          for (const order of orderList) {
            const [key, dir] = Object.entries(order)[0] as [string, string];
            const valA = a[key];
            const valB = b[key];
            const isNumeric = (typeof valA === 'number' || (!isNaN(Number(valA)) && valA !== null && valA !== '')) &&
                              (typeof valB === 'number' || (!isNaN(Number(valB)) && valB !== null && valB !== ''));

            if (isNumeric) {
              const numA = Number(valA);
              const numB = Number(valB);
              if (numA !== numB) {
                return dir === 'asc' ? numA - numB : numB - numA;
              }
            } else {
              const strA = String(valA || '').toLowerCase();
              const strB = String(valB || '').toLowerCase();
              const cmp = strA.localeCompare(strB);
              if (cmp !== 0) {
                return dir === 'asc' ? cmp : -cmp;
              }
            }
          }
          return 0;
        });
      }

      // Pagination
      if (args?.skip !== undefined && args?.take !== undefined) {
        list = list.slice(args.skip, args.skip + args.take);
      } else if (args?.take !== undefined) {
        list = list.slice(0, args.take);
      }

      return list;
    },

    async count(args?: any) {
      const items = await this.findMany({ where: args?.where });
      return items.length;
    },

    async findUnique({ where }: any) {
      const db = loadLocalData();
      if (!where) return null;
      if (where.id !== undefined) {
        return db.students.find((s) => Number(s.id) === Number(where.id)) || null;
      }
      if (where.externalId !== undefined) {
        return db.students.find((s) => String(s.externalId) === String(where.externalId)) || null;
      }
      if (where.email !== undefined) {
        return db.students.find((s) => s.email && s.email.toLowerCase() === String(where.email).toLowerCase()) || null;
      }
      return null;
    },

    async findFirst({ where }: any) {
      const db = loadLocalData();
      if (!where) return db.students[0] || null;
      if (where.OR && Array.isArray(where.OR)) {
        return (
          db.students.find((s) =>
            where.OR.some(
              (cond: any) =>
                (cond.externalId && String(s.externalId) === String(cond.externalId)) ||
                (cond.email && s.email && s.email.toLowerCase() === String(cond.email).toLowerCase())
            )
          ) || null
        );
      }
      if (where.id !== undefined) {
        return db.students.find((s) => Number(s.id) === Number(where.id)) || null;
      }
      if (where.externalId !== undefined) {
        return db.students.find((s) => String(s.externalId) === String(where.externalId)) || null;
      }
      if (where.email !== undefined) {
        return db.students.find((s) => s.email && s.email.toLowerCase() === String(where.email).toLowerCase()) || null;
      }
      const matched = await this.findMany({ where });
      return matched[0] || null;
    },

    async create({ data }: any) {
      const db = loadLocalData();
      const maxId = db.students.reduce((max, s) => Math.max(max, s.id || 0), 0);
      const newStudent = {
        id: maxId + 1,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.students.push(newStudent);
      saveLocalData(db);
      return newStudent;
    },

    async update({ where, data }: any) {
      const db = loadLocalData();
      const idx = db.students.findIndex((s) => s.id === where.id || s.externalId === where.externalId);
      if (idx >= 0) {
        db.students[idx] = { ...db.students[idx], ...data, updatedAt: new Date().toISOString() };
        saveLocalData(db);
        return db.students[idx];
      }
      throw new Error('Student not found');
    },

    async delete({ where }: any) {
      const db = loadLocalData();
      db.students = db.students.filter((s) => s.id !== where.id && s.externalId !== where.externalId);
      saveLocalData(db);
      return { count: 1 };
    },

    async deleteMany() {
      const db = loadLocalData();
      const count = db.students.length;
      db.students = [];
      saveLocalData(db);
      return { count };
    },

    async upsert({ where, update, create }: any) {
      const db = loadLocalData();
      const idx = db.students.findIndex((s) => s.externalId === where.externalId);
      if (idx >= 0) {
        db.students[idx] = { ...db.students[idx], ...update, updatedAt: new Date().toISOString() };
        saveLocalData(db);
        return db.students[idx];
      }
      const maxId = db.students.reduce((max, s) => Math.max(max, s.id || 0), 0);
      const newStudent = {
        id: maxId + 1,
        ...create,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.students.push(newStudent);
      saveLocalData(db);
      return newStudent;
    },

    async aggregate() {
      const db = loadLocalData();
      if (db.students.length === 0) {
        return { _avg: { cgpa: 0 }, _max: { cgpa: 0 }, _min: { cgpa: 0 } };
      }
      const cgpas = db.students.map((s) => Number(s.cgpa) || 0);
      const sum = cgpas.reduce((a, b) => a + b, 0);
      return {
        _avg: { cgpa: sum / cgpas.length },
        _max: { cgpa: Math.max(...cgpas) },
        _min: { cgpa: Math.min(...cgpas) },
      };
    },
  },
  auditLog: {
    async create({ data }: any) {
      const db = loadLocalData();
      const log = { id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, ...data, createdAt: new Date().toISOString() };
      db.auditLogs.unshift(log);
      saveLocalData(db);
      return log;
    },
    async findMany(args?: any) {
      const db = loadLocalData();
      let list = [...(db.auditLogs || [])];
      if (args?.take) {
        list = list.slice(0, args.take);
      }
      return list;
    },
  },
  companyDrive: {
    async findMany(args?: any) {
      const db = loadLocalData();
      let list = [...(db.companyDrives || [])];
      const where = args?.where;
      if (where) {
        if (where.isActive !== undefined) {
          list = list.filter((d) => d.isActive === where.isActive);
        }
      }
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    },
    async findUnique({ where }: any) {
      const db = loadLocalData();
      return (db.companyDrives || []).find((d) => d.id === where.id) || null;
    },
    async create({ data }: any) {
      const db = loadLocalData();
      const id = data.id || `drive-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const drive = {
        id,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!db.companyDrives) db.companyDrives = [];
      db.companyDrives.unshift(drive);
      saveLocalData(db);
      return drive;
    },
    async update({ where, data }: any) {
      const db = loadLocalData();
      const idx = (db.companyDrives || []).findIndex((d) => d.id === where.id);
      if (idx >= 0) {
        db.companyDrives[idx] = { ...db.companyDrives[idx], ...data, updatedAt: new Date().toISOString() };
        saveLocalData(db);
        return db.companyDrives[idx];
      }
      throw new Error('Drive not found');
    },
    async delete({ where }: any) {
      const db = loadLocalData();
      db.companyDrives = (db.companyDrives || []).filter((d) => d.id !== where.id);
      saveLocalData(db);
      return { count: 1 };
    }
  },
  driveApplication: {
    async findMany(args?: any) {
      const db = loadLocalData();
      let list = [...(db.driveApplications || [])];
      const where = args?.where;
      if (where) {
        if (where.driveId) list = list.filter((a) => a.driveId === where.driveId);
        if (where.studentId) list = list.filter((a) => Number(a.studentId) === Number(where.studentId));
        if (where.status) list = list.filter((a) => a.status === where.status);
      }
      return list;
    },
    async findFirst({ where }: any) {
      const db = loadLocalData();
      return (db.driveApplications || []).find(
        (a) => a.driveId === where.driveId && Number(a.studentId) === Number(where.studentId)
      ) || null;
    },
    async upsert({ where, update, create }: any) {
      const db = loadLocalData();
      if (!db.driveApplications) db.driveApplications = [];
      const driveId = where?.driveId_studentId?.driveId || where?.driveId;
      const studentId = Number(where?.driveId_studentId?.studentId || where?.studentId);
      const idx = db.driveApplications.findIndex((a) => a.driveId === driveId && Number(a.studentId) === studentId);
      if (idx >= 0) {
        db.driveApplications[idx] = {
          ...db.driveApplications[idx],
          ...update,
          responseAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        saveLocalData(db);
        return db.driveApplications[idx];
      }
      const newApp = {
        id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...create,
        responseAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.driveApplications.push(newApp);
      saveLocalData(db);
      return newApp;
    },
    async update({ where, data }: any) {
      const db = loadLocalData();
      const idx = (db.driveApplications || []).findIndex((a) => a.id === where.id || (a.driveId === where.driveId && Number(a.studentId) === Number(where.studentId)));
      if (idx >= 0) {
        db.driveApplications[idx] = { ...db.driveApplications[idx], ...data, updatedAt: new Date().toISOString() };
        saveLocalData(db);
        return db.driveApplications[idx];
      }
      throw new Error('Application not found');
    }
  },
  notification: {
    async findMany(args?: any) {
      const db = loadLocalData();
      let list = [...(db.notifications || [])];
      const where = args?.where;
      if (where) {
        if (where.studentId) list = list.filter((n) => Number(n.studentId) === Number(where.studentId));
        if (where.studentEmail) list = list.filter((n) => n.studentEmail.toLowerCase() === where.studentEmail.toLowerCase());
      }
      list.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
      return list;
    },
    async create({ data }: any) {
      const db = loadLocalData();
      if (!db.notifications) db.notifications = [];
      const notif = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...data,
        sentAt: new Date().toISOString(),
      };
      db.notifications.unshift(notif);
      saveLocalData(db);
      return notif;
    },
    async createMany({ data }: any) {
      const db = loadLocalData();
      if (!db.notifications) db.notifications = [];
      const items = (Array.isArray(data) ? data : [data]).map((d) => ({
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...d,
        sentAt: new Date().toISOString(),
      }));
      db.notifications.unshift(...items);
      saveLocalData(db);
      return { count: items.length };
    }
  },
  studentNotification: {
    async findMany(args?: any) {
      return (localDb as any).notification.findMany(args);
    },
    async create(args?: any) {
      return (localDb as any).notification.create(args);
    },
    async createMany(args?: any) {
      return (localDb as any).notification.createMany(args);
    }
  },
  async $transaction(arg: any) {
    if (typeof arg === 'function') {
      return arg(localDb);
    }
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    return arg;
  },
};

// Check PostgreSQL connection on startup
if (rawPrisma) {
  rawPrisma
    .$connect()
    .then(() => {
      console.log('✅ Connected to PostgreSQL database via Prisma.');
    })
    .catch((_err: any) => {
      console.warn(
        '⚠️ PostgreSQL server not detected. Seamlessly falling back to embedded local database engine (zero Docker/Postgres required).'
      );
      useFallback = true;
      loadLocalData();
    });
} else {
  console.log('📦 Using embedded local database engine (zero Docker/Postgres required).');
  useFallback = true;
  loadLocalData();
}

export const prisma = new Proxy({} as any, {
  get(_target, modelProp: string) {
    if (modelProp === '$transaction') {
      return async (arg: any) => {
        if (!useFallback && rawPrisma) {
          try {
            return await rawPrisma.$transaction(arg);
          } catch (err: any) {
            console.warn('⚠️ Prisma $transaction failed, falling back:', err?.message || err);
            useFallback = true;
          }
        }
        return (localDb as any).$transaction(arg);
      };
    }

    const modelKey = modelProp === 'notification' ? 'studentNotification' : (modelProp === 'studentNotification' ? 'notification' : modelProp);
    const realModel = rawPrisma ? ((rawPrisma as any)[modelProp] || (rawPrisma as any)[modelKey]) : null;
    const localModel = (localDb as any)[modelProp] || (localDb as any)[modelKey];

    if (!realModel) {
      return localModel;
    }

    return new Proxy(realModel, {
      get(_modelTarget, methodProp: string) {
        const realMethod = realModel[methodProp];
        const localMethod = localModel ? localModel[methodProp] : null;

        if (typeof realMethod !== 'function') {
          return localMethod || realMethod;
        }

        return async (...args: any[]) => {
          if (!useFallback) {
            try {
              return await realMethod.apply(realModel, args);
            } catch (err: any) {
              console.warn(
                `⚠️ Prisma operation failed on ${modelProp}.${methodProp}. Falling back to in-memory store:`,
                err?.message || err
              );
              if (localMethod && typeof localMethod === 'function') {
                return await localMethod.apply(localModel, args);
              }
              throw err;
            }
          }
          if (localMethod && typeof localMethod === 'function') {
            return await localMethod.apply(localModel, args);
          }
          return null;
        };
      },
    });
  },
});




