const body = document.getElementsByTagName("body")[0];
const info = document.getElementById("info");
body.style.margin = "0px";

// Configurations
const config = {
  // Colors
  colors: {
    bg: '#D84480',
    primary: '#3D6EA4',
    secondary: '#FCDC50'
  },
  camera: {
    fov: 75,
    nearClip: 0.1,
    farClip: 1000
  }
}

const objects = [];
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  config.camera.fov,
  window.innerWidth / window.innerHeight,
  config.camera.nearClip,
  config.camera.farClip
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add first cube
var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
var material = new THREE.MeshPhongMaterial({
  color: config.colors.primary
});
var cube1 = new THREE.Mesh(geometry, material);
cube1.state = new ObjectState(0, 1, 0, true, 50);
cube1.position.set(cube1.state.pos.x, cube1.state.pos.y, cube1.state.pos.z);
scene.add(cube1);
objects.push(cube1);
// Add second cube
geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
material = new THREE.MeshPhongMaterial({
  color: config.colors.secondary
});
var cube2 = new THREE.Mesh(geometry, material);
cube2.state = new ObjectState(0, -1, 0, false, 0);
cube2.position.set(cube2.state.pos.x, cube2.state.pos.y, cube2.state.pos.z);
scene.add(cube2);
objects.push(cube2);
var light = new THREE.PointLight(0xfafafa, 1, 1000);
var ambient = new THREE.AmbientLight(0xFFFFFF);
scene.add(ambient);
light.position.set(0, 50, 50);
scene.add(light);
camera.position.z = 5;
console.log(scene);
// Animation loop
function animate() {
  requestAnimationFrame(animate);
  objects.forEach((object) => {
    // Update the position
    object.state.update();
    // Set position
    object.position.set(
      object.state.pos.x,
      object.state.pos.y,
      object.state.pos.z
    );
    // Update animation sprite
    object.rotation.x += 0.05;
    object.rotation.y += 0.05;
    object.rotation.z += 0.05;
  })
  // update html
  console.log(cube1.state.easing);
  info.innerHTML = '<span class="label">Ease: </span><span class="values">' + cube1.state.easingFactor +
    '</span><span class="label">, Speed: <span class="values">(' +
    (cube1.state.pos.speed.x * 100).toFixed(2) + ', ' + (cube1.state.pos.speed.y * 100).toFixed(2) +
    '),' + '</span></span><br/><span class="label">Ease: </span><span class="values">' + cube2.state.easingFactor +
    '</span><span class="label">, Speed: <span class="values">(' +
    (cube2.state.pos.speed.x * 100).toFixed(2) + ', ' + (cube2.state.pos.speed.y * 100).toFixed(2) + ')';
  renderer.render(scene, camera);
}
animate();
// Rescale on window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
