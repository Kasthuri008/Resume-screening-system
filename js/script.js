document.addEventListener('DOMContentLoaded', () => {
    // --- Shared Logic ---
    lucide.createIcons();

    // Active Sidebar Link logic based on current filename
    const path = window.location.pathname;
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('href') && path.includes(item.getAttribute('href'))) {
            item.classList.add('active');
        }
    });

    // Determine which page we are on and run specific logic
    if (path.includes('dashboard.html')) {
        initDashboard();
    } else if (path.includes('upload_resume.html')) {
        initUpload();
    } else if (path.includes('cv_scoring.html')) {
        initScoring();
    } else if (path.includes('result.html')) {
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
    const data = getStoredData();

    // Update Stats
    document.getElementById('total-uploaded').textContent = data.uploadedCount;

    const selectedCount = data.candidates.filter(c => c.score >= 80).length;
    document.getElementById('total-selected').textContent = selectedCount;

    const highestScore = data.candidates.length > 0 ? Math.max(...data.candidates.map(c => c.score)) : 0;
    document.getElementById('highest-score').textContent = highestScore + '%';

    // Recent Activity
    const activityList = document.getElementById('recent-activity-list');
    if (data.activities.length === 0) {
        activityList.innerHTML = '<div style="color: var(--text-muted); font-style: italic;">No recent activity.</div>';
    } else {
        activityList.innerHTML = data.activities.slice(0, 5).map(act => `
            <div style="padding: 12px 0; border-bottom: 1px solid #333; display: flex; align-items: center;">
                <div style="width: 8px; height: 8px; background: var(--primary); border-radius: 50%; margin-right: 12px;"></div>
                <div>
                    <div style="font-size: 0.9rem;">${act.message}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${act.time}</div>
                </div>
            </div>
        `).join('');
    }
}

function initUpload() {
    let currentUploads = [];
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileCount = document.getElementById('file-count');
    const analyzeBtn = document.getElementById('analyze-btn');

    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', (e) => { e.preventDefault(); dropZone.classList.remove('drag-over'); });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    function handleFiles(files) {
        if (files.length + currentUploads.length > 50) {
            alert("Maximum 50 resumes allowed.");
            return;
        }
        currentUploads = [...currentUploads, ...Array.from(files)];
        fileCount.textContent = `${currentUploads.length} file(s) ready`;
    }

    analyzeBtn.addEventListener('click', () => {
        if (currentUploads.length === 0) {
            alert("Please upload at least one resume.");
            return;
        }

        analyzeBtn.innerHTML = "Analyzing...";
        analyzeBtn.disabled = true;

        setTimeout(() => {
            // Mock Analysis & Save
            const newCandidates = generateMockCandidates(currentUploads.length);
            const data = getStoredData();

            data.uploadedCount += currentUploads.length;
            data.candidates = newCandidates; // For demo, we replace/refresh candidates based on upload
            data.activities.unshift({
                message: `Analyzed ${currentUploads.length} new resumes`,
                time: new Date().toLocaleTimeString()
            });

            saveData(data);

            window.location.href = 'cv_scoring.html';
        }, 1500);
    });
}

function initScoring() {
    const data = getStoredData();
    const tbody = document.querySelector('#scoring-table tbody');

    if (data.candidates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No data found. Please upload resumes first.</td></tr>';
        return;
    }

    tbody.innerHTML = data.candidates.slice(0, 10).map((r, i) => `
        <tr>
            <td>#${i + 1}</td>
            <td>${r.name}</td>
            <td><span style="font-weight: bold; color: ${getScoreColor(r.score)}">${r.score}%</span></td>
            <td>${r.skills.join(', ')}</td>
            <td><span class="match-badge ${getBadgeClass(r.score)}">${getMatchLevel(r.score)} Match</span></td>
        </tr>
    `).join('');
}

function initResults() {
    const data = getStoredData();

    if (data.candidates.length === 0) return;

    // Top Candidate
    const top = data.candidates[0];
    const topContainer = document.getElementById('top-candidate-container');
    topContainer.innerHTML = `
        <div>
            <div style="font-size: 0.9rem; color: var(--primary); font-weight: 600; margin-bottom: 5px;">TOP MATCH</div>
            <h3 style="font-size: 1.8rem; margin-bottom: 10px;">${top.name}</h3>
            <p style="color: var(--text-muted); margin-bottom: 20px;">${top.email}</p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                ${top.skills.map(s => `<span class="match-badge" style="background: rgba(255,255,255,0.1);">${s}</span>`).join('')}
            </div>
        </div>
        <div style="margin-left: auto; text-align: center;">
            <div style="font-size: 3rem; font-weight: 800; color: var(--success); text-shadow: 0 0 20px rgba(0,230,118,0.4);">${top.score}%</div>
            <div style="color: var(--success);">Match Score</div>
        </div>
    `;

    // Shortlist (Top 5)
    // Update global selection count
    const totalSelected = data.candidates.filter(c => c.score >= 80).length;
    document.getElementById('overall-selected-count').textContent = totalSelected;

    const tbody = document.querySelector('#results-table tbody');
    tbody.innerHTML = data.candidates.slice(0, 5).map(r => `
        <tr>
            <td>
                <div style="font-weight: 600;">${r.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">Uploaded Just now</div>
            </td>
            <td>${r.email}</td>
            <td><span style="font-weight: bold;">${r.score}%</span></td>
            <td><span class="match-badge ${getBadgeClass(r.score)}">Shortlisted</span></td>
        </tr>
    `).join('');
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
