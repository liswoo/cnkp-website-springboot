(() => {
  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mount = document.getElementById('hero-animation');

  if (!mount || typeof THREE === 'undefined' || prefersReducedMotion) {
    return;
  }

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(32, mount.clientWidth / mount.clientHeight, 0.1, 40);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.shadowMap.enabled = false;
  mount.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xf0f7ff, 0.8);
  const keyLight = new THREE.PointLight(0x5bb8ff, 1.2, 20);
  keyLight.position.set(3, 4, 5);
  const fillLight = new THREE.PointLight(0x22ffe2, 0.8, 20);
  fillLight.position.set(-4, -3, 3);
  scene.add(ambient, keyLight, fillLight);

  const group = new THREE.Group();
  scene.add(group);

  const nodeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
  const nodeMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f6bff,
    emissive: 0x123e9b,
    metalness: 0.3,
    roughness: 0.4
  });

  const nodes = [];
  for (let i = 0; i < 26; i++) {
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;
    const radius = 1.6 + Math.random() * 0.4;
    const position = new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.copy(position);
    group.add(node);
    nodes.push(position);
  }

  const linkMaterial = new THREE.LineBasicMaterial({
    color: 0x7ab8ff,
    transparent: true,
    opacity: 0.35
  });
  const linkGeometry = new THREE.BufferGeometry();
  const linkVertices = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() < 0.12) {
        linkVertices.push(nodes[i].x, nodes[i].y, nodes[i].z);
        linkVertices.push(nodes[j].x, nodes[j].y, nodes[j].z);
      }
    }
  }
  linkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linkVertices, 3));
  const links = new THREE.LineSegments(linkGeometry, linkMaterial);
  group.add(links);

  const pulses = [];
  const pulseGeometry = new THREE.SphereGeometry(0.06, 12, 12);
  const pulseMaterial = new THREE.MeshBasicMaterial({
    color: 0xff7f50,
    transparent: true,
    opacity: 0.95
  });

  const createPulse = () => {
    const start = nodes[Math.floor(Math.random() * nodes.length)];
    const end = nodes[Math.floor(Math.random() * nodes.length)];
    if (start === end) return createPulse();
    const mesh = new THREE.Mesh(pulseGeometry, pulseMaterial.clone());
    mesh.material.color.setHSL(Math.random() * 0.15 + 0.03, 0.8, 0.6);
    mesh.userData = {
      start,
      end,
      progress: Math.random(),
      speed: 0.004 + Math.random() * 0.003
    };
    group.add(mesh);
    pulses.push(mesh);
  };

  for (let i = 0; i < 10; i++) {
    createPulse();
  }

  const ribbonGeometry = new THREE.TorusGeometry(2.35, 0.01, 16, 220);
  const ribbonMaterial = new THREE.MeshBasicMaterial({
    color: 0x1fade4,
    transparent: true,
    opacity: 0.15
  });
  const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
  ribbon.rotation.x = Math.PI / 2;
  scene.add(ribbon);

  const particleCount = 800;
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    const r = 3.5 + Math.random() * 1.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    sizes[i] = Math.random();
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x9ec5ff,
    size: 0.03,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    group.rotation.y += 0.0015;
    group.rotation.x = Math.sin(elapsed * 0.2) * 0.05;

    pulses.forEach((pulse) => {
      pulse.userData.progress += pulse.userData.speed;
      if (pulse.userData.progress >= 1) {
        pulse.userData.progress = 0;
        pulse.userData.start = nodes[Math.floor(Math.random() * nodes.length)];
        pulse.userData.end = nodes[Math.floor(Math.random() * nodes.length)];
      }
      pulse.position.lerpVectors(pulse.userData.start, pulse.userData.end, pulse.userData.progress);
      pulse.scale.setScalar(1 + Math.sin(pulse.userData.progress * Math.PI) * 0.4);
    });

    ribbon.rotation.z += 0.0008;
    particles.rotation.y += 0.0005;

    renderer.render(scene, camera);
  }
  animate();

  const onResize = () => {
    const { clientWidth, clientHeight } = mount;
    renderer.setSize(clientWidth, clientHeight);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  };

  window.addEventListener('resize', onResize);
})();

