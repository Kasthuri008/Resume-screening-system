# ResumeRanker 🚀  
**Resume Screening & Skill Matching System**

ResumeRanker is a web-based application designed to automatically screen multiple resumes, match skills against a given job description, and rank candidates based on their relevance.  
This project is developed as a **final-year student project** with a clean, simple, and interview-ready ATS-style UI.

---

## 📌 Features

- Upload multiple resumes (PDF only, max 50 files)
- Add job description for skill matching
- Automatic CV scoring and ranking
- Top 10 resume shortlist based on score
- Match level classification:
  - High Match: ≥ 80%
  - Medium Match: 60–75%
  - Low Match: ≤ 50%
- Dashboard with summary statistics
- Sidebar navigation (Dashboard, Upload Resume, CV Scoring, Results)
- Back to Home option
- Modern ATS-style UI (Dark Pink & White theme)
- Subtle landing page animations for better user experience

---

## 🛠️ Tech Stack

### Frontend
- HTML5  
- CSS3  
- JavaScript (Vanilla)

### Backend
- Python
- Flask

---

## 📂 Project Structure
resume_ats/
│
├── app.py
├── requirements.txt
│
├── templates/
│ ├── index.html (Landing Page)
│ ├── dashboard.html (Dashboard Page)
│ ├── upload.html (Resume Upload Page)
│ ├── scoring.html (CV Scoring Page)
│ └── results.html (Results Page)
│
├── static/
│ ├── css/
│ │ └── style.css
│ ├── js/
│ │ └── script.js
│ └── images/
│
├── uploads/ (Uploaded resume files)
│
└── README.md
└── README.md


