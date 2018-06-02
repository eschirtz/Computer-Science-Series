/**
 * Event listeners and handlers for user input
 */

window.onkeyup = function(e){
  // Map functions to keys
  switch(e.key){
    case 'Enter':
      naiveDone = false; 
      run();
    break;
  }
}
// preventDefault on these keys
const keysPreventDefault = {
  37: 1, // left
  38: 1, // up
  39: 1, // right
  40: 1, // down
  32: 1  // spacebar
};

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
    if(keysPreventDefault[e.keyCode]){
      preventDefault(e);
      return false;
    }
}

function disableScroll() {
  if (window.addEventListener) // older FF
      window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove  = preventDefault; // mobile
  document.onkeydown  = preventDefaultForScrollKeys;
}

function enableScroll() {
    if (window.removeEventListener)
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
    window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
    document.onkeydown = null;
}
