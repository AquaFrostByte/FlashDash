let isResumeSelectionMode = false;
let resumeTimeoutId = null;

function resetResumeState() {
    isResumeSelectionMode = false;
    const resumeBtn = document.getElementById('resume-btn');
    const tbody = document.getElementById('downloads-table-body') || document.getElementById('download-tbody');
    
    if (resumeBtn) {
        resumeBtn.innerText = "Resume";
        resumeBtn.disabled = false;
    }
    if (tbody) {
        tbody.classList.remove('resume-mode-active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('downloads-table-body') || document.getElementById('download-tbody');
    
    if (tbody) {
        tbody.addEventListener('click', async (event) => {
            
            if (!isResumeSelectionMode) return;

            const row = event.target.closest('tr');
            if (!row || !row.dataset.gid) return;

            const gid = row.dataset.gid;
            
            clearTimeout(resumeTimeoutId);
            resetResumeState();

            try {
                const response = await fetch('/api/resume-single', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gid: gid })
                });
                
                if (response.ok) {
                    if (typeof refreshDashboard === 'function') await refreshDashboard();
                } else {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const result = await response.json();
                        alert("Error resuming item: " + (result.error || "Unknown error"));
                    } else {
                        alert(`Server Error (Status: ${response.status})`);
                    }
                }
            } catch (err) {
                alert("Failed to connect to server: " + err.message);
            }
        });
    }
});

const resumeBtn = document.getElementById('resume-btn');
if (resumeBtn) {
    resumeBtn.addEventListener('click', async () => {
        const tbody = document.getElementById('downloads-table-body') || document.getElementById('download-tbody');

        if (!isResumeSelectionMode) {
            isResumeSelectionMode = true;
            resumeBtn.innerText = "Resume All?";    
            
            if (tbody) tbody.classList.add('resume-mode-active');
        
            resumeTimeoutId = setTimeout(() => {
                resetResumeState();
            }, 5000);

            return;
        }

        clearTimeout(resumeTimeoutId);
        resetResumeState(); 

        resumeBtn.innerText = "Continuing all! :3";
        resumeBtn.disabled = true;

        try {
            const response = await fetch('/api/resume', { method: 'POST'});
            const result = await response.json();
            if (response.ok) {
                if (typeof refreshDashboard === 'function') await refreshDashboard();
            } else {
                alert("Error: " + result.error);
            }
        } catch (err) {
            alert("Failed to connect to server" + err.message);
        } finally {
            resumeBtn.innerText = "Resume";
            resumeBtn.disabled = false;
        }
    });
}