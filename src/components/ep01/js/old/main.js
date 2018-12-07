// Globals
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let state_space;
let curr_state;
let time = 0; // Running counter
let temp = TEMP;
const naiveDone = false;
const runConfig = {
  initialTemp: TEMP,
  coolingRate: COOLING_RATE,
  points: POINTS_DEFAULT,
  stepSize: STEP_SIZE_DEFAULT,
  algorithm: ALGORITHM_DEFAULT,
};
/**
 * Main function for the hill climbing
 * simulations
 * @return void
 */
function main() {
  clearScreen();
  disableScroll();
  initEnvironment();
  drawHill(state_space, 0, -HEIGHT / 2);
}
window.onload = main;

function run() {
  temp = runConfig.initialTemp;
  // Pick a random start state
  state = state_space.randomState();
  frame();
  Utility.makeToast(`Initial score: ${state.score.toFixed(2)}`, 2000);
}

function initEnvironment() {
  // State data
  state_space = new StateSpace_2D();
  // Generate hill
  const points = runConfig.points;
  const padding = 100;
  state_space.scores = getHill(WIDTH - padding, HEIGHT / 4, points);
  for (const i in state_space.scores) { state_space.max = state_space.scores[i]; }
}
/**
 * Frame is the main animation loop
 * called by the window requestAnimationFrame function
 * @return void
 */
function frame() {
  // Update
  if ((time++) % KEYFRAME == 0) {
    switch (runConfig.algorithm) {
      case 'simulated_annealing':
        state = simulatedAnnealing(state, state_space, temp);
        break;
      case 'naive_hill_climbing':
        state = naiveHillClimbing(state, state_space);
        break;
    }
    temp *= runConfig.coolingRate;
  }
  // Render
  clearScreen();
  drawScene(state, state_space);
  if (temp < TEMP_CUTOFF || naiveDone) {
    Utility.makeToast(`Final score: ${state.score.toFixed(2)}`, 4000);
  } else {
    window.requestAnimationFrame(frame);
  }
}
/**
 * Draws the scene given two params
 * @param  s  [State, current state]
 * @param  ss [State space]
 * @return void
 */
function drawScene(s, ss) {
  const x = 0;
  const y = -HEIGHT / 2;
  drawHill(state_space, x, y);
  drawBall(state, state_space, x, y + RADIUS_DEFAULT);
}

function drawHill(ssHill, x, y) {
  // Setup
  const spacing = WIDTH / (ssHill.scores.length - 1);
  x -= WIDTH / 2;
  // Draw
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (i = 0; i < ssHill.scores.length; i++) {
    ctx.lineTo(x + i * spacing, y + ssHill.scores[i]);
  }
  ctx.lineTo(x + (ssHill.scores.length - 1) * spacing, y);
  ctx.lineTo(x, y);
  ctx.fillStyle = PRIMARY_COLOR;
  ctx.fill();
}
/**
 * Renders a ball to the screen
 * @param  s      state
 * @param  ss     state_space
 * @param  x      x coordinate
 * @param  y      y coordinate
 * @param  radius ball radius
 * @return void
 */
function drawBall(s, ss, x, y, radius) {
  // Setup
  const spacing = WIDTH / (ss.scores.length - 1);
  x -= WIDTH / 2;
  radius = radius || RADIUS_DEFAULT;
  ctx.beginPath();
  ctx.arc(x + spacing * s.coords[0], y + ss.scores[s.coords[0]], radius, 0, 2 * Math.PI);
  ctx.lineWidth = STROKE_WIDTH;
  ctx.strokeStyle = SECONDARY_STROKE_COLOR;
  ctx.stroke();
  ctx.fillStyle = SECONDARY_COLOR;
  ctx.fill();
}

function getHill(width, height, points) {
  const hill = [];
  const pi = Math.PI;
  points = points || POINTS_DEFAULT;
  const h = height || HEIGHT_DEFAULT; // magnitude
  const f1 = 2; // frequency of cos
  const f2 = 7;
  const f3 = 20;
  const f4 = 0.5;
  const phi1 = Math.random();
  const phi2 = Math.random();
  const phi3 = Math.random();
  const phi4 = Math.random();
  // Generate points
  for (i = 0; i < points; i++) {
    const t = i / points;
    const cos1 = (1.0) * Math.cos(2 * pi * (f1) * t + 2 * pi * phi1);
    const cos2 = (0.3) * Math.cos(2 * pi * (f2) * t + 2 * pi * phi2);
    const cos3 = (0.1) * Math.cos(2 * pi * (f3) * t + 2 * pi * phi3);
    const cos4 = (1.75) * Math.cos(2 * pi * (f4) * t + 2 * pi * phi4);
    // let cos5 = (100)/(Math.abs(i - points/2) + 50);
    const complexHill = (cos1 + cos2 + cos3 + cos4 + 2);
    const simpleHill = cos4 + 1;
    const sum = complexHill;
    height = sum * h / 2 + h / 2;
    hill.push(height);
  }
  return hill;
}

function clearScreen() {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.translate(WIDTH / 2, HEIGHT / 2); // Set (0,0) to be center of screen
  ctx.scale(1, -1); // Set +y to be the vertical direction
}
