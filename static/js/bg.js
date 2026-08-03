const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

const accentColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-accent')
  .trim();

const bgColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-bg')
  .trim();

console.log(bgColor)

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
  if(bgColor  == "#000000"){
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.fillStyle = accentColor;
  ctx.font = fontSize + 'px monospace';

  for (let i = 0; i < drops.length; i++) {
    const text = charArray[Math.floor(Math.random() * charArray.length)];
    const x = i * fontSize;
    const y = drops[i] * fontSize;

    ctx.fillText(text, x, y);

    if (y > canvas.height && Math.random() > 0.975) {

      ctx.fillStyle = bgColor;
      ctx.fillRect(x, 0, fontSize, canvas.height);

      ctx.fillStyle = accentColor;
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