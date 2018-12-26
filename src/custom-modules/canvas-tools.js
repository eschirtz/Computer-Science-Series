function getRetinaRatio(canvas) {
  /* eslint-disable no-console */
  if (!canvas) { console.warn('Canvas required!'); }
  /* eslint-enable no-console */
  const devicePixelRatio = window.devicePixelRatio || 1;
  const c = canvas;
  const backingStoreRatio = [
    c.webkitBackingStorePixelRatio,
    c.mozBackingStorePixelRatio,
    c.msBackingStorePixelRatio,
    c.oBackingStorePixelRatio,
    c.backingStorePixelRatio,
    1,
  ].reduce((a, b) => a || b);

  return devicePixelRatio / backingStoreRatio;
}

function setCanvasSize(canvas) {
  const ratio = getRetinaRatio(canvas);
  /* eslint-disable no-param-reassign */
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  /* eslint-enable no-param-reassign */
}

export default {
  getRetinaRatio,
  setCanvasSize,
};
