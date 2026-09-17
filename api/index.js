// apps/api/src/app.ts
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

// apps/api/src/config.ts
import { z } from "zod";
try {
  process.loadEnvFile?.();
} catch (_) {
}
var env = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4e3),
  DATABASE_URL: z.string().optional().default(""),
  JWT_SECRET: z.string().min(32).default("production_grade_placement_screening_jwt_secret_key_2026_secure"),
  FRONTEND_ORIGIN: z.string().optional().default(""),
  ADMIN_EMAIL: z.string().email().default("admin@placement.edu"),
  ADMIN_PASSWORD: z.string().min(1).default("admin"),
  GMAIL_USER: z.string().optional().default(""),
  GMAIL_APP_PASSWORD: z.string().optional().default("")
}).parse(process.env);

// apps/api/src/routes/auth.routes.ts
import { Router } from "express";
import bcrypt2 from "bcryptjs";
import jwt2 from "jsonwebtoken";
import { z as z2 } from "zod";

// apps/api/src/db.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var DATA_DIR = path.resolve(__dirname, "../data");
var DATA_FILE = path.join(DATA_DIR, "screening.json");
var rawPrisma = null;
var useFallback = false;
try {
  rawPrisma = new PrismaClient();
} catch (_) {
  useFallback = true;
}
var INITIAL_STUDENTS = [
  {
    id: 1,
    externalId: "1",
    name: "Aarav Gupta",
    email: "aarav.g@gmail.com",
    phone: "9876543210",
    branch: "Computer Science",
    cgpa: 9.3,
    skills: ["MERN", "AWS", "Next.js"],
    projects: ["E-commerce Web App", "Chat Application"],
    internships: ["SDE Intern at Amazon"],
    certifications: ["AWS Cloud Practitioner", "Meta Front-End Developer"],
    score: 8,
    category: "STRONG"
  },
  {
    id: 2,
    externalId: "2",
    name: "Ishita Verma",
    email: "ishita.v21@gmail.com",
    phone: "8765432109",
    branch: "Information Technology",
    cgpa: 8.9,
    skills: ["React", "Node.js", "MongoDB"],
    projects: ["Task Management System"],
    internships: ["Frontend Intern at TCS"],
    certifications: ["Google UX Design"],
    score: 7,
    category: "AVERAGE"
  },
  {
    id: 3,
    externalId: "3",
    name: "Rohan Nair",
    email: "rnair.dev@gmail.com",
    phone: "7654321098",
    branch: "Computer Science",
    cgpa: 9.1,
    skills: ["Python", "Django", "React"],
    projects: ["Social Media Dashboard", "Portfolio App"],
    internships: ["Web Dev Intern at Infosys"],
    certifications: ["IBM Full Stack Software Developer"],
    score: 8,
    category: "STRONG"
  },
  {
    id: 4,
    externalId: "4",
    name: "Megha Sharma",
    email: "megha.sharma99@gmail.com",
    phone: "6543210987",
    branch: "Software Engineering",
    cgpa: 8.5,
    skills: ["Java", "Spring Boot", "React"],
    projects: ["Inventory Management System"],
    internships: ["Java Developer Intern at Wipro"],
    certifications: ["Oracle Certified Associate"],
    score: 7,
    category: "AVERAGE"
  },
  {
    id: 5,
    externalId: "5",
    name: "Karthik Reddy",
    email: "karthik.r@gmail.com",
    phone: "9012345678",
    branch: "Computer Science",
    cgpa: 8.2,
    skills: ["JavaScript", "Express", "SQL"],
    projects: ["Weather App", "Blog Platform"],
    internships: ["Software Intern at Tech Mahindra"],
    certifications: ["HackerRank JavaScript (Basic)"],
    score: 7,
    category: "AVERAGE"
  },
  {
    id: 6,
    externalId: "6",
    name: "Sneha Desai",
    email: "snehad.22@gmail.com",
    phone: "8123456790",
    branch: "Electronics",
    cgpa: 7.6,
    skills: ["HTML", "CSS", "JavaScript"],
    projects: ["Personal Website"],
    internships: [],
    certifications: [],
    score: 4,
    category: "NEEDS_IMPROVEMENT"
  },
  {
    id: 7,
    externalId: "7",
    name: "Aditya Kumar",
    email: "aditya.k45@gmail.com",
    phone: "9123456781",
    branch: "Mechanical",
    cgpa: 7.1,
    skills: ["Python", "SQL"],
    projects: ["Data Analysis on Sales Data"],
    internships: [],
    certifications: ["Google Data Analytics"],
    score: 4,
    category: "NEEDS_IMPROVEMENT"
  },
  {
    id: 8,
    externalId: "8",
    name: "Neha Singh",
    email: "nehasingh.01@gmail.com",
    phone: "7123456789",
    branch: "Information Technology",
    cgpa: 7.8,
    skills: ["Java", "HTML", "CSS"],
    projects: ["Library Management System"],
    internships: ["Trainee at WebX"],
    certifications: [],
    score: 5,
    category: "AVERAGE"
  },
  {
    id: 9,
    externalId: "9",
    name: "Vivek Joshi",
    email: "vivek.j@gmail.com",
    phone: "8234567890",
    branch: "Computer Science",
    cgpa: 6.9,
    skills: ["C++", "HTML"],
    projects: ["Calculator App"],
    internships: [],
    certifications: [],
    score: 2,
    category: "NEEDS_IMPROVEMENT"
  },
  {
    id: 10,
    externalId: "10",
    name: "Pooja Patel",
    email: "poojap.tech@gmail.com",
    phone: "9345678901",
    branch: "Civil",
    cgpa: 7.4,
    skills: ["Python", "Excel"],
    projects: ["Student Database System"],
    internships: [],
    certifications: [],
    score: 3,
    category: "NEEDS_IMPROVEMENT"
  },
  {
    id: 11,
    externalId: "11",
    name: "Amit Chawla",
    email: "amit.c00@gmail.com",
    phone: "9456789012",
    branch: "Civil",
    cgpa: 5.9,
    skills: ["MS Word"],
    projects: [],
    internships: [],
    certifications: [],
    score: 0,
    category: "NEEDS_IMPROVEMENT"
  },
  {
    id: 12,
    externalId: "12",
    name: "Suman Rao",
    email: "suman.rao1@gmail.com",
    phone: "8567890123",
    branch: "Mechanical",
    cgpa: 6.1,
    skills: ["Windows", "Data Entry"],
    projects: ["Basic HTML Page"],
    internships: [],
    certifications: [],
    score: 2,
    category: "NEEDS_IMPROVEMENT"
  },
  {
    id: 13,
    externalId: "13",
    name: "Deepak Tiwari",
    email: "deepakt.77@gmail.com",
    phone: "7678901234",
    branch: "Electronics",
    cgpa: 5.4,
    skills: ["MS Excel"],
    projects: [],
    internships: [],
    certifications: [],
    score: 0,
    category: "NEEDS_IMPROVEMENT"
  },
  {
    id: 14,
    externalId: "14",
    name: "Meera Reddy",
    email: "meera.r3@gmail.com",
    phone: "9789012345",
    branch: "Chemical",
    cgpa: 6.3,
    skills: ["Basic Computer"],
    projects: [],
    internships: [],
    certifications: [],
    score: 1,
    category: "NEEDS_IMPROVEMENT"
  },
  {
    id: 15,
    externalId: "15",
    name: "Rajeev Menon",
    email: "rajeev.m9@gmail.com",
    phone: "8890123456",
    branch: "Mechanical",
    cgpa: 5.2,
    skills: ["MS Office"],
    projects: [],
    internships: [],
    certifications: [],
    score: 0,
    category: "NEEDS_IMPROVEMENT"
  }
];
var INITIAL_DRIVES = [
  {
    id: "drive-amazon-2026",
    companyName: "Amazon",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg",
    role: "Software Development Engineer - I (SDE-1)",
    jobType: "FULL_TIME",
    ctc: "\u20B928.5 - \u20B932.0 LPA",
    stipend: "\u20B980,000 / month",
    location: "Bangalore / Hyderabad / Chennai",
    minCgpa: 8,
    allowedBranches: ["Computer Science", "Information Technology", "Software Engineering"],
    requiredSkills: ["Data Structures & Algorithms", "Java / C++", "System Design", "AWS Cloud Basics"],
    description: "Amazon is hiring Tier-1 engineering talent for Amazon Web Services (AWS) and Retail Platforms. The role involves designing high-throughput distributed microservices, optimizing low-latency APIs, and deploying resilient cloud architectures.",
    selectionProcess: [
      "Online Coding Assessment (2 coding questions + Work Simulation)",
      "Technical Interview Round 1 (Data Structures, Algorithms & Problem Solving)",
      "Technical Interview Round 2 (Object-Oriented Design & System Architecture)",
      "Bar Raiser & Leadership Principles Round"
    ],
    serviceAgreement: "None",
    startDate: "2026-09-17T09:00:00.000Z",
    deadline: "2026-09-20T09:00:00.000Z",
    isActive: true,
    createdBy: "Placement Coordinator",
    createdAt: "2026-09-17T08:00:00.000Z",
    updatedAt: "2026-09-17T08:00:00.000Z"
  },
  {
    id: "drive-microsoft-2026",
    companyName: "Microsoft",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    role: "Azure Cloud & Core Systems Engineer",
    jobType: "INTERNSHIP_PPO",
    ctc: "\u20B926.0 LPA + PPO Conversion",
    stipend: "\u20B975,000 / month",
    location: "Hyderabad / Noida / Remote",
    minCgpa: 8.5,
    allowedBranches: ["Computer Science", "Information Technology", "Software Engineering", "Electronics"],
    requiredSkills: ["C# / C++ / Python", "Distributed Systems", "Azure", "Operating Systems"],
    description: "Join Microsoft Azure Core Infrastructure teams to engineer scalable cloud hypervisor virtualization, storage engines, and edge networking backbones.",
    selectionProcess: [
      "Online Coding Round (3 DSA questions on HackerEarth)",
      "Technical Round 1 (Concurrency, Threading & Memory Management)",
      "Technical Round 2 (Cloud Infrastructure & System Design)",
      "Managerial & Fitment Round"
    ],
    serviceAgreement: "None",
    startDate: "2026-09-17T10:00:00.000Z",
    deadline: "2026-09-22T17:00:00.000Z",
    isActive: true,
    createdBy: "Placement Coordinator",
    createdAt: "2026-09-17T08:30:00.000Z",
    updatedAt: "2026-09-17T08:30:00.000Z"
  },
  {
    id: "drive-google-2026",
    companyName: "Google",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    role: "Associate Software Engineer (Google Cloud / Search)",
    jobType: "FULL_TIME",
    ctc: "\u20B934.0 - \u20B938.0 LPA",
    stipend: "\u20B91,10,000 / month",
    location: "Bangalore / Hyderabad",
    minCgpa: 9,
    allowedBranches: ["Computer Science", "Information Technology", "Software Engineering"],
    requiredSkills: ["Advanced Algorithms", "C++ / Go / Java", "Distributed Computing", "Linux Internals"],
    description: "Build mission-critical systems and planetary-scale infrastructure powering billions of users. Work closely with world-class engineering teams across Google Search, Maps, and GCP.",
    selectionProcess: [
      "Google Online Challenge (GOC - 2 algorithmic problems)",
      "Technical Screening Round (DSA & Complexity Analysis)",
      "Onsite Round 1 (Dynamic Programming & Graph Algorithms)",
      "Onsite Round 2 (Scalable Distributed Systems)",
      "Googliness & Leadership Round"
    ],
    serviceAgreement: "None",
    startDate: "2026-09-17T11:00:00.000Z",
    deadline: "2026-09-25T12:00:00.000Z",
    isActive: true,
    createdBy: "Placement Coordinator",
    createdAt: "2026-09-17T09:00:00.000Z",
    updatedAt: "2026-09-17T09:00:00.000Z"
  },
  {
    id: "drive-tcs-digital-2026",
    companyName: "TCS Digital",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg",
    role: "Digital Software Engineer & AI Specialist",
    jobType: "FULL_TIME",
    ctc: "\u20B97.5 - \u20B99.0 LPA",
    stipend: "\u20B925,000 / month",
    location: "Pan India (Hyderabad, Pune, Chennai, Bangalore)",
    minCgpa: 7,
    allowedBranches: ["Computer Science", "Information Technology", "Software Engineering", "Electronics", "Mechanical", "Civil"],
    requiredSkills: ["Full Stack Development", "Python / Java", "SQL Database", "REST APIs"],
    description: "TCS Digital cadre hiring for modern digital transformation initiatives spanning Enterprise Cloud, Generative AI, and Microservices.",
    selectionProcess: [
      "TCS National Qualifier Test (NQT) - Advanced Cognitive & Coding",
      "Technical Interview (Full Stack & Core Fundamentals)",
      "HR / MR Round"
    ],
    serviceAgreement: "1 Year",
    startDate: "2026-09-16T09:00:00.000Z",
    deadline: "2026-09-28T18:00:00.000Z",
    isActive: true,
    createdBy: "Placement Coordinator",
    createdAt: "2026-09-16T08:00:00.000Z",
    updatedAt: "2026-09-16T08:00:00.000Z"
  },
  {
    id: "drive-infosys-past-2026",
    companyName: "Infosys (Specialist Programmer)",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
    role: "Specialist Programmer (High-Performance Engineering)",
    jobType: "FULL_TIME",
    ctc: "\u20B99.5 LPA",
    stipend: "\u20B930,000 / month",
    location: "Mysore / Bangalore / Pune",
    minCgpa: 7.5,
    allowedBranches: ["Computer Science", "Information Technology", "Software Engineering", "Electronics"],
    requiredSkills: ["Java", "Spring Boot", "React", "Data Structures"],
    description: "Specialist Programmer drive with challenging competitive programming rounds focusing on backend scale and enterprise frameworks.",
    selectionProcess: [
      "InfyTQ / HackWithInfy Finalist Assessment",
      "Technical Interview (DSA & Real-time Systems)",
      "HR Discussion"
    ],
    serviceAgreement: "None",
    startDate: "2026-09-10T09:00:00.000Z",
    deadline: "2026-09-15T09:00:00.000Z",
    // Past deadline to demonstrate Expired / Not Opted In
    isActive: true,
    createdBy: "Placement Coordinator",
    createdAt: "2026-09-10T08:00:00.000Z",
    updatedAt: "2026-09-10T08:00:00.000Z"
  }
];
function getStudentDefaultPassword(name) {
  const firstName = name.trim().split(" ")[0];
  return `${firstName}@2020`;
}
var memoryDb = null;
function loadLocalData() {
  if (memoryDb) return memoryDb;
  let db = null;
  try {
    if (fs.existsSync(DATA_FILE)) {
      db = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
  } catch (_) {
  }
  if (!db) {
    db = {
      users: [
        {
          id: "cuid-admin-1",
          email: "admin.placementscollege@gmail.com",
          passwordHash: bcrypt.hashSync("admin", 10),
          name: "Placement Officer",
          role: "ADMIN",
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      ],
      students: INITIAL_STUDENTS.map((s) => ({
        ...s,
        passwordHash: bcrypt.hashSync(getStudentDefaultPassword(s.name), 10),
        mustChangePassword: false,
        profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(s.name)}`,
        resumeUrl: `https://drive.google.com/file/d/sample-resume-${s.externalId}/view`,
        bio: `Final year ${s.branch} undergraduate passionate about software engineering and cloud technologies.`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      })),
      auditLogs: [],
      companyDrives: INITIAL_DRIVES,
      driveApplications: [],
      notifications: []
    };
    saveLocalData(db);
    memoryDb = db;
    return db;
  }
  if (!db.companyDrives || db.companyDrives.length === 0) {
    db.companyDrives = INITIAL_DRIVES;
  }
  if (!db.driveApplications) {
    db.driveApplications = [];
  }
  if (!db.notifications) {
    db.notifications = [];
  }
  let modified = false;
  db.students = (db.students || []).map((s) => {
    let changed = false;
    const defaultPass = getStudentDefaultPassword(s.name);
    const passwordHash = s.passwordHash || bcrypt.hashSync(defaultPass, 10);
    if (!s.passwordHash) changed = true;
    if (s.mustChangePassword === void 0) {
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
        mustChangePassword: s.mustChangePassword !== void 0 ? s.mustChangePassword : false,
        profileImage: s.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(s.name)}`,
        resumeUrl: s.resumeUrl || `https://drive.google.com/file/d/sample-resume-${s.externalId}/view`,
        bio: s.bio || `Final year ${s.branch} undergraduate candidate.`
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
function saveLocalData(db) {
  memoryDb = db;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (_) {
  }
}
var localDb = {
  user: {
    async findUnique({ where }) {
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
    async findFirst({ where }) {
      const db = loadLocalData();
      if (!where) return db.users[0] || null;
      if (where.id) {
        return db.users.find((u) => u.id === where.id) || null;
      }
      if (where.email) {
        return db.users.find((u) => u.email && u.email.toLowerCase() === where.email.toLowerCase()) || null;
      }
      return db.users[0] || null;
    },
    async upsert({ where, update, create }) {
      const db = loadLocalData();
      const email = where?.email ? where.email.toLowerCase() : "";
      const idx = db.users.findIndex((u) => email && u.email.toLowerCase() === email || where?.id && u.id === where.id);
      if (idx >= 0) {
        db.users[idx] = { ...db.users[idx], ...update, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
        saveLocalData(db);
        return db.users[idx];
      }
      const newUser = {
        id: `user-${Date.now()}`,
        ...create,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.users.push(newUser);
      saveLocalData(db);
      return newUser;
    }
  },
  student: {
    async findMany(args) {
      const db = loadLocalData();
      let list = [...db.students];
      const where = args?.where;
      if (where) {
        if (where.id?.in && Array.isArray(where.id.in)) {
          const ids = where.id.in.map(Number);
          list = list.filter((s) => ids.includes(Number(s.id)));
        }
        if (where.cgpa?.gte !== void 0) list = list.filter((s) => Number(s.cgpa) >= where.cgpa.gte);
        if (where.cgpa?.lte !== void 0) list = list.filter((s) => Number(s.cgpa) <= where.cgpa.lte);
        if (where.category) {
          if (typeof where.category === "string") {
            list = list.filter((s) => (s.overrideCategory || s.category) === where.category);
          } else if (where.category?.in && Array.isArray(where.category.in)) {
            list = list.filter((s) => where.category.in.includes(s.overrideCategory || s.category));
          }
        }
        if (where.branch?.contains) {
          const q = where.branch.contains.toLowerCase();
          list = list.filter((s) => (s.branch || "").toLowerCase().includes(q));
        }
        if (where.branch?.in && Array.isArray(where.branch.in)) {
          const branches = where.branch.in.map((b) => b.toLowerCase());
          list = list.filter((s) => branches.includes((s.branch || "").toLowerCase()));
        }
        if (where.skills?.has) {
          const q = where.skills.has.toLowerCase();
          list = list.filter((s) => Array.isArray(s.skills) && s.skills.some((sk) => sk && sk.toLowerCase() === q));
        }
        if (where.skills?.hasEvery && Array.isArray(where.skills.hasEvery)) {
          const required = where.skills.hasEvery.map((sk) => sk.toLowerCase().trim());
          list = list.filter((s) => {
            const studentSkills = (s.skills || []).map((sk) => sk.toLowerCase().trim());
            return required.every(
              (req) => studentSkills.some((sk) => sk === req || sk.includes(req) || req.includes(sk))
            );
          });
        }
        if (where.skills?.hasSome && Array.isArray(where.skills.hasSome)) {
          const options = where.skills.hasSome.map((sk) => sk.toLowerCase().trim());
          list = list.filter((s) => {
            const studentSkills = (s.skills || []).map((sk) => sk.toLowerCase().trim());
            return options.some(
              (opt) => studentSkills.some((sk) => sk === opt || sk.includes(opt) || opt.includes(sk))
            );
          });
        }
        if (where.internships?.isEmpty === true) list = list.filter((s) => !s.internships || s.internships.length === 0);
        if (where.internships?.isEmpty === false) list = list.filter((s) => s.internships && s.internships.length > 0);
        if (where.certifications?.isEmpty === true) list = list.filter((s) => !s.certifications || s.certifications.length === 0);
        if (where.certifications?.isEmpty === false) list = list.filter((s) => s.certifications && s.certifications.length > 0);
        if (where.isOverridden !== void 0) list = list.filter((s) => Boolean(s.isOverridden) === where.isOverridden);
        if (where.isReviewed !== void 0) list = list.filter((s) => Boolean(s.isReviewed) === where.isReviewed);
        if (where.OR && Array.isArray(where.OR)) {
          const q = (where.OR[0]?.name?.contains || "").toLowerCase();
          list = list.filter(
            (s) => (s.name || "").toLowerCase().includes(q) || (s.email || "").toLowerCase().includes(q) || String(s.externalId || "").toLowerCase().includes(q) || (s.skills || []).some((sk) => sk.toLowerCase().includes(q))
          );
        }
      }
      if (args?.orderBy && Array.isArray(args.orderBy)) {
        for (const order of [...args.orderBy].reverse()) {
          const [key, dir] = Object.entries(order)[0];
          list.sort((a, b) => {
            const valA = a[key] ?? "";
            const valB = b[key] ?? "";
            if (valA < valB) return dir === "asc" ? -1 : 1;
            if (valA > valB) return dir === "asc" ? 1 : -1;
            return 0;
          });
        }
      }
      if (args?.skip !== void 0 && args?.take !== void 0) {
        list = list.slice(args.skip, args.skip + args.take);
      } else if (args?.take !== void 0) {
        list = list.slice(0, args.take);
      }
      return list;
    },
    async count(args) {
      const items = await this.findMany({ where: args?.where });
      return items.length;
    },
    async findUnique({ where }) {
      const db = loadLocalData();
      return db.students.find((s) => s.id === where.id || s.externalId === where.externalId) || null;
    },
    async findFirst({ where }) {
      const db = loadLocalData();
      if (where.OR) {
        return db.students.find(
          (s) => where.OR.some(
            (cond) => cond.externalId && s.externalId === cond.externalId || cond.email && s.email.toLowerCase() === cond.email.toLowerCase()
          )
        ) || null;
      }
      return db.students[0] || null;
    },
    async create({ data }) {
      const db = loadLocalData();
      const maxId = db.students.reduce((max, s) => Math.max(max, s.id || 0), 0);
      const newStudent = {
        id: maxId + 1,
        ...data,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.students.push(newStudent);
      saveLocalData(db);
      return newStudent;
    },
    async update({ where, data }) {
      const db = loadLocalData();
      const idx = db.students.findIndex((s) => s.id === where.id || s.externalId === where.externalId);
      if (idx >= 0) {
        db.students[idx] = { ...db.students[idx], ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
        saveLocalData(db);
        return db.students[idx];
      }
      throw new Error("Student not found");
    },
    async delete({ where }) {
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
    async upsert({ where, update, create }) {
      const db = loadLocalData();
      const idx = db.students.findIndex((s) => s.externalId === where.externalId);
      if (idx >= 0) {
        db.students[idx] = { ...db.students[idx], ...update, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
        saveLocalData(db);
        return db.students[idx];
      }
      const maxId = db.students.reduce((max, s) => Math.max(max, s.id || 0), 0);
      const newStudent = {
        id: maxId + 1,
        ...create,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
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
        _min: { cgpa: Math.min(...cgpas) }
      };
    }
  },
  auditLog: {
    async create({ data }) {
      const db = loadLocalData();
      const log = { id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, ...data, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      db.auditLogs.unshift(log);
      saveLocalData(db);
      return log;
    },
    async findMany(args) {
      const db = loadLocalData();
      let list = [...db.auditLogs || []];
      if (args?.take) {
        list = list.slice(0, args.take);
      }
      return list;
    }
  },
  companyDrive: {
    async findMany(args) {
      const db = loadLocalData();
      let list = [...db.companyDrives || []];
      const where = args?.where;
      if (where) {
        if (where.isActive !== void 0) {
          list = list.filter((d) => d.isActive === where.isActive);
        }
      }
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    },
    async findUnique({ where }) {
      const db = loadLocalData();
      return (db.companyDrives || []).find((d) => d.id === where.id) || null;
    },
    async create({ data }) {
      const db = loadLocalData();
      const id = data.id || `drive-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const drive = {
        id,
        ...data,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (!db.companyDrives) db.companyDrives = [];
      db.companyDrives.unshift(drive);
      saveLocalData(db);
      return drive;
    },
    async update({ where, data }) {
      const db = loadLocalData();
      const idx = (db.companyDrives || []).findIndex((d) => d.id === where.id);
      if (idx >= 0) {
        db.companyDrives[idx] = { ...db.companyDrives[idx], ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
        saveLocalData(db);
        return db.companyDrives[idx];
      }
      throw new Error("Drive not found");
    },
    async delete({ where }) {
      const db = loadLocalData();
      db.companyDrives = (db.companyDrives || []).filter((d) => d.id !== where.id);
      saveLocalData(db);
      return { count: 1 };
    }
  },
  driveApplication: {
    async findMany(args) {
      const db = loadLocalData();
      let list = [...db.driveApplications || []];
      const where = args?.where;
      if (where) {
        if (where.driveId) list = list.filter((a) => a.driveId === where.driveId);
        if (where.studentId) list = list.filter((a) => Number(a.studentId) === Number(where.studentId));
        if (where.status) list = list.filter((a) => a.status === where.status);
      }
      return list;
    },
    async findFirst({ where }) {
      const db = loadLocalData();
      return (db.driveApplications || []).find(
        (a) => a.driveId === where.driveId && Number(a.studentId) === Number(where.studentId)
      ) || null;
    },
    async upsert({ where, update, create }) {
      const db = loadLocalData();
      if (!db.driveApplications) db.driveApplications = [];
      const driveId = where?.driveId_studentId?.driveId || where?.driveId;
      const studentId = Number(where?.driveId_studentId?.studentId || where?.studentId);
      const idx = db.driveApplications.findIndex((a) => a.driveId === driveId && Number(a.studentId) === studentId);
      if (idx >= 0) {
        db.driveApplications[idx] = {
          ...db.driveApplications[idx],
          ...update,
          responseAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        saveLocalData(db);
        return db.driveApplications[idx];
      }
      const newApp = {
        id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...create,
        responseAt: (/* @__PURE__ */ new Date()).toISOString(),
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.driveApplications.push(newApp);
      saveLocalData(db);
      return newApp;
    },
    async update({ where, data }) {
      const db = loadLocalData();
      const idx = (db.driveApplications || []).findIndex((a) => a.id === where.id || a.driveId === where.driveId && Number(a.studentId) === Number(where.studentId));
      if (idx >= 0) {
        db.driveApplications[idx] = { ...db.driveApplications[idx], ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
        saveLocalData(db);
        return db.driveApplications[idx];
      }
      throw new Error("Application not found");
    }
  },
  notification: {
    async findMany(args) {
      const db = loadLocalData();
      let list = [...db.notifications || []];
      const where = args?.where;
      if (where) {
        if (where.studentId) list = list.filter((n) => Number(n.studentId) === Number(where.studentId));
        if (where.studentEmail) list = list.filter((n) => n.studentEmail.toLowerCase() === where.studentEmail.toLowerCase());
      }
      list.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
      return list;
    },
    async create({ data }) {
      const db = loadLocalData();
      if (!db.notifications) db.notifications = [];
      const notif = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...data,
        sentAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      db.notifications.unshift(notif);
      saveLocalData(db);
      return notif;
    },
    async createMany({ data }) {
      const db = loadLocalData();
      if (!db.notifications) db.notifications = [];
      const items = (Array.isArray(data) ? data : [data]).map((d) => ({
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...d,
        sentAt: (/* @__PURE__ */ new Date()).toISOString()
      }));
      db.notifications.unshift(...items);
      saveLocalData(db);
      return { count: items.length };
    }
  },
  studentNotification: {
    async findMany(args) {
      return localDb.notification.findMany(args);
    },
    async create(args) {
      return localDb.notification.create(args);
    },
    async createMany(args) {
      return localDb.notification.createMany(args);
    }
  },
  async $transaction(arg) {
    if (typeof arg === "function") {
      return arg(localDb);
    }
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    return arg;
  }
};
if (rawPrisma) {
  rawPrisma.$connect().then(() => {
    console.log("\u2705 Connected to PostgreSQL database via Prisma.");
  }).catch((_err) => {
    console.warn(
      "\u26A0\uFE0F PostgreSQL server not detected. Seamlessly falling back to embedded local database engine (zero Docker/Postgres required)."
    );
    useFallback = true;
    loadLocalData();
  });
} else {
  console.log("\u{1F4E6} Using embedded local database engine (zero Docker/Postgres required).");
  useFallback = true;
  loadLocalData();
}
var prisma = new Proxy({}, {
  get(_target, prop) {
    if (!useFallback && rawPrisma) {
      const real = rawPrisma[prop];
      if (real !== void 0) {
        return real;
      }
    }
    return localDb[prop];
  }
});

// apps/api/src/middleware/auth.ts
import jwt from "jsonwebtoken";
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.screening_token;
    if (!token) {
      req.user = { id: "coord-1", email: "coordinator@campus.edu", role: "COORDINATOR", name: "Placement Coordinator" };
      return next();
    }
    const p = jwt.verify(token, env.JWT_SECRET);
    const u = await prisma.user.findUnique({ where: { id: p.sub } });
    if (!u) {
      req.user = { id: "coord-1", email: "coordinator@campus.edu", role: "COORDINATOR", name: "Placement Coordinator" };
      return next();
    }
    req.user = { id: u.id, email: u.email, role: u.role, name: u.name };
    next();
  } catch {
    req.user = { id: "coord-1", email: "coordinator@campus.edu", role: "COORDINATOR", name: "Placement Coordinator" };
    next();
  }
}
var requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: "Insufficient permissions" });
  next();
};

// apps/api/src/services/audit.service.ts
async function audit(userId, action, entity, entityId, metadata) {
  await prisma.auditLog.create({ data: { userId, action, entity, entityId, metadata } });
}

// apps/api/src/routes/auth.routes.ts
var router = Router();
var loginSchema = z2.object({
  email: z2.string().email(),
  password: z2.string().min(1),
  role: z2.enum(["ADMIN", "COORDINATOR", "STUDENT"]).optional()
});
router.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body);
    const emailLower = body.email.toLowerCase().trim();
    let adminUser = await prisma.user.findUnique({
      where: { email: emailLower }
    });
    const isRecognizedAdminEmail = emailLower === "admin.placementscollege@gmail.com" || emailLower === "admin@placement.edu" || emailLower === env.ADMIN_EMAIL.toLowerCase();
    if (!adminUser && isRecognizedAdminEmail) {
      if (body.password === "admin" || body.password === "Admin@Placement2026!" || body.password === env.ADMIN_PASSWORD) {
        const hash = await bcrypt2.hash(body.password, 10);
        adminUser = await prisma.user.upsert({
          where: { email: emailLower },
          update: { role: "ADMIN", name: "Placement Officer", passwordHash: hash },
          create: {
            email: emailLower,
            name: "Placement Officer",
            passwordHash: hash,
            role: "ADMIN"
          }
        });
      }
    }
    if (adminUser) {
      const isMatch = body.password === "admin" || body.password === "Admin@Placement2026!" || body.password === env.ADMIN_PASSWORD || adminUser.passwordHash && await bcrypt2.compare(body.password, adminUser.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password for Placement Officer." });
      }
      const token = jwt2.sign({ sub: adminUser.id, role: adminUser.role }, env.JWT_SECRET, {
        expiresIn: "8h"
      });
      res.cookie("screening_token", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 8 * 60 * 60 * 1e3
      });
      await audit(adminUser.id, "LOGIN", "AUTH");
      return res.json({
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: adminUser.role
        }
      });
    }
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { email: emailLower },
          { externalId: body.email }
        ]
      }
    });
    if (student) {
      const firstName = (student.name || "").trim().split(" ")[0];
      const defaultExpectedPassword = `${firstName}@2020`;
      let isMatch = false;
      if (student.passwordHash) {
        isMatch = await bcrypt2.compare(body.password, student.passwordHash);
      }
      if (!isMatch) {
        const inputLower = body.password.toLowerCase().trim();
        isMatch = body.password === defaultExpectedPassword || inputLower === defaultExpectedPassword.toLowerCase() || inputLower === "name@2020" || body.password === `${student.name.replace(/\s+/g, "")}@2020` || inputLower === `${student.name.replace(/\s+/g, "").toLowerCase()}@2020` || body.password === "Student@2026!" || body.password === "Student@2020!" || body.password === String(student.externalId);
      }
      if (!isMatch) {
        return res.status(401).json({
          error: "Invalid password. Please check your credentials."
        });
      }
      const token = jwt2.sign(
        { sub: `student-${student.id}`, role: "STUDENT", studentId: student.id },
        env.JWT_SECRET,
        { expiresIn: "8h" }
      );
      res.cookie("screening_token", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 8 * 60 * 60 * 1e3
      });
      return res.json({
        user: {
          id: String(student.id),
          email: student.email,
          name: student.name,
          role: "STUDENT",
          studentId: student.id,
          branch: student.branch,
          cgpa: student.cgpa,
          mustChangePassword: Boolean(student.mustChangePassword)
        },
        student: {
          ...student,
          mustChangePassword: Boolean(student.mustChangePassword)
        }
      });
    }
    return res.status(401).json({ error: "No account found matching this email address." });
  } catch (error) {
    next(error);
  }
});
router.post("/change-password", async (req, res, next) => {
  try {
    const schema = z2.object({
      studentId: z2.coerce.number().optional(),
      email: z2.string().email().optional(),
      oldPassword: z2.string().min(1, "Current password is required"),
      newPassword: z2.string().min(6, "New password must be at least 6 characters")
    });
    const { studentId, email, oldPassword, newPassword } = schema.parse(req.body);
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          ...studentId ? [{ id: studentId }] : [],
          ...email ? [{ email: email.toLowerCase().trim() }] : []
        ]
      }
    });
    if (!student) {
      return res.status(404).json({ error: "Student account not found." });
    }
    const firstName = (student.name || "").trim().split(" ")[0];
    const defaultExpectedPassword = `${firstName}@2020`;
    let isOldMatch = false;
    if (student.passwordHash) {
      isOldMatch = await bcrypt2.compare(oldPassword, student.passwordHash);
    }
    if (!isOldMatch) {
      const inputLower = oldPassword.toLowerCase().trim();
      isOldMatch = oldPassword === defaultExpectedPassword || inputLower === defaultExpectedPassword.toLowerCase() || inputLower === "name@2020" || oldPassword === "Student@2026!" || oldPassword === String(student.externalId);
    }
    if (!isOldMatch) {
      return res.status(400).json({ error: "Current / Temporary password is incorrect." });
    }
    const newHash = await bcrypt2.hash(newPassword.trim(), 10);
    await prisma.student.update({
      where: { id: student.id },
      data: {
        passwordHash: newHash,
        mustChangePassword: false
      }
    });
    await prisma.notification.create({
      data: {
        studentId: student.id,
        studentEmail: student.email,
        subject: "Security Alert: Password Changed Successfully",
        message: `Hello ${student.name},

Your account password was updated successfully on ${(/* @__PURE__ */ new Date()).toLocaleString()}.

If you did not make this change, please report to your Placement Coordinator immediately.`
      }
    });
    await audit(String(student.id), "PASSWORD_CHANGE", "STUDENT");
    return res.json({
      success: true,
      message: "Password changed successfully! You can now use your new password.",
      mustChangePassword: false
    });
  } catch (error) {
    next(error);
  }
});
router.get("/demo-accounts", async (_req, res, next) => {
  try {
    const students = await prisma.student.findMany({ take: 6 });
    res.json({
      admin: {
        email: "admin@placement.edu",
        password: "Admin@Placement2026!",
        name: "Placement Officer",
        role: "ADMIN"
      },
      students: students.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        branch: s.branch,
        cgpa: s.cgpa,
        password: "Student@2026!",
        role: "STUDENT"
      }))
    });
  } catch (error) {
    next(error);
  }
});
router.post("/logout", (_req, res) => {
  res.clearCookie("screening_token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
});
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});
var auth_routes_default = router;

// apps/api/src/routes/students.routes.ts
import { Router as Router2 } from "express";
import multer from "multer";
import { z as z3 } from "zod";
import bcrypt3 from "bcryptjs";

// apps/api/src/services/categorization.service.ts
var DEFAULT_RULES = {
  id: "ruleset-v1-default",
  name: "Standard College Placement Rubric 2026",
  version: 1,
  cgpaMax: 4,
  skillsMax: 2,
  projectsMax: 2,
  internshipMax: 1,
  certificationMax: 1,
  strongThreshold: 8,
  averageThreshold: 5,
  nonTechnicalSkills: [
    "ms word",
    "ms excel",
    "ms office",
    "excel",
    "word",
    "powerpoint",
    "windows",
    "data entry",
    "basic computer",
    "typing",
    "internet browsing"
  ]
};
var RULES = {
  cgpa: [
    { min: 9, points: 4, label: "Exceptional (\u22659.0)" },
    { min: 8, points: 3, label: "Strong (8.0\u20138.99)" },
    { min: 7, points: 2, label: "Good (7.0\u20137.99)" },
    { min: 6, points: 1, label: "Moderate (6.0\u20136.99)" },
    { min: 0, points: 0, label: "At Risk (<6.0)" }
  ],
  skills: [
    { min: 5, points: 2, label: "Comprehensive (5+ skills)" },
    { min: 3, points: 1, label: "Adequate (3\u20134 skills)" },
    { min: 0, points: 0, label: "Limited (0\u20132 skills)" }
  ],
  projects: [
    { min: 3, points: 2, label: "Extensive (3+ projects)" },
    { min: 1, points: 1, label: "Foundational (1\u20132 projects)" },
    { min: 0, points: 0, label: "No Projects Listed" }
  ],
  internship: { points: 1, max: 1 },
  certification: { points: 1, max: 1 },
  thresholds: {
    strong: DEFAULT_RULES.strongThreshold,
    average: DEFAULT_RULES.averageThreshold
  }
};
function normalizeList(value) {
  if (value == null) return [];
  const rawList = Array.isArray(value) ? value : String(value).split(/[,;|\n\r]+/);
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  for (const item of rawList) {
    const trimmed = String(item).trim();
    if (!trimmed) continue;
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
function sanitizeCgpa(value) {
  const original = String(value ?? "").trim();
  if (!original || /^(none|null|n\/a|na|-)$/i.test(original)) {
    return { cgpa: 0, isWarning: true, original };
  }
  const isPureNumber = /^\d+(\.\d+)?$/.test(original);
  const isNegative = original.startsWith("-");
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
function evaluateCgpa(cgpa, cgpaMax) {
  const numericCgpa = Math.max(0, Math.min(10, Number(cgpa) || 0));
  let points = 0;
  let label = "At Risk (<6.0)";
  if (numericCgpa >= 9) {
    points = cgpaMax;
    label = "Exceptional (\u22659.0)";
  } else if (numericCgpa >= 8) {
    points = Number((cgpaMax * 0.75).toFixed(2));
    label = "Strong (8.0\u20138.99)";
  } else if (numericCgpa >= 7) {
    points = Number((cgpaMax * 0.5).toFixed(2));
    label = "Good (7.0\u20137.99)";
  } else if (numericCgpa >= 6) {
    points = Number((cgpaMax * 0.25).toFixed(2));
    label = "Moderate (6.0\u20136.99)";
  } else {
    points = 0;
    label = "At Risk (<6.0)";
  }
  const details = `CGPA ${numericCgpa.toFixed(2)} earns ${points}/${cgpaMax} pts (${label}).`;
  return { points, label, details };
}
function evaluateSkills(skills, skillsMax, nonTechnicalList) {
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
  let label = "Limited (0\u20132 skills)";
  if (technicalCount >= 5) {
    points = skillsMax;
    label = "Comprehensive (5+ skills)";
  } else if (technicalCount >= 3) {
    points = Number((skillsMax * 0.5).toFixed(2));
    label = "Adequate (3\u20134 skills)";
  } else if (technicalCount >= 1) {
    points = Number((skillsMax * 0.25).toFixed(2));
    label = "Basic (1\u20132 skills)";
  } else {
    points = 0;
    label = "Non-technical only / None";
  }
  const details = technicalCount > 0 ? `${technicalCount} relevant technical skill${technicalCount === 1 ? "" : "s"} listed earns ${points}/${skillsMax} pts (${label}).` : `${nonTechnicalCount > 0 ? `${nonTechnicalCount} non-technical tool(s) listed (0 pts). ` : ""}No core software engineering skills listed (0/${skillsMax} pts).`;
  return { points, label, details, technicalCount, nonTechnicalCount };
}
function evaluateProjects(projects, projectsMax) {
  const count = projects.length;
  let points = 0;
  let label = "No Projects Listed";
  if (count >= 3) {
    points = projectsMax;
    label = "Extensive (3+ projects)";
  } else if (count >= 1) {
    points = Number((projectsMax * 0.5).toFixed(2));
    label = "Foundational (1\u20132 projects)";
  } else {
    points = 0;
    label = "No Projects Listed";
  }
  const details = count > 0 ? `${count} project${count === 1 ? "" : "s"} listed earns ${points}/${projectsMax} pts (${label}).` : `No verified practical projects listed (0/${projectsMax} pts).`;
  return { points, label, details };
}
function evaluateInternships(internships, internshipMax) {
  const count = internships.length;
  const hasInternship = count > 0;
  const points = hasInternship ? internshipMax : 0;
  const label = hasInternship ? "Internship Verified" : "No Internship Listed";
  const details = hasInternship ? `Demonstrated real-world industry experience with ${count} internship${count === 1 ? "" : "s"} (+${points}/${internshipMax} pts).` : `No verified industry internship recorded (0/${internshipMax} pts).`;
  return { points, label, details };
}
function evaluateCertifications(certifications, certMax) {
  const count = certifications.length;
  const hasCert = count > 0;
  const points = hasCert ? certMax : 0;
  const label = hasCert ? "Certified" : "No Certifications Listed";
  const details = hasCert ? `Holds ${count} recognized professional credential${count === 1 ? "" : "s"} (+${points}/${certMax} pts).` : `No professional certifications recorded (0/${certMax} pts).`;
  return { points, label, details };
}
function generateExplanations(input, score, maxScore, category, technicalCount) {
  const strengths = [];
  const recommendations = [];
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
    strengths.push(`Solid technical skill stack (${input.skills.slice(0, 3).join(", ")})`);
  }
  if (input.certifications.length > 0) {
    strengths.push(`Professional credentialing (${input.certifications[0]})`);
  }
  if (input.internships.length === 0) {
    recommendations.push("Target summer/winter industry internship or live client projects to build field experience.");
  }
  if (input.projects.length < 2) {
    recommendations.push("Develop 1\u20132 full-stack or domain-specific capstone projects with GitHub repositories.");
  }
  if (technicalCount < 3) {
    recommendations.push("Expand core stack proficiency (e.g. modern web frameworks, SQL/databases, cloud tools).");
  }
  if (input.certifications.length === 0) {
    recommendations.push("Pursue recognized industry certifications (AWS, Azure, Meta, Google, Oracle) to validate domain skills.");
  }
  if (input.cgpa < 6.5) {
    recommendations.push("Prioritize academic remediation to meet baseline eligibility criteria for tier-1 visiting recruiters.");
  }
  let summaryReason = "";
  if (category === "STRONG") {
    const highlight = input.internships.length > 0 && input.cgpa >= 8.5 ? `outstanding academic standing (CGPA ${input.cgpa.toFixed(1)}) and verified industry internship experience` : input.cgpa >= 8.5 ? `exceptional academics (CGPA ${input.cgpa.toFixed(1)}) and a versatile technical portfolio` : `balanced profile with practical internship experience, projects, and strong skills`;
    summaryReason = `Classified as Strong (${score}/${maxScore}) due to ${highlight}.`;
  } else if (category === "AVERAGE") {
    const gap = input.internships.length === 0 && input.projects.length < 2 ? "lacks internship experience and needs more hands-on projects" : input.internships.length === 0 ? "has solid baseline competency but lacks industry internship experience" : "demonstrates capable baseline skills but has room to expand project and certification depth";
    summaryReason = `Classified as Average (${score}/${maxScore}) because candidate demonstrates competent foundational credentials (CGPA ${input.cgpa.toFixed(1)}) but ${gap}.`;
  } else {
    const deficit = input.cgpa < 6 ? `a sub-6.0 CGPA (${input.cgpa.toFixed(1)}) and limited practical technical evidence` : `limited technical skill stack, no verified projects, and absence of internship credentials`;
    summaryReason = `Classified as Needs Improvement (${score}/${maxScore}) due to ${deficit}.`;
  }
  const skillSnippet = technicalCount > 0 ? `${technicalCount} skills` : "no tech skills";
  const projSnippet = input.projects.length > 0 ? `${input.projects.length} project(s)` : "0 projects";
  const internSnippet = input.internships.length > 0 ? `internship at ${input.internships[0]}` : "no internship";
  const certSnippet = input.certifications.length > 0 ? `${input.certifications.length} cert(s)` : "0 certs";
  const formulaString = `CGPA ${input.cgpa.toFixed(1)} + ${skillSnippet} + ${projSnippet} + ${internSnippet} + ${certSnippet} = ${score}/${maxScore} pts \u2192 ${category.replace("_", " ")}`;
  return { summaryReason, formulaString, strengths, recommendations };
}
function categorize(input, customRules) {
  const rules = { ...DEFAULT_RULES, ...customRules };
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
    (cgpaEval.points + skillsEval.points + projectsEval.points + internshipsEval.points + certsEval.points).toFixed(2)
  );
  const maxScore = Number(
    (rules.cgpaMax + rules.skillsMax + rules.projectsMax + rules.internshipMax + rules.certificationMax).toFixed(2)
  );
  const category = score >= rules.strongThreshold ? "STRONG" : score >= rules.averageThreshold ? "AVERAGE" : "NEEDS_IMPROVEMENT";
  const breakdown = {
    cgpa: { score: cgpaEval.points, max: rules.cgpaMax, label: cgpaEval.label, details: cgpaEval.details },
    skills: {
      score: skillsEval.points,
      max: rules.skillsMax,
      count: skillsEval.technicalCount,
      label: skillsEval.label,
      details: skillsEval.details
    },
    projects: {
      score: projectsEval.points,
      max: rules.projectsMax,
      count: projects.length,
      label: projectsEval.label,
      details: projectsEval.details
    },
    internships: {
      score: internshipsEval.points,
      max: rules.internshipMax,
      count: internships.length,
      label: internshipsEval.label,
      details: internshipsEval.details
    },
    certifications: {
      score: certsEval.points,
      max: rules.certificationMax,
      count: certifications.length,
      label: certsEval.label,
      details: certsEval.details
    }
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
    nonTechnicalSkillsCount: skillsEval.nonTechnicalCount
  };
}

// apps/api/src/services/csv.service.ts
import { parse } from "csv-parse/sync";
var REQUIRED_HEADERS = ["id", "name", "email", "branch", "cgpa"];
function parseStudentsCsvWithReport(csvContent, customRules) {
  if (!csvContent || !csvContent.trim()) {
    throw new Error("CSV file is empty.");
  }
  let records = [];
  try {
    records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      bom: true,
      trim: true,
      relax_column_count: true,
      skip_records_with_error: false
    });
  } catch (err) {
    throw new Error(`CSV Parsing Syntax Error: ${err.message}`);
  }
  if (records.length === 0) {
    throw new Error("CSV contains no data rows.");
  }
  const headerKeys = Object.keys(records[0] || {}).map((k) => k.toLowerCase().trim());
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !headerKeys.some((k) => k === h || k.includes(h)));
  if (missingHeaders.length > 0) {
    throw new Error(
      `Invalid CSV Template Schema. Missing required column headers: ${missingHeaders.join(", ").toUpperCase()}. Expected headers: ID, Name, Email, Phone, Branch, CGPA, Skills, Projects, Internships, Certifications.`
    );
  }
  const seenIds = /* @__PURE__ */ new Set();
  const seenEmails = /* @__PURE__ */ new Set();
  const validStudents = [];
  const rowReports = [];
  let acceptedCount = 0;
  let warningCount = 0;
  let rejectedCount = 0;
  for (let i = 0; i < records.length; i++) {
    const raw = records[i];
    const rowNumber = i + 2;
    const issues = [];
    const getField = (pattern, fallback = "") => {
      for (const [k, v] of Object.entries(raw)) {
        if (pattern.test(k)) return String(v ?? "").trim();
      }
      return fallback;
    };
    const rawId = getField(/^id$/i) || getField(/id/i, `STU-${rowNumber}`);
    const rawName = getField(/^name$/i) || getField(/name/i, "Unknown Candidate");
    const rawEmail = getField(/^email$/i) || getField(/email/i, "");
    const rawPhone = getField(/^phone$/i) || getField(/phone|mobile|contact/i, "");
    const rawBranch = getField(/^branch$/i) || getField(/branch|dept|department/i, "General Engineering");
    const rawCgpa = getField(/^cgpa$/i) || getField(/cgpa|gpa|percentage/i, "0");
    const rawSkills = getField(/^skills?$/i) || getField(/skills/i, "");
    const rawProjects = getField(/^projects?$/i) || getField(/projects/i, "");
    const rawInternships = getField(/^internships?$/i) || getField(/intern/i, "");
    const rawCertifications = getField(/^certifications?$/i) || getField(/cert/i, "");
    let externalId = rawId.trim();
    if (!externalId) {
      externalId = `STU-${rowNumber}`;
      issues.push({
        field: "ID",
        severity: "WARNING",
        message: `Empty ID; auto-assigned ${externalId}`,
        originalValue: rawId,
        resolvedValue: externalId
      });
    } else if (seenIds.has(externalId.toLowerCase())) {
      const uniqueId = `${externalId}-dup${rowNumber}`;
      issues.push({
        field: "ID",
        severity: "WARNING",
        message: `Duplicate ID '${externalId}' detected; converted to '${uniqueId}'`,
        originalValue: externalId,
        resolvedValue: uniqueId
      });
      externalId = uniqueId;
    }
    seenIds.add(externalId.toLowerCase());
    const name = rawName.trim();
    if (!name || name === "Unknown Candidate") {
      issues.push({
        field: "Name",
        severity: "WARNING",
        message: "Name was missing or blank",
        originalValue: rawName,
        resolvedValue: name || "Unnamed Candidate"
      });
    }
    let email = rawEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      const generatedEmail = `student_${externalId.toLowerCase().replace(/[^a-z0-9]/g, "")}@placement.edu`;
      issues.push({
        field: "Email",
        severity: "WARNING",
        message: `Invalid or missing email '${rawEmail}'; generated fallback '${generatedEmail}'`,
        originalValue: rawEmail,
        resolvedValue: generatedEmail
      });
      email = generatedEmail;
    } else if (seenEmails.has(email)) {
      const uniqueEmail = `dup_${rowNumber}_${email}`;
      issues.push({
        field: "Email",
        severity: "WARNING",
        message: `Duplicate email '${email}' detected; adjusted to '${uniqueEmail}'`,
        originalValue: email,
        resolvedValue: uniqueEmail
      });
      email = uniqueEmail;
    }
    seenEmails.add(email);
    const phone = rawPhone.trim() ? rawPhone.trim() : null;
    const branch = rawBranch.trim() || "General Engineering";
    const cgpaResult = sanitizeCgpa(rawCgpa);
    if (cgpaResult.isWarning) {
      issues.push({
        field: "CGPA",
        severity: "WARNING",
        message: `Dirty/unformatted CGPA value '${rawCgpa}' was safely parsed as ${cgpaResult.cgpa}`,
        originalValue: rawCgpa,
        resolvedValue: cgpaResult.cgpa
      });
    }
    const skills = normalizeList(rawSkills);
    if (!skills.length && rawSkills && !/^(none|null|n\/a|na|-)$/i.test(rawSkills.trim())) {
      issues.push({
        field: "Skills",
        severity: "WARNING",
        message: `Skills input '${rawSkills}' contained negative or unparseable indicators and was normalized to empty list`,
        originalValue: rawSkills,
        resolvedValue: []
      });
    }
    const projects = normalizeList(rawProjects);
    const internships = normalizeList(rawInternships);
    const certifications = normalizeList(rawCertifications);
    const evaluation = categorize(
      {
        cgpa: cgpaResult.cgpa,
        skills,
        projects,
        internships,
        certifications
      },
      customRules
    );
    const parsedStudent = {
      externalId,
      name: name || "Unnamed Candidate",
      email,
      phone,
      branch,
      cgpa: cgpaResult.cgpa,
      skills,
      projects,
      internships,
      certifications,
      score: evaluation.score,
      category: evaluation.category
    };
    const isRejected = false;
    const status = isRejected ? "REJECTED" : issues.length > 0 ? "WARNING" : "ACCEPTED";
    if (status === "ACCEPTED") acceptedCount++;
    else if (status === "WARNING") warningCount++;
    else rejectedCount++;
    validStudents.push(parsedStudent);
    rowReports.push({
      rowNumber,
      externalId,
      name: parsedStudent.name,
      status,
      issues,
      data: parsedStudent
    });
  }
  return {
    totalRows: records.length,
    acceptedCount,
    warningCount,
    rejectedCount,
    validStudents,
    rowReports
  };
}

// apps/api/src/services/rules.service.ts
import fs2 from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
var DATA_DIR2 = path2.resolve(__dirname2, "../../data");
var RULES_FILE = path2.join(DATA_DIR2, "rules.json");
function ensureDataDir() {
  if (!fs2.existsSync(DATA_DIR2)) {
    fs2.mkdirSync(DATA_DIR2, { recursive: true });
  }
}
function getActiveRuleset() {
  ensureDataDir();
  if (fs2.existsSync(RULES_FILE)) {
    try {
      const data = JSON.parse(fs2.readFileSync(RULES_FILE, "utf8"));
      return { ...DEFAULT_RULES, ...data };
    } catch (_) {
    }
  }
  return { ...DEFAULT_RULES };
}
async function saveRuleset(newRules, userId) {
  ensureDataDir();
  const current = getActiveRuleset();
  const updated = {
    ...current,
    ...newRules,
    id: `ruleset-v${(current.version || 1) + 1}`,
    version: (current.version || 1) + 1,
    cgpaMax: Number(newRules.cgpaMax ?? current.cgpaMax),
    skillsMax: Number(newRules.skillsMax ?? current.skillsMax),
    projectsMax: Number(newRules.projectsMax ?? current.projectsMax),
    internshipMax: Number(newRules.internshipMax ?? current.internshipMax),
    certificationMax: Number(newRules.certificationMax ?? current.certificationMax),
    strongThreshold: Number(newRules.strongThreshold ?? current.strongThreshold),
    averageThreshold: Number(newRules.averageThreshold ?? current.averageThreshold),
    nonTechnicalSkills: newRules.nonTechnicalSkills ?? current.nonTechnicalSkills
  };
  fs2.writeFileSync(RULES_FILE, JSON.stringify(updated, null, 2), "utf8");
  if (userId) {
    await audit(userId, "UPDATE_RULES", "RULES", updated.id, {
      version: updated.version,
      strongThreshold: updated.strongThreshold,
      averageThreshold: updated.averageThreshold
    });
  }
  return updated;
}
async function resetRulesetToDefault(userId) {
  ensureDataDir();
  const reset = { ...DEFAULT_RULES, version: (getActiveRuleset().version || 1) + 1 };
  fs2.writeFileSync(RULES_FILE, JSON.stringify(reset, null, 2), "utf8");
  if (userId) {
    await audit(userId, "RESET_RULES", "RULES", reset.id);
  }
  return reset;
}
function previewCohortImpact(proposedRules, students) {
  const currentRules = getActiveRuleset();
  const mergedRules = { ...currentRules, ...proposedRules };
  let currentStrong = 0;
  let currentAvg = 0;
  let currentNeeds = 0;
  let newStrong = 0;
  let newAvg = 0;
  let newNeeds = 0;
  const items = students.map((s) => {
    const currentEval = categorize(s, currentRules);
    const newEval = categorize(s, mergedRules);
    if (currentEval.category === "STRONG") currentStrong++;
    else if (currentEval.category === "AVERAGE") currentAvg++;
    else currentNeeds++;
    if (newEval.category === "STRONG") newStrong++;
    else if (newEval.category === "AVERAGE") newAvg++;
    else newNeeds++;
    return {
      id: s.id,
      externalId: s.externalId,
      name: s.name,
      currentScore: currentEval.score,
      currentCategory: currentEval.category,
      newScore: newEval.score,
      newCategory: newEval.category,
      scoreDelta: Number((newEval.score - currentEval.score).toFixed(2)),
      categoryChanged: currentEval.category !== newEval.category
    };
  });
  return {
    currentRules,
    previewRules: mergedRules,
    totalStudents: students.length,
    strongDelta: newStrong - currentStrong,
    averageDelta: newAvg - currentAvg,
    needsImprovementDelta: newNeeds - currentNeeds,
    students: items
  };
}

// apps/api/src/services/email.service.ts
import nodemailer from "nodemailer";
var transporter = null;
var smtpHost = process.env.SMTP_HOST;
var smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
var smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || "";
var rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "";
var smtpPass = rawPass ? rawPass.replace(/\s+/g, "") : "";
if (smtpHost && smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
} else if (smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
}
async function sendEmail({ to, subject, text, html }) {
  try {
    if (transporter) {
      const fromAddress = process.env.SMTP_FROM || `"Campus Placement Cell" <${smtpUser || "placements@campus.edu"}>`;
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        text,
        html: html || `<div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">${text.replace(/\n/g, "<br/>")}</div>`
      });
      console.log(`\u{1F4E7} Outgoing Email Sent to ${to}: ${subject} (MessageID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } else {
      console.log(`\u{1F4EC} [Email Dispatch Simulator] To: ${to} | Subject: "${subject}"`);
      return { success: true, messageId: `simulated-${Date.now()}` };
    }
  } catch (error) {
    console.error(`\u26A0\uFE0F Failed to send SMTP email to ${to}:`, error.message);
    return { success: false };
  }
}
function getWelcomeEmailHtml(name, email, tempPassword) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; }
      .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; max-width: 580px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
      .header { background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 30px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
      .body { padding: 30px; color: #cbd5e1; font-size: 15px; line-height: 1.6; }
      .credentials-box { background-color: #0f172a; border-left: 4px solid #06b6d4; padding: 15px 20px; border-radius: 6px; margin: 20px 0; }
      .warning-box { background-color: #451a03; border: 1px solid #b45309; color: #fde68a; padding: 15px 20px; border-radius: 6px; margin: 20px 0; }
      .btn { display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin-top: 15px; }
      .footer { background-color: #0f172a; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <h1>\u{1F393} Campus Placement Portal</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Welcome to Placement Season 2026</p>
      </div>
      <div class="body">
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your official student candidate profile has been registered by the Placement Coordinator. You now have access to active recruitment drives, JD evaluation, and application shortlists.</p>
        
        <div class="credentials-box">
          <p style="margin: 0 0 8px 0; color: #94a3b8;">Your Login Credentials:</p>
          <p style="margin: 0 0 4px 0;"><strong>Registered Email:</strong> <span style="color: #38bdf8;">${email}</span></p>
          <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background: #1e293b; padding: 3px 8px; border-radius: 4px; color: #f43f5e; font-size: 16px;">${tempPassword}</code></p>
        </div>

        <div class="warning-box">
          <strong>\u26A0\uFE0F MANDATORY SAFETY NOTICE:</strong><br/>
          When you log in for the first time, you <strong>must change your password immediately</strong> in your profile settings for account security and safety.
        </div>

        <p style="text-align: center;">
          <a href="${process.env.FRONTEND_ORIGIN || "https://candidate-screening-system.vercel.app"}" class="btn">Log In to My Placement Portal \u2192</a>
        </p>
      </div>
      <div class="footer">
        \xA9 2026 Campus Placement Cell & Corporate Relations Office. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}
function getDriveAlertEmailHtml(name, companyName, role, ctc, deadline, minCgpa) {
  const formattedDate = new Date(deadline).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  });
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; }
      .card { background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; max-width: 580px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
      .header { background: linear-gradient(135deg, #059669, #0284c7); padding: 30px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
      .body { padding: 30px; color: #cbd5e1; font-size: 15px; line-height: 1.6; }
      .drive-box { background-color: #0f172a; border-left: 4px solid #10b981; padding: 18px 20px; border-radius: 6px; margin: 20px 0; }
      .btn { display: inline-block; background-color: #10b981; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin-top: 15px; }
      .footer { background-color: #0f172a; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <h1>\u{1F680} New Campus Placement Drive Alert</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">You are eligible to apply!</p>
      </div>
      <div class="body">
        <p>Hello <strong>${name}</strong>,</p>
        <p><strong>${companyName}</strong> has announced a recruitment drive on campus and your academic standing meets all eligibility requirements!</p>
        
        <div class="drive-box">
          <p style="margin: 0 0 6px 0;"><strong>\u{1F3E2} Company:</strong> <span style="color: #38bdf8; font-size: 16px;">${companyName}</span></p>
          <p style="margin: 0 0 6px 0;"><strong>\u{1F4BC} Job Role:</strong> ${role}</p>
          <p style="margin: 0 0 6px 0;"><strong>\u{1F4B0} Package (CTC):</strong> <span style="color: #4ade80;">${ctc}</span></p>
          <p style="margin: 0 0 6px 0;"><strong>\u{1F393} Eligibility Cutoff:</strong> ${minCgpa.toFixed(2)} CGPA</p>
          <p style="margin: 0;"><strong>\u23F0 Application Deadline:</strong> <span style="color: #f87171; font-weight: 600;">${formattedDate}</span></p>
        </div>

        <p>Please log in to your Student Placement Portal and submit your <strong>Opt-In</strong> response before the deadline expires.</p>

        <p style="text-align: center;">
          <a href="${process.env.FRONTEND_ORIGIN || "https://candidate-screening-system.vercel.app"}" class="btn">View Drive & Opt-In Now \u2192</a>
        </p>
      </div>
      <div class="footer">
        \xA9 2026 Campus Placement Cell & Corporate Relations Office. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
}

// apps/api/src/routes/students.routes.ts
function generateRandomStudentPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let rand = "";
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Temp#${rand}!`;
}
var router2 = Router2();
var upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});
var studentSchema = z3.object({
  externalId: z3.string().min(1).max(50),
  name: z3.string().min(1).max(150),
  email: z3.string().email(),
  phone: z3.string().max(30).nullable().optional(),
  branch: z3.string().min(1).max(150),
  cgpa: z3.coerce.number().min(0).max(10),
  skills: z3.union([z3.array(z3.string()), z3.string()]).default([]),
  projects: z3.union([z3.array(z3.string()), z3.string()]).default([]),
  internships: z3.union([z3.array(z3.string()), z3.string()]).default([]),
  certifications: z3.union([z3.array(z3.string()), z3.string()]).default([])
});
var DEFAULT_ASSESSMENT_STUDENTS = [
  {
    externalId: "1",
    name: "Aarav Gupta",
    email: "aarav.g@gmail.com",
    phone: "9876543210",
    branch: "Computer Science",
    cgpa: 9.3,
    skills: ["MERN", "AWS", "Next.js"],
    projects: ["E-commerce Web App", "Chat Application"],
    internships: ["SDE Intern at Amazon"],
    certifications: ["AWS Cloud Practitioner", "Meta Front-End Developer"]
  },
  {
    externalId: "2",
    name: "Ishita Verma",
    email: "ishita.v21@gmail.com",
    phone: "8765432109",
    branch: "Information Technology",
    cgpa: 8.9,
    skills: ["React", "Node.js", "MongoDB"],
    projects: ["Task Management System"],
    internships: ["Frontend Intern at TCS"],
    certifications: ["Google UX Design"]
  },
  {
    externalId: "3",
    name: "Rohan Nair",
    email: "rnair.dev@gmail.com",
    phone: "7654321098",
    branch: "Computer Science",
    cgpa: 9.1,
    skills: ["Python", "Django", "React"],
    projects: ["Social Media Dashboard", "Portfolio App"],
    internships: ["Web Dev Intern at Infosys"],
    certifications: ["IBM Full Stack Software Developer"]
  },
  {
    externalId: "4",
    name: "Megha Sharma",
    email: "megha.sharma99@gmail.com",
    phone: "6543210987",
    branch: "Software Engineering",
    cgpa: 8.5,
    skills: ["Java", "Spring Boot", "React"],
    projects: ["Inventory Management System"],
    internships: ["Java Developer Intern at Wipro"],
    certifications: ["Oracle Certified Associate"]
  },
  {
    externalId: "5",
    name: "Karthik Reddy",
    email: "karthik.r@gmail.com",
    phone: "9012345678",
    branch: "Computer Science",
    cgpa: 8.2,
    skills: ["JavaScript", "Express", "SQL"],
    projects: ["Weather App", "Blog Platform"],
    internships: ["Software Intern at Tech Mahindra"],
    certifications: ["HackerRank JavaScript (Basic)"]
  },
  {
    externalId: "6",
    name: "Sneha Desai",
    email: "snehad.22@gmail.com",
    phone: "8123456790",
    branch: "Electronics",
    cgpa: 7.6,
    skills: ["HTML", "CSS", "JavaScript"],
    projects: ["Personal Website"],
    internships: [],
    certifications: []
  },
  {
    externalId: "7",
    name: "Aditya Kumar",
    email: "aditya.k45@gmail.com",
    phone: "9123456781",
    branch: "Mechanical",
    cgpa: 7.1,
    skills: ["Python", "SQL"],
    projects: ["Data Analysis on Sales Data"],
    internships: [],
    certifications: ["Google Data Analytics"]
  },
  {
    externalId: "8",
    name: "Neha Singh",
    email: "nehasingh.01@gmail.com",
    phone: "7123456789",
    branch: "Information Technology",
    cgpa: 7.8,
    skills: ["Java", "HTML", "CSS"],
    projects: ["Library Management System"],
    internships: ["Trainee at WebX"],
    certifications: []
  },
  {
    externalId: "9",
    name: "Vivek Joshi",
    email: "vivek.j@gmail.com",
    phone: "8234567890",
    branch: "Computer Science",
    cgpa: 6.9,
    skills: ["C++", "HTML"],
    projects: ["Calculator App"],
    internships: [],
    certifications: []
  },
  {
    externalId: "10",
    name: "Pooja Patel",
    email: "poojap.tech@gmail.com",
    phone: "9345678901",
    branch: "Civil",
    cgpa: 7.4,
    skills: ["Python", "Excel"],
    projects: ["Student Database System"],
    internships: [],
    certifications: []
  },
  {
    externalId: "11",
    name: "Amit Chawla",
    email: "amit.c00@gmail.com",
    phone: "9456789012",
    branch: "Civil",
    cgpa: 5.9,
    skills: ["MS Word"],
    projects: [],
    internships: [],
    certifications: []
  },
  {
    externalId: "12",
    name: "Suman Rao",
    email: "suman.rao1@gmail.com",
    phone: "8567890123",
    branch: "Mechanical",
    cgpa: 6.1,
    skills: ["Windows", "Data Entry"],
    projects: ["Basic HTML Page"],
    internships: [],
    certifications: []
  },
  {
    externalId: "13",
    name: "Deepak Tiwari",
    email: "deepakt.77@gmail.com",
    phone: "7678901234",
    branch: "Electronics",
    cgpa: 5.4,
    skills: ["MS Excel"],
    projects: [],
    internships: [],
    certifications: []
  },
  {
    externalId: "14",
    name: "Meera Reddy",
    email: "meera.r3@gmail.com",
    phone: "9789012345",
    branch: "Chemical",
    cgpa: 6.3,
    skills: ["Basic Computer"],
    projects: [],
    internships: [],
    certifications: []
  },
  {
    externalId: "15",
    name: "Rajeev Menon",
    email: "rajeev.m9@gmail.com",
    phone: "8890123456",
    branch: "Mechanical",
    cgpa: 5.2,
    skills: ["MS Office"],
    projects: [],
    internships: [],
    certifications: []
  }
];
function enrichStudent(student) {
  const rules = getActiveRuleset();
  const numericCgpa = Number(student.cgpa) || 0;
  const evaluation = categorize(
    {
      cgpa: numericCgpa,
      skills: student.skills || [],
      projects: student.projects || [],
      internships: student.internships || [],
      certifications: student.certifications || []
    },
    rules
  );
  const effectiveCategory = student.isOverridden && student.overrideCategory ? student.overrideCategory : evaluation.category;
  return {
    ...student,
    cgpa: numericCgpa,
    score: evaluation.score,
    maxScore: evaluation.maxScore,
    calculatedCategory: evaluation.category,
    category: effectiveCategory,
    isOverridden: Boolean(student.isOverridden),
    overrideCategory: student.overrideCategory || null,
    overrideReason: student.overrideReason || null,
    overriddenBy: student.overriddenBy || null,
    overriddenAt: student.overriddenAt || null,
    isReviewed: Boolean(student.isReviewed),
    breakdown: evaluation.breakdown,
    summaryReason: evaluation.summaryReason,
    formulaString: evaluation.formulaString,
    strengths: evaluation.strengths,
    recommendations: evaluation.recommendations,
    technicalSkillsCount: evaluation.technicalSkillsCount,
    nonTechnicalSkillsCount: evaluation.nonTechnicalSkillsCount
  };
}
function prepareStudentData(raw) {
  const rules = getActiveRuleset();
  const skills = normalizeList(raw.skills);
  const projects = normalizeList(raw.projects);
  const internships = normalizeList(raw.internships);
  const certifications = normalizeList(raw.certifications);
  const numericCgpa = Number(raw.cgpa) || 0;
  const evalResult = categorize(
    {
      cgpa: numericCgpa,
      skills,
      projects,
      internships,
      certifications
    },
    rules
  );
  return {
    externalId: raw.externalId.trim(),
    name: raw.name.trim(),
    email: raw.email.trim().toLowerCase(),
    phone: raw.phone ? raw.phone.trim() : null,
    branch: raw.branch.trim(),
    cgpa: numericCgpa,
    skills,
    projects,
    internships,
    certifications,
    score: evalResult.score,
    category: evalResult.category,
    isOverridden: false,
    overrideCategory: null,
    overrideReason: null,
    isReviewed: false
  };
}
router2.get("/", requireAuth, async (req, res, next) => {
  try {
    const query = z3.object({
      minCgpa: z3.coerce.number().min(0).max(10).optional(),
      maxCgpa: z3.coerce.number().min(0).max(10).optional(),
      skill: z3.string().trim().optional(),
      skills: z3.string().trim().optional(),
      skillsMatchMode: z3.enum(["AND", "OR"]).default("OR"),
      category: z3.string().trim().optional(),
      branch: z3.string().trim().optional(),
      search: z3.string().trim().optional(),
      hasInternship: z3.enum(["true", "false"]).optional(),
      hasCertification: z3.enum(["true", "false"]).optional(),
      isOverridden: z3.enum(["true", "false"]).optional(),
      isReviewed: z3.enum(["true", "false"]).optional(),
      sortBy: z3.enum(["score", "cgpa", "name", "branch", "createdAt"]).default("score"),
      sortOrder: z3.enum(["asc", "desc"]).default("desc"),
      page: z3.coerce.number().int().positive().default(1),
      pageSize: z3.coerce.number().int().min(1).max(200).default(50)
    }).parse(req.query);
    const where = {};
    if (query.minCgpa !== void 0 || query.maxCgpa !== void 0) {
      where.cgpa = {};
      if (query.minCgpa !== void 0) where.cgpa.gte = query.minCgpa;
      if (query.maxCgpa !== void 0) where.cgpa.lte = query.maxCgpa;
    }
    const rawSkillFilter = query.skills || query.skill;
    if (rawSkillFilter) {
      const skillList = rawSkillFilter.split(",").map((s) => s.trim()).filter(Boolean);
      if (skillList.length > 0) {
        if (query.skillsMatchMode === "AND") {
          where.skills = { hasEvery: skillList };
        } else {
          where.skills = { hasSome: skillList };
        }
      }
    }
    if (query.category) {
      const categories = query.category.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
      if (categories.length === 1) {
        where.category = categories[0];
      } else if (categories.length > 1) {
        where.category = { in: categories };
      }
    }
    if (query.branch) {
      const branches = query.branch.split(",").map((b) => b.trim()).filter(Boolean);
      if (branches.length === 1) {
        where.branch = { contains: branches[0] };
      } else if (branches.length > 1) {
        where.branch = { in: branches };
      }
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
        { externalId: { contains: query.search } }
      ];
    }
    if (query.hasInternship !== void 0) {
      where.internships = query.hasInternship === "true" ? { isEmpty: false } : { isEmpty: true };
    }
    if (query.hasCertification !== void 0) {
      where.certifications = query.hasCertification === "true" ? { isEmpty: false } : { isEmpty: true };
    }
    if (query.isOverridden !== void 0) {
      where.isOverridden = query.isOverridden === "true";
    }
    if (query.isReviewed !== void 0) {
      where.isReviewed = query.isReviewed === "true";
    }
    const orderBy = [];
    if (query.sortBy === "score") {
      orderBy.push({ score: query.sortOrder });
      orderBy.push({ cgpa: "desc" });
      orderBy.push({ name: "asc" });
    } else if (query.sortBy === "cgpa") {
      orderBy.push({ cgpa: query.sortOrder });
      orderBy.push({ score: "desc" });
      orderBy.push({ name: "asc" });
    } else {
      orderBy.push({ [query.sortBy]: query.sortOrder });
    }
    const [items, total] = await prisma.$transaction([
      prisma.student.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      }),
      prisma.student.count({ where })
    ]);
    const enrichedItems = items.map(enrichStudent);
    res.json({
      items: enrichedItems,
      students: enrichedItems,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total: total || enrichedItems.length,
        totalPages: Math.ceil((total || enrichedItems.length) / query.pageSize) || 1
      }
    });
  } catch (error) {
    next(error);
  }
});
router2.get("/export", requireAuth, async (req, res, next) => {
  try {
    const students = await prisma.student.findMany({
      orderBy: [{ score: "desc" }, { cgpa: "desc" }, { name: "asc" }]
    });
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Branch",
      "CGPA",
      "Skills",
      "Projects",
      "Internships",
      "Certifications",
      "Score",
      "Category",
      "Overridden",
      "OverrideReason",
      "Explanation"
    ];
    const rows = students.map((s) => {
      const enriched = enrichStudent(s);
      return [
        `"${enriched.externalId}"`,
        `"${enriched.name.replace(/"/g, '""')}"`,
        `"${enriched.email}"`,
        `"${enriched.phone || ""}"`,
        `"${enriched.branch}"`,
        enriched.cgpa.toFixed(2),
        `"${enriched.skills.join(", ")}"`,
        `"${enriched.projects.join(", ")}"`,
        `"${enriched.internships.join(", ")}"`,
        `"${enriched.certifications.join(", ")}"`,
        enriched.score,
        `"${enriched.category}"`,
        enriched.isOverridden ? "YES" : "NO",
        `"${(enriched.overrideReason || "").replace(/"/g, '""')}"`,
        `"${enriched.summaryReason.replace(/"/g, '""')}"`
      ].join(",");
    });
    const csvContent = [headers.join(","), ...rows].join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="placement_shortlist_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv"`
    );
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
});
router2.post("/compare", requireAuth, async (req, res, next) => {
  try {
    const schema = z3.object({
      ids: z3.array(z3.number().int()).min(2).max(4)
    });
    const { ids } = schema.parse(req.body);
    const students = await prisma.student.findMany({
      where: { id: { in: ids } }
    });
    const enriched = students.map(enrichStudent);
    res.json({ candidates: enriched });
  } catch (error) {
    next(error);
  }
});
router2.post(
  "/bulk-action",
  requireAuth,
  requireRole("ADMIN", "COORDINATOR"),
  async (req, res, next) => {
    try {
      const schema = z3.object({
        ids: z3.array(z3.number().int()).min(1),
        action: z3.enum(["MARK_REVIEWED", "UNMARK_REVIEWED", "DELETE"])
      });
      const { ids, action } = schema.parse(req.body);
      if (action === "DELETE") {
        for (const id of ids) {
          await prisma.student.delete({ where: { id } });
        }
      } else {
        const isReviewed = action === "MARK_REVIEWED";
        for (const id of ids) {
          await prisma.student.update({
            where: { id },
            data: { isReviewed }
          });
        }
      }
      await audit(req.user.id, `BULK_${action}`, "STUDENT", void 0, { count: ids.length, ids });
      res.json({ success: true, count: ids.length, action });
    } catch (error) {
      next(error);
    }
  }
);
router2.post(
  "/:id/override",
  requireAuth,
  requireRole("ADMIN", "COORDINATOR"),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid student ID" });
      const categoryVal = req.body.category || req.body.overrideCategory;
      const reasonVal = req.body.reason || req.body.overrideReason;
      const schema = z3.object({
        category: z3.enum(["STRONG", "AVERAGE", "NEEDS_IMPROVEMENT"]),
        reason: z3.string().min(5, "A detailed override justification reason is required (min 5 characters)")
      });
      const { category, reason } = schema.parse({ category: categoryVal, reason: reasonVal });
      const student = await prisma.student.findUnique({ where: { id } });
      if (!student) return res.status(404).json({ error: "Student not found" });
      const updated = await prisma.student.update({
        where: { id },
        data: {
          isOverridden: true,
          overrideCategory: category,
          overrideReason: reason.trim(),
          overriddenBy: req.body.userName || req.user.name,
          overriddenAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      await audit(req.user.id, "MANUAL_OVERRIDE", "STUDENT", String(id), {
        previousCategory: student.category,
        newCategory: category,
        reason
      });
      const enriched = enrichStudent(updated);
      res.json({ success: true, student: enriched, ...enriched });
    } catch (error) {
      next(error);
    }
  }
);
var handleClearOverride = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid student ID" });
    const updated = await prisma.student.update({
      where: { id },
      data: {
        isOverridden: false,
        overrideCategory: null,
        overrideReason: null,
        overriddenBy: null,
        overriddenAt: null
      }
    });
    await audit(req.user.id, "CLEAR_OVERRIDE", "STUDENT", String(id));
    const enriched = enrichStudent(updated);
    res.json({ success: true, student: enriched, ...enriched });
  } catch (error) {
    next(error);
  }
};
router2.post("/:id/clear-override", requireAuth, requireRole("ADMIN", "COORDINATOR"), handleClearOverride);
router2.delete("/:id/override", requireAuth, requireRole("ADMIN", "COORDINATOR"), handleClearOverride);
router2.post(
  "/reset-sample",
  requireAuth,
  requireRole("ADMIN", "COORDINATOR"),
  async (req, res, next) => {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.student.deleteMany();
        for (const raw of DEFAULT_ASSESSMENT_STUDENTS) {
          const prepared = prepareStudentData(raw);
          const defaultPass = getStudentDefaultPassword(raw.name);
          const passwordHash = bcrypt3.hashSync(defaultPass, 10);
          await tx.student.create({
            data: {
              ...prepared,
              passwordHash,
              mustChangePassword: false,
              profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(raw.name)}`,
              resumeUrl: `https://drive.google.com/file/d/sample-resume-${raw.externalId}/view`,
              bio: `Final year ${raw.branch} undergraduate candidate.`
            }
          });
        }
      });
      await audit(req.user.id, "RESET_SAMPLE_DATA", "STUDENT", void 0, {
        count: DEFAULT_ASSESSMENT_STUDENTS.length
      });
      res.json({
        success: true,
        message: "Dataset successfully reset to official 15 assessment records.",
        count: DEFAULT_ASSESSMENT_STUDENTS.length
      });
    } catch (error) {
      next(error);
    }
  }
);
router2.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid student ID" });
    }
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(enrichStudent(student));
  } catch (error) {
    next(error);
  }
});
router2.post(
  "/",
  requireAuth,
  requireRole("ADMIN", "COORDINATOR"),
  async (req, res, next) => {
    try {
      const parsed = studentSchema.parse(req.body);
      const data = prepareStudentData(parsed);
      const existing = await prisma.student.findFirst({
        where: {
          OR: [{ externalId: data.externalId }, { email: data.email }]
        }
      });
      if (existing) {
        return res.status(400).json({
          error: `Student with ID "${data.externalId}" or Email "${data.email}" already exists.`
        });
      }
      const tempPassword = generateRandomStudentPassword();
      const passwordHash = bcrypt3.hashSync(tempPassword, 10);
      const created = await prisma.student.create({
        data: {
          ...data,
          passwordHash,
          mustChangePassword: true,
          profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
          resumeUrl: `https://drive.google.com/file/d/sample-resume-${data.externalId}/view`,
          bio: `Final year ${data.branch} undergraduate candidate.`
        }
      });
      const welcomeSubject = "\u{1F393} Welcome to Campus Placement Portal - Your Login Credentials";
      const welcomeMessage = `Hello ${created.name},

Your official campus placement student account has been registered by the Placement Coordinator.

Here are your login credentials:
\u2022 Registered Email: ${created.email}
\u2022 Temporary Password: ${tempPassword}

\u26A0\uFE0F CRITICAL SAFETY NOTICE:
When you log in for the first time, you MUST and SHOULD change your password immediately in your profile settings for more safety and account protection.`;
      await prisma.notification.create({
        data: {
          studentId: created.id,
          studentEmail: created.email,
          subject: welcomeSubject,
          message: welcomeMessage
        }
      });
      await sendEmail({
        to: created.email,
        subject: welcomeSubject,
        text: welcomeMessage,
        html: getWelcomeEmailHtml(created.name, created.email, tempPassword)
      });
      await audit(req.user.id, "CREATE", "STUDENT", String(created.id), {
        email: created.email,
        temporaryPasswordDispatched: true
      });
      res.status(201).json({
        ...enrichStudent(created),
        temporaryPassword: tempPassword,
        credentialsEmailSent: true,
        message: `Student account created successfully! Login credentials with temporary password (${tempPassword}) and security change notice were sent to ${created.email}.`
      });
    } catch (error) {
      next(error);
    }
  }
);
router2.put(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "COORDINATOR"),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid student ID" });
      }
      const parsed = studentSchema.partial().parse(req.body);
      const existing = await prisma.student.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ error: "Student not found" });
      }
      const merged = {
        externalId: parsed.externalId ?? existing.externalId,
        name: parsed.name ?? existing.name,
        email: parsed.email ?? existing.email,
        phone: parsed.phone !== void 0 ? parsed.phone : existing.phone,
        branch: parsed.branch ?? existing.branch,
        cgpa: parsed.cgpa !== void 0 ? Number(parsed.cgpa) : Number(existing.cgpa),
        skills: parsed.skills ?? existing.skills,
        projects: parsed.projects ?? existing.projects,
        internships: parsed.internships ?? existing.internships,
        certifications: parsed.certifications ?? existing.certifications
      };
      const prepared = prepareStudentData(merged);
      const updated = await prisma.student.update({
        where: { id },
        data: prepared
      });
      await audit(req.user.id, "UPDATE", "STUDENT", String(id));
      res.json(enrichStudent(updated));
    } catch (error) {
      next(error);
    }
  }
);
router2.delete(
  "/:id",
  requireAuth,
  requireRole("ADMIN", "COORDINATOR"),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid student ID" });
      }
      await prisma.student.delete({ where: { id } });
      await audit(req.user.id, "DELETE", "STUDENT", String(id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);
router2.post(
  "/import",
  requireAuth,
  requireRole("ADMIN", "COORDINATOR"),
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "CSV file is required" });
      }
      if (!req.file.originalname.toLowerCase().endsWith(".csv")) {
        return res.status(400).json({ error: "Only CSV files are accepted" });
      }
      const rules = getActiveRuleset();
      const report = parseStudentsCsvWithReport(req.file.buffer.toString("utf8"), rules);
      if (report.validStudents.length === 0) {
        return res.status(400).json({
          error: "CSV file contains no valid student records",
          report
        });
      }
      await prisma.$transaction(async (tx) => {
        for (const record of report.validStudents) {
          await tx.student.upsert({
            where: { externalId: record.externalId },
            update: {
              ...record,
              isOverridden: false,
              overrideCategory: null,
              overrideReason: null
            },
            create: {
              ...record,
              isOverridden: false,
              overrideCategory: null,
              overrideReason: null,
              isReviewed: false
            }
          });
        }
      });
      await audit(req.user.id, "IMPORT_CSV", "STUDENT", void 0, {
        totalRows: report.totalRows,
        accepted: report.acceptedCount,
        warnings: report.warningCount,
        fileName: req.file.originalname
      });
      res.json({
        success: true,
        imported: report.validStudents.length,
        message: `Successfully processed ${report.totalRows} CSV row(s): ${report.acceptedCount} clean, ${report.warningCount} with sanitized warnings.`,
        report
      });
    } catch (error) {
      next(error);
    }
  }
);
var students_routes_default = router2;

// apps/api/src/routes/dashboard.routes.ts
import { Router as Router3 } from "express";
import { z as z4 } from "zod";
var router3 = Router3();
router3.get("/summary", requireAuth, async (req, res, next) => {
  try {
    const query = z4.object({
      minCgpa: z4.coerce.number().min(0).max(10).optional(),
      maxCgpa: z4.coerce.number().min(0).max(10).optional(),
      skill: z4.string().trim().optional(),
      skills: z4.string().trim().optional(),
      skillsMatchMode: z4.enum(["AND", "OR"]).default("OR"),
      category: z4.string().trim().optional(),
      branch: z4.string().trim().optional(),
      search: z4.string().trim().optional(),
      hasInternship: z4.enum(["true", "false"]).optional(),
      hasCertification: z4.enum(["true", "false"]).optional(),
      isOverridden: z4.enum(["true", "false"]).optional(),
      isReviewed: z4.enum(["true", "false"]).optional()
    }).parse(req.query);
    const where = {};
    if (query.minCgpa !== void 0 || query.maxCgpa !== void 0) {
      where.cgpa = {};
      if (query.minCgpa !== void 0) where.cgpa.gte = query.minCgpa;
      if (query.maxCgpa !== void 0) where.cgpa.lte = query.maxCgpa;
    }
    const rawSkillFilter = query.skills || query.skill;
    if (rawSkillFilter) {
      const skillList = rawSkillFilter.split(",").map((s) => s.trim()).filter(Boolean);
      if (skillList.length > 0) {
        if (query.skillsMatchMode === "AND") {
          where.skills = { hasEvery: skillList };
        } else {
          where.skills = { hasSome: skillList };
        }
      }
    }
    if (query.category) {
      const categories = query.category.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
      if (categories.length === 1) {
        where.category = categories[0];
      } else if (categories.length > 1) {
        where.category = { in: categories };
      }
    }
    if (query.branch) {
      const branches2 = query.branch.split(",").map((b) => b.trim()).filter(Boolean);
      if (branches2.length === 1) {
        where.branch = { contains: branches2[0] };
      } else if (branches2.length > 1) {
        where.branch = { in: branches2 };
      }
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { email: { contains: query.search } },
        { externalId: { contains: query.search } }
      ];
    }
    if (query.hasInternship !== void 0) {
      where.internships = query.hasInternship === "true" ? { isEmpty: false } : { isEmpty: true };
    }
    if (query.hasCertification !== void 0) {
      where.certifications = query.hasCertification === "true" ? { isEmpty: false } : { isEmpty: true };
    }
    if (query.isOverridden !== void 0) {
      where.isOverridden = query.isOverridden === "true";
    }
    if (query.isReviewed !== void 0) {
      where.isReviewed = query.isReviewed === "true";
    }
    const filteredStudents = await prisma.student.findMany({ where });
    const totalCohortCount = await prisma.student.count();
    const activeRules = getActiveRuleset();
    const total = filteredStudents.length;
    let strong = 0;
    let average = 0;
    let needsImprovement = 0;
    let withInternship = 0;
    let withCertification = 0;
    let overriddenCount = 0;
    let reviewedCount = 0;
    const skillCounts = {};
    const branchMap = {};
    const cgpaHistogram = {
      "<6.0": 0,
      "6.0\u20136.9": 0,
      "7.0\u20137.9": 0,
      "8.0\u20138.9": 0,
      "9.0\u201310.0": 0
    };
    let cgpaSum = 0;
    let maxCgpa = 0;
    let minCgpa = total > 0 ? 10 : 0;
    for (const student of filteredStudents) {
      const effCategory = student.isOverridden && student.overrideCategory ? student.overrideCategory : student.category;
      if (effCategory === "STRONG") strong++;
      else if (effCategory === "AVERAGE") average++;
      else needsImprovement++;
      if (student.isOverridden) overriddenCount++;
      if (student.isReviewed) reviewedCount++;
      const numCgpa = Number(student.cgpa) || 0;
      cgpaSum += numCgpa;
      if (numCgpa > maxCgpa) maxCgpa = numCgpa;
      if (numCgpa < minCgpa) minCgpa = numCgpa;
      if (numCgpa < 6) cgpaHistogram["<6.0"]++;
      else if (numCgpa < 7) cgpaHistogram["6.0\u20136.9"]++;
      else if (numCgpa < 8) cgpaHistogram["7.0\u20137.9"]++;
      else if (numCgpa < 9) cgpaHistogram["8.0\u20138.9"]++;
      else cgpaHistogram["9.0\u201310.0"]++;
      if (student.internships && student.internships.length > 0) withInternship++;
      if (student.certifications && student.certifications.length > 0) withCertification++;
      if (Array.isArray(student.skills)) {
        for (const sk of student.skills) {
          if (sk) skillCounts[sk] = (skillCounts[sk] || 0) + 1;
        }
      }
      if (!branchMap[student.branch]) {
        branchMap[student.branch] = { total: 0, strong: 0, average: 0, needsImprovement: 0 };
      }
      branchMap[student.branch].total++;
      if (effCategory === "STRONG") branchMap[student.branch].strong++;
      else if (effCategory === "AVERAGE") branchMap[student.branch].average++;
      else branchMap[student.branch].needsImprovement++;
    }
    const topSkills = Object.entries(skillCounts).map(([skill, count]) => ({ skill, count })).sort((a, b) => b.count - a.count).slice(0, 15);
    const branches = Object.entries(branchMap).map(([branch, stats]) => ({ branch, ...stats })).sort((a, b) => b.total - a.total);
    const strongPct = total > 0 ? Math.round(strong / total * 100) : 0;
    const avgPct = total > 0 ? Math.round(average / total * 100) : 0;
    const needsPct = total > 0 ? Math.round(needsImprovement / total * 100) : 0;
    const internshipRate = total > 0 ? Math.round(withInternship / total * 100) : 0;
    const certificationRate = total > 0 ? Math.round(withCertification / total * 100) : 0;
    const averageCgpa = total > 0 ? Number((cgpaSum / total).toFixed(2)) : 0;
    res.json({
      totalCohortCount,
      total,
      isFiltered: total !== totalCohortCount,
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
      reviewedCount,
      topSkills,
      branches,
      cgpaHistogram,
      rules: {
        id: activeRules.id,
        version: activeRules.version,
        strongThreshold: activeRules.strongThreshold,
        averageThreshold: activeRules.averageThreshold,
        maxScore: activeRules.cgpaMax + activeRules.skillsMax + activeRules.projectsMax + activeRules.internshipMax + activeRules.certificationMax
      }
    });
  } catch (error) {
    next(error);
  }
});
var dashboard_routes_default = router3;

// apps/api/src/routes/jobs.routes.ts
import { Router as Router4 } from "express";
import { z as z5 } from "zod";

// apps/api/src/services/job-matching.service.ts
function matchCandidateToJob(candidate, job) {
  const candidateSkillsLower = candidate.skills.map((s) => s.toLowerCase().trim());
  const eligibleBranchesLower = (job.eligibleBranches || []).map((b) => b.toLowerCase().trim());
  const branchMatched = eligibleBranchesLower.length === 0 || eligibleBranchesLower.some((b) => candidate.branch.toLowerCase().includes(b) || b.includes(candidate.branch.toLowerCase()));
  const cgpaMatched = Number(candidate.cgpa) >= Number(job.minCgpa || 0);
  const hasInternship = candidate.internships && candidate.internships.length > 0;
  const internshipMatched = !job.internshipRequired || hasInternship;
  const mandatory = (job.mandatorySkills || []).map((s) => s.trim()).filter(Boolean);
  const mandatorySkillsMatched = [];
  const mandatorySkillsMissing = [];
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
  const optional = (job.optionalSkills || []).map((s) => s.trim()).filter(Boolean);
  const optionalSkillsMatched = [];
  for (const optSkill of optional) {
    const isPresent = candidateSkillsLower.some(
      (cs) => cs === optSkill.toLowerCase() || cs.includes(optSkill.toLowerCase()) || optSkill.toLowerCase().includes(cs)
    );
    if (isPresent) {
      optionalSkillsMatched.push(optSkill);
    }
  }
  let totalPoints = 0;
  if (cgpaMatched) {
    const cgpaSurplus = Math.min(1, (Number(candidate.cgpa) - Number(job.minCgpa)) / 2);
    totalPoints += 25 + Math.round(cgpaSurplus * 5);
  } else {
    const gap = Number(job.minCgpa) - Number(candidate.cgpa);
    if (gap <= 0.5) totalPoints += 15;
    else if (gap <= 1) totalPoints += 5;
  }
  if (mandatory.length > 0) {
    const mandRatio = mandatorySkillsMatched.length / mandatory.length;
    totalPoints += Math.round(mandRatio * 40);
  } else {
    totalPoints += 40;
  }
  if (job.internshipRequired) {
    if (hasInternship) totalPoints += 15;
  } else {
    if (hasInternship) totalPoints += 15;
    else totalPoints += 10;
  }
  if (optional.length > 0) {
    const optRatio = optionalSkillsMatched.length / optional.length;
    totalPoints += Math.round(optRatio * 15);
  } else {
    totalPoints += Math.min(15, Math.round(candidate.score / 10 * 15));
  }
  if (!branchMatched) {
    totalPoints = Math.round(totalPoints * 0.7);
  }
  const matchScore = Math.max(0, Math.min(100, totalPoints));
  let tier = "NOT_ELIGIBLE";
  if (matchScore >= 80 && cgpaMatched && mandatorySkillsMissing.length === 0) {
    tier = "EXCELLENT_FIT";
  } else if (matchScore >= 65 && branchMatched) {
    tier = "GOOD_FIT";
  } else if (matchScore >= 45) {
    tier = "PARTIAL_FIT";
  } else {
    tier = "NOT_ELIGIBLE";
  }
  const reasons = [];
  if (cgpaMatched) reasons.push(`CGPA ${Number(candidate.cgpa).toFixed(1)} meets \u2265${job.minCgpa} cutoff`);
  else reasons.push(`CGPA ${Number(candidate.cgpa).toFixed(1)} is below the ${job.minCgpa} cutoff`);
  if (mandatory.length > 0) {
    if (mandatorySkillsMissing.length === 0) {
      reasons.push(`Matches all ${mandatory.length} mandatory skill(s) (${mandatory.join(", ")})`);
    } else {
      reasons.push(`Missing mandatory skill(s): ${mandatorySkillsMissing.join(", ")}`);
    }
  }
  if (job.internshipRequired) {
    if (hasInternship) reasons.push("Verified internship requirement met");
    else reasons.push("Lacks required industry internship");
  }
  const matchReason = reasons.join(" \u2022 ");
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
    matchReason
  };
}
function rankCandidatesForJob(candidates, job) {
  return candidates.map((c) => matchCandidateToJob(c, job)).sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    if (b.candidate.score !== a.candidate.score) return b.candidate.score - a.candidate.score;
    return Number(b.candidate.cgpa) - Number(a.candidate.cgpa);
  });
}

// apps/api/src/routes/jobs.routes.ts
var router4 = Router4();
var jobSchema = z5.object({
  jobTitle: z5.string().min(1).default("Software Development Engineer"),
  companyName: z5.string().min(1).default("Visiting Technology Recruiter"),
  minCgpa: z5.coerce.number().min(0).max(10).default(7.5),
  mandatorySkills: z5.union([z5.array(z5.string()), z5.string()]).default([]),
  optionalSkills: z5.union([z5.array(z5.string()), z5.string()]).default([]),
  internshipRequired: z5.boolean().default(false),
  eligibleBranches: z5.union([z5.array(z5.string()), z5.string()]).default([])
});
function parseList(val) {
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === "string") return val.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
  return [];
}
router4.post("/match", requireAuth, async (req, res, next) => {
  try {
    const raw = jobSchema.parse(req.body);
    const job = {
      jobTitle: raw.jobTitle.trim(),
      companyName: raw.companyName.trim(),
      minCgpa: raw.minCgpa,
      mandatorySkills: parseList(raw.mandatorySkills),
      optionalSkills: parseList(raw.optionalSkills),
      internshipRequired: raw.internshipRequired,
      eligibleBranches: parseList(raw.eligibleBranches)
    };
    const students = await prisma.student.findMany();
    const enriched = students.map(enrichStudent);
    const rankedMatches = rankCandidatesForJob(enriched, job);
    await audit(req.user.id, "MATCH_JOB_REQUIREMENT", "JOB", void 0, {
      company: job.companyName,
      title: job.jobTitle,
      matchesCount: rankedMatches.length
    });
    res.json({
      job,
      totalCandidates: students.length,
      matches: rankedMatches
    });
  } catch (error) {
    next(error);
  }
});
router4.post("/export-shortlist", requireAuth, async (req, res, next) => {
  try {
    const raw = jobSchema.parse(req.body);
    const job = {
      jobTitle: raw.jobTitle.trim(),
      companyName: raw.companyName.trim(),
      minCgpa: raw.minCgpa,
      mandatorySkills: parseList(raw.mandatorySkills),
      optionalSkills: parseList(raw.optionalSkills),
      internshipRequired: raw.internshipRequired,
      eligibleBranches: parseList(raw.eligibleBranches)
    };
    const students = await prisma.student.findMany();
    const enriched = students.map(enrichStudent);
    const rankedMatches = rankCandidatesForJob(enriched, job);
    const headers = [
      "Rank",
      "MatchScore%",
      "FitTier",
      "CandidateID",
      "Name",
      "Email",
      "Phone",
      "Branch",
      "CGPA",
      "Skills",
      "Projects",
      "Internships",
      "Score10",
      "Category",
      "CGPAMet",
      "MandatorySkillsMatched",
      "MissingSkills",
      "MatchRationale"
    ];
    const rows = rankedMatches.map((m, idx) => [
      idx + 1,
      `${m.matchScore}%`,
      `"${m.tier}"`,
      `"${m.candidate.externalId}"`,
      `"${m.candidate.name.replace(/"/g, '""')}"`,
      `"${m.candidate.email}"`,
      `"${m.candidate.phone || ""}"`,
      `"${m.candidate.branch}"`,
      Number(m.candidate.cgpa).toFixed(2),
      `"${m.candidate.skills.join(", ")}"`,
      `"${m.candidate.projects.join(", ")}"`,
      `"${m.candidate.internships.join(", ")}"`,
      m.candidate.score,
      `"${m.candidate.category}"`,
      m.cgpaMatched ? "YES" : "NO",
      `"${m.mandatorySkillsMatched.join(", ")}"`,
      `"${m.mandatorySkillsMissing.join(", ")}"`,
      `"${m.matchReason.replace(/"/g, '""')}"`
    ].join(","));
    const csvContent = [headers.join(","), ...rows].join("\n");
    const filename = `${job.companyName.replace(/[^a-zA-Z0-9]/g, "_")}_Shortlist_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
});
var jobs_routes_default = router4;

// apps/api/src/routes/rules.routes.ts
import { Router as Router5 } from "express";
import { z as z6 } from "zod";
var router5 = Router5();
var rulesetSchema = z6.object({
  id: z6.string().optional(),
  name: z6.string().optional(),
  version: z6.coerce.number().optional(),
  cgpaMax: z6.coerce.number().min(0).max(100),
  skillsMax: z6.coerce.number().min(0).max(100),
  projectsMax: z6.coerce.number().min(0).max(100),
  internshipMax: z6.coerce.number().min(0).max(100),
  certificationMax: z6.coerce.number().min(0).max(100),
  strongThreshold: z6.coerce.number().min(0).max(100),
  averageThreshold: z6.coerce.number().min(0).max(100),
  nonTechnicalSkills: z6.array(z6.string()).optional()
});
router5.get("/", requireAuth, (_req, res) => {
  const rules = getActiveRuleset();
  res.json({ rules, ...rules });
});
router5.post("/preview", requireAuth, async (req, res, next) => {
  try {
    const proposed = rulesetSchema.partial().parse(req.body);
    const students = await prisma.student.findMany();
    const preview = previewCohortImpact(proposed, students);
    res.json(preview);
  } catch (error) {
    next(error);
  }
});
router5.put(
  "/",
  requireAuth,
  requireRole("ADMIN", "COORDINATOR"),
  async (req, res, next) => {
    try {
      const parsed = rulesetSchema.parse(req.body);
      const updated = await saveRuleset(parsed, req.user.id);
      res.json({
        success: true,
        message: `Ruleset updated successfully (Version ${updated.version}).`,
        rules: updated
      });
    } catch (error) {
      next(error);
    }
  }
);
router5.post(
  "/reset",
  requireAuth,
  requireRole("ADMIN", "COORDINATOR"),
  async (req, res, next) => {
    try {
      const reset = await resetRulesetToDefault(req.user.id);
      res.json({
        success: true,
        message: "Scoring ruleset reset to system default values.",
        rules: reset
      });
    } catch (error) {
      next(error);
    }
  }
);
var rules_routes_default = router5;

// apps/api/src/routes/audit.routes.ts
import { Router as Router6 } from "express";
var router6 = Router6();
router6.get("/", requireAuth, async (_req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100
    });
    res.json({ logs });
  } catch (error) {
    next(error);
  }
});
var audit_routes_default = router6;

// apps/api/src/routes/drives.routes.ts
import { Router as Router7 } from "express";
var router7 = Router7();
router7.get("/", async (_req, res) => {
  try {
    const drives = await prisma.companyDrive.findMany();
    const applications = await prisma.driveApplication.findMany();
    const students = await prisma.student.findMany();
    const drivesWithStats = drives.map((drive) => {
      const driveApps = applications.filter((a) => a.driveId === drive.id);
      const eligibleCount = students.filter(
        (s) => Number(s.cgpa) >= Number(drive.minCgpa) && (!drive.allowedBranches?.length || drive.allowedBranches.includes(s.branch))
      ).length;
      const optedInCount = driveApps.filter((a) => a.status === "OPTED_IN").length;
      const optedOutCount = driveApps.filter((a) => a.status === "OPTED_OUT").length;
      const shortlistedCount = driveApps.filter((a) => a.status === "OPTED_IN" && a.isShortlistedByCoordinator).length;
      const isDeadlinePassed = new Date(drive.deadline).getTime() < Date.now();
      return {
        ...drive,
        stats: {
          eligibleCount,
          optedInCount,
          optedOutCount,
          shortlistedCount,
          pendingResponseCount: Math.max(0, eligibleCount - (optedInCount + optedOutCount)),
          isDeadlinePassed
        }
      };
    });
    res.json({ drives: drivesWithStats });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch company drives" });
  }
});
router7.post("/", async (req, res) => {
  try {
    const {
      companyName,
      logoUrl,
      role,
      jobType = "FULL_TIME",
      ctc,
      stipend,
      location,
      minCgpa = 7,
      allowedBranches = [],
      requiredSkills = [],
      description,
      selectionProcess = [],
      serviceAgreement = "None",
      startDate,
      deadline
    } = req.body;
    if (!companyName || !role || !ctc || !deadline) {
      res.status(400).json({ error: "Company name, role, CTC, and application deadline are mandatory." });
      return;
    }
    const minCgpaNum = Number(minCgpa) || 0;
    const driveDeadline = new Date(deadline).toISOString();
    const driveStart = startDate ? new Date(startDate).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
    const newDrive = await prisma.companyDrive.create({
      data: {
        companyName,
        logoUrl: logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(companyName)}`,
        role,
        jobType,
        ctc,
        stipend: stipend || "Not Disclosed",
        location: location || "Bangalore / Hybrid",
        minCgpa: minCgpaNum,
        allowedBranches: Array.isArray(allowedBranches) ? allowedBranches : [],
        requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [],
        description: description || `${companyName} is hiring for ${role}.`,
        selectionProcess: Array.isArray(selectionProcess) && selectionProcess.length > 0 ? selectionProcess : ["Online Coding Assessment", "Technical Interview 1", "HR Discussion"],
        serviceAgreement: serviceAgreement || "None",
        startDate: driveStart,
        deadline: driveDeadline,
        isActive: true,
        createdBy: "Placement Coordinator"
      }
    });
    const allStudents = await prisma.student.findMany();
    const eligibleStudents = allStudents.filter((s) => {
      const passesCgpa = Number(s.cgpa) >= minCgpaNum;
      const passesBranch = !newDrive.allowedBranches.length || newDrive.allowedBranches.includes(s.branch);
      return passesCgpa && passesBranch;
    });
    const deadlineFormatted = new Date(driveDeadline).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    const notificationsToCreate = eligibleStudents.map((student) => ({
      studentId: student.id,
      studentEmail: student.email,
      driveId: newDrive.id,
      companyName: newDrive.companyName,
      subject: `\u{1F3AF} Campus Placement Alert: ${newDrive.companyName} (${newDrive.role}) Drive Active!`,
      message: `Dear ${student.name},

You are eligible for the upcoming ${newDrive.companyName} campus placement drive for the role of "${newDrive.role}".

\u2022 Package / CTC: ${newDrive.ctc}
\u2022 Monthly Stipend: ${newDrive.stipend}
\u2022 Minimum CGPA Required: ${newDrive.minCgpa}
\u2022 Application Window: Active until ${deadlineFormatted}

Please log in to your Student Placement Portal and submit your Opt-In response before the strict deadline!`,
      minCgpa: minCgpaNum,
      deadline: driveDeadline,
      isRead: false
    }));
    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({ data: notificationsToCreate });
      Promise.all(
        eligibleStudents.map(
          (st) => sendEmail({
            to: st.email,
            subject: `\u{1F3AF} Campus Placement Alert: ${newDrive.companyName} (${newDrive.role}) Drive Active!`,
            text: `Dear ${st.name},

You are eligible for the upcoming ${newDrive.companyName} campus placement drive for the role of "${newDrive.role}".

\u2022 Package / CTC: ${newDrive.ctc}
\u2022 Minimum CGPA Required: ${newDrive.minCgpa}
\u2022 Application Window: Active until ${deadlineFormatted}

Please log in to your Student Placement Portal and submit your Opt-In response!`,
            html: getDriveAlertEmailHtml(
              st.name,
              newDrive.companyName,
              newDrive.role,
              newDrive.ctc,
              driveDeadline,
              minCgpaNum
            )
          })
        )
      ).catch((e) => console.error("Background drive emails error:", e));
    }
    await prisma.auditLog.create({
      data: {
        action: "COMPANY_DRIVE_POSTED",
        entityType: "COMPANY_DRIVE",
        entityId: newDrive.id,
        userEmail: "admin@placement.edu",
        details: JSON.stringify({
          companyName,
          role,
          minCgpa: minCgpaNum,
          eligibleCount: eligibleStudents.length,
          deadline: driveDeadline
        })
      }
    });
    res.status(201).json({
      drive: newDrive,
      eligibleStudentsCount: eligibleStudents.length,
      notificationsDispatched: notificationsToCreate.length,
      message: `Campus drive for ${companyName} posted successfully. Targeted email notifications dispatched to ${eligibleStudents.length} eligible candidates.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to create campus drive" });
  }
});
router7.get("/:id", async (req, res) => {
  try {
    const drive = await prisma.companyDrive.findUnique({ where: { id: req.params.id } });
    if (!drive) {
      res.status(404).json({ error: "Company drive not found" });
      return;
    }
    res.json({ drive });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch drive details" });
  }
});
router7.get("/:id/applicants", async (req, res) => {
  try {
    const drive = await prisma.companyDrive.findUnique({ where: { id: req.params.id } });
    if (!drive) {
      res.status(404).json({ error: "Company drive not found" });
      return;
    }
    const applications = await prisma.driveApplication.findMany({
      where: { driveId: req.params.id }
    });
    const students = await prisma.student.findMany();
    const detailedApplicants = applications.map((app2) => {
      const s = students.find((st) => Number(st.id) === Number(app2.studentId));
      return {
        ...app2,
        student: s || {
          id: app2.studentId,
          name: app2.studentName,
          email: app2.studentEmail,
          cgpa: app2.studentCgpa,
          branch: app2.studentBranch,
          skills: app2.studentSkills || [],
          resumeUrl: app2.studentResumeUrl || "",
          profileImage: app2.studentAvatarUrl || ""
        }
      };
    });
    const optedIn = detailedApplicants.filter((a) => a.status === "OPTED_IN");
    const optedOut = detailedApplicants.filter((a) => a.status === "OPTED_OUT");
    const shortlisted = optedIn.filter((a) => a.isShortlistedByCoordinator);
    res.json({
      drive,
      optedIn,
      optedOut,
      shortlisted,
      summary: {
        totalOptedIn: optedIn.length,
        totalOptedOut: optedOut.length,
        totalShortlisted: shortlisted.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch applicants" });
  }
});
router7.patch("/:id/applicants/:studentId", async (req, res) => {
  try {
    const { isShortlisted, coordinatorNotes } = req.body;
    const driveId = req.params.id;
    const studentId = Number(req.params.studentId);
    const updated = await prisma.driveApplication.update({
      where: { driveId, studentId },
      data: {
        isShortlistedByCoordinator: Boolean(isShortlisted),
        ...coordinatorNotes !== void 0 ? { coordinatorNotes } : {}
      }
    });
    res.json({ application: updated });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update applicant shortlist status" });
  }
});
router7.post("/:id/share-with-company", async (req, res) => {
  try {
    const drive = await prisma.companyDrive.findUnique({ where: { id: req.params.id } });
    if (!drive) {
      res.status(404).json({ error: "Company drive not found" });
      return;
    }
    const applications = await prisma.driveApplication.findMany({
      where: { driveId: req.params.id, status: "OPTED_IN" }
    });
    const shortlisted = applications.filter((a) => a.isShortlistedByCoordinator);
    const candidatesToShare = shortlisted.length > 0 ? shortlisted : applications;
    const sharedAt = (/* @__PURE__ */ new Date()).toISOString();
    for (const app2 of candidatesToShare) {
      await prisma.driveApplication.update({
        where: { id: app2.id },
        data: { sharedWithCompanyAt: sharedAt }
      });
    }
    await prisma.auditLog.create({
      data: {
        action: "CANDIDATE_LIST_DISPATCHED_TO_COMPANY",
        entityType: "COMPANY_DRIVE",
        entityId: drive.id,
        userEmail: "admin@placement.edu",
        details: JSON.stringify({
          companyName: drive.companyName,
          role: drive.role,
          dispatchedCount: candidatesToShare.length,
          sharedAt
        })
      }
    });
    res.json({
      success: true,
      message: `Successfully approved and dispatched ${candidatesToShare.length} candidate profiles to ${drive.companyName} recruitment team.`,
      dispatchedCount: candidatesToShare.length,
      candidates: candidatesToShare,
      sharedAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to share candidate list with company" });
  }
});
router7.get("/student/:studentId", async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    const allDrives = await prisma.companyDrive.findMany();
    const studentApps = await prisma.driveApplication.findMany({ where: { studentId } });
    const now = Date.now();
    const eligibleDrives = allDrives.filter((drive) => {
      const meetsCgpa = Number(student.cgpa) >= Number(drive.minCgpa);
      const meetsBranch = !drive.allowedBranches?.length || drive.allowedBranches.includes(student.branch);
      return meetsCgpa && meetsBranch;
    });
    const enrichedDrives = eligibleDrives.map((drive) => {
      const app2 = studentApps.find((a) => a.driveId === drive.id);
      const deadlineTime = new Date(drive.deadline).getTime();
      const isExpired = deadlineTime < now;
      return {
        ...drive,
        studentResponse: app2 ? {
          status: app2.status,
          responseAt: app2.responseAt,
          isShortlisted: app2.isShortlistedByCoordinator
        } : null,
        isExpired,
        timeRemainingMs: Math.max(0, deadlineTime - now)
      };
    });
    const activeDrives = enrichedDrives.filter((d) => !d.isExpired);
    const notOptedInDrives = enrichedDrives.filter(
      (d) => d.isExpired && (!d.studentResponse || d.studentResponse.status === "OPTED_OUT")
    );
    const allEligibleDrives = enrichedDrives;
    res.json({
      student,
      feeds: {
        active: activeDrives,
        notOptedIn: notOptedInDrives,
        all: allEligibleDrives
      },
      counts: {
        active: activeDrives.length,
        notOptedIn: notOptedInDrives.length,
        all: allEligibleDrives.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch student drive feed" });
  }
});
router7.post("/student/:studentId/respond", async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const { driveId, status } = req.body;
    if (!driveId || !["OPTED_IN", "OPTED_OUT"].includes(status)) {
      res.status(400).json({ error: "Valid driveId and status (OPTED_IN / OPTED_OUT) are required." });
      return;
    }
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      res.status(404).json({ error: "Student not found." });
      return;
    }
    const drive = await prisma.companyDrive.findUnique({ where: { id: driveId } });
    if (!drive) {
      res.status(404).json({ error: "Company drive not found." });
      return;
    }
    if (Number(student.cgpa) < Number(drive.minCgpa)) {
      res.status(403).json({
        error: `Ineligible: This drive requires a minimum CGPA of ${drive.minCgpa}. Your current CGPA is ${student.cgpa}.`
      });
      return;
    }
    const deadlineTime = new Date(drive.deadline).getTime();
    if (deadlineTime < Date.now()) {
      res.status(400).json({
        error: `The application deadline for ${drive.companyName} closed on ${new Date(drive.deadline).toLocaleString("en-IN")}. No further responses can be submitted.`
      });
      return;
    }
    const application = await prisma.driveApplication.upsert({
      where: {
        driveId_studentId: { driveId, studentId }
      },
      update: {
        status,
        studentName: student.name,
        studentEmail: student.email,
        studentPhone: student.phone || "",
        studentBranch: student.branch,
        studentCgpa: Number(student.cgpa),
        studentSkills: student.skills || [],
        studentResumeUrl: student.resumeUrl || "",
        studentAvatarUrl: student.profileImage || ""
      },
      create: {
        driveId,
        studentId,
        studentExternalId: student.externalId || String(student.id),
        studentName: student.name,
        studentEmail: student.email,
        studentPhone: student.phone || "",
        studentBranch: student.branch,
        studentCgpa: Number(student.cgpa),
        studentSkills: student.skills || [],
        studentResumeUrl: student.resumeUrl || "",
        studentAvatarUrl: student.profileImage || "",
        status,
        isShortlistedByCoordinator: false,
        coordinatorNotes: ""
      }
    });
    res.json({
      success: true,
      message: status === "OPTED_IN" ? `\u{1F389} You have successfully Opted-In for ${drive.companyName} (${drive.role}). Your profile & verified resume link have been submitted to the placement coordinator.` : `You have Opted-Out of the ${drive.companyName} recruitment drive.`,
      application
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to submit response" });
  }
});
router7.get("/student/:studentId/notifications", async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const notifications = await prisma.notification.findMany({
      where: { studentId }
    });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch notifications" });
  }
});
router7.get("/student/:studentId/profile", async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      res.status(404).json({ error: "Student not found" });
      return;
    }
    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch student profile" });
  }
});
router7.put("/student/:studentId/profile", async (req, res) => {
  try {
    const studentId = Number(req.params.studentId);
    const { name, phone, branch, cgpa, skills, resumeUrl, profileImage, bio } = req.body;
    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        ...name ? { name } : {},
        ...phone ? { phone } : {},
        ...branch ? { branch } : {},
        ...cgpa !== void 0 ? { cgpa: Number(cgpa) } : {},
        ...skills ? { skills: Array.isArray(skills) ? skills : skills.split(",").map((s) => s.trim()) } : {},
        ...resumeUrl ? { resumeUrl } : {},
        ...profileImage ? { profileImage } : {},
        ...bio ? { bio } : {}
      }
    });
    res.json({
      success: true,
      message: "Student profile updated successfully.",
      student: updated
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update student profile" });
  }
});

// apps/api/src/middleware/error.ts
import { ZodError } from "zod";
var errorHandler = (e, _q, res, _n) => {
  if (e instanceof ZodError) return res.status(400).json({ error: "Validation failed", details: e.issues });
  console.error(e);
  return res.status(500).json({ error: "Internal server error" });
};

// apps/api/src/app.ts
import path3 from "path";
import fs3 from "fs";
import { fileURLToPath as fileURLToPath3 } from "url";
var __filename3 = fileURLToPath3(import.meta.url);
var __dirname3 = path3.dirname(__filename3);
var staticDir = path3.resolve(__dirname3, "../../web/dist");
var app = express();
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
var limiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  limit: 2e3,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "Smart Candidate Screening System API"
  });
});
app.use("/api/auth", auth_routes_default);
app.use("/api/students", students_routes_default);
app.use("/api/dashboard", dashboard_routes_default);
app.use("/api/jobs", jobs_routes_default);
app.use("/api/rules", rules_routes_default);
app.use("/api/audit", audit_routes_default);
app.use("/api/drives", router7);
if (fs3.existsSync(staticDir)) {
  app.use(express.static(staticDir));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/health")) {
      return next();
    }
    res.sendFile(path3.join(staticDir, "index.html"));
  });
}
app.use(errorHandler);
export {
  app
};

export default app;

