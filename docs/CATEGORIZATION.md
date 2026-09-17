# Deterministic Candidate Categorization & Scoring Logic

> **Placement Cell Philosophy**: Every student is scored using an objective, transparent, and 100% explainable 10-point framework. No black-box AI or subjective guesswork decides candidate eligibility. If a student, recruiter, or faculty member questions why a student received a particular tier, a placement coordinator can point to this exact document and explain the score in one clear sentence.

---

## 1. The 10-Point Scoring Framework

A candidate's **Placement Readiness Score** (ranging from **0 to 10 points**) evaluates 5 core pillars of career readiness:

| Pillar | Measurement Focus | Point Allocation | Max Points |
|---|---|---|:---:|
| **1. Academic Rigor** | Grade Point Average (CGPA) | $\ge 9.0 \to 4$<br>$8.0\text{--}8.99 \to 3$<br>$7.0\text{--}7.99 \to 2$<br>$6.0\text{--}6.99 \to 1$<br>$< 6.0 \to 0$ | **4 pts** |
| **2. Technical Skill Breadth** | Validated programming skills & tools | $\ge 5 \text{ skills} \to 2$<br>$3\text{--}4 \text{ skills} \to 1$<br>$0\text{--}2 \text{ skills} \to 0$ | **2 pts** |
| **3. Project Portfolio** | Hands-on applications & projects | $\ge 3 \text{ projects} \to 2$<br>$1\text{--}2 \text{ projects} \to 1$<br>$0 \text{ projects} \to 0$ | **2 pts** |
| **4. Industry Internship** | Real-world corporate exposure | $\ge 1 \text{ verified internship} \to 1$<br>$0 \text{ internships} \to 0$ | **1 pt** |
| **5. Recognized Certifications** | Industry credentials (AWS, Google, Meta) | $\ge 1 \text{ certification} \to 1$<br>$0 \text{ certifications} \to 0$ | **1 pt** |
| **Total Maximum Score** | | | **10 pts** |

---

## 2. Classification Tiers

Based on their total score out of 10, candidates automatically fall into one of three operational categories:

### 🟢 Strong Candidates (Score: 8 – 10 Points)
- **Profile Summary**: Top-tier candidates who combine high academic performance with hands-on projects, industry internship experience, and relevant certifications.
- **Placement Office Action**: Fast-track for Day-1 and Tier-1 visiting tech recruiters (e.g. Amazon, Google, Microsoft, TCS Digital). Immediate shortlisting with high interview conversion probability.

### 🟡 Average Candidates (Score: 5 – 7 Points)
- **Profile Summary**: Solid, competent candidates who meet foundational technical and academic benchmarks, but typically lack either an industry internship or multi-stack project portfolio depth.
- **Placement Office Action**: Primary shortlist for mass hiring and mid-tier product/services companies. Recommended for 1–2 capstone project sprints or resume refinement.

### 🔴 Needs Improvement (Score: 0 – 4 Points)
- **Profile Summary**: Candidates with low academic standing (sub-6.0 CGPA), non-technical/office-only skillsets, no project portfolio, or zero corporate exposure.
- **Placement Office Action**: Enrolled in mandatory Placement Cell Training Bootcamps (core coding, project building, interview preparation) before presenting to visiting recruitment panels.

---

## 3. Real-World Case Studies (From Official Assessment Dataset)

### Example 1: Aarav Gupta (ID #1) — **Strong (8/10)**
- **Profile**: CGPA `9.3`, Skills: `[MERN, AWS, Next.js]`, Projects: `[E-commerce Web App, Chat Application]`, Internship: `[SDE Intern at Amazon]`, Certifications: `[AWS Cloud Practitioner, Meta Front-End Developer]`.
- **Score Breakdown**:
  - CGPA $\ge 9.0 \implies \mathbf{+4\text{ pts}}$
  - 3 skills $\implies \mathbf{+1\text{ pt}}$
  - 2 projects $\implies \mathbf{+1\text{ pt}}$
  - Amazon SDE Internship $\implies \mathbf{+1\text{ pt}}$
  - 2 Certifications $\implies \mathbf{+1\text{ pt}}$
  - **Total**: $4 + 1 + 1 + 1 + 1 = \mathbf{8 / 10\text{ pts}}$
- **Plain-English Rationale**: *"Classified as Strong (8/10) due to outstanding academic standing (CGPA 9.30) and verified industry internship experience."*

---

### Example 2: Ishita Verma (ID #2) — **Average (7/10)**
- **Profile**: CGPA `8.9`, Skills: `[React, Node.js, MongoDB]`, Projects: `[Task Management System]`, Internship: `[Frontend Intern at TCS]`, Certifications: `[Google UX Design]`.
- **Score Breakdown**:
  - CGPA $8.9 \implies \mathbf{+3\text{ pts}}$
  - 3 skills $\implies \mathbf{+1\text{ pt}}$
  - 1 project $\implies \mathbf{+1\text{ pt}}$
  - TCS Internship $\implies \mathbf{+1\text{ pt}}$
  - Google UX Design Cert $\implies \mathbf{+1\text{ pt}}$
  - **Total**: $3 + 1 + 1 + 1 + 1 = \mathbf{7 / 10\text{ pts}}$
- **Plain-English Rationale**: *"Classified as Average (7/10) because candidate demonstrates competent foundational credentials (CGPA 8.90) but has room to expand project depth."*

---

### Example 3: Sneha Desai (ID #6) — **Needs Improvement (4/10)**
- **Profile**: CGPA `7.6`, Skills: `[HTML, CSS, JavaScript]`, Projects: `[Personal Website]`, Internship: `None`, Certifications: `None`.
- **Score Breakdown**:
  - CGPA $7.6 \implies \mathbf{+2\text{ pts}}$
  - 3 skills $\implies \mathbf{+1\text{ pt}}$
  - 1 project $\implies \mathbf{+1\text{ pt}}$
  - 0 internships $\implies \mathbf{0\text{ pts}}$
  - 0 certifications $\implies \mathbf{0\text{ pts}}$
  - **Total**: $2 + 1 + 1 + 0 + 0 = \mathbf{4 / 10\text{ pts}}$
- **Plain-English Rationale**: *"Classified as Needs Improvement (4/10) due to limited technical skill stack, no verified complex projects, and absence of internship credentials."*

---

### Example 4: Deepak Tiwari (ID #13) — **Needs Improvement (0/10)**
- **Profile**: CGPA `5.4`, Skills: `[MS Excel]`, Projects: `None`, Internship: `None`, Certifications: `None`.
- **Score Breakdown**:
  - CGPA $< 6.0 \implies \mathbf{0\text{ pts}}$
  - 1 basic tool skill $\implies \mathbf{0\text{ pts}}$
  - 0 projects $\implies \mathbf{0\text{ pts}}$
  - 0 internships $\implies \mathbf{0\text{ pts}}$
  - 0 certifications $\implies \mathbf{0\text{ pts}}$
  - **Total**: $0 + 0 + 0 + 0 + 0 = \mathbf{0 / 10\text{ pts}}$
- **Plain-English Rationale**: *"Classified as Needs Improvement (0/10) due to a sub-6.0 CGPA (5.40) and limited practical technical evidence."*

---

## 4. Data Hygiene & Edge Case Policies

Real-world student records are rarely clean. The system incorporates strict sanitation rules:
1. **Negative Indicators**: Strings like `"None"`, `"none"`, `"N/A"`, `"-"`, `"Nil"` are automatically stripped and treated as zero evidence rather than counted as valid skills or projects.
2. **Delimiter Normalization**: Skills and projects separated by commas, semicolons, pipes, or newlines are parsed cleanly into distinct items.
3. **Deduplication**: Repeated skills (e.g. `"React, react, REACT"`) are collapsed into a single skill entry.
4. **Boundary Guarantees**: CGPA is validated strictly within $[0.0, 10.0]$. Missing numeric values default safely to $0.0$.

