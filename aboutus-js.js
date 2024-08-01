let scene, camera, cameraCtrl, renderer;
let width = window.innerWidth,height = window.innerHeight,cx = width / 2,cy = height / 2;
let light1, light2, light3, light4;

let conf = {
  objectRadius: 2.5,
  objectDepth: 1,
  nx: Math.round(width / 20),
  ny: Math.round(height / 15),
  lookAtZ: 40 };


let meshes;
const lookAt = new THREE.Vector3(0, 0, conf.lookAtZ);

let mouseOver = false;
const mouse = new THREE.Vector2();
const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0).translate(new THREE.Vector3(0, 0, -conf.lookAtZ));
const mousePosition = new THREE.Vector3();
const raycaster = new THREE.Raycaster();

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.z = 75;
  cameraCtrl = new THREE.OrbitControls(camera);
  cameraCtrl.enableRotate = false;
  cameraCtrl.enableKeys = false;

  onWindowResize();
  window.addEventListener('resize', onWindowResize, false);

  initScene();

  document.addEventListener('click', initScene);
  document.addEventListener('mouseout', e => {mouseOver = false;});
  document.addEventListener('mousemove', e => {
    const v = new THREE.Vector3();
    camera.getWorldDirection(v);
    v.normalize();
    mousePlane.normal = v;

    mouseOver = true;
    mouse.x = e.clientX / width * 2 - 1;
    mouse.y = -(e.clientY / height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(mousePlane, mousePosition);
  });

  animate();
};

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  initLights();

  meshes = [];
  let mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.9 });
  let geo = polygonGeometry(6, 0, 0, conf.objectRadius, 0);;
  let mesh;
  const dx = Math.cos(Math.PI / 6) * conf.objectRadius * 2;
  const dy = conf.objectRadius * 1.5;
  for (let j = 0; j < conf.ny; j++) {
    for (let i = 0; i < conf.nx; i++) {
      mesh = new THREE.Mesh(geo, mat);
      mesh.position.x = (-conf.nx / 2 + i) * dx + j % 2 / 2 * dx;
      mesh.position.y = (-conf.ny / 2 + j) * dy;
      mesh.position.z = -200 - rnd(50);
      mesh.rotation.x = rnd(2 * Math.PI, true);
      mesh.rotation.y = rnd(2 * Math.PI, true);
      mesh.rotation.z = rnd(2 * Math.PI, true);
      let duration = 1 + rnd(2);
      mesh.tween1 = TweenMax.to(mesh.position, duration, { z: 0, ease: Power1.easeOut });
      mesh.tween2 = TweenMax.to(mesh.rotation, duration + 1.5, { x: 0, y: 0, z: 0, ease: Power1.easeOut });
      meshes.push(mesh);
      scene.add(mesh);
    }
  }
}

function initLights() {
  const r = 100;
  const lightIntensity = 0.2;
  const lightDistance = 300;

  scene.add(new THREE.AmbientLight(0xffffff));

  light1 = new THREE.PointLight(randomColor(), lightIntensity, lightDistance);
  light1.position.set(0, r, r);
  scene.add(light1);
  light2 = new THREE.PointLight(randomColor(), lightIntensity, lightDistance);
  light2.position.set(0, -r, r);
  scene.add(light2);
  light3 = new THREE.PointLight(randomColor(), lightIntensity, lightDistance);
  light3.position.set(r, 0, r);
  scene.add(light3);
  light4 = new THREE.PointLight(randomColor(), lightIntensity, lightDistance);
  light4.position.set(-r, 0, r);
  scene.add(light4);
}

function animate() {
  requestAnimationFrame(animate);

  cameraCtrl.update();

  const time = Date.now() * 0.001;
  const d = 100;
  light1.position.x = Math.sin(time * 0.1) * d;
  light1.position.y = Math.cos(time * 0.2) * d;
  light2.position.x = Math.cos(time * 0.3) * d;
  light2.position.y = Math.sin(time * 0.4) * d;
  light3.position.x = Math.sin(time * 0.5) * d;
  light3.position.y = Math.sin(time * 0.6) * d;
  light4.position.x = Math.sin(time * 0.7) * d;
  light4.position.y = Math.cos(time * 0.8) * d;

  const lookAt = mouseOver ? mousePosition : new THREE.Vector3(0, 0, 10000);
  if (mouseOver) {
    lookAt.x = mousePosition.x;
    lookAt.y = mousePosition.y;
    lookAt.z = conf.lookAtZ;
  }

  for (let i = 0; i < meshes.length; i++) {
    if (!meshes[i].tween1.isActive() && !meshes[i].tween2.isActive())
    meshes[i].lookAt(lookAt);
  }

  renderer.render(scene, camera);
};

function polygonGeometry(n, x, y, s, r) {
  let points = ppoints(n, x, y, s, r);
  let shape = new THREE.Shape();
  points.forEach((p, i) => {
    if (i === 0) shape.moveTo(p[0], p[1]);else
    shape.lineTo(p[0], p[1]);
  });
  shape.lineTo(points[0][0], points[0][1]);

  let extrudeSettings = { steps: 1, depth: conf.objectDepth, bevelEnabled: false };
  let geometry = new THREE.ExtrudeBufferGeometry(shape, extrudeSettings);
  geometry.translate(0, 0, -conf.objectDepth / 2);
  return geometry;
}

function ppoints(n, x, y, s, r) {
  const dt = 2 * Math.PI / n;
  let points = [],t,px,py;
  for (let i = 0; i < n; i++) {
    t = Math.PI / 2 + r + i * dt;
    px = x + Math.cos(t) * s;
    py = y + Math.sin(t) * s;
    points.push([px, py]);
  }
  return points;
}

function onWindowResize() {
  width = window.innerWidth;cx = width / 2;
  height = window.innerHeight;cy = height / 2;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function rnd(max, negative) {
  return negative ? Math.random() * 2 * max - max : Math.random() * max;
}

init();