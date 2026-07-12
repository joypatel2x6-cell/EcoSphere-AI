// EcoSphere AI - Innovations & Simulation Lab Logic

let carbonForecastChart = null;
let trees = [];

// Base data for neural prediction
const baseEsg = 85.0;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Icons
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // 2. Initialize ECharts Carbon Forecast
  initCarbonForecastChart();

  // 3. Setup Interactive Sliders for ESG Predictor
  setupPredictorSliders();

  // 4. Setup Forest Plantation canvas
  initForestCanvas();

  // 5. Setup Interactive Particle Background
  initParticleBackground();

  // 6. Setup Offline Sync and PWA triggers
  setupPwaAndOffline();
});

// --- Theme Toggler Sync ---
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    const isLight = document.documentElement.classList.contains('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    setTimeout(initCarbonForecastChart, 100);
  });
}

// --- 1. ECharts Dynamic Carbon Emissions Forecast ---
function initCarbonForecastChart() {
  const dom = document.getElementById('dynamic-carbon-chart');
  if (!dom) return;

  if (carbonForecastChart) {
    carbonForecastChart.dispose();
  }

  carbonForecastChart = echarts.init(dom, null, { renderer: 'canvas' });

  const isLight = document.documentElement.classList.contains('light');
  const textColor = isLight ? '#4b5563' : '#9ca3af';
  const gridColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';

  // Initial Forecast curves
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Dynamic series based on slider offsets
  updateForecastChartData();
}

function updateForecastChartData() {
  if (!carbonForecastChart) return;

  const isLight = document.documentElement.classList.contains('light');
  const textColor = isLight ? '#4b5563' : '#9ca3af';
  const gridColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';

  // Calculate dynamic reductions from sliders
  const renewRatio = parseFloat(document.getElementById('slide-renew').value) / 100;
  const supplyRatio = parseFloat(document.getElementById('slide-supply').value) / 100;

  // Modulate Scope 1 & Scope 2 forecast points (August to December)
  const baseHistorical = [12000, 11800, 11500, 11200, 10800, 10500, 10200];
  const baseForecast = [
    10200, 
    Math.round(9800 * (1 - renewRatio * 0.15)), 
    Math.round(9400 * (1 - renewRatio * 0.22)), 
    Math.round(9000 * (1 - renewRatio * 0.28 - supplyRatio * 0.05)), 
    Math.round(8500 * (1 - renewRatio * 0.35 - supplyRatio * 0.08)), 
    Math.round(8000 * (1 - renewRatio * 0.40 - supplyRatio * 0.12))
  ];

  const historicalSeries = [...baseHistorical, null, null, null, null, null];
  const forecastSeries = [null, null, null, null, null, null, 10200, ...baseForecast.slice(1)];

  carbonForecastChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: isLight ? '#fff' : '#0f172a',
      borderColor: 'transparent',
      textStyle: { color: isLight ? '#0f172a' : '#f8fafc', fontSize: 11 }
    },
    grid: { left: '4%', right: '4%', bottom: '4%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      axisLabel: { color: textColor, fontSize: 10 },
      axisLine: { lineStyle: { color: gridColor } }
    },
    yAxis: {
      type: 'value',
      min: 4000,
      max: 13000,
      splitLine: { lineStyle: { color: gridColor } },
      axisLabel: { color: textColor, fontSize: 10 }
    },
    series: [
      {
        name: 'Historical Emissions',
        type: 'line',
        data: historicalSeries,
        smooth: true,
        itemStyle: { color: '#3b82f6' },
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(59, 130, 246, 0.15)' }, { offset: 1, color: 'rgba(59, 130, 246, 0)' }]
          }
        }
      },
      {
        name: 'AI Carbon Forecast',
        type: 'line',
        data: forecastSeries,
        smooth: true,
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 3, type: 'dashed' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(16, 185, 129, 0.15)' }, { offset: 1, color: 'rgba(16, 185, 129, 0)' }]
          }
        }
      }
    ]
  });
}

// --- 2. ESG Score Predictor ---
function setupPredictorSliders() {
  const sliders = [
    { id: 'slide-renew', labelId: 'slide-val-renew', suffix: '%' },
    { id: 'slide-supply', labelId: 'slide-val-supply', suffix: '%' },
    { id: 'slide-diversity', labelId: 'slide-val-diversity', suffix: '%' },
    { id: 'slide-social', labelId: 'slide-val-social', suffix: '%' }
  ];

  sliders.forEach(s => {
    const el = document.getElementById(s.id);
    if (!el) return;
    el.addEventListener('input', () => {
      document.getElementById(s.labelId).textContent = el.value + s.suffix;
      calculateProjectedScore();
      updateForecastChartData();
    });
  });
}

function calculateProjectedScore() {
  const renewVal = parseFloat(document.getElementById('slide-renew').value);
  const supplyVal = parseFloat(document.getElementById('slide-supply').value);
  const diversityVal = parseFloat(document.getElementById('slide-diversity').value);
  const socialVal = parseFloat(document.getElementById('slide-social').value);

  // Neural simulation equation (weighted impact)
  const calc = baseEsg + (renewVal * 0.075) + (supplyVal * 0.038) + (diversityVal * 0.022) + (socialVal * 0.18);
  const projectedScore = Math.min(99.9, Math.max(80.0, calc)).toFixed(1);

  const scoreEl = document.getElementById('projected-esg-score');
  if (scoreEl) {
    // Simple counter animation using GSAP
    gsap.to(scoreEl, {
      innerText: parseFloat(projectedScore),
      duration: 0.4,
      snap: { innerText: 0.1 },
      onUpdate: function () {
        scoreEl.innerText = parseFloat(scoreEl.innerText).toFixed(1);
      }
    });
  }
}

// --- 3. Sustainability Coach tips ---
const coachTips = [
  "Optimizing thermal load on manufacturing systems during peak utility grid rates (1 PM to 4 PM) will save approximately 14.5 tCO2e monthly and improve score parameters by 0.35 pts.",
  "Upgrading server warehouse air circulators to smart thermodynamic fans drops Scope 2 emissions by 8.4% and saves 1,200 kWh per module unit.",
  "Integrating micro-mobility rewards (bicycles, electric scooters) for urban employees is estimated to lift Eco League levels by 15% and cut Scope 3 commute overheads.",
  "Transitioning cardboard packaging metrics to compostable hemp wraps reduces waste-to-landfill indices by 22% with positive brand sentiments.",
  "Conducting supplier ESG reviews for logistics teams will increase transparency and protect supply chain audit indices from Governance flags."
];
let currentCoachIndex = 0;

function cycleCoachAdvice() {
  currentCoachIndex = (currentCoachIndex + 1) % coachTips.length;
  const targetText = coachTips[currentCoachIndex];
  const adviceEl = document.getElementById('coach-advice');
  if (adviceEl) {
    gsap.to(adviceEl, {
      opacity: 0,
      y: -5,
      duration: 0.2,
      onComplete: () => {
        adviceEl.textContent = targetText;
        gsap.to(adviceEl, { opacity: 1, y: 0, duration: 0.2 });
      }
    });
  }
}

function speakCoachAdvice() {
  const text = document.getElementById('coach-advice').textContent;
  if ('speechSynthesis' in window) {
    // Stop any speaking first
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Prefer a premium English voice
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
    if (premiumVoice) utterance.voice = premiumVoice;
    
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Speech synthesis not supported in this browser.");
  }
}

// --- 4. Waste Image Recognition Simulator ---
function simulateScan(type) {
  const dropzonePrompt = document.getElementById('dropzone-prompt');
  const scanningPrompt = document.getElementById('scanning-prompt');
  const resultsPanel = document.getElementById('scan-results');
  const laser = document.getElementById('scanner-laser');

  if (!dropzonePrompt || !scanningPrompt || !resultsPanel || !laser) return;

  // Toggle Loading states
  dropzonePrompt.style.display = 'none';
  scanningPrompt.style.display = 'block';
  resultsPanel.style.display = 'none';
  laser.style.display = 'block';

  // Scanning parameters
  const scanData = {
    bottle: {
      title: "PET Recyclable Polymer Container",
      confidence: "99% Confidence",
      desc: "PET 1 thermoplastic resin identified. Highly recyclable. Committing this block reduces manufacturing footprint and earns Green Coins.",
      coins: 15,
      co2: "0.18"
    },
    battery: {
      title: "Lithium-Ion Household Cell",
      confidence: "98% Confidence",
      desc: "Hazardous electronic waste classified. Must be directed to specialized battery recycling points to secure environmental indices.",
      coins: 25,
      co2: "0.45"
    },
    cardboard: {
      title: "Double-Wall Corrugated Container",
      confidence: "97% Confidence",
      desc: "Paperboard packaging material. Organic cellulose fibers detected. Recyclable in standard paper bins. Low carbon footprint.",
      coins: 10,
      co2: "0.11"
    }
  };

  const item = scanData[type];

  // Laser scanning animation
  gsap.fromTo(laser, { top: '0%' }, { top: '100%', duration: 1.2, repeat: 1, yoyo: true, ease: 'power1.inOut' });

  setTimeout(() => {
    scanningPrompt.style.display = 'none';
    dropzonePrompt.style.display = 'block';
    laser.style.display = 'none';

    // Populate Results
    document.getElementById('scan-title').textContent = item.title;
    document.getElementById('scan-confidence').textContent = item.confidence;
    document.getElementById('scan-desc').textContent = item.desc;
    resultsPanel.style.display = 'block';

    // Trigger Success Notification & Confetti!
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#06b6d4', '#eab308']
      });
    }
    
    // Alert Notification Toast
    showToast(`Vision Scan Succeeded: Detected ${item.title}! +${item.coins} Coins.`, 'success');
  }, 2200);
}

// --- 5. Virtual Offset Forest Canvas ---
function initForestCanvas() {
  const canvas = document.getElementById('forest-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  
  // Resize Canvas
  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    drawForest();
  }
  
  window.addEventListener('resize', resizeCanvas);
  
  // Pre-populate trees
  const initialCount = parseInt(document.getElementById('forest-tree-count').textContent) || 12;
  for (let i = 0; i < initialCount; i++) {
    spawnTreeData(canvas.width || 400, canvas.height || 250);
  }
  
  resizeCanvas();

  // Simple Loop to draw
  function loop() {
    drawForest();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

function spawnTreeData(width, height) {
  // Tree coordinates, size, type
  trees.push({
    x: 40 + Math.random() * (width - 80),
    y: (height || 250) - 20 - Math.random() * 30,
    size: 20 + Math.random() * 30,
    maxSize: 40 + Math.random() * 25,
    leafColor: Math.random() > 0.4 ? '#10b981' : '#059669',
    trunkColor: '#78350f',
    sway: Math.random() * Math.PI,
    growth: 1.0
  });
}

function drawForest() {
  const canvas = document.getElementById('forest-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Ground
  ctx.fillStyle = '#064e3b';
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, canvas.height, canvas.width / 2 + 100, 40, 0, 0, Math.PI * 2);
  ctx.fill();

  // Draw Trees
  trees.forEach(t => {
    // Grow slightly if not max size
    if (t.size < t.maxSize) {
      t.size += 0.08;
    }

    t.sway += 0.015;
    const swayOffset = Math.sin(t.sway) * 2;

    // Draw Trunk
    ctx.fillStyle = t.trunkColor;
    ctx.fillRect(t.x - 3, t.y - t.size, 6, t.size);

    // Draw Canopy
    ctx.fillStyle = t.leafColor;
    ctx.beginPath();
    ctx.arc(t.x + swayOffset, t.y - t.size, t.size / 2, 0, Math.PI * 2);
    ctx.arc(t.x - t.size / 4 + swayOffset, t.y - t.size - t.size / 4, t.size / 2.5, 0, Math.PI * 2);
    ctx.arc(t.x + t.size / 4 + swayOffset, t.y - t.size - t.size / 4, t.size / 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

function plantVirtualTree() {
  const countEl = document.getElementById('forest-tree-count');
  let currentCount = parseInt(countEl.textContent) || 0;
  currentCount++;
  countEl.textContent = currentCount;

  const canvas = document.getElementById('forest-canvas');
  // Spawn at bottom, small size, and grow
  trees.push({
    x: 40 + Math.random() * (canvas.width - 80),
    y: canvas.height - 20 - Math.random() * 20,
    size: 2,
    maxSize: 35 + Math.random() * 20,
    leafColor: '#10b981',
    trunkColor: '#78350f',
    sway: Math.random() * Math.PI,
    growth: 0.1
  });

  // Confetti burst on tree planting
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#10b981', '#059669']
    });
  }

  showToast("New carbon-offset sapling planted! +10 Green Coins.", "success");
}

function waterVirtualForest() {
  // Trigger rain effect
  showToast("Irrigating virtual carbon sink... Accelerating sapling growth.", "info");
  
  // Rain particles on trees
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 50,
      spread: 80,
      origin: { y: 0.1 },
      colors: ['#3b82f6', '#60a5fa']
    });
  }
}

// --- 6. Interactive Particle Background ---
function initParticleBackground() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const dots = [];
  const dotsCount = 60;

  for (let i = 0; i < dotsCount; i++) {
    dots.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: 0.2 + Math.random() * 0.5
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    dots.forEach(d => {
      d.x += d.vx;
      d.y += d.vy;

      if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
      if (d.y < 0 || d.y > canvas.height) d.vy *= -1;

      ctx.fillStyle = `rgba(16, 185, 129, ${d.alpha})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// --- 7. PWA and Offline Support ---
function setupPwaAndOffline() {
  // Sync offline status banner
  function updateOnlineStatus() {
    const banner = document.getElementById('offline-banner');
    const statusText = document.getElementById('conn-status-text');
    if (navigator.onLine) {
      banner.classList.remove('active');
      if (statusText) statusText.textContent = "Online Mode";
    } else {
      banner.classList.add('active');
      if (statusText) statusText.textContent = "Offline Mode";
      showToast("Connection lost. Operating in secure offline mode.", "warning");
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // PWA Install Prompt Toggler
  let deferredPrompt;
  const pwaBtn = document.getElementById('pwa-install-btn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (pwaBtn) pwaBtn.style.display = 'inline-flex';
  });

  if (pwaBtn) {
    pwaBtn.addEventListener('click', () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
          pwaBtn.style.display = 'none';
        }
        deferredPrompt = null;
      });
    });
  }

  // Register Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('EcoSphere SW registered successfully:', reg.scope);
    }).catch((err) => {
      console.log('EcoSphere SW registration failed:', err);
    });
  }
}

// Mock Connection Toggle
function toggleMockConnection() {
  const banner = document.getElementById('offline-banner');
  const statusText = document.getElementById('conn-status-text');
  
  if (banner.classList.contains('active')) {
    banner.classList.remove('active');
    statusText.textContent = "Online Mode";
    showToast("Reconnected to EcoSphere cloud servers.", "success");
  } else {
    banner.classList.add('active');
    statusText.textContent = "Offline Mode";
    showToast("Switched to Offline Mode database.", "warning");
  }
}

// --- Toast System ---
function showToast(message, type = 'success') {
  // Check if there is an existing toast box on parent window or create one
  let toastStack = document.getElementById('toast-stack-lab');
  if (!toastStack) {
    toastStack = document.createElement('div');
    toastStack.id = 'toast-stack-lab';
    toastStack.style.position = 'fixed';
    toastStack.style.bottom = '24px';
    toastStack.style.left = '24px';
    toastStack.style.zIndex = '9999';
    toastStack.style.display = 'flex';
    toastStack.style.flexDirection = 'column';
    toastStack.style.gap = '10px';
    document.body.appendChild(toastStack);
  }

  const toast = document.createElement('div');
  toast.style.background = 'rgba(15, 23, 42, 0.95)';
  toast.style.backdropFilter = 'blur(8px)';
  toast.style.color = '#fff';
  toast.style.padding = '12px 18px';
  toast.style.borderRadius = '12px';
  toast.style.fontSize = '12.5px';
  toast.style.border = '1px solid var(--border-subtle)';
  toast.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '10px';
  toast.style.animation = 'toast-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

  const colors = {
    success: '#10b981',
    info: '#3b82f6',
    warning: '#eab308',
    danger: '#ef4444'
  };

  const color = colors[type] || '#10b981';
  toast.innerHTML = `
    <span style="width:8px; height:8px; border-radius:50%; background:${color}; display:inline-block; box-shadow: 0 0 6px ${color};"></span>
    <span>${message}</span>
  `;

  toastStack.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3200);
}

// Add stylesheet rules for dynamic keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes toast-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);

// --- Department ESG Battle interactions ---
function cheerTeam(team) {
  const teamAXpEl = document.getElementById('battle-team-a-xp');
  const teamBXpEl = document.getElementById('battle-team-b-xp');
  const progressA = document.getElementById('battle-progress-a');
  const progressB = document.getElementById('battle-progress-b');

  let xpA = parseInt(teamAXpEl.textContent.replace(/,/g, '')) || 0;
  let xpB = parseInt(teamBXpEl.textContent.replace(/,/g, '')) || 0;

  if (team === 'a') {
    xpA += 150;
    teamAXpEl.textContent = xpA.toLocaleString() + ' XP';
    showToast("Supported Engineering! Added +150 XP to their duel score.", "info");
  } else {
    xpB += 150;
    teamBXpEl.textContent = xpB.toLocaleString() + ' XP';
    showToast("Supported Operations! Added +150 XP to their duel score.", "info");
  }

  // Recalculate percentages
  const total = xpA + xpB;
  const pctA = Math.round((xpA / total) * 100);
  const pctB = 100 - pctA;

  progressA.style.width = pctA + '%';
  progressB.style.width = pctB + '%';

  // Confetti burst
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  }
}
