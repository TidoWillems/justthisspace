import * as THREE from './three.module.js';

export function addPortale(scene, camera) {
  const portale = new THREE.Group();

  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(10, 0.8, 32, 64),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x3366ff,
      metalness: 0.6,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7
    })
  );

  ring1.position.set(60, 0, -40);
  ring1.rotation.x = Math.PI / 2;
  portale.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(10, 0.8, 32, 64),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xcc4488,
      metalness: 0.6,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7
    })
  );

  ring2.position.set(-50, 20, 50);
  ring2.rotation.z = Math.PI / 4;
  portale.add(ring2);

  let t = 0;
  function animatePortal() {
    requestAnimationFrame(animatePortal);
    t += 0.01;
    ring1.rotation.z += 0.002;
    ring2.rotation.y += 0.003;

    const s1 = 1 + 0.05 * Math.sin(t);
    const s2 = 1 + 0.04 * Math.cos(t * 1.3);
    ring1.scale.set(s1, s1, s1);
    ring2.scale.set(s2, s2, s2);
  }
  animatePortal();

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  window.addEventListener('pointermove', e => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('click', () => {
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects([ring1, ring2]);
    if (intersects.length > 0) {
      const ring = intersects[0].object;
      ring.material.emissive.setHex(0xffcc00);
      debug("Portal aktiviert – sende Impuls an Kristall & Fäden");
      window.dispatchEvent(new Event('netzraum-impuls'));
      setTimeout(() => ring.material.emissive.setHex(ring === ring1 ? 0x3366ff : 0xcc4488), 600);
    }
  });

  scene.add(portale);
}

