import canvasDpiScaler from 'canvas-dpi-scaler';

function fillScreen(canvas) {
  /* eslint-disable no-param-reassign */
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  /* eslint-enable no-param-reassign */
}

function initFullScreen(canvas) {
  fillScreen(canvas);
  canvasDpiScaler(canvas, canvas.getContext('2d'));
}

function terminate() {
  window.removeEventListener('resize', fillScreen);
}


export default {
  initFullScreen,
  terminate,
  fillScreen,
};
