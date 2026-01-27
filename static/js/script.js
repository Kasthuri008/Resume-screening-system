document.addEventListener('DOMContentLoaded', () => {
    // --- Shared Logic ---
    lucide.createIcons();

    // Active Sidebar Link logic based on current filename
    const path = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active'); // Remove all active classes first
        const href = item.getAttribute('href');
        if (href && (path === href || path.endsWith(href))) {
            item.classList.add('active');
        }
    });

    // Determine which page we are on and run specific logic
    if (path.includes('dashboard') || path === '/dashboard') {
        initDashboard();
    } else if (path.includes('upload') || path === '/upload') {
        initUpload();
    } else if (path.includes('scoring') || path === '/scoring') {
        initScoring();
    } else if (path.includes('results') || path === '/results') {
        initResults();
    }
});

// --- Data Helpers ---
function getStoredData() {
    const data = localStorage.getItem('resumeRankerData');
    if (data) return JSON.parse(data);
    return {
        uploadedCount: 0,
        candidates: [],
        activities: []
    };
}

function saveData(data) {
    localStorage.setItem('resumeRankerData', JSON.stringify(data));
}

// --- Page Functions ---

function initDashboard() {
    // Fetch real data from Flask backend
    fetch('/api/stats')
        .then(response => response.json())
        .then(stats => {
            document.getElementById('total-uploaded').textContent = stats.total_uploaded;
            document.getElementById('total-selected').textContent = stats.total_selected;
            document.getElementById('highest-score').textContent = stats.highest_score + '%';
        })
        .catch(error => {
            console.error('Error fetching stats:', error);
            // Fallback to 0 values
            document.getElementById('total-uploaded').textContent = '0';
            document.getElementById('total-selected').textContent = '0';
            document.getElementById('highest-score').textContent = '0%';
        });

    // Recent activities are now rendered server-side in the template
}

function initUpload() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileCount = document.getElementById('file-count');
    const uploadForm = document.getElementById('upload-form');

    // Drag & Drop functionality
    dropZone.addEventListener('dragover', (e) => { 
        e.preventDefault(); 
        dropZone.classList.add('drag-over'); 
    });
    
    dropZone.addEventListener('dragleave', (e) => { 
        e.preventDefault(); 
        dropZone.classList.remove('drag-over'); 
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        handleFileSelection(files);
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFileSelection(e.target.files);
    });

    function handleFileSelection(files) {
        console.log(`Selected ${files.length} files`);
        
        // Validate file count
        if (files.length < 10) {
            fileCount.textContent = `${files.length} file(s) selected - Need minimum 10 resumes`;
            fileCount.style.color = 'var(--danger)';
            return;
        }
        
        if (files.length > 20) {
            alert("Maximum 20 resumes allowed.");
            return;
        }

        // Validate file types
        const validFiles = Array.from(files).filter(file => 
            file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
        );

        if (validFiles.length !== files.length) {
            alert("Only PDF files are allowed.");
            return;
        }

        // Update display
        fileCount.textContent = `${files.length} PDF file(s) ready ✅`;
        fileCount.style.color = 'var(--success)';
        
        console.log('Files ready for upload:', Array.from(files).map(f => f.name));
    }

    // Form submission
    uploadForm.addEventListener('submit', (e) => {
        const files = fileInput.files;
        const jobDesc = document.querySelector('textarea[name="job_description"]').value.trim();
        
        // Validate files
        if (files.length < 10) {
            e.preventDefault();
            alert("Please select at least 10 PDF resumes.");
            return false;
        }

        // Validate job description
        if (!jobDesc) {
            e.preventDefault();
            alert("Please provide a job description.");
            return false;
        }

        // Show loading state
        const submitBtn = document.getElementById('analyze-btn');
        submitBtn.innerHTML = "Processing...";
        submitBtn.disabled = true;
        
        console.log(`Submitting form with ${files.length} files`);
        return true; // Allow form submission
    });
}

function initScoring() {
    // Scoring data is now rendered server-side, no JavaScript needed
    console.log('CV Scoring page loaded with server-side data');
}

function initResults() {
    // Results are now rendered server-side, no JavaScript needed
    console.log('Results page loaded with server-side data');
}

// --- Mock Generators & Utils ---
function generateMockCandidates(count) {
    const names = ["John Doe", "Jane Smith", "Alex Johnson", "Sarah Williams", "Michael Brown", "Emily Davis", "David Wilson", "Lisa Anderson", "Chris Taylor", "Amanda Moore"];
    const skillsPool = ["Python", "Java", "SQL", "React", "AWS", "Node.js", "Docker", "Figma"];

    let candidates = [];
    for (let i = 0; i < Math.max(count, 10); i++) {
        // Use mod for names to cycle if count > 10, or random
        const name = names[i % names.length] + (i >= 10 ? ` ${i + 1}` : "");
        const score = Math.floor(Math.random() * 41) + 55; // 55-95
        // Random 3 skills
        const skills = [];
        for (let j = 0; j < 3; j++) skills.push(skillsPool[Math.floor(Math.random() * skillsPool.length)]);

        candidates.push({
            name: name,
            email: name.toLowerCase().replace(/ /g, '.') + '@example.com',
            skills: [...new Set(skills)], // unique
            score: score
        });
    }
    return candidates.sort((a, b) => b.score - a.score);
}

function getScoreColor(score) {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--text-muted)';
}

function getMatchLevel(score) {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    return 'Low';
}

function getBadgeClass(score) {
    if (score >= 80) return 'match-high';
    if (score >= 60) return 'match-medium';
    return 'match-low';
}
