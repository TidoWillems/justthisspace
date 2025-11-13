import * as THREE from './three.module.js';
import { setForm } from './netzraum_faeden.js';

let raycaster, pointer, camera, scene;
const buttons = [];

export function addTerminal(_scene, _camera) {
  scene = _scene;
  camera = _camera;

  // Terminalfläche
  const planeGeo = new THREE.PlaneGeometry(50, 30);
  const planeMat = new THREE.MeshBasicMaterial({
    color: 0x00ffcc,
    transparent: true,
    opacity: 0.07,
    side: THREE.DoubleSide
  });
  const panel = new THREE.Mesh(planeGeo, planeMat);
  panel.position.set(60, 25, 0);
  panel.rotation.y = -0.4;
  scene.add(panel);

  // Button-Labels
  const labels = [
    { text: '●', form: 'sphere', offset: [-15, 8] },
    { text: '⟲', form: 'spirale', offset: [-5, 8] },
    { text: '◎', form: 'torus', offset: [5, 8] },
    { text: '☁️', form: 'random', offset: [15, 8] }
  ];

  labels.forEach(({ text, form, offset }) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#00ffcc';
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 64, 32);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(10, 5, 1);
    sprite.position.set(panel.position.x + offset[0], panel.position.y + offset[1], panel.position.z + 0.5);
    sprite.userData.form = form;
    scene.add(sprite);
    buttons.push(sprite);
  });

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  window.addEventListener('click', onClick);
}

function onClick(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(buttons);
  if (intersects.length > 0) {
    const hit = intersects[0].object;
    const form = hit.userData.form;
    if (form) {
      setForm(form);
    }
  }
}

