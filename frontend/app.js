// EcoSphere AI - Core Interactive Logic & Application Controls

let carbonChart = null;
let mapInstance = null;
let mapTileLayer = null;
let currentTestimonialSlide = 0;
let testimonialInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Initialize Theme System
  initTheme();

  // 3. Initialize Interactive Map (Leaflet)
  initInteractiveMap();

  // 4. Initialize Data Visualizations (ECharts)
  initDataCharts();

  // 5. Initialize GSAP Scroll & Counter Animations
  initScrollAnimations();

  // 6. Testimonial Slider Loop
  startTestimonialSlider();

  // 7. Interactive Navigation Header Shadow on Scroll
  window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
      header.style.boxShadow = 'var(--shadow-premium)';
      header.style.padding = '4px 0';
    } else {
      header.style.boxShadow = 'none';
      header.style.padding = '0';
    }
  });

  // Mobile navigation drawer toggle (simplified for demonstration)
  const mobileToggle = document.getElementById('mobile-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const navLinks = document.querySelector('.nav-links');
      if (navLinks.style.display === 'flex') {
        navLinks.style.display = '';
      } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '80px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'var(--bg-secondary)';
        navLinks.style.padding = '20px';
        navLinks.style.borderBottom = '1px solid var(--border-subtle)';
        navLinks.style.zIndex = '999';
      }
    });
  }

  // Bind Voice assistant button mock
  const voiceBtn = document.getElementById('voice-btn');
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      const icon = voiceBtn.querySelector('i') || voiceBtn;
      voiceBtn.classList.toggle('active');
      if (voiceBtn.classList.contains('active')) {
        voiceBtn.style.borderColor = 'var(--primary)';
        voiceBtn.style.color = 'var(--primary)';
        voiceBtn.style.boxShadow = '0 0 10px var(--primary-glow)';
        appendChatMessage('bot', "Voice recognition active. Speak now or ask: 'Analyze our carbon index'.");
      } else {
        voiceBtn.style.borderColor = '';
        voiceBtn.style.color = '';
        voiceBtn.style.boxShadow = '';
      }
    });
  }
});

// Theme Toggle and Synchronization
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  // Retrieve saved preference or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    htmlRoot.classList.add('light');
  } else {
    htmlRoot.classList.remove('light');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      htmlRoot.classList.toggle('light');
      const currentTheme = htmlRoot.classList.contains('light') ? 'light' : 'dark';
      localStorage.setItem('theme', currentTheme);

      // Dynamically sync subcomponents
      syncMapTiles(currentTheme);
      syncChartTheme(currentTheme);
    });
  }
}

// Leaflet Map Setup
function initInteractiveMap() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer || typeof L === 'undefined') return;

  // Silicon Valley Coordinate
  const centerLatLong = [37.3382, -121.8863];

  mapInstance = L.map('map-container', {
    zoomControl: false,
    scrollWheelZoom: false
  }).setView(centerLatLong, 13);

  // Initialize correct tile layer based on active theme
  const isLight = document.documentElement.classList.contains('light');
  const tileUrl = isLight 
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  mapTileLayer = L.tileLayer(tileUrl, {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }).addTo(mapInstance);

  // Custom Green Pulsing Pin
  const customPin = L.divIcon({
    className: 'custom-map-pin',
    html: '<div style="width: 20px; height: 20px; border-radius: 50%; background: var(--primary); border: 3px solid #ffffff; box-shadow: 0 0 15px var(--primary-glow); animation: pulse 2s infinite;"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  L.marker(centerLatLong, { icon: customPin })
    .addTo(mapInstance)
    .bindPopup('<b>EcoSphere AI HQ</b><br>100% Carbon Net-Zero Campus')
    .openPopup();
}

function syncMapTiles(theme) {
  if (!mapInstance || !mapTileLayer) return;

  const newUrl = theme === 'light'
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  mapTileLayer.setUrl(newUrl);
}

// ECharts Live Dashboard Rendering
function initDataCharts() {
  const chartDom = document.getElementById('carbon-saved-chart');
  if (!chartDom || typeof echarts === 'undefined') return;

  carbonChart = echarts.init(chartDom);
  const isLight = document.documentElement.classList.contains('light');
  const options = getChartOptions(isLight);
  carbonChart.setOption(options);

  // Keep charts responsive
  window.addEventListener('resize', () => {
    if (carbonChart) carbonChart.resize();
  });
}

function getChartOptions(isLight) {
  const textColor = isLight ? '#475569' : '#9ca3af';
  const gridLineColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.05)';

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(15, 23, 42, 0.95)',
      borderColor: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: { color: isLight ? '#0f172a' : '#f9fafb' },
      formatter: '{b}: <b>{c}M kg</b>'
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: '10%',
      top: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
      axisLine: { lineStyle: { color: gridLineColor } },
      axisLabel: { color: textColor, fontFamily: 'Inter' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: gridLineColor } },
      axisLabel: { color: textColor, fontFamily: 'Inter' }
    },
    series: [
      {
        name: 'Carbon Saved',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#10b981' },
        lineStyle: { width: 3, color: '#10b981' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0)' }
          ])
        },
        data: [1.2, 1.8, 2.9, 4.1, 5.6, 7.2, 8.9, 10.4]
      }
    ]
  };
}

function syncChartTheme(theme) {
  if (!carbonChart) return;
  const isLight = theme === 'light';
  carbonChart.setOption(getChartOptions(isLight));
}

// GSAP Animations
function initScrollAnimations() {
  if (typeof gsap === 'undefined') return;

  // Register ScrollTrigger plugin
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Hero ESG Counter Load animation
  gsap.fromTo("#hero-esg-val", { textContent: 0.0 }, {
    textContent: 94.2,
    duration: 2,
    ease: "power2.out",
    snap: { textContent: 0.1 },
    onUpdate: function() {
      const val = parseFloat(document.getElementById("hero-esg-val").textContent);
      document.getElementById("hero-esg-val").textContent = val.toFixed(1);
    }
  });

  // Staggered reveals on scroll
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  revealElements.forEach((el) => {
    gsap.fromTo(el, 
      { opacity: 0, y: 40 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 1, 
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Counter statistical values scroll triggers
  const statsCounters = document.querySelectorAll('.stat-number');
  statsCounters.forEach((stat) => {
    const target = parseInt(stat.getAttribute('data-target'));
    
    gsap.fromTo(stat, 
      { textContent: 0 },
      {
        textContent: target,
        duration: 2.5,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: stat,
          start: 'top 90%',
          toggleActions: 'play none none none'
        },
        onUpdate: function() {
          const val = parseInt(stat.textContent);
          if (target === 100000) {
            stat.textContent = (val / 1000).toFixed(0) + 'K+';
          } else if (target === 500) {
            stat.textContent = val + '+';
          } else if (target === 10000000) {
            stat.textContent = (val / 1000000).toFixed(0) + 'M+';
          } else if (target === 50000) {
            stat.textContent = (val / 1000).toFixed(0) + 'K+';
          }
        }
      }
    );
  });
}

// AI Chat Assistant Interactive Functions
function handleChatSubmit(e) {
  if (e.key === 'Enter') {
    submitChat();
  }
}

function submitChat() {
  const chatInput = document.getElementById('chat-input');
  if (!chatInput || !chatInput.value.trim()) return;

  const userQuery = chatInput.value.trim();
  appendChatMessage('user', userQuery);
  chatInput.value = '';

  // Simulate typing response
  triggerBotResponse(userQuery);
}

function askAiQuestion(chipElement) {
  const questionText = chipElement.querySelector('span').innerText.replace(/"/g, '');
  appendChatMessage('user', questionText);
  triggerBotResponse(questionText);
}

function appendChatMessage(sender, text) {
  const chatBody = document.getElementById('chat-body');
  if (!chatBody) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message msg-${sender}`;
  msgDiv.innerText = text;

  chatBody.appendChild(msgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function triggerBotResponse(query) {
  const chatBody = document.getElementById('chat-body');
  if (!chatBody) return;

  // Append Typing Wave
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.id = 'typing-loader';
  typingIndicator.innerHTML = `
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
    <span class="typing-dot"></span>
  `;
  chatBody.appendChild(typingIndicator);
  chatBody.scrollTop = chatBody.scrollHeight;

  // AI responses lookup
  let botAnswer = "Interesting inquiry. I am compiling carbon ledger parameters and compliance reports to compute that. Let me know if you would like an audit PDF.";
  const q = query.toLowerCase();

  if (q.includes('environmental') || q.includes('carbon score') || q.includes('mom')) {
    botAnswer = "Our Environment Score aggregates automated utility feeds (Scope 1 & 2) and supplier ledger records (Scope 3) converted using localized EPA emission factors, audited monthly.";
  } else if (q.includes('predict') || q.includes('shipping') || q.includes('q4')) {
    botAnswer = "EcoSphere Core AI models indicate Q4 shipping goals will expand carbon footprint output by 12.8% (approx. 4,200 MT CO2e) unless alternative biofuel routes are utilized.";
  } else if (q.includes('governance') || q.includes('compliance') || q.includes('flag')) {
    botAnswer = "Scan complete. No active governance violations found. EcoSphere is auditing Board diversity guidelines (G3.2) and anti-bribery policies. You are fully compliant with CSRD mandates.";
  }

  setTimeout(() => {
    // Remove loader and append bot message
    const loader = document.getElementById('typing-loader');
    if (loader) loader.remove();

    appendChatMessage('bot', botAnswer);
  }, 1500);
}

// Testimonial Carousel Auto Slider
function startTestimonialSlider() {
  const track = document.getElementById('testimonial-track');
  const dots = document.querySelectorAll('#testimonial-dots .test-dot');
  if (!track || dots.length === 0) return;

  testimonialInterval = setInterval(() => {
    currentTestimonialSlide = (currentTestimonialSlide + 1) % dots.length;
    setTestimonialSlide(currentTestimonialSlide);
  }, 5000);
}

function setTestimonialSlide(slideIndex) {
  const track = document.getElementById('testimonial-track');
  const dots = document.querySelectorAll('#testimonial-dots .test-dot');
  if (!track) return;

  // Clear interval on manual interact
  if (event && event.type === 'click') {
    clearInterval(testimonialInterval);
  }

  currentTestimonialSlide = slideIndex;
  track.style.transform = `translateX(-${slideIndex * 100}%)`;

  dots.forEach((dot, index) => {
    if (index === slideIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

// Form Submission Handlers
function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const originalHtml = form.innerHTML;
  
  // Show premium success feedback overlay
  form.innerHTML = `
    <div style="text-align: center; padding: 40px 0; animation: message-fade 0.5s ease forwards;">
      <div style="width: 60px; height: 60px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); border: 2px solid var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; color: var(--primary);">
        <i data-lucide="check" style="width: 32px; height: 32px;"></i>
      </div>
      <h4 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">RFP Inquiry Received</h4>
      <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.5; max-width: 300px; margin: 0 auto;">Our sustainability engineering team will contact you within 24 hours with custom pricing models.</p>
    </div>
  `;
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function handleNewsletterSubmit(e) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  if (!input) return;
  
  const container = e.target.parentElement;
  container.innerHTML = `
    <h4 style="font-size: 14px; font-weight: 600; color: var(--primary); margin-bottom: 8px;">Subscription Confirmed</h4>
    <p style="font-size: 12.5px; color: var(--text-secondary);">You have successfully joined the EcoSphere ESG Log dispatch list.</p>
  `;
}
