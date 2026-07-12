// EcoSphere AI - Onboarding Auth Script (Three.js 3D Globe, Form Toggles, Micro Interactions)

'use strict';

let scene, camera, renderer, globe;
let particles = [];
const particleCount = 180;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Icons
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // 2. Initialize Three.js 3D Globe Visuals
  initThreeGlobe();

  // 3. Initialize Card Parallax Tilt
  initCardTilt();

  // 4. Initialize Leaf Particles Background
  spawnLeaves();

  // 5. Initialize Theme Sync
  initThemeSync();
});

// ── 1. Three.js 3D Globe Setup ──────────────────────────────────────────
function initThreeGlobe() {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 240;

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambient);

  const mainLight = new THREE.DirectionalLight(0x10b981, 1.5); // Glowing Green
  mainLight.position.set(150, 100, 100);
  scene.add(mainLight);

  const backLight = new THREE.DirectionalLight(0x38bdf8, 1.2); // Glowing Soft Blue
  backLight.position.set(-150, -100, 100);
  scene.add(backLight);

  // Globe Mesh Setup (Wireframe for Sci-Fi High Tech look)
  const geom = new THREE.SphereGeometry(72, 38, 38);
  const mat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    wireframe: true,
    transparent: true,
    opacity: 0.16
  });
  globe = new THREE.Mesh(geom, mat);
  scene.add(globe);

  // Add a glowing core sphere inside
  const coreGeom = new THREE.SphereGeometry(68, 32, 32);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x064e3b,
    transparent: true,
    opacity: 0.25
  });
  const core = new THREE.Mesh(coreGeom, coreMat);
  globe.add(core);

  // Hologram ESG Orbiting Particles
  const partGeom = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const particleSpeeds = [];

  for (let i = 0; i < particleCount; i++) {
    // Distribute randomly in a spherical shell around the globe
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 85 + Math.random() * 25; // Orbit height

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    particleSpeeds.push({
      thetaSpeed: (Math.random() - 0.5) * 0.006,
      phiSpeed: (Math.random() - 0.5) * 0.006,
      r: r,
      theta: theta,
      phi: phi
    });
  }

  partGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const partMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 2.2,
    transparent: true,
    opacity: 0.8
  });

  const starPoints = new THREE.Points(partGeom, partMat);
  scene.add(starPoints);

  // Mouse Interaction drag support
  let isDragging = false;
  let prevMouseX = 0;
  let prevMouseY = 0;

  canvas.addEventListener('mousedown', (e) => { isDragging = true; prevMouseX = e.clientX; prevMouseY = e.clientY; });
  window.addEventListener('mouseup', () => { isDragging = false; });
  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;
    globe.rotation.y += deltaX * 0.005;
    globe.rotation.x += deltaY * 0.005;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  });

  // Render Loop
  function animate() {
    requestAnimationFrame(animate);

    // Auto rotate globe
    if (!isDragging) {
      globe.rotation.y += 0.002;
      globe.rotation.x += 0.0006;
    }

    // Move orbiting stars
    const posAttr = starPoints.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
      const speed = particleSpeeds[i];
      speed.theta += speed.thetaSpeed;
      speed.phi += speed.phiSpeed;

      const x = speed.r * Math.sin(speed.phi) * Math.cos(speed.theta);
      const y = speed.r * Math.sin(speed.phi) * Math.sin(speed.theta);
      const z = speed.r * Math.cos(speed.phi);

      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();

  // Handle Resize
  window.addEventListener('resize', () => {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight || 440;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

// ── 2. Card Parallax Tilt Effect ─────────────────────────────────────────
function initCardTilt() {
  const card = document.getElementById('auth-card');
  if (!card) return;

  const wrapper = document.querySelector('.auth-card-side');
  wrapper.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Modulate tilt coordinates
    const tiltX = (y / (rect.height / 2)) * -6; // Max 6deg
    const tiltY = (x / (rect.width / 2)) * 6;

    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-2px)`;
  });

  wrapper.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
  });
}

// ── 3. Spawn Floating Leaves Particles ──────────────────────────────
function spawnLeaves() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  const count = 15;
  for (let i = 0; i < count; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'leaf-particle';
    leaf.style.left = `${Math.random() * 100}%`;
    leaf.style.animationDelay = `${Math.random() * 10}s`;
    leaf.style.animationDuration = `${10 + Math.random() * 8}s`;
    leaf.style.transform = `scale(${0.5 + Math.random() * 0.7})`;
    container.appendChild(leaf);
  }
}

// ── 4. Forms Switch Controllers ──────────────────────────────────────────
function toggleAuthPanel(type) {
  const login = document.getElementById('login-panel');
  const signup = document.getElementById('signup-panel');
  if (!login || !signup) return;

  if (type === 'signup') {
    login.classList.remove('active');
    signup.classList.add('active');
  } else {
    signup.classList.remove('active');
    login.classList.add('active');
  }
}

function togglePasswordVisibility(fieldId) {
  const input = document.getElementById(fieldId);
  if (!input) return;

  const wrapper = input.parentElement;
  const openEye = wrapper.querySelector('.eye-open');
  const closedEye = wrapper.querySelector('.eye-closed');

  if (input.type === 'password') {
    input.type = 'text';
    if (openEye) openEye.style.display = 'none';
    if (closedEye) closedEye.style.display = 'block';
  } else {
    input.type = 'password';
    if (openEye) openEye.style.display = 'block';
    if (closedEye) closedEye.style.display = 'none';
  }
}

// ── 5. Real-Time Validations ─────────────────────────────────────────────
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validateEmailField(input) {
  const wrapper = input.parentElement;
  if (input.value === '') {
    wrapper.className = 'input-wrapper';
    return;
  }

  if (validateEmail(input.value)) {
    wrapper.className = 'input-wrapper validated-success';
  } else {
    wrapper.className = 'input-wrapper validated-error';
  }
}

function checkPasswordStrength(val) {
  const fill = document.getElementById('strength-fill');
  const label = document.getElementById('strength-label');
  if (!fill || !label) return;

  if (val.length === 0) {
    fill.style.width = '0%';
    label.innerText = 'Too weak';
    label.style.color = 'var(--text-muted)';
    return;
  }

  let score = 0;
  if (val.length >= 6) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const widths = ['20%', '45%', '75%', '100%'];
  const labels = ['Weak 🔴', 'Moderate 🟡', 'Good 🟢', 'Strong 🔥'];
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#10b981'];

  const idx = Math.min(score, 3);
  fill.style.width = widths[idx];
  fill.style.backgroundColor = colors[idx];
  label.innerText = labels[idx];
  label.style.color = colors[idx];
}

function validatePasswordMatch() {
  const pwd = document.getElementById('signup-password');
  const confirm = document.getElementById('signup-confirm-password');
  if (!pwd || !confirm) return;

  const wrapper = confirm.parentElement;
  if (confirm.value === '') {
    wrapper.className = 'input-wrapper';
    return;
  }

  if (pwd.value === confirm.value) {
    wrapper.className = 'input-wrapper validated-success';
  } else {
    wrapper.className = 'input-wrapper validated-error';
  }
}

// ── 6. Form Submission Operations ────────────────────────────────────────
function handleLoginSubmit(event) {
  event.preventDefault();
  const btn = event.target.querySelector('.auth-submit-btn');
  const text = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.loading-spinner-wrap');

  if (text && spinner) {
    text.style.display = 'none';
    spinner.style.display = 'flex';
  }
  btn.disabled = true;

  // Simulate loading, then transition
  setTimeout(() => {
    const overlay = document.getElementById('success-overlay');
    const title = document.getElementById('success-title');
    const msg = document.getElementById('success-msg');
    
    if (overlay && title && msg) {
      title.innerText = "Welcome back CSO!";
      msg.innerText = "Accessing corporate sustainability registries...";
      overlay.classList.add('active');
    }

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1800);
  }, 1600);
}

function handleSignupSubmit(event) {
  event.preventDefault();
  const pwd = document.getElementById('signup-password');
  const confirm = document.getElementById('signup-confirm-password');

  if (pwd && confirm && pwd.value !== confirm.value) {
    showAuthToast('❌ Passwords do not match. Please verify.', '#ef4444');
    return;
  }

  const btn = event.target.querySelector('.auth-submit-btn');
  const text = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.loading-spinner-wrap');

  if (text && spinner) {
    text.style.display = 'none';
    spinner.style.display = 'flex';
  }
  btn.disabled = true;

  // Simulate account provisioning
  setTimeout(() => {
    const overlay = document.getElementById('success-overlay');
    const title = document.getElementById('success-title');
    const msg = document.getElementById('success-msg');
    
    if (overlay && title && msg) {
      title.innerText = "Enterprise Ready!";
      msg.innerText = "EcoSphere workspace configured successfully.";
      overlay.classList.add('active');
    }

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1800);
  }, 2000);
}

// Mock Social logins
function handleSocialAuth(provider) {
  showAuthToast(`🔄 Handshaking authentication with ${provider}...`, '#3b82f6');
  setTimeout(() => {
    const overlay = document.getElementById('success-overlay');
    const title = document.getElementById('success-title');
    const msg = document.getElementById('success-msg');
    if (overlay && title && msg) {
      title.innerText = `${provider} Authorized`;
      msg.innerText = "Redirecting to your sustainability space...";
      overlay.classList.add('active');
    }
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
  }, 1200);
}

function triggerForgotPassword() {
  const email = document.getElementById('login-email')?.value;
  if (!email || !validateEmail(email)) {
    showAuthToast('⚠️ Enter a valid email first to receive reset code.', '#eab308');
    return;
  }
  showAuthToast(`📨 Reset link dispatched to ${email}!`, '#10b981');
}

// ── 7. Theme Sync ────────────────────────────────────────────────────────
function initThemeSync() {
  const btn = document.getElementById('theme-toggle');
  const html = document.documentElement;

  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') html.classList.add('light');

  if (btn) {
    btn.addEventListener('click', () => {
      html.classList.toggle('light');
      localStorage.setItem('theme', html.classList.contains('light') ? 'light' : 'dark');
    });
  }
}

// ── 8. Language Translate Toggle ──────────────────────────────────────────
const TRANSLATIONS = {
  es: {
    "Home": "Inicio",
    "Features": "Funciones",
    "About": "Sobre nosotros",
    "Contact": "Contacto",
    "Why EcoSphere AI?": "¿Por qué EcoSphere AI?",
    "AI-Powered ESG Analytics": "Análisis ESG con IA",
    "Predict compliance pathways and generate carbon forecasting models instantly.": "Prediga rutas de cumplimiento y genere modelos de emisiones al instante.",
    "Carbon Footprint Tracking": "Seguimiento de huella de carbono",
    "Automate Scope 1, 2, and 3 calculations across all operational ledgers.": "Automatice cálculos de Alcance 1, 2 y 3 en todos los registros operativos.",
    "Compliance Management": "Gestión de cumplimiento",
    "Audit workflows and board approvals matched to SEC and CSRD regulations.": "Flujos de auditoría y aprobaciones alineados con regulaciones de la SEC y CSRD.",
    "Employee Gamification": "Gamificación de empleados",
    "Level up teams, earn XP badges, and redeem sustainability reward vouchers.": "Suba de nivel, gane medallas de XP y canjee vales de recompensas ecológicas.",
    "Welcome Back 👋": "Bienvenido de vuelta 👋",
    "Login to continue your sustainability journey.": "Inicie sesión para continuar su viaje de sostenibilidad.",
    "Email Address": "Dirección de correo",
    "Password": "Contraseña",
    "Forgot Password?": "¿Olvidó su contraseña?",
    "Remember Me": "Recordarme",
    "Login": "Iniciar Sesión",
    "or continue with": "o continuar con",
    "Don't have an account?": "¿No tiene una cuenta?",
    "Sign Up": "Registrarse",
    "Join EcoSphere AI": "Únase a EcoSphere AI",
    "Build a sustainable future with AI.": "Construya un futuro sostenible con inteligencia artificial.",
    "Full Name": "Nombre completo",
    "Company Name": "Nombre de la empresa",
    "Phone Number": "Teléfono",
    "Too weak": "Muy débil",
    "Confirm Password": "Confirmar contraseña",
    "I agree to the": "Acepto los",
    "Terms & Privacy Policy": "Términos y Política de Privacidad",
    "Create Account": "Crear Cuenta",
    "or signup with": "o registrarse con",
    "Already have an account?": "¿Ya tiene una cuenta?"
  },
  en: {
    // Will fallback to innerHTML defaults
  }
};

function toggleLanguage(lang) {
  const trans = TRANSLATIONS[lang];
  document.querySelectorAll('[data-lang-en]').forEach(el => {
    const key = el.getAttribute('data-lang-en');
    if (trans && trans[key]) {
      el.textContent = trans[key];
    } else {
      el.textContent = key;
    }
  });
}

// ── 9. Toast System ──────────────────────────────────────────────────────
function showAuthToast(message, color = '#10b981') {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.style.borderLeft = `3px solid ${color}`;
  toast.innerHTML = `
    <div class="toast-icon" style="background:${color}11; color:${color};">
      <i data-lucide="info" style="width:14px; height:14px;"></i>
    </div>
    <span>${message}</span>
  `;
  stack.appendChild(toast);
  if (typeof lucide !== 'undefined') lucide.createIcons();

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}
