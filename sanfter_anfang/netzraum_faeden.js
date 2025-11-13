import * as THREE from './three.module.js';

let faeden;
let verbindungen = [];
let sceneRef;

export function addFaeden(scene) {
  sceneRef = scene;
  faeden = new THREE.Group();
  scene.add(faeden);
  window.addEventListener('netzraum-impuls', pulseFaeden);
  setForm("sphere");
}

export function setForm(mode = "sphere") {
  // Vorherige Fäden entfernen
  while (faeden.children.length) faeden.remove(faeden.children[0]);

  const points = [];
  const count = 100;

  if (mode === "sphere") {
    const radius = 70;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(-1 + (2 * i) / count);
      const theta = Math.sqrt(count * Math.PI) * phi;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      points.push(new THREE.Vector3(x, y, z));
    }
  } else {
    // Fallback: zufällige Punkte
    for (let i = 0; i < count; i++) {
      points.push(new THREE.Vector3(
        (Math.random() - 0.5) * 160,
        (Math.random() - 0.5) * 160,
        (Math.random() - 0.5) * 160
      ));
    }
  }

  const material = new THREE.LineBasicMaterial({ color: 0x4488ff, opacity: 0.4, transparent: true });

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i];
      const b = points[j];
      const dist = a.distanceTo(b);
      if (dist < 30) {
        const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
        const line = new THREE.Line(geo, material.clone());
        faeden.add(line);
        verbindungen.push(line);
      }
    }
  }
}

function pulseFaeden() {
  verbindungen.forEach(line => {
    if (line.material) {
      line.material.color.setHex(0xffcc88);
    }
  });
  setTimeout(() => {
    verbindungen.forEach(line => {
      if (line.material) {
        line.material.color.setHex(0x4488ff);
      }
    });
  }, 600);
}

