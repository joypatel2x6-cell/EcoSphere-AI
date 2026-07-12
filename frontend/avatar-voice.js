// EcoSphere AI - Floating AI Avatar & Voice Navigation System
// Fully theme-aware: panel colours change with dark/light toggle

(function() {
  document.addEventListener('DOMContentLoaded', () => {
    injectAvatarElements();
    setupAvatarTriggers();
    setupVoiceRecognition();
    // Listen for theme changes to update panel colours live
    observeThemeChanges();
  });

  // ─── 1. Inject avatar elements ─────────────────────────────────────────────
  function injectAvatarElements() {
    if (!document.getElementById('avatar-voice-styles')) {
      const style = document.createElement('style');
      style.id = 'avatar-voice-styles';
      style.textContent = `
        /* ── Floating trigger ── */
        .avatar-floating-trigger {
          position: fixed;
          bottom: 90px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(6,182,212,0.4);
          z-index: 10000;
          transition: all 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
          border: none;
        }
        .avatar-floating-trigger:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 10px 28px rgba(6,182,212,0.55);
        }

        /* ── Halo ring ── */
        .avatar-halo {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid #38bdf8;
          animation: halo-scale 2s infinite linear;
          pointer-events: none;
        }
        @keyframes halo-scale {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        /* ── Avatar panel ── */
        .avatar-panel {
          position: fixed;
          bottom: 160px;
          right: 24px;
          width: 320px;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.55);
          z-index: 9999;
          display: none;
          flex-direction: column;
          overflow: hidden;
          transform: translateY(20px) scale(0.96);
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1);

          /* Dark mode defaults */
          background: rgba(13,20,38,0.97);
          border: 1px solid rgba(255,255,255,0.08);
          color: #f1f5f9;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .avatar-panel.active {
          display: flex;
          transform: translateY(0) scale(1);
          opacity: 1;
        }

        /* Light mode panel overrides */
        html.light .avatar-panel {
          background: rgba(255,255,255,0.97);
          border: 1px solid rgba(0,0,0,0.09);
          color: #1e293b;
          box-shadow: 0 20px 50px rgba(0,0,0,0.18);
        }

        /* ── Panel header ── */
        .avatar-panel-header {
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.02);
        }
        html.light .avatar-panel-header {
          border-bottom-color: rgba(0,0,0,0.08);
          background: rgba(0,0,0,0.02);
        }

        /* ── Panel body ── */
        .avatar-panel-body {
          padding: 20px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 14px;
        }

        /* ── Avatar circle ── */
        .avatar-circle-display {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(6,182,212,0.2) 0%, rgba(16,185,129,0.15) 100%);
          border: 2px solid #38bdf8;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
          transition: border-color 0.3s, background 0.3s;
        }
        html.light .avatar-circle-display {
          background: radial-gradient(circle, rgba(6,182,212,0.12) 0%, rgba(16,185,129,0.08) 100%);
          border-color: #06b6d4;
        }

        /* ── Voice wave bars ── */
        .avatar-wave-container {
          display: flex;
          gap: 4px;
          align-items: center;
          height: 24px;
        }
        .avatar-wave-bar {
          width: 3px;
          height: 6px;
          background: #38bdf8;
          border-radius: 2px;
          transition: background 0.3s;
        }
        html.light .avatar-wave-bar {
          background: #0284c7;
        }
        .avatar-wave-container.active .avatar-wave-bar {
          animation: wave-motion 1.2s infinite ease-in-out;
        }
        .avatar-wave-bar:nth-child(1) { animation-delay: 0s;    }
        .avatar-wave-bar:nth-child(2) { animation-delay: 0.15s; }
        .avatar-wave-bar:nth-child(3) { animation-delay: 0.3s;  }
        .avatar-wave-bar:nth-child(4) { animation-delay: 0.45s; }
        .avatar-wave-bar:nth-child(5) { animation-delay: 0.6s;  }
        @keyframes wave-motion {
          0%, 100% { height: 6px; }
          50%       { height: 22px; }
        }

        /* ── Status text ── */
        #avatar-speech-status {
          font-size: 12px;
          font-weight: 700;
          color: #10b981;
          margin-bottom: 4px;
          transition: color 0.2s;
        }
        html.light #avatar-speech-status { color: #059669; }

        /* ── Transcription text box ── */
        #avatar-speech-text {
          font-size: 11px;
          line-height: 1.5;
          min-height: 36px;
          padding: 8px 10px;
          border-radius: 10px;
          width: 100%;
          box-sizing: border-box;
          text-align: left;
          /* Dark mode */
          color: #94a3b8;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          transition: background 0.3s, color 0.3s, border-color 0.3s;
        }
        html.light #avatar-speech-text {
          color: #475569;
          background: rgba(0,0,0,0.04);
          border-color: rgba(0,0,0,0.09);
        }

        /* ── Close button ── */
        #avatar-close-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: color 0.2s, background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #avatar-close-btn:hover {
          color: #ef4444;
          background: rgba(239,68,68,0.08);
        }

        /* ── Start listening button ── */
        #start-voice-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          font-size: 13px;
        }

        /* ── Voice feedback pulse ── */
        .avatar-listening-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(16,185,129,0.15);
          animation: listen-pulse 1.2s infinite ease-in-out;
        }
        @keyframes listen-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50%       { transform: scale(1.25); opacity: 0; }
        }

        /* ── Responsive ── */
        @media (max-width: 480px) {
          .avatar-panel { width: calc(100vw - 32px); right: 12px; bottom: 140px; }
          .avatar-floating-trigger { right: 12px; bottom: 80px; }
        }
      `;
      document.head.appendChild(style);
    }

    if (document.getElementById('avatar-trigger')) return;

    // Floating trigger button
    const trigger = document.createElement('button');
    trigger.id = 'avatar-trigger';
    trigger.className = 'avatar-floating-trigger';
    trigger.setAttribute('aria-label', 'Open AI Voice Assistant');
    trigger.innerHTML = `
      <div class="avatar-halo"></div>
      <i data-lucide="sparkles" style="width:22px; height:22px; position:relative; z-index:2;"></i>
    `;
    document.body.appendChild(trigger);

    // Control panel
    const panel = document.createElement('div');
    panel.id = 'avatar-panel';
    panel.className = 'avatar-panel';
    panel.innerHTML = `
      <div class="avatar-panel-header">
        <div style="display:flex; align-items:center; gap:8px;">
          <i data-lucide="bot" style="width:18px; height:18px; color:#38bdf8;"></i>
          <span style="font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:800; letter-spacing:-0.2px;">EcoSphere AI Guide</span>
        </div>
        <button id="avatar-close-btn" aria-label="Close AI assistant">
          <i data-lucide="x" style="width:16px; height:16px;"></i>
        </button>
      </div>

      <div class="avatar-panel-body">
        <div class="avatar-circle-display" id="avatar-circle">
          <i data-lucide="mic" id="mic-icon-display" style="width:30px; height:30px; color:#38bdf8; position:relative; z-index:2;"></i>
        </div>

        <div class="avatar-wave-container" id="voice-waves">
          <div class="avatar-wave-bar"></div>
          <div class="avatar-wave-bar"></div>
          <div class="avatar-wave-bar"></div>
          <div class="avatar-wave-bar"></div>
          <div class="avatar-wave-bar"></div>
        </div>

        <div style="width:100%;">
          <p id="avatar-speech-status">EcoSphere assistant ready</p>
          <p id="avatar-speech-text">Say "Go to Overview" or "Go to Governance" to navigate</p>
        </div>

        <button class="btn btn-primary" id="start-voice-btn">
          <i data-lucide="mic" style="width:16px; height:16px;"></i> Start Listening
        </button>
      </div>
    `;
    document.body.appendChild(panel);

    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // ─── 2. Trigger & Close ────────────────────────────────────────────────────
  function setupAvatarTriggers() {
    const trigger  = document.getElementById('avatar-trigger');
    const panel    = document.getElementById('avatar-panel');
    const closeBtn = document.getElementById('avatar-close-btn');

    if (trigger && panel) {
      trigger.addEventListener('click', () => {
        const open = panel.classList.contains('active');
        if (open) {
          closePanel(panel);
        } else {
          openPanel(panel);
        }
      });
    }
    if (closeBtn && panel) {
      closeBtn.addEventListener('click', () => closePanel(panel));
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('avatar-panel');
      const trigger = document.getElementById('avatar-trigger');
      if (panel && trigger && panel.classList.contains('active')) {
        if (!panel.contains(e.target) && !trigger.contains(e.target)) {
          closePanel(panel);
        }
      }
    });
  }

  function openPanel(panel) {
    panel.classList.add('active');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(panel, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
    }
  }

  function closePanel(panel) {
    if (typeof gsap !== 'undefined') {
      gsap.to(panel, { y: 18, opacity: 0, duration: 0.22, ease: 'power2.in',
        onComplete: () => panel.classList.remove('active') });
    } else {
      panel.classList.remove('active');
    }
  }

  // ─── 3. Voice Recognition ─────────────────────────────────────────────────
  function setupVoiceRecognition() {
    const startBtn     = document.getElementById('start-voice-btn');
    const statusText   = document.getElementById('avatar-speech-status');
    const displayTrans = document.getElementById('avatar-speech-text');
    const waves        = document.getElementById('voice-waves');

    if (!startBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      startBtn.disabled = true;
      startBtn.innerHTML = `<i data-lucide="mic-off" style="width:16px;height:16px;"></i> Voice Unsupported`;
      if (displayTrans) displayTrans.textContent = 'Your browser does not support Speech Recognition. Try Google Chrome.';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous     = false;
    recognition.lang            = 'en-US';
    recognition.interimResults  = false;
    recognition.maxAlternatives = 1;

    let isListeningVoice = false;

    startBtn.addEventListener('click', () => {
      if (isListeningVoice) {
        recognition.stop();
      } else {
        try { recognition.start(); } catch(e) { console.warn('Speech recognition error:', e); }
      }
    });

    recognition.onstart = () => {
      isListeningVoice = true;
      setStatus(statusText, 'Listening to commands...', '#38bdf8');
      if (displayTrans) displayTrans.textContent = 'Speak a navigation command...';
      if (waves) waves.classList.add('active');

      // Add pulse to avatar circle
      const circle = document.getElementById('avatar-circle');
      if (circle && !circle.querySelector('.avatar-listening-pulse')) {
        const pulse = document.createElement('div');
        pulse.className = 'avatar-listening-pulse';
        circle.appendChild(pulse);
      }

      startBtn.innerHTML = `<i data-lucide="square" style="width:16px;height:16px;color:#ef4444;fill:#ef4444;"></i> Stop Listening`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    };

    recognition.onerror = (e) => {
      console.warn('Voice recognition error:', e.error);
      isListeningVoice = false;
      setStatus(statusText, 'Mic error — check browser permissions', '#ef4444');
      cleanupListening(waves, startBtn);
    };

    recognition.onend = () => {
      isListeningVoice = false;
      cleanupListening(waves, startBtn);
      if (statusText && statusText.textContent === 'Listening to commands...') {
        setStatus(statusText, 'EcoSphere assistant ready', '#10b981');
      }
    };

    recognition.onresult = (event) => {
      const resultText = event.results[0][0].transcript.toLowerCase().trim();
      if (displayTrans) displayTrans.textContent = `"${resultText}"`;
      handleVoiceCommand(resultText, statusText);
    };
  }

  function setStatus(el, text, color) {
    if (!el) return;
    el.textContent  = text;
    el.style.color  = color;
  }

  function cleanupListening(waves, startBtn) {
    if (waves) waves.classList.remove('active');
    // Remove pulse
    const circle = document.getElementById('avatar-circle');
    if (circle) {
      const pulse = circle.querySelector('.avatar-listening-pulse');
      if (pulse) circle.removeChild(pulse);
    }
    if (startBtn) {
      startBtn.innerHTML = `<i data-lucide="mic" style="width:16px;height:16px;"></i> Start Listening`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }

  // ─── 4. Voice Command Router ──────────────────────────────────────────────
  function handleVoiceCommand(cmd, statusText) {
    const navMap = {
      'overview':       'dashboard.html',
      'dashboard':      'dashboard.html',
      'climate':        'environmental.html',
      'environmental':  'environmental.html',
      'carbon':         'environmental.html',
      'social':         'social.html',
      'people':         'social.html',
      'governance':     'governance.html',
      'compliance':     'governance.html',
      'insights':       'insights.html',
      'ai':             'insights.html',
      'assistant':      'insights.html',
      'reports':        'reports.html',
      'report center':  'reports.html',
      'eco league':     'gamification.html',
      'gamification':   'gamification.html',
      'badges':         'gamification.html',
      'innovations':    'innovations.html',
      'lab':            'innovations.html',
      'innovation':     'innovations.html',
      'admin':          'admin.html',
      'settings':       'admin.html',
      'home':           'index.html',
      'landing':        'index.html',
      'logout':         'index.html',
    };

    let targetPage = null;
    for (const [key, page] of Object.entries(navMap)) {
      if (cmd.includes(key)) { targetPage = page; break; }
    }

    if (targetPage) {
      setStatus(statusText, `Navigating to ${targetPage.replace('.html','')}...`, '#10b981');
      setTimeout(() => { window.location.href = targetPage; }, 900);
    } else {
      setStatus(statusText, 'Command not recognized — try "Go to Reports"', '#eab308');
    }
  }

  // ─── 5. Live theme observation ────────────────────────────────────────────
  // When the root <html> class changes (light/dark toggle), the CSS handles
  // colour changes via `html.light` rules — no JS needed for colours.
  // This observer just re-renders icons that may need refreshing.
  function observeThemeChanges() {
    const observer = new MutationObserver(() => {
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }

})();
