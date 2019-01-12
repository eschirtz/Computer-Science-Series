/**
 * K-means clustering
 */
/* eslint-disable no-use-before-define */
/* eslint-disable no-console */
import Util from './utility';

const World = {};

function initialize(points, clusters, canvas) {
  const width = canvas.width;
  const height = canvas.height;
  World.numClusters = clusters;
  World.centroids = [];
  // Place clusters randomly
  for (let i = 0; i < clusters; i += 1) {
    World.centroids.push(
      {
        x: Math.random() * width,
        y: Math.random() * height,
        bucket: [],
      },
    );
  }
  // Build world of random points
  World.points = Util.getGroupedDistribution(
    canvas.width,
    canvas.height,
    points,
    8,
  );
}

function render(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgb(0,0,0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  World.points.forEach((point) => {
    drawPoint(ctx, point.x, point.y, 5, 'rgb(50,50,50)');
  });
  World.centroids.forEach((centroid) => {
    drawPoint(ctx, centroid.x, centroid.y, 15, 'white');
  });
}

function step() {
  console.log(World);
  // Make buckets
  for (let i = 0; i < World.numClusters; i += 1) {
    World.centroids[i].prevBucket = World.centroids[i].bucket; // save prev
    World.centroids[i].bucket = []; // clear bucket for each centroid
  }
  // Find closest centroids
  World.points.forEach((point) => {
    let bestCentroid = -1; // index of best centroid
    let bestDistance = Number.MAX_VALUE;
    for (let i = 0; i < World.numClusters; i += 1) {
      const dist = Util.getDistance(point, World.centroids[i]);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestCentroid = i;
      }
    }
    // Add point to its corresponding centroid bucket
    World.centroids[bestCentroid].bucket.push(point);
  });
  // Update centroid locations
  World.centroids.forEach((centroid) => {
    const newPos = Util.getAveragePos(centroid.bucket);
    /* eslint-disable no-param-reassign */
    centroid.x = newPos.x;
    centroid.y = newPos.y;
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
