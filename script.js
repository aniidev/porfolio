
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);


canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '400';
canvas.style.zIndex = '-1';
canvas.style.backgroundColor = '#000';


function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const fontSize = 14;
const columns = Math.floor(canvas.width / fontSize);
const drops = new Array(columns).fill(1);
const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let frameCount = 0;  


function drawMatrixRain() {

  frameCount++;
  const shouldUpdate = frameCount % 4 === 0;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#FFFFFF';  
  ctx.font = fontSize + 'px monospace';

  for (let i = 0; i < drops.length; i++) {
    const text = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (shouldUpdate) {
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }
}

// Start the animation
function animate() {
  drawMatrixRain();
  requestAnimationFrame(animate);
}
animate();



// Cursor and Magnetic Text Effect
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-dot-outline');

const nameElement = document.querySelector('h1');
if (nameElement) {
  nameElement.classList.add('magnetic-text');
  nameElement.innerHTML = nameElement.textContent.split('').map(char =>
    char === ' ' ? ' ' : `<span class="text-distort">${char}</span>`
  ).join('');
}

let cursorVisible = false;
let cursorEnlarged = false;

const endX = window.innerWidth / 2;
const endY = window.innerHeight / 2;

let mouseX = endX;
let mouseY = endY;

const magneticPower = 0.6; 
const magneticRadius = 300; 

function toggleCursorVisibility() {
  if (!cursorVisible) {
    cursorDot.style.opacity = 1;
    cursorOutline.style.opacity = 1;
    cursorVisible = true;
  }
}

function toggleCursorSize(hover) {
  if (hover) {
    cursorDot.style.transform = 'translate(-50%, -50%) scale(0.85)';
    cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.5)';
  } else {
    cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
  }
}

function createPulse() {
  cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
  cursorOutline.style.transform = 'translate(-50%, -50%) scale(2)';

  setTimeout(() => {
    cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 100);
}

function getDistanceFromCenter(element, mouseX, mouseY) {
  const rect = element.getBoundingClientRect();
  const elementX = rect.left + (rect.width / 2);
  const elementY = rect.top + (rect.height / 2);

  return {
    distance: Math.sqrt(Math.pow(mouseX - elementX, 2) + Math.pow(mouseY - elementY, 2)),
    dx: mouseX - elementX,
    dy: mouseY - elementY
  };
}

function applyMagneticEffect(element, mouseX, mouseY) {
  // Remove the main element movement
  element.style.transform = '';

  // Apply distortion effect to child spans
  const letters = element.querySelectorAll('.text-distort');
  letters.forEach((letter, index) => {
    const letterRect = letter.getBoundingClientRect();
    const letterCenter = {
      x: letterRect.left + (letterRect.width / 2),
      y: letterRect.top + (letterRect.height / 2)
    };
    const letterDistance = Math.sqrt(
      Math.pow(mouseX - letterCenter.x, 2) +
      Math.pow(mouseY - letterCenter.y, 2)
    );

    if (letterDistance < magneticRadius) {
      const letterPower = (1 - (letterDistance / magneticRadius)) * (magneticPower * 0.5);
      const dx = mouseX - letterCenter.x;
      const dy = mouseY - letterCenter.y;
      const translateX = -dx * letterPower;
      const translateY = -dy * letterPower;
      const rotation = (dx / magneticRadius) * 20 * letterPower;
      const scale = 1 + letterPower * 0.2;
      letter.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg) scale(${scale})`;
      letter.style.letterSpacing = `${letterPower * 5}px`;
    } else {
      letter.style.transform = '';
      letter.style.letterSpacing = '';
    }
  });
}

function mousemoveHandler(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  toggleCursorVisibility();

  // Apply magnetic effect only to the name
  if (nameElement) {
    applyMagneticEffect(nameElement, mouseX, mouseY);
  }
}

function mouseenterHandler() {
  toggleCursorVisibility();
}

function mouseleaveHandler() {
  cursorDot.style.opacity = 0;
  cursorOutline.style.opacity = 0;
  cursorVisible = false;

  // Reset name element
  if (nameElement) {
    nameElement.style.transform = '';
    const letters = nameElement.querySelectorAll('.text-distort');
    letters.forEach(letter => {
      letter.style.transform = '';
      letter.style.letterSpacing = '';
    });
  }
}

// Event listeners
document.addEventListener('mousemove', mousemoveHandler);
document.addEventListener('mouseenter', mouseenterHandler);
document.addEventListener('mouseleave', mouseleaveHandler);
document.addEventListener('click', createPulse);

// Hover effect for clickable elements
const clickables = document.querySelectorAll('a, button, .project-card');
clickables.forEach((el) => {
  el.addEventListener('mouseover', () => toggleCursorSize(true));
  el.addEventListener('mouseout', () => toggleCursorSize(false));
});

// Smooth cursor animation
function updateCursor() {
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top = mouseY + 'px';
  cursorOutline.style.left = mouseX + 'px';
  cursorOutline.style.top = mouseY + 'px';
  requestAnimationFrame(updateCursor);
}

updateCursor();

let scrollPosition = window.pageYOffset;

function parallaxScroll() {
  const currentScroll = window.pageYOffset;
  const scrollDiff = currentScroll - scrollPosition;

  // cards.forEach((card, index) => {
  //   const speed = 0.05 + (index * 0.01); // Different speed for each card
  //   const rect = card.getBoundingClientRect();
  //   const isInView = rect.top < window.innerHeight && rect.bottom > 0;

  //   if (isInView) {
  //     const yPos = parseFloat(getComputedStyle(card).transform.split(',')[5]) || 0;
  //     const newY = Math.max(-50, Math.min(50, yPos - (scrollDiff * speed)));
  //     const scale = 1 - Math.abs(newY) / 1000;
  //     const rotation = newY / 50; // Subtle rotation based on scroll

  //     card.style.transform = `translate3d(0, ${newY}px, 0) scale(${scale}) rotateX(${rotation}deg)`;
  //   }
  // });

  scrollPosition = currentScroll;
  requestAnimationFrame(parallaxScroll);
}

// Initialize parallax effect
window.addEventListener('load', () => {
  requestAnimationFrame(parallaxScroll);
});

// Optimize performance by using passive scroll listener
window.addEventListener('scroll', () => {
  requestAnimationFrame(parallaxScroll);
}, { passive: true });
