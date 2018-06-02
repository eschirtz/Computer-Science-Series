const stepSize = 0.05;
/**
 *  The ObjectState object holds the current
 *  state of the cube
 */
class ObjectState {
  constructor(x, y, z, easing, easingFactor) {
    // Flag for using easing in position updates
    this.easing = easing;
    this.easingFactor = easingFactor;
    // Position of cube in Euclidean coordinates
    this.pos = {
      x: x,
      y: y,
      z: z,
    };
    // The real speed of the cube
    // used to update its position each frame
    this.pos.speed = {
      x: 0,
      y: 0,
      z: 0
    };
    // The speed that we will update to "target"
    this.pos.inputSpeed = {
      x: 0,
      y: 0,
      z: 0
    }
  };
  /**
   * Update postion using standard formula
   * position = postion + speed * time
   * where time = 1 frame
   */
  updatePosition() {
    const pos = this.pos; // set up a helper variable
    // Update position for each coordinate
    pos.x = pos.x + pos.speed.x;
    pos.y = pos.y + pos.speed.y;
    pos.z = pos.z + pos.speed.z;
  }
  /**
   * Update the cubes parameters
   */
  update() {
    const pos = this.pos; // set up a helper variable
    // Update speeds naively (just copy input speed to real speed)
    if (!this.easing) {
      pos.speed.x = pos.inputSpeed.x;
      pos.speed.y = pos.inputSpeed.y;
      pos.speed.z = pos.inputSpeed.z;
    }
    // Update speed with easing
    else {
      pos.speed.x += (pos.inputSpeed.x - pos.speed.x) / this.easingFactor;
      pos.speed.y += (pos.inputSpeed.y - pos.speed.y) / this.easingFactor;
      pos.speed.z += (pos.inputSpeed.z - pos.speed.z) / this.easingFactor;
    }
    // Update Position
    this.updatePosition();
  }
}

/**
 * Input handlers
 */
window.addEventListener("keydown", function(e) {
  // Prevent scroll on space and arrow keys
  if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
    e.preventDefault();
  }
  objects.forEach((object) => {
    // Handle input
    if (e.key === 'ArrowUp') {
      object.state.pos.inputSpeed.y = stepSize;
    }
    if (e.key === 'ArrowDown') {
      object.state.pos.inputSpeed.y = -stepSize;
    }
    if (e.key === 'ArrowLeft') {
      object.state.pos.inputSpeed.x = -stepSize;
    }
    if (e.key === 'ArrowRight') {
      object.state.pos.inputSpeed.x = stepSize;
    }
    if (e.key === ' ') {
      object.state.pos.inputSpeed.x = 0;
      object.state.pos.inputSpeed.y = 0;
    }
  });
}, false);
