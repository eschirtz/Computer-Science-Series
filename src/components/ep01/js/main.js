/**
 * WARNING! This code is a hack, the only interesting code lives
 * inside "algorithms.js", found in this directory
 */

import canvasTools from '@/custom-modules/canvas-tools';
import { drawHill, drawBall } from './DrawingTools';
import StateSpace from './StateSpace';
import Algorithm from './algorithms';

let currentFrame = null;

const scene = {
  stateSpace: {},
  currState: {},
};

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
    /* eslint-enable no-mixed-operators */
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


function render(canvas, options) {
  // Clear Canvas
  const context = canvas.getContext('2d');
  context.fillStyle = options.backgroundColor || 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.scale(1, -1); // set positive Y as up
  context.translate(canvas.width / 2, -canvas.height / 2); // set (0,0) to center
  const x = 0;
  const y = -canvas.height / 2;
  const width = canvas.width;
  const height = canvas.height * (3 / 4);
  // Draw Scene
  drawHill(canvas, scene.backgroundHill, {
    x,
    y,
    width,
    height,
    color: options.backgroundHillColor,
  });
  drawHill(canvas, scene.stateSpace.scores, {
    x,
    y,
    width,
    height,
    color: options.hillColor,
  });
  const radius = 25;
  drawBall(canvas, scene.currState, scene.stateSpace, {
    x,
    y: y + radius,
    width,
    height,
    radius,
    primaryColor: options.ballColor,
    secondaryColor: options.ballColor,
  });
}

// Wrapper for canvas-tools
function setCanvasSize(canvas) {
  canvasTools.setCanvasSize(canvas);
}

function initialize(canvas, options) {
  // Build scene
  const numPoints = options.numPoints || 300;
  // Artwork
  scene.backgroundHill = getHill(
    numPoints,
    { f3: 2 });
  // Algorithm dependants
  scene.stateSpace = new StateSpace();
  scene.stateSpace.scores = getHill(
    numPoints,
    options);
  scene.currState = scene.stateSpace.randomState();
  scene.canvas = canvas; // add global pointer to the canvas
  scene.backgroundColor = options.backgroundColor;
  scene.backgroundHillColor = options.backgroundHillColor;
  scene.hillColor = options.hillColor;
  scene.ballColor = options.ballColor;
  setCanvasSize(canvas);
  render(scene.canvas, {
    backgroundHillColor: scene.backgroundHillColor,
    hillColor: scene.hillColor,
    backgroundColor: scene.backgroundColor,
    ballColor: scene.ballColor,
  });
}
/**
 * Pulls from global scene to do work
 * Dependency on globals is a little sloppy,
 * but fine for this demo
 * @return {[type]} [description]
 */
function frame() {
  // Update Scene only at intervals set by keyframe
  currentFrame = window.requestAnimationFrame(frame);
  if (scene.time % scene.keyframe === 0) {
    scene.currState = Algorithm.simulatedAnnealing(
      scene.currState,
      scene.stateSpace,
      scene.temp,
      scene.stepSize);
    scene.temp *= scene.coolingRate; // apply cooling
    setCanvasSize(scene.canvas);
    render(scene.canvas, {
      backgroundHillColor: scene.backgroundHillColor,
      hillColor: scene.hillColor,
      backgroundColor: scene.backgroundColor,
      ballColor: scene.ballColor,
    });
  }
  scene.time += 1;
}

function run(opts) {
  if (currentFrame) {
    window.cancelAnimationFrame(currentFrame);
  }
  const options = opts || {};
  scene.temp = options.initialTemp;
  scene.coolingRate = options.coolingRate;
  scene.algorithm = options.algorithm;
  scene.keyframe = options.keyframe; // frames between changes
  scene.stepSize = options.stepSize;
  scene.time = 0;
  frame();
}

function terminate() {
  if (currentFrame) {
    window.cancelAnimationFrame(currentFrame);
  }
}

export default { initialize, setCanvasSize, render, run, terminate };
