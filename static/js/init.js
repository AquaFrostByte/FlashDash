const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let boot = false;

async function loading() {
    const mainWindow = document.getElementById('MainWindow');
    
    if (boot === false) {
        if (mainWindow) {
            mainWindow.style.visibility = 'hidden';
            await wait(2500);
            mainWindow.style.visibility = 'visible';
        }
    }
}

function theme() {
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
        localStorage.setItem('site-accent', color);
    }

    if (themeToggle && accentPicker) {
        themeToggle.addEventListener('change', (e) => applyTheme(e.target.value));
        accentPicker.addEventListener('input', (e) => applyAccent(e.target.value));
    }

    const savedTheme = localStorage.getItem('site-theme') || 'dark';
    const savedAccent = localStorage.getItem('site-accent') || '#56a6bd';

    if (themeToggle) themeToggle.value = savedTheme;
    if (accentPicker) accentPicker.value = savedAccent;

    applyTheme(savedTheme);
    applyAccent(savedAccent);
}

loading();
theme();

boot = true;