const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

const accentColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-accent')
  .trim();

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resize();
window.addEventListener('resize', resize);

const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ';
const charArray = chars.split('');

const fontSize = 16;
let columns = Math.floor(canvas.width / fontSize);

let drops = new Array(columns).fill(1);

function draw() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = accentColor;
  ctx.font = fontSize + 'px monospace';

  for (let i = 0; i < drops.length; i++) {
    const text = charArray[Math.floor(Math.random() * charArray.length)];
    const x = i * fontSize;
    const y = drops[i] * fontSize;

    ctx.fillText(text, x, y);

    if (y > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
}

setInterval(draw, 33);

window.addEventListener('resize', () => {
  columns = Math.floor(canvas.width / fontSize);
  drops = new Array(columns).fill(1);
});