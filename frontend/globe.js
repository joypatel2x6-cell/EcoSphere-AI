// EcoSphere AI - 3D Earth Globe Visualizer (Three.js)

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  // Scene Setup
  const scene = new THREE.Scene();
  
  // Camera Setup
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 250;

  // Renderer Setup
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true // Transparent background to blend with page gradients
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Handle Resize
  window.addEventListener('resize', () => {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight || 500;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const dirLight1 = new THREE.DirectionalLight(0x10b981, 1.2); // Green light
  dirLight1.position.set(100, 100, 100);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0x3b82f6, 1.2); // Blue light
  dirLight2.position.set(-100, -100, 100);
  scene.add(dirLight2);

  // Procedural Earth Texture (High-Tech Dot Matrix World Map)
  function createEarthTexture() {
    const texCanvas = document.createElement('canvas');
    texCanvas.width = 2048;
    texCanvas.height = 1024;
    const ctx = texCanvas.getContext('2d');

    // Base background
    ctx.fillStyle = '#030712'; // Matches dark theme background
    ctx.fillRect(0, 0, texCanvas.width, texCanvas.height);

    // Grid lines (latitudes/longitudes)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < texCanvas.width; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, texCanvas.height);
      ctx.stroke();
    }
    for (let j = 0; j < texCanvas.height; j += 64) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(texCanvas.width, j);
      ctx.stroke();
    }

    // Helper to verify if coordinate falls in approximate continent blobs
    function inContinent(x, y) {
      // Map x (0-2048) to (0-360 deg) and y (0-1024) to (0-180 deg)
      // Normalize values for continent checks
      const checkDistance = (cx, cy, r) => {
        const dx = x - cx;
        const dy = y - cy;
        return (dx * dx) + (dy * dy) < r * r;
      };

      // North America
      if (checkDistance(560, 320, 240) || checkDistance(400, 260, 150)) return true;
      // South America
      if (checkDistance(700, 720, 180) || checkDistance(760, 560, 150)) return true;
      // Greenland
      if (checkDistance(880, 140, 110)) return true;
      // Africa
      if (checkDistance(1100, 640, 180) || checkDistance(1140, 540, 160)) return true;
      // Europe / Asia
      if (checkDistance(1300, 300, 320) || checkDistance(1560, 340, 260) || checkDistance(1200, 200, 140)) return true;
      // Australia
      if (checkDistance(1680, 720, 130)) return true;

      return false;
    }

    // Draw dot-matrix lands
    ctx.fillStyle = '#10b981'; // Green land dots
    const dotSpacing = 8;
    const dotRadius = 2.2;
    for (let x = 0; x < texCanvas.width; x += dotSpacing) {
      for (let y = 0; y < texCanvas.height; y += dotSpacing) {
        if (inContinent(x, y)) {
          // Add slight color variance for organic tech look
          ctx.fillStyle = Math.random() > 0.85 ? '#3b82f6' : '#10b981';
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    return new THREE.CanvasTexture(texCanvas);
  }

  // Create Globe Group to hold layers
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // Inner Globe
  const earthGeo = new THREE.SphereGeometry(70, 64, 64);
  const earthTexture = createEarthTexture();
  const earthMat = new THREE.MeshPhongMaterial({
    map: earthTexture,
    bumpScale: 0.15,
    specular: new THREE.Color('#10b981'),
    shininess: 10
  });
  const earthMesh = new THREE.Mesh(earthGeo, earthMat);
  globeGroup.add(earthMesh);

  // Holographic Outlines / Latitude Longitude Lines
  const gridGeo = new THREE.SphereGeometry(70.5, 24, 24);
  const gridMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    wireframe: true,
    transparent: true,
    opacity: 0.12
  });
  const gridMesh = new THREE.Mesh(gridGeo, gridMat);
  globeGroup.add(gridMesh);

  // Custom Atmosphere Glow Shader
  const vertexShader = `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    varying vec3 vNormal;
    void main() {
      // Glow intensity highest at the edge, fades out inwards
      float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
      gl_FragColor = vec4(0.062, 0.725, 0.505, 1.0) * intensity;
    }
  `;

  const glowMat = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide, // Glow on the outer boundary
    transparent: true
  });

  const glowGeo = new THREE.SphereGeometry(76, 64, 64);
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  scene.add(glowMesh);

  // Floating Particles & Orbiting Leaves System
  const particleCount = 180;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorGreen = new THREE.Color(0x10b981);
  const colorBlue = new THREE.Color(0x3b82f6);

  for (let i = 0; i < particleCount; i++) {
    // Generate spherical coordinates just outside the globe (r = 80 to 110)
    const radius = 80 + Math.random() * 30;
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Alternate colors to represent leaves (green) and data (blue)
    const chosenColor = Math.random() > 0.4 ? colorGreen : colorBlue;
    colors[i * 3] = chosenColor.r;
    colors[i * 3 + 1] = chosenColor.g;
    colors[i * 3 + 2] = chosenColor.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Small square particles simulating green/blue nodes and floating leaves
  const particleMat = new THREE.PointsMaterial({
    size: 2.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // Mouse Grab and Spin Interactivity Controls
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let rotationVelocity = { x: 0.002, y: 0.003 }; // Initial drift velocities

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    };

    // Update group rotations based on mouse drag offsets
    globeGroup.rotation.y += deltaMove.x * 0.005;
    globeGroup.rotation.x += deltaMove.y * 0.005;

    // Track dynamic drag velocity for smooth inertia releases
    rotationVelocity = {
      x: deltaMove.y * 0.001,
      y: deltaMove.x * 0.001
    };

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch Interactivity Support
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });

  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;

    const deltaMove = {
      x: e.touches[0].clientX - previousMousePosition.x,
      y: e.touches[0].clientY - previousMousePosition.y
    };

    globeGroup.rotation.y += deltaMove.x * 0.005;
    globeGroup.rotation.x += deltaMove.y * 0.005;

    rotationVelocity = {
      x: deltaMove.y * 0.001,
      y: deltaMove.x * 0.001
    };

    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  });

  canvas.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Animation / Render Loop
  const animate = () => {
    requestAnimationFrame(animate);

    // Apply rotation drift or dragging inertia deceleration
    if (!isDragging) {
      globeGroup.rotation.y += rotationVelocity.y;
      globeGroup.rotation.x += rotationVelocity.x;

      // Gradually damp down to a base slow rotation drift
      rotationVelocity.y += (0.0015 - rotationVelocity.y) * 0.05;
      rotationVelocity.x += (0.0005 - rotationVelocity.x) * 0.05;
    }

    // Slowly rotate particle field in the opposite direction
    particleSystem.rotation.y -= 0.0008;
    particleSystem.rotation.x += 0.0002;

    renderer.render(scene, camera);
  };

  animate();
});
