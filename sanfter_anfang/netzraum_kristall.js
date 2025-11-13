import * as THREE from './three.module.js';

let kristall;

export function addKristall(scene) {
  kristall = new THREE.Mesh(
    new THREE.SphereGeometry(8, 64, 64),
    new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      transmission: 1.0,
      roughness: 0.05,
      metalness: 0.0,
      thickness: 3.5,
      clearcoat: 1.0,
      reflectivity: 0.8,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 1
    })
  );

  kristall.position.set(0, 0, 0);
  scene.add(kristall);

  let t = 0;
  function animateKristall() {
    requestAnimationFrame(animateKristall);
    t += 0.01;
    const s = 1 + 0.03 * Math.sin(t);
    kristall.scale.set(s, s, s);
  }
  animateKristall();

  window.addEventListener('netzraum-impuls', pulse);
  return kristall;
}

function pulse() {
  kristall.material.emissive.setHex(0x88ccff);
  setTimeout(() => kristall.material.emissive.setHex(0x000000), 600);
}

