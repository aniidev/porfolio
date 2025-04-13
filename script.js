// Matrix Rain Effect
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// Style the canvas to cover the whole background
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = '-1';
canvas.style.backgroundColor = '#000';

// Set actual canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Matrix rain configuration
const fontSize = 14;
const columns = Math.floor(canvas.width / fontSize);
const drops = new Array(columns).fill(1);
const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let frameCount = 0;  // Add frame counter for controlling speed

// Animation function
function drawMatrixRain() {
  // Only update positions every 4 frames
  frameCount++;
  const shouldUpdate = frameCount % 4 === 0;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#FFFFFF';  // Changed to white
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

// Game state
let currentStreak = 0;
let timerActive = false;
let startTime;
let timerInterval;
let currentWordPair = 0;

// Word pairs and their possible bridge words
const wordPairs = [
  {
    word1: 'Pine',
    word2: 'Apple',
    bridges: ['Tree', 'Cone', 'Needle']
  },
  {
    word1: 'Light',
    word2: 'Snow',
    bridges: ['White', 'House', 'Flake']
  },
  {
    word1: 'Book',
    word2: 'Shelf',
    bridges: ['Case', 'End', 'Store']
  },
  {
    word1: 'Coffee',
    word2: 'Cup',
    bridges: ['Mug', 'Table', 'Holder']
  },
  {
    word1: 'Rain',
    word2: 'Bow',
    bridges: ['Bow', 'Drop', 'Cloud']
  }
];

// DOM elements
const word1Element = document.getElementById('word1');
const word2Element = document.getElementById('word2');
const bridgeInput = document.getElementById('bridgeWord');
const submitBtn = document.getElementById('submitBtn');
const newGameBtn = document.getElementById('newGameBtn');
const toggleTimerBtn = document.getElementById('toggleTimerBtn');
const streakElement = document.getElementById('streak');
const timerElement = document.getElementById('timer');
const feedbackElement = document.getElementById('feedback');

// Cursor and Magnetic Text Effect
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-dot-outline');

// Add magnetic effect only to the name
const nameElement = document.querySelector('h1');
if (nameElement) {
  nameElement.classList.add('magnetic-text');
  // Split text into spans for individual letter animation
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

// Magnetic effect parameters
const magneticPower = 0.6; // Increased strength for more noticeable effect on name
const magneticRadius = 300; // Increased radius for the name

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

// Initialize game
function initGame() {
  currentStreak = 0;
  currentWordPair = 0;
  updateStreak();
  displayCurrentWordPair();
  resetTimer();
  feedbackElement.textContent = '';
  bridgeInput.value = '';
}

// Display current word pair
function displayCurrentWordPair() {
  word1Element.textContent = wordPairs[currentWordPair].word1;
  word2Element.textContent = wordPairs[currentWordPair].word2;
}

// Check if the bridge word is valid
function isValidBridge(bridgeWord) {
  return wordPairs[currentWordPair].bridges.some(
    bridge => bridge.toLowerCase() === bridgeWord.toLowerCase()
  );
}

// Update streak display
function updateStreak() {
  streakElement.textContent = currentStreak;
}

// Timer functions
function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function resetTimer() {
  stopTimer();
  timerElement.textContent = '00:00';
}

function updateTimer() {
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
  const seconds = (elapsedTime % 60).toString().padStart(2, '0');
  timerElement.textContent = `${minutes}:${seconds}`;
}

// Event listeners
submitBtn.addEventListener('click', () => {
  const bridgeWord = bridgeInput.value.trim();
  if (!bridgeWord) {
    feedbackElement.textContent = 'Please enter a bridge word';
    return;
  }

  if (isValidBridge(bridgeWord)) {
    feedbackElement.textContent = 'Correct!';
    currentStreak++;
    updateStreak();

    // Move to next word pair
    currentWordPair = (currentWordPair + 1) % wordPairs.length;
    setTimeout(() => {
      displayCurrentWordPair();
      bridgeInput.value = '';
      feedbackElement.textContent = '';
    }, 1500);
  } else {
    feedbackElement.textContent = 'Try again!';
    currentStreak = 0;
    updateStreak();
  }
});

newGameBtn.addEventListener('click', initGame);

toggleTimerBtn.addEventListener('click', () => {
  timerActive = !timerActive;
  if (timerActive) {
    startTimer();
  } else {
    stopTimer();
  }
});

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame); 