"""
ResumeRanker - Complete Flask Backend
Handles resume upload, job description matching, scoring, and results
Author: AI Assistant
"""

from flask import Flask, request, render_template, redirect, url_for, flash, jsonify
import os
import re
import PyPDF2
from werkzeug.utils import secure_filename
import shutil
from datetime import datetime


app = Flask(__name__)
app.secret_key = 'resumeranker_secret_2024'


app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_FILES'] = 10


UPLOAD_FOLDER = app.config['UPLOAD_FOLDER']
MIN_FILES = 10  
MAX_FILES = 20  
ALLOWED_EXTENSIONS = {'pdf'}


os.makedirs(UPLOAD_FOLDER, exist_ok=True)


resume_data = {}
resume_scores = {}
job_description = ""
recent_activities = []  
system_stats = {
    'total_uploaded': 0,
    'total_selected': 0,
    'highest_score': 0.0
}

def allowed_file(filename):
    """Check if file has allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    """Extract text from PDF using PyPDF2"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
    except Exception as e:
        print(f"Error extracting text from {file_path}: {str(e)}")
        return ""

def clean_text(text):
    """Clean and normalize text"""
    if not text:
        return ""
    
   
    text = text.lower()
    
    
    text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()

def extract_skills_from_job_desc(job_desc):
    """Extract skills from job description"""
    if not job_desc:
        return []
    
    
    skill_keywords = [
        'python', 'java', 'javascript', 'react', 'angular', 'vue', 'nodejs', 'express',
        'html', 'css', 'bootstrap', 'jquery', 'php', 'laravel', 'django', 'flask',
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
        'machine learning', 'ai', 'data science', 'pandas', 'numpy', 'tensorflow',
        'communication', 'teamwork', 'leadership', 'problem solving', 'analytical'
    ]
    
    cleaned_desc = clean_text(job_desc)
    found_skills = []
    
    for skill in skill_keywords:
        if skill in cleaned_desc:
            found_skills.append(skill)
    
    return found_skills

def calculate_resume_score(resume_text, job_skills):
    """Calculate resume score based on skill matching"""
    if not job_skills:
        return {
            'score': 0.0,
            'matched_skills': [],
            'match_level': 'Low'
        }
    
    cleaned_resume = clean_text(resume_text)
    matched_skills = []
    
    for skill in job_skills:
        if skill in cleaned_resume:
            matched_skills.append(skill)
    
    
    score = (len(matched_skills) / len(job_skills)) * 100 if job_skills else 0
    
    
    if score >= 70:
        match_level = "High"
    elif score >= 40:
        match_level = "Medium"
    else:
        match_level = "Low"
    
    return {
        'score': round(score, 1),
        'matched_skills': matched_skills,
        'match_level': match_level
    }

def add_activity(message, activity_type="info"):
    """Add a new activity to the recent activities list"""
    global recent_activities
    
    activity = {
        'message': message,
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'time_ago': datetime.now().strftime('%H:%M'),
        'type': activity_type
    }
    
    
    recent_activities.insert(0, activity)
    
    
    recent_activities = recent_activities[:10]
    
    print(f"📝 Activity logged: {message}")

def update_system_stats():
    """Update system statistics"""
    global system_stats
    
  
    all_scores = list(resume_scores.values())
    all_scores.sort(key=lambda x: x['score'], reverse=True)
    
    system_stats['total_uploaded'] = len(resume_data)
    
    system_stats['total_selected'] = min(3, len(all_scores)) if len(all_scores) >= MIN_FILES else 0
    system_stats['highest_score'] = max([
        score['score'] for score in resume_scores.values()
    ], default=0.0)

def clear_all_data():
    """Clear all data and reset system"""
    global resume_data, resume_scores, job_description, system_stats, recent_activities
    
    
    if os.path.exists(UPLOAD_FOLDER):
        shutil.rmtree(UPLOAD_FOLDER)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    
    
    resume_data.clear()
    resume_scores.clear()
    recent_activities.clear()  
    job_description = ""
    system_stats = {
        'total_uploaded': 0,
        'total_selected': 0,
        'highest_score': 0.0
    }
    
    add_activity("All data cleared and system reset", "warning")



@app.route('/')
def home():
    """Home page"""
    add_activity("Visited landing page", "info")
    return render_template('index.html')

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    """Handle resume upload"""
    if request.method == 'POST':
        
        global job_description
        job_description = request.form.get('job_description', '').strip()
        
        if not job_description:
            flash('Please provide a job description for skill matching.', 'error')
            return redirect(request.url)
        
        
        if 'resumes' not in request.files:
            flash('No files selected.', 'error')
            return redirect(request.url)
        
        files = request.files.getlist('resumes')
        files = [f for f in files if f.filename != '']
        
        print(f"📊 Received {len(files)} files for processing")
        
        if not files:
            flash('No files selected.', 'error')
            return redirect(request.url)
        
        
        if len(files) < MIN_FILES:
            flash(f'Minimum {MIN_FILES} resumes required. You selected only {len(files)} files.', 'error')
            return redirect(request.url)
        
        if len(files) > MAX_FILES:
            flash(f'Maximum {MAX_FILES} files allowed. You selected {len(files)} files.', 'error')
            return redirect(request.url)
        
        
        clear_all_data()
        job_description = request.form.get('job_description', '').strip()
        
        add_activity(f"Started new resume analysis session", "info")
        
        
        job_skills = extract_skills_from_job_desc(job_description)
        
        if not job_skills:
            add_activity("Failed: No skills found in job description", "error")
            flash('No recognizable skills found in job description. Please include technical skills.', 'error')
            return redirect(request.url)
        
        add_activity(f"Job description processed - Found {len(job_skills)} skills: {', '.join(job_skills[:3])}{'...' if len(job_skills) > 3 else ''}", "success")
        
        processed_count = 0
        failed_files = []
        
        
        for file in files:
            if file and allowed_file(file.filename):
                try:
                    filename = secure_filename(file.filename)
                    
                    
                    counter = 1
                    original_filename = filename
                    while filename in resume_data:
                        name, ext = os.path.splitext(original_filename)
                        filename = f"{name}_{counter}{ext}"
                        counter += 1
                    
                    
                    file_path = os.path.join(UPLOAD_FOLDER, filename)
                    file.save(file_path)
                    
                    
                    extracted_text = extract_text_from_pdf(file_path)
                    
                    if extracted_text:
                        
                        resume_data[filename] = {
                            'text': extracted_text,
                            'file_path': file_path,
                            'upload_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                        }
                        
                        
                        score_result = calculate_resume_score(extracted_text, job_skills)
                        resume_scores[filename] = score_result
                        
                        
                        add_activity(f"Processed {filename} - Score: {score_result['score']}% ({score_result['match_level']} match)", "info")
                        
                        processed_count += 1
                    else:
                        failed_files.append(filename)
                        add_activity(f"Failed to extract text from {filename}", "error")
                        if os.path.exists(file_path):
                            os.remove(file_path)
                
                except Exception as e:
                    failed_files.append(file.filename)
                    print(f"Error processing {file.filename}: {str(e)}")
            else:
                failed_files.append(file.filename)
        
        
        update_system_stats()
        
        
        if processed_count >= MIN_FILES:
            
            sorted_candidates = sorted(resume_scores.items(), key=lambda x: x[1]['score'], reverse=True)
            top_3 = sorted_candidates[:3]
            
            high_matches = len([s for s in resume_scores.values() if s['score'] >= 70])
            add_activity(f"Analysis complete: {processed_count} resumes processed, Top 3 selected: {', '.join([name for name, _ in top_3])}", "success")
            flash(f'Successfully processed {processed_count} resume(s)! Top 3 candidates automatically selected.', 'success')
        elif processed_count > 0:
            add_activity(f"Insufficient resumes: Only {processed_count} processed, need minimum {MIN_FILES}", "warning")
            flash(f'Only {processed_count} resumes processed. Need minimum {MIN_FILES} resumes for analysis.', 'warning')
        
        if failed_files:
            add_activity(f"Warning: {len(failed_files)} files failed to process", "warning")
            flash(f'Failed to process: {", ".join(failed_files)}', 'error')
        
        return redirect(url_for('dashboard'))
    
    
    add_activity("Accessed upload page", "info")
    return render_template('upload_resume.html')

@app.route('/dashboard')
def dashboard():
    """Dashboard with statistics"""
    update_system_stats()
    add_activity("Viewed dashboard", "info")
    
    return render_template('dashboard.html', 
                         stats=system_stats,
                         total_resumes=len(resume_data),
                         job_description=job_description,
                         recent_activities=recent_activities)

@app.route('/scoring')
def scoring():
    """CV Scoring page with detailed results"""
    add_activity("Viewed CV scoring results", "info")
    
    
    scoring_results = []
    
    for filename, score_data in resume_scores.items():
        scoring_results.append({
            'candidate_name': filename,
            'matched_skills': score_data['matched_skills'],
            'score': score_data['score'],
            'match_level': score_data['match_level']
        })
    
    
    scoring_results.sort(key=lambda x: x['score'], reverse=True)
    
    return render_template('cv_scoring.html', 
                         results=scoring_results,
                         job_description=job_description,
                         total_resumes=len(resume_data))

@app.route('/results')
def results():
    """Results page with Top 3 candidates"""
    add_activity("Viewed top 3 selected candidates", "info")
    
    
    results_data = []
    
    for filename, score_data in resume_scores.items():
        results_data.append({
            'candidate_name': filename,
            'final_score': score_data['score'],
            'match_level': score_data['match_level'],
            'matched_skills': score_data['matched_skills']
        })
    
    
    results_data.sort(key=lambda x: x['final_score'], reverse=True)
    top_3_candidates = results_data[:3]  
    
    return render_template('result.html', 
                         results=top_3_candidates,
                         total_candidates=len(results_data),
                         all_candidates_count=len(results_data))

@app.route('/clear')
def clear():
    """Clear all data"""
    clear_all_data()
    flash('All data cleared successfully!', 'success')
    return redirect(url_for('home'))


@app.route('/api/stats')
def api_stats():
    """Get current statistics"""
    update_system_stats()
    return jsonify(system_stats)

@app.route('/api/recent-activities')
def api_recent_activities():
    """Get recent activities as JSON"""
    return jsonify({'activities': recent_activities})

@app.route('/api/scoring-data')
def api_scoring_data():
    """Get scoring data as JSON"""
    
    scoring_results = []
    
    for filename, score_data in resume_scores.items():
        scoring_results.append({
            'candidate_name': filename,
            'matched_skills': score_data['matched_skills'],
            'score': score_data['score'],
            'match_level': score_data['match_level']
        })
    
    
    scoring_results.sort(key=lambda x: x['score'], reverse=True)
    
    return jsonify({'results': scoring_results})

@app.route('/api/results-data')
def api_results_data():
    """Get Top 3 results data as JSON"""
    
    results_data = []
    
    for filename, score_data in resume_scores.items():
        results_data.append({
            'candidate_name': filename,
            'final_score': score_data['score'],
            'match_level': score_data['match_level'],
            'matched_skills': score_data['matched_skills']
        })
    
    
    results_data.sort(key=lambda x: x['final_score'], reverse=True)
    top_3_candidates = results_data[:3]  
    
    return jsonify({
        'results': top_3_candidates,
        'total_uploaded': len(results_data),
        'top_3_selected': len(top_3_candidates)
    })

@app.errorhandler(413)
def too_large(e):
    flash('File too large! Please upload smaller files.', 'error')
    return redirect(url_for('upload'))

@app.errorhandler(404)
def not_found(e):
    return redirect(url_for('home'))

if __name__ == '__main__':
    print("🚀 Starting ResumeRanker Flask Backend")
    print(f"📁 Upload folder: {UPLOAD_FOLDER}")
    print(f"📊 Min files: {MIN_FILES}, Max files: {MAX_FILES}")
    print("🌐 Server starting at http://localhost:5000")
    
    
    add_activity("ResumeRanker system started - Minimum 10 resumes required", "success")
    
    app.run(debug=True, host='0.0.0.0', port=5000)