document.addEventListener('DOMContentLoaded', async () => {
    const defaultDownloadPathInput = document.getElementById('defaultDownloadPath');
    const saveDefaultPathBtn = document.getElementById('saveDefaultPathBtn');

                // Load current default path
    try {
        const response = await fetch('/api/settings');
        if (response.ok) {
            const settings = await response.json();
            defaultDownloadPathInput.value = settings.default_download_path || '';
        } else {
            console.error('Failed to load settings:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching settings:', error);
    }

                // Save default path
    saveDefaultPathBtn.addEventListener('click', async () => {
        const newPath = defaultDownloadPathInput.value.trim();
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ default_download_path: newPath }),
            });
            const result = await response.json();
            if (response.ok) {
                alert('Default download path saved!');
            } else {
                alert('Error saving settings: ' + result.error);
            }
        } catch (error) {
            alert('Failed to connect to server to save settings.');
            console.error('Error saving settings:', error);
        }
    });
});

const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const accentPicker = document.getElementById('accentPicker');

const themes = {
    dark: {
        '--color-bg': '#000000',
        '--color-text': '#ffffff',
        '--color-text-muted': '#dfdfdf',
        '--color-bevel-shadow-1': '#373737',
        '--color-bevel-shadow-2': '#1a1a1a',
        '--color-active-bg': '#0a0a0a',
        '--color-active-shadow-1': '#6d6d6d',
        '--color-active-shadow-2': '#9c9c9c'
    },
    light: {
        '--color-bg': '#ffffff',
        '--color-text': '#000000',
        '--color-text-muted': '#555555',
        '--color-bevel-shadow-1': '#e0e0e0',
        '--color-bevel-shadow-2': '#ffffff',
        '--color-active-bg': '#f0f0f0',
        '--color-active-shadow-1': '#cccccc',
        '--color-active-shadow-2': '#e6e6e6'
    }
};

function applyTheme(mode) {
    const theme = themes[mode];
    for (let key in theme) {
        root.style.setProperty(key, theme[key]);
    }

    localStorage.setItem('site-theme', mode); 
}

function applyAccent(color) {
    root.style.setProperty('--color-accent', color);

    root.style.setProperty('--color-border', color + 'c1');

    localStorage.setItem('site-accent', color)
}

if (themeToggle && accentPicker) {
    themeToggle.addEventListener('change', (e) => applyTheme(e.target.value))
    accentPicker.addEventListener('input', (e) => applyAccent(e.target.value))
}

const savedTheme = localStorage.getItem('site-theme') || 'dark';
const savedAccent = localStorage.getItem('site-accent') || '#56a6bd';


if (themeToggle) themeToggle.value = savedTheme;
if (accentPicker) accentPicker.value = savedAccent;

applyTheme(savedTheme);
applyAccent(savedAccent);