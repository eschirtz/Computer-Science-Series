import canvasDpiScaler from 'canvas-dpi-scaler';

const stateSpace = {};

/**
 * Creates a normalized "hill" or function with
 * given number of data points.
 * @param  {[type]} points  [description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
function getHill(points, options) {
  const pi = Math.PI;
  const f1 = options.f1 || 2;
  const f2 = options.f2 || 7;
  const f3 = options.f3 || 20;
  const f4 = options.f4 || 0.5;
  const phi1 = Math.random();
  const phi2 = Math.random();
  const phi3 = Math.random();
  const phi4 = Math.random();
  // Generate heights on hill
  const hill = [];
  let maxHeight = 1;
  for (let i = 0; i < points; i += 1) {
    const t = i / points; // for use in cosine
    /* eslint-disable no-mixed-operators */
    const cos1 = (1.0) * Math.cos(2 * pi * (f1) * t + 2 * pi * phi1);
    const cos2 = (0.25) * Math.cos(2 * pi * (f2) * t + 2 * pi * phi2);
    const cos3 = (0.1) * Math.cos(2 * pi * (f3) * t + 2 * pi * phi3);
    const cos4 = (1.65) * Math.cos(2 * pi * (f4) * t + 2 * pi * phi4);
    /* eslint-disable no-mixed-operators */
    const cosSum = cos1 + cos2 + cos3 + cos4 + 2;
    const currHeight = Math.abs(cosSum); // prevent negative valleys
    if (currHeight > maxHeight) maxHeight = currHeight;
    hill.push(currHeight);
  }
  // normalize hill
  for (let i = 0; i < points; i += 1) {
    hill[i] /= maxHeight;
  }
  return hill;
}

function drawHill(canvas, ssHill, options) {
  // Setup
  const context = canvas.getContext('2d');
  const spacing = (options.width / (ssHill.scores.length - 1));
  const x = options.x - options.width / 2;
  const y = options.y;
  // Draw
  context.beginPath();
  context.moveTo(x, y);
  for (let i = 0; i < ssHill.scores.length; i += 1) {
    context.lineTo(x + i * spacing, y + ssHill.scores[i] * options.height);
  }
  context.lineTo(x + (ssHill.scores.length - 1) * spacing, y);
  context.lineTo(x, y);
  context.fillStyle = options.color || 'black';
  context.fill();
}

function render(canvas, options) {
  /* eslint-disable no-param-reassign */
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  /* eslint-enable no-param-reassign */
  // Clear Canvas
  const context = canvas.getContext('2d');
  context.fillStyle = options.backgroundColor || 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.translate(canvas.width / 2, canvas.height / 2); // set (0,0) to center
  context.scale(1, -1); // set positive Y as up
  // Draw Scene
  drawHill(canvas, stateSpace, {
    x: 0,
    y: -canvas.height / 2,
    width: canvas.width,
    height: canvas.height / 2,
    color: options.hillColor || 'black',
  });
}

function setCanvasSize(canvas) {
  /* eslint-disable no-param-reassign */
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  /* eslint-enable no-param-reassign */
  canvasDpiScaler(canvas, canvas.getContext('2d'));
}

function initialize(canvas, options) {
  // Build scene
  const numPoints = options.numPoints || 300;
  stateSpace.scores = getHill(
    numPoints,
    options);
  setCanvasSize(canvas);
  render(canvas, options);
}

export default { initialize, setCanvasSize, render };
