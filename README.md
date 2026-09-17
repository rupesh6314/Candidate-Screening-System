# Smart Candidate Screening System 🎓

> **Enterprise Candidate Screening & Placement Readiness Platform**
> Built for College Placement Cells to eliminate subjective guesswork, streamline shortlisting, and provide deterministic, 100% explainable categorization for graduating student batches.

---

## 🌟 Key Highlights & Industry Standards

- **Deterministic 10-Point Scoring Engine**: Evaluates Academic CGPA (0–4 pts), Technical Skills (0–2 pts), Projects Portfolio (0–2 pts), Corporate Internship (0–1 pt), and Professional Certifications (0–1 pt).
- **Zero Black-Box Guesswork**: Every student receives a **1-sentence plain-English explainable rationale** alongside an itemized 5-pillar score matrix that coordinators can defend to visiting recruiters and students.
- **Dynamic Multi-Dimensional Filtering**: Search by name/email/ID, minimum CGPA threshold, branch, specific tech skill matching, category tiers, internship requirement, and certifications.
- **Placement Executive Dashboard**: Real-time batch KPI metrics (Total candidates, Strong %, Average %, Needs Improvement %, Batch Avg CGPA, Internship & Certification participation rates, and in-demand skill distribution).
- **Candidate Dossier Slide-Over**: Granular profile inspection with strengths analysis and tailored Placement Cell Action Plans.
- **Transactional CSV Ingestion & Export**: Robust CSV parser with data normalization (handling dirty delimiters, `"None"` / `"N/A"` representations, and casing variations) + 1-click Shortlist CSV export.
- **1-Click Official Dataset Reset**: Restores the 15-student STON Technology assessment dataset instantly for demonstration and auditing.
- **Enterprise Web Security**: HTTP-only JWT cookies, Helmet defensive headers, rate-limiting, Zod schema validation, bcrypt password hashing, and immutable audit logging.

---

## 🏗️ Architecture Overview

```
smart-candidate-screening-system/
├── apps/
│   ├── api/                     # Node.js + Express + TypeScript Backend
│   │   ├── prisma/              # Prisma ORM Schema, Migrations & Seeds
│   │   └── src/
│   │       ├── routes/          # REST Endpoints (/auth, /students, /dashboard)
│   │       ├── services/        # Scoring Engine, CSV Parser, Audit Logger
│   │       └── middleware/      # JWT Auth & Global Error Handling
│   └── web/                     # React 19 + TypeScript + Vite Frontend
│       └── src/
│           ├── App.tsx          # Placement Officer Interactive Dashboard
│           ├── api.ts           # Typed Axios Client & Data Models
│           └── styles.css       # Enterprise UI Styling & Responsive Layout
├── docs/
│   ├── CATEGORIZATION.md        # Plain-Language Scoring Rationale & Matrix
│   ├── PROJECT_REPORT.md        # Official Assessment Submission & Analysis
│   └── SECURITY.md              # Security Architecture & Data Protection
└── sample-data/
    └── students.csv             # STON Technology 15-Student Assessment Cohort
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js $\ge 20$
- Docker & Docker Compose (or local PostgreSQL)

### 1. Environment Configuration & Database Setup
```bash
# Start PostgreSQL container
docker compose up -d postgres

# Install all workspace dependencies
npm install

# Generate Prisma Client & apply migrations
npm run db:generate -w apps/api
npm run db:migrate -w apps/api

# Seed the official 15-student assessment dataset & admin user
npm run db:seed -w apps/api
```

### 2. Run the Development Servers
```bash
npm run dev
```

- **Frontend Portal**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:4000`
- **Health Check**: `http://localhost:4000/health`

### 3. Default Placement Officer Credentials
- **Email**: `admin@placement.edu`
- **Password**: `Admin@Placement2026!`
- *(Or click the **"Quick Demo Sign-in"** button on the login screen)*

---

## 🧪 Quality Gates & Test Suite

Run the full automated test suite covering deterministic categorization, normalization rules, boundary conditions, and edge cases:

```bash
# Run Vitest unit tests
npm test

# Run TypeScript typechecks across all workspaces
npm run typecheck

# Production build test
npm run build
```

---

## 📊 Evaluation Summary of the 15-Student Dataset

| Category Tier | Score Range | Count in Dataset | Batch % | Key Action |
|---|:---:|:---:|:---:|---|
| 🟢 **Strong** | 8 – 10 pts | **2** | 13% | Fast-track for Tier-1 Recruiters (Amazon, Infosys) |
| 🟡 **Average** | 5 – 7 pts | **4** | 27% | Core Shortlist for Product & IT Services |
| 🔴 **Needs Improvement** | 0 – 4 pts | **9** | 60% | Enrolled in Placement Training Bootcamps |

*Detailed case studies and plain-language breakdowns are available in [docs/CATEGORIZATION.md](docs/CATEGORIZATION.md) and [docs/PROJECT_REPORT.md](docs/PROJECT_REPORT.md).*

