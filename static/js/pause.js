let isPauseSelectionMode = false;
let pauseTimeoutId = null;

function resetPauseState() {
    isPauseSelectionMode = false;
    const pauseBtn = document.getElementById('pause-btn');
    const tbody = document.getElementById('downloads-table-body') || document.getElementById('download-tbody');
    
    if (pauseBtn) {
        pauseBtn.innerText = "Pause";
        pauseBtn.disabled = false;
    }
    if (tbody) {
        tbody.classList.remove('pause-mode-active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('downloads-table-body') || document.getElementById('download-tbody');
    
    if (tbody) {
        tbody.addEventListener('click', async (event) => {
            if (!isPauseSelectionMode) return;

            const row = event.target.closest('tr');
            if (!row || !row.dataset.gid) return;

            const gid = row.dataset.gid;
            
            clearTimeout(pauseTimeoutId);
            resetPauseState();

            try {
                const response = await fetch('/api/pause-single', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gid: gid })
                });
                
                if (response.ok) {
                    if (typeof refreshDashboard === 'function') await refreshDashboard();
                } else {
                    const result = await response.json();
                    alert("Error pausing item: " + (result.error || "Unknown error"));
                }
            } catch (err) {
                alert("Failed to connect to server: " + err.message);
            }
        });
    }
});

const pauseBtn = document.getElementById('pause-btn');
if (pauseBtn) {
    pauseBtn.addEventListener('click', async () => {
        const tbody = document.getElementById('downloads-table-body') || document.getElementById('download-tbody');

        if (!isPauseSelectionMode) {
            isPauseSelectionMode = true;
            pauseBtn.innerText = "Pause All?";    
            
            if (tbody) tbody.classList.add('pause-mode-active');
        
            pauseTimeoutId = setTimeout(() => {
                resetPauseState();
            }, 5000);

            return;
        }

        clearTimeout(pauseTimeoutId);
        resetPauseState(); 

        pauseBtn.innerText = "Pausing all!";
        pauseBtn.disabled = true;

        try {
            const response = await fetch('/api/pause', { method: 'POST'});
            const result = await response.json();
            if (response.ok) {
                if (typeof refreshDashboard === 'function') await refreshDashboard();
            } else {
                alert("Error: " + result.error);
            }
        } catch (err) {
            alert("Failed to connect to server" + err.message);
        } finally {
            pauseBtn.innerText = "Pause";
            pauseBtn.disabled = false;
        }
    });
}