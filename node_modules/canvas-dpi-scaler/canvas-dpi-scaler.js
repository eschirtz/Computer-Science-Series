//
//
// Based on: http://www.html5rocks.com/en/tutorials/canvas/hidpi/

//
var scaleFn = function(canvas, context, customWidth, customHeight) {
  if(!canvas || !context) { throw new Error('Must pass in `canvas` and `context`.'); }

  var width = customWidth ||
              canvas.width || // attr, eg: <canvas width='400'>
              canvas.clientWidth; // keep existing width
  var height = customHeight ||
               canvas.height ||
               canvas.clientHeight;
  var deviceRatio = window.devicePixelRatio || 1;
  var bsRatio = context.webkitBackingStorePixelRatio ||
                context.mozBackingStorePixelRatio ||
                context.msBackingStorePixelRatio ||
                context.oBackingStorePixelRatio ||
                context.backingStorePixelRatio || 1;
  var ratio = deviceRatio / bsRatio;

  // Adjust canvas if ratio =/= 1
  if (deviceRatio !== bsRatio) {
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    context.scale(ratio, ratio);
  }
  return ratio;
};

// expose functionality
if(typeof window !== 'undefined') { window.canvasDpiScaler = scaleFn; }
module.exports = scaleFn;
