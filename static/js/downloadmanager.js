async function refreshDashboard() {
    try {
        const response = await fetch('/api/downloads');
        if (!response.ok) throw new Error("Could not reach API");
        const downloads = await response.json();

        const tbody = document.getElementById('downloads-table-body') || document.getElementById('download-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (downloads.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: gray;">Nothing.. Empty.. so add something &gt;:3</td></tr>';
            return;
        }

        downloads.forEach(task => {
            const row = document.createElement('tr');

            // Handle potential errors beautifully
            const isError = task.status.toLowerCase() === 'error';
            const errorNotice = isError && task.error_message
                ? `<br><span class="error-text" style="color: #ff6b6b; font-size: 0.85rem;">⚠️ Error ${task.error_code}: ${task.error_message}</span>`
                : '';

            const badgeClass = isError ? 'status-badge error' : 'status-badge';

            row.innerHTML = `
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <strong>${task.name || 'Retrieving metadata...'}</strong>
                    ${errorNotice}
                </td>
                <td><span class="${badgeClass}">${task.status.toUpperCase()}</span></td>
                <td>
                    <div><strong>${task.progress}%</strong></div>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${task.progress}%"></div>
                    </div>
                </td>
                <td>${task.download_speed}</td>   
                <td>${task.completed_length} / ${task.total_length}</td>
                <td>${task.eta}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        const tbody = document.getElementById('downloads-table-body') || document.getElementById('download-tbody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;"> Ups: ${err.message}</td></tr>`;
        }
    }
}

const purgeBtn = document.getElementById('purge-btn');
if (purgeBtn) {
    purgeBtn.addEventListener('click', async () => {
        const originalText = purgeBtn.innerText;

        purgeBtn.innerText = "Killing it all! >:3";
        purgeBtn.disabled = true;

        try {
            const response = await fetch('/api/purge', { method: 'POST' });
            const result = await response.json();

            if (response.ok) {
                await refreshDashboard();
            } else {
                alert("Error: " + result.error);
            }
        } catch (err) {
            alert("Failed to connect to server: " + err.message);
        } finally {
            purgeBtn.innerText = originalText;
            purgeBtn.disabled = false; 
        }
    });
}

document.getElementById('Downloadlink').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();

        const downloadLink = this.value.trim(); 
        const downloadPath = document.getElementById('Downloadpath').value.trim();
        const statuspre = document.getElementById('status');

        statuspre.style.display = 'block';

        if (!downloadLink) {
            alert('Add a download link! 3:<');
            return;
        }

        const requestBody = {
            download_link: downloadLink
        };

        if (downloadPath) {
            requestBody.download_path = downloadPath;
        }

        fetch('/api/add-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody) 
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Download started!:', data.gid);
                this.value = ''; 

                document.getElementById('Downloadpath').value = ''; 
                alert('Download started!');
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to send request.'); 
        });
    }
});

setInterval(refreshDashboard, 2000);
refreshDashboard();