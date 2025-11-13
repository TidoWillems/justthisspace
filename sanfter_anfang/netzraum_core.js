import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';

export function setupScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(50, 30, 150);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;

  const pointLight    = new THREE.PointLight(0xffffff, 1.5);
  const ambientLight  = new THREE.AmbientLight(0x404040, 1.0);
  const directional   = new THREE.DirectionalLight(0xffffff, 0.5);
  pointLight.position.set(50, 50, 150);
  directional.position.set(1, 1, 1);
  scene.add(pointLight, ambientLight, directional);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer };
}
