let activeSplit = null;

const split8Btn = document.getElementById('split8-btn');
const split16Btn = document.getElementById('split16-btn');

function updateSplitVisuals() {
    const accentColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent')
        .trim() || '#4CAF50'; 

    if (split8Btn) {
        split8Btn.style.backgroundColor = '';
        split8Btn.style.color = '';
    }
    if (split16Btn) {
        split16Btn.style.backgroundColor = '';
        split16Btn.style.color = '';
    }

    if (activeSplit === 8 && split8Btn) {
        split8Btn.style.backgroundColor = accentColor; 
        split8Btn.style.color = 'white';
    } else if (activeSplit === 16 && split16Btn) {
        split16Btn.style.backgroundColor = accentColor;
        split16Btn.style.color = 'white';
    }
}

if (split8Btn) {
    split8Btn.addEventListener('click', () => {
        activeSplit = (activeSplit === 8) ? null : 8; 
        updateSplitVisuals();
    });
}

if (split16Btn) {
    split16Btn.addEventListener('click', () => {
        activeSplit = (activeSplit === 16) ? null : 16;
        updateSplitVisuals();
    });
}

window.splitManager = {
    getActiveSplit: () => activeSplit,
    resetSplit: () => {
        activeSplit = null;
        updateSplitVisuals();
    }
};