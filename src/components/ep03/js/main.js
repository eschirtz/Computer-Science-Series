/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/**
 * K-means clustering
 */
import Util from './utility';

const TWEEN = require('./Tween.js').TWEEN;

const World = {};
const BG_COLOR = '#292E34';
const DEFAULT_COLOR = '#363D45';
let frameId;

function animate() {
  frameId = window.requestAnimationFrame(animate);
  TWEEN.update();
  render(World.canvas);
}

function initialize(numPoints, numCentroids, canvas, numSteps) {
  const width = canvas.width;
  const height = canvas.height;
  World.numCentroids = numCentroids;
  World.numPoints = numPoints;
  World.numSteps = numSteps;
  World.centroids = [];
  World.canvas = canvas;
  setCentroids(width, height);
  setPoints(width, height);
  // kick off animation loop for tweening
  if (frameId) window.cancelAnimationFrame(frameId);
  animate();
}

function setPoints(width, height) {
  // Build world of random points
  World.points = Util.getGroupedDistribution(
    width,
    height,
    World.numPoints,
    World.numCentroids * (Math.random() * 2),
  );
}

function setCentroids(width, height) {
  // Place clusters randomly
  for (let i = 0; i < World.numCentroids; i += 1) {
    const hue = (i * 50) % 360; // Move through color wheel
    World.centroids.push(
      {
        x: Math.random() * width,
        y: Math.random() * height,
        bucket: [],
        hue,
      },
    );
  }
}

function render(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  World.points.forEach((point) => {
    let color = DEFAULT_COLOR;
    if (point.hue !== undefined) { color = `hsl(${point.hue}, 70%, 60%)`; }
    drawPoint(ctx, point.x, point.y, 5, color);
  });
  World.centroids.forEach((centroid) => {
    drawPoint(ctx, centroid.x, centroid.y, 15, `hsl(${centroid.hue}, 80%, 50%)`);
  });
}

function step() {
  // Make buckets
  for (let i = 0; i < World.numCentroids; i += 1) {
    World.centroids[i].prevBucket = World.centroids[i].bucket; // save prev
    World.centroids[i].bucket = []; // clear bucket for each centroid
  }
  // Find closest centroids
  World.points.forEach((point) => {
    let bestCentroid = -1; // index of best centroid
    let bestDistance = Number.MAX_VALUE;
    for (let i = 0; i < World.numCentroids; i += 1) {
      const dist = Util.getDistance(point, World.centroids[i]);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestCentroid = i;
      }
    }
    // Add point to its corresponding centroid bucket
    World.centroids[bestCentroid].bucket.push(point);
    // Color the point to match it's centroid
    point.hue = World.centroids[bestCentroid].hue;
  });
  // Update centroid locations
  World.centroids.forEach((centroid) => {
    const newPos = Util.getAveragePos(centroid.bucket);
    // Setup tweening animation
    const tween = new TWEEN.Tween(centroid);
    tween.to({ x: newPos.x, y: newPos.y }, 1000)
      .easing(TWEEN.Easing.Quadratic.Out)
      .start()
      .onComplete(() => {
        // if (World.numSteps > 0) {
        //   step();
        //   World.numSteps -= 1;
        // }
        // console.log(`Completed step #${World.numSteps}`);
      });
  });
}

function drawPoint(ctx, x, y, radius, color) {
  const context = ctx;
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI);
  context.fillStyle = color;
  context.fill();
}

export default { initialize, render, step };
