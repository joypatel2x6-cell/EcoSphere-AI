// EcoSphere AI - Floating AI Avatar & Voice Navigation System

(function() {
  document.addEventListener('DOMContentLoaded', () => {
    injectAvatarElements();
    setupAvatarTriggers();
    setupVoiceRecognition();
  });

  // Inject elements to DOM
  function injectAvatarElements() {
    // Inject Avatar styles dynamically if not present
    if (!document.getElementById('avatar-voice-styles')) {
      const style = document.createElement('style');
      style.id = 'avatar-voice-styles';
      style.textContent = `
        .avatar-floating-trigger {
          position: fixed;
          bottom: 90px;
          right: 24px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4);
          z-index: 10000;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .avatar-floating-trigger:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 8px 25px rgba(6, 182, 212, 0.6);
        }
        .avatar-halo {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid #38bdf8;
          animation: halo-scale 2s infinite linear;
        }
        @keyframes halo-scale {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        .avatar-panel {
          position: fixed;
          bottom: 165px;
          right: 24px;
          width: 320px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6);
          z-index: 10000;
          display: none;
          flex-direction: column;
          overflow: hidden;
          transform: translateY(20px) scale(0.95);
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .avatar-panel.active {
          display: flex;
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        .avatar-panel-header {
          padding: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .avatar-panel-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 14px;
        }
        .avatar-circle-display {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%);
          border: 2px solid #38bdf8;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        .avatar-wave-container {
          display: flex;
          gap: 4px;
          align-items: center;
          height: 20px;
        }
        .avatar-wave-bar {
          width: 3px;
          height: 6px;
          background: #38bdf8;
          border-radius: 2px;
        }
        .avatar-wave-container.active .avatar-wave-bar {
          animation: wave-motion 1.2s infinite ease-in-out;
        }
        .avatar-wave-bar:nth-child(2) { animation-delay: 0.15s; }
        .avatar-wave-bar:nth-child(3) { animation-delay: 0.3s; }
        .avatar-wave-bar:nth-child(4) { animation-delay: 0.45s; }
        .avatar-wave-bar:nth-child(5) { animation-delay: 0.6s; }
        @keyframes wave-motion {
          0%, 100% { height: 6px; }
          50% { height: 20px; }
        }
      `;
      document.head.appendChild(style);
    }

    // 1. Floating Trigger Button
    if (document.getElementById('avatar-trigger')) return;

    const trigger = document.createElement('div');
    trigger.id = 'avatar-trigger';
    trigger.className = 'avatar-floating-trigger';
    trigger.innerHTML = `
      <div class="avatar-halo"></div>
      <i data-lucide="sparkles" style="width:24px; height:24px;"></i>
    `;
    document.body.appendChild(trigger);

    // 2. Control Panel Box
    const panel = document.createElement('div');
    panel.id = 'avatar-panel';
    panel.className = 'avatar-panel';
    panel.innerHTML = `
      <div class="avatar-panel-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <i data-lucide="bot" style="color:var(--neon-cyan); width:18px; height:18px;"></i>
          <span style="font-family:'Space Grotesk',sans-serif; font-size:13.5px; font-weight:800;">EcoSphere AI Guide</span>
        </div>
        <button id="avatar-close-btn" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer;">
          <i data-lucide="x" style="width:16px; height:16px;"></i>
        </button>
      </div>
      <div class="avatar-panel-body">
        <div class="avatar-circle-display" id="avatar-circle">
          <i data-lucide="mic" id="mic-icon-display" style="width:30px; height:30px; color:var(--neon-cyan); position:relative; z-index:2;"></i>
        </div>
        
        <div class="avatar-wave-container" id="voice-waves">
          <div class="avatar-wave-bar"></div>
          <div class="avatar-wave-bar"></div>
          <div class="avatar-wave-bar"></div>
          <div class="avatar-wave-bar"></div>
          <div class="avatar-wave-bar"></div>
        </div>

        <div style="width:100%;">
          <p id="avatar-speech-status" style="font-size:12px; font-weight:700; color:var(--neon-green); margin-bottom:4px;">EcoSphere assistant ready</p>
          <p id="avatar-speech-text" style="font-size:11px; color:var(--text-secondary); line-height:1.4; min-height:30px; padding:8px; border-radius:10px; background:rgba(255,255,255,0.02); border:1px solid var(--border-subtle);">Say "Go to Overview" or "Go to Innovations Lab"</p>
        </div>

        <button class="btn btn-primary" id="start-voice-btn" style="width:100%; display:flex; align-items:center; justify-content:center; gap:8px;">
          <i data-lucide="mic"></i> Start Listening
        </button>
      </div>
    `;
    document.body.appendChild(panel);

    // Refresh lucide icons
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  function setupAvatarTriggers() {
    const trigger = document.getElementById('avatar-trigger');
    const panel = document.getElementById('avatar-panel');
    const closeBtn = document.getElementById('avatar-close-btn');

    if (trigger && panel) {
      trigger.addEventListener('click', () => {
        panel.classList.toggle('active');
      });
    }

    if (closeBtn && panel) {
      closeBtn.addEventListener('click', () => {
        panel.classList.remove('active');
      });
    }
  }

  function setupVoiceRecognition() {
    const startBtn = document.getElementById('start-voice-btn');
    const statusText = document.getElementById('avatar-speech-status');
    const displayTrans = document.getElementById('avatar-speech-text');
    const waves = document.getElementById('voice-waves');
    const micIcon = document.getElementById('mic-icon-display');

    if (!startBtn) return;

    // Check voice support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      startBtn.disabled = true;
      startBtn.innerHTML = `<i data-lucide="mic-off"></i> Voice Unsupported`;
      displayTrans.textContent = "Your browser does not support Speech Recognition. Try Google Chrome.";
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let isListening = false;

    startBtn.addEventListener('click', () => {
      if (isListening) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (e) {
          console.error(e);
        }
      }
    });

    recognition.onstart = () => {
      isListening = true;
      statusText.textContent = "Listening to commands...";
      statusText.style.color = "var(--neon-cyan)";
      displayTrans.textContent = "Speak a navigation query...";
      waves.classList.add('active');
      startBtn.innerHTML = `<i data-lucide="square" style="color:#ef4444; fill:#ef4444;"></i> Stop Listening`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    recognition.onerror = (e) => {
      console.error(e);
      isListening = false;
      statusText.textContent = "Error occurred";
      statusText.style.color = "#ef4444";
      waves.classList.remove('active');
      startBtn.innerHTML = `<i data-lucide="mic"></i> Start Listening`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    recognition.onend = () => {
      isListening = false;
      waves.classList.remove('active');
      startBtn.innerHTML = `<i data-lucide="mic"></i> Start Listening`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript.toLowerCase().trim();
      displayTrans.textContent = `"${resultText}"`;
      
      // Command Router
      handleVoiceCommand(resultText, statusText);
    };
  }

  function handleVoiceCommand(cmd, statusText) {
    const pages = {
      'overview': 'dashboard.html',
      'dashboard': 'dashboard.html',
      'climate': 'environmental.html',
      'environmental': 'environmental.html',
      'social': 'social.html',
      'governance': 'governance.html',
      'insights': 'insights.html',
      'coach': 'insights.html',
      'reports': 'reports.html',
      'report center': 'reports.html',
      'eco league': 'gamification.html',
      'gamification': 'gamification.html',
      'innovations': 'innovations.html',
      'lab': 'innovations.html',
      'admin': 'admin.html',
      'home': 'index.html',
      'landing': 'index.html'
    };

    let targetPage = null;

    // Check match
    for (const [key, value] of Object.entries(pages)) {
      if (cmd.includes(key)) {
        targetPage = value;
        break;
      }
    }

    if (targetPage) {
      statusText.textContent = "Redirecting...";
      statusText.style.color = "var(--neon-green)";
      setTimeout(() => {
        window.location.href = targetPage;
      }, 1000);
    } else {
      statusText.textContent = "Command not recognized";
      statusText.style.color = "#eab308";
    }
  }
})();
