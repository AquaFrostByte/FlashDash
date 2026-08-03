const pauseBtn = document.getElementById('pause-btn');
if (pauseBtn) {
    const originalText = "Pause";
    let isConfirm = false;
    let timeoutId = null;

    pauseBtn.addEventListener('click', async () => {
        
        if (!isConfirm) {
            isConfirm = true;
            pauseBtn.innerText = "Pause All?";    
        
            timeoutId = setTimeout(() => {
                isConfirm = false;
                pauseBtn.innerText = originalText;
            }, 3000);

            return;
        }

        clearTimeout(timeoutId);

        pauseBtn.innerText = "Pausing all!";
        pauseBtn.disabled = true;

        try {
            const response = await fetch('/api/pause', { method: 'POST'});
            const result = await response.json();
            if (response.ok) {
                await refreshDashboard();
            } else {
                alert("Error: " + result.error);
            }
        } catch (err) {
            alert("Failed to connect to server" + err.message);
        } finally {
            pauseBtn.innerText = originalText;
            pauseBtn.disabled = false;
            isConfirm = false;
        }
    })
}