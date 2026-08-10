document.addEventListener("DOMContentLoaded", () => {
    const repoInput = document.getElementById("repo-input");
    const repoSubmit = document.getElementById("repo-submit");
    const reposContainer = document.getElementById("repos");

    const repoManager = document.getElementById("repo-manager");
    const repoBrowser = document.getElementById("repo-browser");
    const repoIframe = document.getElementById("repo-iframe");

    async function loadRepos() {
        const response = await fetch('/api/repos');
        const repos = await response.json();
        
        reposContainer.innerHTML = '';
        
        repos.forEach(url => {
            const repoDiv = document.createElement("div");
            repoDiv.className = "repo-item";
            
            const urlText = document.createElement("span");
            urlText.textContent = url;
            urlText.className = "clickable-repo";
            urlText.title = "Click to view site";
            urlText.onclick = () => openRepo(url);
            
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Remove";
            deleteBtn.onclick = () => deleteRepo(url);
            
            repoDiv.appendChild(urlText);
            repoDiv.appendChild(deleteBtn);
            reposContainer.appendChild(repoDiv);
        });
    }

    async function addRepo() {
        const url = repoInput.value.trim();
        if (!url) return;

        const response = await fetch('/api/repos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        if (response.ok) {
            repoInput.value = ''; 
            loadRepos(); 
        } else {
            alert("Failed to add repository.");
        }
    }

    async function deleteRepo(url) {
        const response = await fetch('/api/repos', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: url })
        });

        if (response.ok) {
            loadRepos();
        }
    }
    
    async function openRepo(url) {
        try {
            const response = await fetch(`/api/check-frame?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data.can_frame) {
                repoManager.style.display = "none";
                repoIframe.src = url;
                repoBrowser.style.display = "flex";
            } else {
                console.log("Iframe blocked by site security. Opening in new tab...");
                window.open(url, '_blank');
            }
        } catch (error) {
            console.error("Frame check failed:", error);
            window.open(url, '_blank');
        }
    }

    window.closeBrowser = function() {
        repoIframe.src = "about:blank";
        repoBrowser.style.display = "none";
        repoManager.style.display = "block";
    };

    repoSubmit.addEventListener("click", addRepo);
    
    repoInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addRepo();
    });

    loadRepos();
});