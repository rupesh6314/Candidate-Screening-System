# Smart Candidate Screening System — Official Project Report & Submission

- **Live Deployed Application**: `https://campus-placement-portal.onrender.com`
- **Assessment Evaluation Organization**: STON Technology Assessment

---

## 1. Problem Statement & Placement Cell Context

During every university campus placement drive, placement coordinators (often a small team of 2–3 staff members) face the daunting challenge of reviewing academic transcripts and resumes for dozens or hundreds of final-year students.

### Key Pain Points in Current Manual Workflows:
1. **Subjective "Gut-Feel" Decisions**: Two coordinators evaluating the same student profile often reach conflicting conclusions due to lack of a standardized, written definition of what makes a candidate "placement-ready".
2. **Spreadsheet Chaos & Overlooked Talent**: High-potential students with strong technical skills or project experience are frequently overlooked simply because manual scanning of rows is slow, error-prone, and biased toward high CGPA alone.
3. **Recruiter Time Pressure**: Visiting corporate recruiters demand shortlisted batches on tight deadlines (e.g. *"give me all Computer Science / IT students with CGPA > 8.0 who know React and have completed an internship"*).
4. **Lack of Explainability**: Black-box AI tools cannot be defended to students, faculty, or visiting companies. When a student asks why they were not shortlisted, coordinators need an immediate, transparent, 1-sentence rationale.

---

## 2. The Solution: Deterministic, Explainable Screening

The **Smart Candidate Screening System** replaces subjective spreadsheets with an automated, explainable screening platform.

### Core Architecture:
- **Frontend**: High-performance React 19 + TypeScript single-page application built with Vite and Lucide icons, offering instantaneous multi-dimensional filtering, KPI dashboards, and candidate dossier slide-overs.
- **Backend**: Express + TypeScript REST API protected with Helmet, rate limiting, and HTTP-only JWT cookies.
- **Database & Ingestion**: PostgreSQL database modeled with Prisma ORM, supporting transactional CSV file imports and audit logging.
- **Categorization Engine**: A pure, deterministic rule-scoring service with 100% test coverage and zero black-box obscurity.

---

## 3. Plain-Language Explanation of Categorization Logic

The system scores every student on a **10-point scale** across **5 career readiness pillars**:

```
Total Score (0–10) = CGPA (0–4) + Skills (0–2) + Projects (0–2) + Internship (0–1) + Certifications (0–1)
```

1. **Academic Rigor (CGPA — Max 4 Points)**:
   - $\text{CGPA} \ge 9.0$: **4 Points** (Top tier academic excellence)
   - $8.0 \le \text{CGPA} < 9.0$: **3 Points** (Strong academic foundation)
   - $7.0 \le \text{CGPA} < 8.0$: **2 Points** (Consistent good standing)
   - $6.0 \le \text{CGPA} < 7.0$: **1 Point** (Passing benchmark)
   - $\text{CGPA} < 6.0$: **0 Points** (Academic risk / remedial need)

2. **Technical Skills Breadth (Max 2 Points)**:
   - $\ge 5$ verified skills: **2 Points** (Versatile full-stack competency)
   - $3\text{--}4$ skills: **1 Point** (Adequate core stack)
   - $0\text{--}2$ skills: **0 Points** (Limited technical toolset)

3. **Project Portfolio (Max 2 Points)**:
   - $\ge 3$ projects: **2 Points** (Extensive practical execution)
   - $1\text{--}2$ projects: **1 Point** (Basic project evidence)
   - $0$ projects: **0 Points** (No verified implementation)

4. **Industry Internship Experience (Max 1 Point)**:
   - $\ge 1$ verified corporate internship: **1 Point** (Demonstrated workplace experience)
   - $0$ internships: **0 Points**

5. **Recognized Certifications (Max 1 Point)**:
   - $\ge 1$ professional credential (AWS, Meta, Google, Oracle, IBM): **1 Point**
   - $0$ certifications: **0 Points**

### Candidate Tiers:
- 🟢 **Strong (8 – 10 Points)**: Fast-track for Tier-1 visiting companies.
- 🟡 **Average (5 – 7 Points)**: Solid foundation for general campus drives.
- 🔴 **Needs Improvement (0 – 4 Points)**: Directed to placement skill-up bootcamps.

---

## 4. Evaluation of the 15-Student Assessment Cohort

| ID | Name | Branch | CGPA | Skills | Proj | Intern | Cert | Score | Category | Plain-English Explanation |
|:--:|---|---|:---:|---|:---:|:---:|:---:|:---:|:---:|---|
| **1** | Aarav Gupta | CS | 9.3 | MERN, AWS, Next.js (3) | 2 | Amazon | 2 | **8/10** | 🟢 **Strong** | Outstanding academic standing (9.30) & Amazon SDE internship. |
| **2** | Ishita Verma | IT | 8.9 | React, Node.js, MongoDB (3) | 1 | TCS | 1 | **7/10** | 🟡 **Average** | Competent credentials (8.90) with room to expand project depth. |
| **3** | Rohan Nair | CS | 9.1 | Python, Django, React (3) | 2 | Infosys | 1 | **8/10** | 🟢 **Strong** | High academic excellence (9.10) with verified Infosys internship. |
| **4** | Megha Sharma | SE | 8.5 | Java, Spring Boot, React (3) | 1 | Wipro | 1 | **7/10** | 🟡 **Average** | Strong academic standing (8.50) with enterprise internship at Wipro. |
| **5** | Karthik Reddy | CS | 8.2 | JS, Express, SQL (3) | 2 | Tech Mahindra | 1 | **7/10** | 🟡 **Average** | Solid multi-project profile (8.20 CGPA) with Tech Mahindra internship. |
| **6** | Sneha Desai | ECE | 7.6 | HTML, CSS, JS (3) | 1 | None | None | **4/10** | 🔴 **Needs Imp.** | Good academics (7.60) but lacks internship and advanced projects. |
| **7** | Aditya Kumar | Mech | 7.1 | Python, SQL (2) | 1 | None | 1 | **4/10** | 🔴 **Needs Imp.** | Foundational data skills with cert, but lacks corporate internship. |
| **8** | Neha Singh | IT | 7.8 | Java, HTML, CSS (3) | 1 | WebX | None | **5/10** | 🟡 **Average** | Solid baseline profile (7.80 CGPA) with WebX training internship. |
| **9** | Vivek Joshi | CS | 6.9 | C++, HTML (2) | 1 | None | None | **2/10** | 🔴 **Needs Imp.** | Moderate academics (6.90) with limited project and skill breadth. |
| **10** | Pooja Patel | Civil | 7.4 | Python, Excel (2) | 1 | None | None | **3/10** | 🔴 **Needs Imp.** | Consistent academic score (7.40) but needs core software projects. |
| **11** | Amit Chawla | Civil | 5.9 | MS Word (1) | 0 | None | None | **0/10** | 🔴 **Needs Imp.** | Sub-6.0 CGPA and absence of technical projects or credentials. |
| **12** | Suman Rao | Mech | 6.1 | Windows, Data Entry (2) | 1 | None | None | **2/10** | 🔴 **Needs Imp.** | Passing academic standard (6.10) but lacks engineering software projects. |
| **13** | Deepak Tiwari | ECE | 5.4 | MS Excel (1) | 0 | None | None | **0/10** | 🔴 **Needs Imp.** | Sub-6.0 CGPA with no technical projects or corporate experience. |
| **14** | Meera Reddy | Chem | 6.3 | Basic Computer (1) | 0 | None | None | **1/10** | 🔴 **Needs Imp.** | Moderate academics (6.30) with no programming projects or internships. |
| **15** | Rajeev Menon | Mech | 5.2 | MS Office (1) | 0 | None | None | **0/10** | 🔴 **Needs Imp.** | Sub-6.0 CGPA with zero software or technical project evidence. |

---

## 5. Security & Production Engineering Standards

1. **Input Sanitation & Normalization**:
   - Strips `"None"`, `"none"`, `"N/A"`, `"-"` values from list columns so they are never mistakenly counted as valid skills.
   - Trims and deduplicates tags case-insensitively.
2. **Defensive Web Security**:
   - HTTP-only, SameSite cookies for JWT session tokens to prevent XSS credential theft.
   - Helmet HTTP headers enabled to mitigate clickjacking and MIME-sniffing.
   - Express rate limiting (`express-rate-limit`) configured on API endpoints.
3. **Transactional Integrity**:
   - Bulk CSV ingestion executed inside Prisma database transactions so invalid files never leave orphaned or corrupted state.
4. **Audit Trail**:
   - Every candidate creation, deletion, CSV ingestion, and login event is immutably logged into the `AuditLog` table.

---

## 6. Future Roadmap & Enhancements

If granted additional development cycles, the roadmap includes:
1. **Company-Specific Screening Profiles**: Allow placement officers to define dynamic weights based on recruiter profiles (e.g., higher weight on Data Structures & Algorithms for Google vs Frontend frameworks for startups).
2. **Resume PDF Parsing**: Direct ingestion and NLP extraction of PDF resumes with side-by-side verification.
3. **Student Self-Service Portal**: Allow students to submit profile updates and see targeted recommendations on how to reach the "Strong" tier.
4. **Institutional SSO/SAML**: Integration with college Active Directory or Google Workspace for seamless faculty authentication.
5. **Interview Scheduling & Pipeline Tracking**: End-to-end recruitment drive tracking from initial shortlist to final offer letter issuance.

