# ResumeRanker - AI Resume Screening System

## 🚀 Project Overview
A complete Flask-based resume screening system that automatically analyzes and ranks candidates based on job requirements.

## ✅ Project Status: WORKING
- ✅ Flask Backend: Functional
- ✅ File Upload: Working (10-20 PDFs)
- ✅ Resume Analysis: Active
- ✅ Top 3 Selection: Automated
- ✅ All Templates: Rendered correctly

## 🔧 Fixed Issues
1. ✅ Removed duplicate `result.html` from root directory
2. ✅ Proper template structure in `/templates/`
3. ✅ Static files organized in `/static/`
4. ✅ Flask routes properly configured
5. ✅ File upload validation working

## 📋 System Requirements
- Python 3.7+
- Flask 2.3.3
- PyPDF2 3.0.1
- Werkzeug 2.3.7

## 🚀 How to Run

### Method 1: Command Line
```bash
python app.py
```

### Method 2: VS Code
1. Open terminal in VS Code (Ctrl + `)
2. Run: `python app.py`
3. Access: http://localhost:5000

## 🌐 Application URLs
- **Home**: http://localhost:5000
- **Dashboard**: http://localhost:5000/dashboard
- **Upload**: http://localhost:5000/upload
- **CV Scoring**: http://localhost:5000/scoring
- **Results**: http://localhost:5000/results

## 📁 Project Structure
```
resume-screening/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/            # HTML templates
│   ├── index.html        # Landing page
│   ├── dashboard.html    # Dashboard
│   ├── upload_resume.html # Upload page
│   ├── cv_scoring.html   # Scoring page
│   └── result.html       # Results page
├── static/               # Static assets
│   ├── css/
│   │   └── style.css     # Styles
│   └── js/
│       └── script.js     # JavaScript
└── uploads/              # Uploaded resumes
```

## 🎯 Features
- ✅ **Minimum 10 Resume Upload** (up to 20 allowed)
- ✅ **Job Description Matching**
- ✅ **Skill-based Scoring**
- ✅ **Automatic Top 3 Selection**
- ✅ **Real-time Activity Tracking**
- ✅ **Professional UI with Glassmorphism**
- ✅ **Responsive Design**

## 🔍 Troubleshooting

### If localhost:5000 doesn't work:
- Try: http://127.0.0.1:5000
- Try: http://10.245.109.99:5000

### If upload fails:
- Ensure minimum 10 PDF files
- Check file size (max 100MB total)
- Verify job description is provided

### If server won't start:
```bash
pip install -r requirements.txt
python app.py
```

## 📊 Usage Flow
1. **Upload** → Select 10+ PDF resumes + job description
2. **Analysis** → System processes and scores all resumes
3. **CV Scoring** → View all candidates ranked by score
4. **Results** → See top 3 selected candidates with highlights

## 🎨 UI Features
- **Dark Theme** with neon pink accents
- **Glassmorphism Design** with blur effects
- **Animated Statistics** counters
- **Medal System** for top 3 candidates
- **Skill Tags** for matched keywords
- **Color-coded Scores** (green/yellow/red)

## 🔒 Security
- File type validation (PDF only)
- Secure filename handling
- File size limits
- Input sanitization

## 📈 Performance
- In-memory data storage
- Efficient PDF text extraction
- Optimized skill matching algorithm
- Fast ranking system

---

**Status**: ✅ FULLY FUNCTIONAL
**Last Updated**: January 2026
**Version**: 1.0.0