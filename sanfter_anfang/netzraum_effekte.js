import * as THREE from './three.module.js';

export function pulse(mesh, farbe = 0xffff00, dauer = 600) {
  const original = mesh.material.emissive?.getHex() ?? 0x000000;
  if (mesh.material && mesh.material.emissive) {
    mesh.material.emissive.setHex(farbe);
    setTimeout(() => mesh.material.emissive.setHex(original), dauer);
  }
}

export function leuchte(mesh, farbe = 0xff00ff, intensitaet = 1.5, dauer = 1000) {
  const original = mesh.material.emissiveIntensity ?? 1.0;
  if (mesh.material) {
    mesh.material.emissive?.setHex(farbe);
    mesh.material.emissiveIntensity = intensitaet;
    setTimeout(() => {
      mesh.material.emissiveIntensity = original;
    }, dauer);
  }
}

export function schwebe(mesh, amplitude = 2, frequenz = 0.002) {
  let t = 0;
  const startY = mesh.position.y;
  function animate() {
    requestAnimationFrame(animate);
    t += frequenz;
    mesh.position.y = startY + amplitude * Math.sin(t);
  }
  animate();
}

export function drehe(mesh, achse = 'y', geschwindigkeit = 0.005) {
  function rotate() {
    requestAnimationFrame(rotate);
    mesh.rotation[achse] += geschwindigkeit;
  }
  rotate();
}

