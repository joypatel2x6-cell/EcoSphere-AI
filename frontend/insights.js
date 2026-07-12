// EcoSphere AI — AI Assistant Suite & Workspace Logic
// Fully theme-aware: chatbox, voice overlay, typing indicators all respond to dark/light toggle.

let isListening = false;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide icons
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // 2. Restore saved theme
  initInsightsTheme();

  // 3. Init workspace if on the dedicated page
  if (document.getElementById('insights-workspace')) {
    initInsightsWorkspace();
  }
});

// ─── 1. Theme System ─────────────────────────────────────────────────────────
function initInsightsTheme() {
  const html = document.documentElement;

  // Restore saved theme
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') {
    html.classList.add('light');
  } else {
    html.classList.remove('light');
  }

  // Only bind toggle on this page (body#insights-body-page)
  if (document.body.id !== 'insights-body-page') return;

  const toggleBtn = document.getElementById('theme-toggle');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    html.classList.toggle('light');
    const isLight = html.classList.contains('light');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');

    // Re-render inline charts with correct text colour
    reRenderInlineCharts();
  });
}

// Helper: re-render any open inline charts after theme change
function reRenderInlineCharts() {
  const esgDom = document.getElementById('inline-chart-esg');
  const carbonDom = document.getElementById('inline-chart-carbon');
  if (esgDom && typeof echarts !== 'undefined') {
    const inst = echarts.getInstanceByDom(esgDom);
    if (inst) renderInlineESGChart('inline-chart-esg');
  }
  if (carbonDom && typeof echarts !== 'undefined') {
    const inst = echarts.getInstanceByDom(carbonDom);
    if (inst) renderInlineCarbonChart('inline-chart-carbon');
  }
}

// ─── 2. Floating Chatbot (cross-page drawer) ─────────────────────────────────
function toggleFloatingChat() {
  const drawer = document.getElementById('chat-widget-drawer');
  if (!drawer) return;

  if (drawer.classList.contains('active')) {
    if (typeof gsap !== 'undefined') {
      gsap.to(drawer, {
        y: 20, opacity: 0, duration: 0.25,
        onComplete: () => drawer.classList.remove('active')
      });
    } else {
      drawer.classList.remove('active');
    }
  } else {
    drawer.classList.add('active');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(drawer, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
    }
    // Auto-focus input
    const inp = document.getElementById('chat-drawer-input');
    if (inp) setTimeout(() => inp.focus(), 320);
  }
}

function handleDrawerKeyPress(e) {
  if (e.key === 'Enter') sendDrawerMessage();
}

function sendDrawerMessage() {
  const input    = document.getElementById('chat-drawer-input');
  const messages = document.getElementById('chat-drawer-messages');
  if (!input || !messages || !input.value.trim()) return;

  const query = input.value.trim();
  input.value = '';

  appendBubble(messages, 'user-msg', query, true);
  autoScrollEl(messages);

  // Typing indicator
  const typing = appendBubble(messages, 'assistant-msg', '', false, true);
  autoScrollEl(messages);

  setTimeout(() => {
    messages.removeChild(typing);
    const reply = resolveESGReply(query);
    appendBubble(messages, 'assistant-msg', reply, false);
    autoScrollEl(messages);
  }, 1100);
}

function autoScrollEl(el) {
  if (el) el.scrollTop = el.scrollHeight;
}

// ─── 3. Workspace Init ───────────────────────────────────────────────────────
function initInsightsWorkspace() {
  // Hide floating widget if present
  const floatWidget = document.getElementById('floating-chat-widget');
  if (floatWidget) floatWidget.style.display = 'none';

  // Load default session
  loadChatHistory('scope-3');

  // Bind search input (workspace search)
  const searchInput = document.getElementById('workspace-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      handleWorkspaceSearch(e.target.value.trim());
    });
  }
}

function handleWorkspaceSearch(query) {
  if (!query) return;
  const container = document.getElementById('chat-stream-container');
  if (!container) return;

  // Highlight matching messages
  const msgs = container.querySelectorAll('.chat-msg');
  msgs.forEach(msg => {
    msg.style.outline = '';
    if (query && msg.textContent.toLowerCase().includes(query.toLowerCase())) {
      msg.style.outline = '2px solid var(--primary)';
    }
  });
}

// ─── 4. Chat History Sessions ─────────────────────────────────────────────────
function loadChatHistory(sessionId) {
  const container = document.getElementById('chat-stream-container');
  if (!container) return;

  // Update active item in sidebar
  document.querySelectorAll('.history-item').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(sessionId)) {
      item.classList.add('active');
    }
  });

  const sessions = {
    'scope-3': [
      { role: 'assistant', text: 'Scope 3 Logistics Review opened. How can I help you analyze transportation grid compliance today?' },
      { role: 'user',      text: 'Verify if vendor logistics RFP contains carbon indicators.' },
      { role: 'assistant', text: 'I scanned the vendor RFP documentation. Anti-greenwashing policies are aligned, but <strong>Scope 3 carbon metrics are missing</strong> for the third-party shipping fleet. Recommending adding EPA emissions disclosures contract clauses before approval.' }
    ],
    'decarbon': [
      { role: 'assistant', text: 'Decarbonization pathway analyzer loaded. I can run carbon calculations or transition pathway forecasts.' },
      { role: 'user',      text: 'Show decarb trends for Q4.' },
      { role: 'assistant', text: 'Projected carbon output is trending down to <strong>7,420 tCO₂e</strong> — a 4% decrease based on manufacturing operations updates and Warehouse B solar installation progress.' }
    ],
    'anti-bribery': [
      { role: 'assistant', text: 'Anti-Bribery Audit G3.2 flag analysis opened. Anti-corruption policies are missing for international regional operations.' },
      { role: 'assistant', text: '<strong>14 of 324</strong> employees have not yet acknowledged the G3.2 policy. H2 2026 audit begins in 3 weeks — escalation risk is HIGH if signatures not collected.' }
    ],
    'csr': [
      { role: 'assistant', text: 'CSR Volunteer Outreach session loaded. Q2 volunteer engagement shows <strong>4,280 hours</strong> logged — 7% above target. The Beach Clean-up and Tech Mentorship events drove the highest participation.' }
    ],
    'new': [
      { role: 'assistant', text: 'New conversation started. Ask me to run carbon calculations, explain ESG scores, review compliance status, or evaluate regulatory risks.' }
    ]
  };

  const messages = sessions[sessionId] || sessions['new'];

  // Clear and re-render
  container.innerHTML = '';
  messages.forEach(msg => {
    appendBubble(container, msg.role === 'user' ? 'user-msg' : 'assistant-msg', msg.text, false);
  });
  autoScrollEl(container);
}

function resetWorkspaceChat() {
  // Add new conversation to sidebar
  const historyContainer = document.getElementById('history-container');
  if (historyContainer) {
    const newItem = document.createElement('div');
    newItem.className = 'history-item';
    newItem.innerHTML = `<i data-lucide="message-square" style="width:14px;height:14px;"></i><span>New Chat</span>`;
    newItem.onclick = () => {
      document.querySelectorAll('.history-item').forEach(i => i.classList.remove('active'));
      newItem.classList.add('active');
      loadChatHistory('new');
    };
    historyContainer.insertBefore(newItem, historyContainer.firstChild);
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
  loadChatHistory('new');

  // Re-show quick prompts
  const promptsGrid = document.getElementById('quick-prompts-grid');
  if (promptsGrid) promptsGrid.style.display = '';
}

// ─── 5. Message Sender ────────────────────────────────────────────────────────
function handleKeyPress(e) {
  if (e.key === 'Enter') sendWorkspaceMessage();
}

function sendWorkspaceMessage(customQuery = '') {
  const input     = document.getElementById('chat-input');
  const container = document.getElementById('chat-stream-container');
  if (!container) return;

  const query = customQuery !== '' ? customQuery : (input ? input.value.trim() : '');
  if (!query) return;
  if (input) input.value = '';

  // Hide quick prompts
  const promptsGrid = document.getElementById('quick-prompts-grid');
  if (promptsGrid) promptsGrid.style.display = 'none';

  // User bubble
  appendBubble(container, 'user-msg', query, true);
  autoScrollEl(container);

  // Typing indicator
  const typing = appendBubble(container, 'assistant-msg', '', false, true);
  autoScrollEl(container);

  setTimeout(() => {
    container.removeChild(typing);
    const reply = resolveESGReply(query);
    appendBubble(container, 'assistant-msg', reply, false);
    autoScrollEl(container);
  }, 1200);
}

// ─── 6. ESG Reply Resolver ────────────────────────────────────────────────────
function resolveESGReply(query) {
  const q = query.toLowerCase();

  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('help') || q.includes('what can you')) {
    return `👋 Hi! I'm <strong>EcoSphere AI</strong>. I can help you with:<br>
      • 📊 ESG scores & carbon metrics<br>
      • ⚖️ Governance compliance & audit status<br>
      • 🌱 Environmental & social insights<br>
      • 📄 Report generation & export<br>
      • 🏆 Gamification, XP & rewards<br>
      • 🤖 AI forecasts & predictions<br>Just ask me anything about your ESG platform!`;
  }
  if (q.includes('carbon') || q.includes('emission') || q.includes('scope')) {
    return `📊 <strong>Carbon Analysis — Q2 2026:</strong><br><br>
      • Scope 1: <strong>2,840 tCO₂e</strong> (direct operations)<br>
      • Scope 2: <strong>3,120 tCO₂e</strong> (purchased energy)<br>
      • Scope 3: <strong>1,880 tCO₂e</strong> (supply chain — disclosure gaps noted)<br>
      • <strong>Total: 7,840 tCO₂e</strong> vs 7,500 target (+4.5%)<br><br>
      <strong>AI Recommendation:</strong> Accelerate Warehouse B solar installation (+4% renewable) and mandate Scope 3 carbon disclosures from top 10 suppliers to close the gap by Q4.`;
  }
  if (q.includes('esg') || q.includes('score') || q.includes('rating') || q.includes('index')) {
    return `🌿 <strong>ESG Performance — Q2 2026:</strong><br><br>
      • Environmental Index: <strong>92%</strong> ↑4.2% YoY<br>
      • Social Index: <strong>84%</strong> — volunteer programme +7% above target<br>
      • Governance Index: <strong>98%</strong> — G3.2 Anti-Bribery under final review<br>
      • <strong>Overall ESG Score: 91.2 / 100</strong><br><br>
      Key risk: Scope 3 supply chain disclosure gaps may impact Q3 Environmental index by −2 to −4 points.`;
  }
  if (q.includes('governance') || q.includes('compliance') || q.includes('audit') || q.includes('policy') || q.includes('risk')) {
    return `⚖️ <strong>Governance Compliance Report:</strong><br><br>
      • Overall compliance index: <strong>98.2%</strong><br>
      • Active policies: <strong>24</strong> (1 pending — G3.2 Anti-Bribery v3.2)<br>
      • Outstanding signatures: <strong>14 / 324</strong> employees<br>
      • Next audit cycle: <strong>H2 2026</strong> (starts in 3 weeks)<br><br>
      <strong>Priority:</strong> Collect remaining 14 signatures for G3.2 to clear the open flag before the audit cycle begins.`;
  }
  if (q.includes('social') || q.includes('csr') || q.includes('volunteer') || q.includes('wellness') || q.includes('diversity') || q.includes('employee')) {
    return `🤝 <strong>Social Impact Summary — Q2 2026:</strong><br><br>
      • Volunteer hours: <strong>4,280 hrs</strong> (+7% vs target)<br>
      • CSR participation: <strong>87%</strong> of workforce<br>
      • Employee wellness score: <strong>78 / 100</strong><br>
      • Diversity & Inclusion ratio: <strong>46%</strong> inclusive representation<br>
      • Top initiative: Beach Clean-up (340 participants)<br><br>
      <strong>Recommendation:</strong> Launch Q3 Digital Skills mentorship to push Social Index above 90%.`;
  }
  if (q.includes('environment') || q.includes('energy') || q.includes('renewable') || q.includes('water') || q.includes('waste') || q.includes('solar')) {
    return `🌱 <strong>Environmental Metrics — Q2 2026:</strong><br><br>
      • Renewable energy adoption: <strong>68%</strong> (target: 70%)<br>
      • Water conservation savings: <strong>12,400 m³</strong> this quarter<br>
      • Waste recycled: <strong>73%</strong><br>
      • Fleet electrification: <strong>34%</strong> complete<br><br>
      Solar grid installation at Warehouse B projected to add <strong>+4% renewable capacity</strong> on completion.`;
  }
  if (q.includes('report') || q.includes('export') || q.includes('download') || q.includes('pdf') || q.includes('excel') || q.includes('csv')) {
    return `📄 <strong>Report Center:</strong><br><br>
      Available reports:<br>
      • 🌱 Environmental Performance Q2 — <em>Ready to export</em><br>
      • 🤝 Social Impact Summary — <em>Ready to export</em><br>
      • ⚖️ Governance Compliance Report — <em>In Review (G3.2 flag)</em><br>
      • 📊 ESG Consolidated Summary — <em>Ready to export</em><br><br>
      Navigate to the <strong>Report Center</strong> to export as PDF, Excel, or CSV with AI-powered executive summaries.`;
  }
  if (q.includes('gamification') || q.includes('badge') || q.includes('xp') || q.includes('league') || q.includes('reward') || q.includes('coins') || q.includes('level')) {
    return `🏆 <strong>Eco League Status:</strong><br><br>
      • Current Level: <strong>4 (Diamond)</strong> with 2,840 XP<br>
      • Green Coins available: <strong>847</strong> (redeemable)<br>
      • Weekly challenge: <em>"Submit 3 Scope 2 logs"</em> — +150 XP + Carbon Sentinel badge<br><br>
      Complete the challenge before Sunday to climb the leaderboard!`;
  }
  if (q.includes('predict') || q.includes('forecast') || q.includes('q4') || q.includes('future') || q.includes('project')) {
    return `🤖 <strong>AI Carbon Forecast — Q4 2026:</strong><br><br>
      Based on current electrification trajectory:<br>
      • Projected total emissions: <strong>7,420 tCO₂e</strong> (5.4% reduction vs Q2)<br>
      • Scope 2 reduction if Warehouse B solar completes: <strong>−6.8%</strong><br>
      • Renewable energy forecast: <strong>72%</strong> (exceeding 70% target)<br><br>
      Confidence level: <strong>87%</strong> — contingent on Operations electrification plan proceeding on schedule.`;
  }
  if (q.includes('admin') || q.includes('department') || q.includes('user') || q.includes('rbac') || q.includes('access')) {
    return `🛡️ <strong>Admin Overview:</strong><br><br>
      • Employees managed: <strong>324</strong> across <strong>12 departments</strong><br>
      • System uptime: <strong>99.8%</strong><br>
      • Pending policy ACKs: <strong>3</strong><br>
      • Open admin alerts: <strong>1</strong> (G3.2 flag)<br><br>
      Visit the <strong>Admin Portal</strong> for full RBAC controls, audit logs, and notification management.`;
  }
  if (q.includes('innovation') || q.includes('lab') || q.includes('neural') || q.includes('classifier') || q.includes('ml')) {
    return `🔬 <strong>AI Innovation Lab:</strong><br><br>
      • Neural ESG Predictor: projected score <strong>94.9</strong> at 69% renewable sourcing<br>
      • Carbon Forecast: emissions dropping to <strong>7,420 tCO₂e</strong> by Q4<br>
      • Waste Neural Classifier: active — scan a waste item for instant category prediction<br><br>
      Head to <strong>Innovations Lab</strong> to explore all AI-powered tools.`;
  }
  if (q.includes('volunteer') || q.includes('policy') || q.includes('draft') || q.includes('write') || q.includes('csrd')) {
    return `📝 <strong>Corporate Volunteer Policy Framework (Draft):</strong><br><br>
      <strong>1. Objective:</strong> Encourage workforce community contribution aligned with CSRD Article 29.<br>
      <strong>2. Scope:</strong> 16 paid CSR volunteer hours allocated per employee annually.<br>
      <strong>3. Eligible Activities:</strong> Environmental restoration, primary education support, and community food programs.<br>
      <strong>4. Reporting:</strong> Hours logged via EcoSphere Social module, synced to ESG disclosure system.<br><br>
      This framework aligns with <strong>SEC and CSRD social guidelines</strong> for workforce engagement disclosure.`;
  }

  // Default fallback
  return `I've received your query about <strong>"${query}"</strong>. Let me cross-reference EcoSphere's live ESG database for the most accurate insight.<br><br>Could you provide more context — are you asking about <em>Environmental, Social, Governance metrics</em>, a <em>specific report</em>, or a <em>forecast</em>?`;
}

// ─── 7. Quick Prompt Tiles ────────────────────────────────────────────────────
function triggerQuickPrompt(promptType) {
  const container   = document.getElementById('chat-stream-container');
  const promptsGrid = document.getElementById('quick-prompts-grid');
  if (!container) return;
  if (promptsGrid) promptsGrid.style.display = 'none';

  const configs = {
    'explain-esg': {
      userText:    'Explain EcoSphere ESG Scores',
      typingText:  'Evaluating E, S, G sub-scores...',
      chartId:     'inline-chart-esg',
      responseHTML: `
        <p>Here is the breakdown of your corporate ESG indices:</p>
        <ul>
          <li><strong>Environmental Index (92%)</strong>: Strong performance in solar carbon offsets, offset by Scope 3 shipping gaps.</li>
          <li><strong>Social Index (84%)</strong>: High volunteer hours compliance, with opportunities in wellness.</li>
          <li><strong>Governance Index (98%)</strong>: High rating, G3.2 anti-bribery flag under final review.</li>
        </ul>
        <div class="inline-chart-container" id="inline-chart-esg"></div>`
    },
    'predict-carbon': {
      userText:    'Predict Carbon Emissions Q4',
      typingText:  'Calculating emissions transition projections...',
      chartId:     'inline-chart-carbon',
      responseHTML: `
        <p>Emissions transition projections for the next 4 quarters — electrification parameters reduce projected Scope 2 emissions by <strong>14%</strong>.</p>
        <div class="inline-chart-container" id="inline-chart-carbon"></div>`
    },
    'analyze-docs': {
      userText:    'Analyze Compliance Document',
      typingText:  'Parsing policy text and clauses...',
      chartId:     '',
      responseHTML: `
        <p><strong>RFP Supply Chain Policy Audit Result:</strong></p>
        <ul>
          <li>❌ Clause 4.2: Missing Scope 3 supplier carbon disclosures.</li>
          <li>✅ Clause 8.1: Anti-greenwashing policies verified.</li>
          <li>✅ Clause 12.3: Anti-corruption governance signed off.</li>
        </ul>
        <p style="color:#ef4444; font-weight:600;">1 audit gap identified — update Scope 3 requirements before RFP approval.</p>`
    },
    'recommend-goals': {
      userText:    'Recommend ESG Goals for Q4',
      typingText:  'Drafting Q4 ESG roadmap targets...',
      chartId:     '',
      responseHTML: `
        <p>Recommending the following Q4 sustainability targets:</p>
        <ol>
          <li>Establish Scope 3 supplier carbon disclosure contract clauses.</li>
          <li>Achieve 90% volunteer programme participation.</li>
          <li>Complete Warehouse B solar installation (+4% renewable).</li>
        </ol>
        <p>Push these targets to the ESG tracker with this API payload:</p>
        <pre class="code-block-markdown"><code>{
  <span class="code-keyword">"target"</span>: <span class="code-string">"Scope 3 Logistics"</span>,
  <span class="code-keyword">"targetYear"</span>: <span class="code-number">2026</span>,
  <span class="code-keyword">"compliance"</span>: <span class="code-string">"CSRD Art.29"</span>
}</code></pre>`
    }
  };

  const cfg = configs[promptType];
  if (!cfg) return;

  // User bubble
  appendBubble(container, 'user-msg', cfg.userText, true);
  autoScrollEl(container);

  // Typing indicator
  const typing = appendBubble(container, 'assistant-msg', cfg.typingText, false, false, true);
  autoScrollEl(container);

  setTimeout(() => {
    container.removeChild(typing);

    const replyBubble = document.createElement('div');
    replyBubble.className = 'chat-msg assistant-msg';
    replyBubble.innerHTML = cfg.responseHTML;
    container.appendChild(replyBubble);
    autoScrollEl(container);

    // Render inline chart
    if (cfg.chartId === 'inline-chart-esg') {
      setTimeout(() => renderInlineESGChart('inline-chart-esg'), 80);
    } else if (cfg.chartId === 'inline-chart-carbon') {
      setTimeout(() => renderInlineCarbonChart('inline-chart-carbon'), 80);
    }
  }, 1500);
}

// ─── 8. Bubble Factory ────────────────────────────────────────────────────────
/**
 * Append a message bubble to a container.
 * @param {HTMLElement} container  - target scroll container
 * @param {string}      cssClass   - 'user-msg' | 'assistant-msg'
 * @param {string}      content    - text or HTML
 * @param {boolean}     isPlain    - true → set innerText (safe), false → innerHTML
 * @param {boolean}     isTyping   - if true, render animated dots instead of content
 * @param {boolean}     isSmall    - render small typing label (for quick prompts)
 * @returns {HTMLElement} the created bubble
 */
function appendBubble(container, cssClass, content, isPlain = false, isTyping = false, isSmall = false) {
  const bubble = document.createElement('div');
  bubble.className = `chat-msg ${cssClass}`;

  if (isTyping) {
    // Animated dots typing indicator
    bubble.innerHTML = `<span class="typing-dots"><span></span><span></span><span></span></span>`;
  } else if (isSmall) {
    bubble.innerHTML = `<span style="font-size:11px; color:var(--text-secondary);">${content}</span>`;
  } else if (isPlain) {
    bubble.innerText = content;
  } else {
    bubble.innerHTML = `<p>${content}</p>`;
  }

  container.appendChild(bubble);
  return bubble;
}

// ─── 9. Inline ECharts ────────────────────────────────────────────────────────
function getChartTextColor() {
  return document.documentElement.classList.contains('light') ? '#334155' : 'rgba(255,255,255,0.65)';
}
function getChartGridColor() {
  return document.documentElement.classList.contains('light') ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
}

function renderInlineESGChart(domId) {
  const dom = document.getElementById(domId);
  if (!dom || typeof echarts === 'undefined') return;

  // Dispose existing instance if any
  const existing = echarts.getInstanceByDom(dom);
  if (existing) existing.dispose();

  const chart = echarts.init(dom);
  const textColor = getChartTextColor();
  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(15,23,42,0.9)',
      textStyle: { color: '#fff', fontSize: 11 }
    },
    grid: { left: '3%', right: '8%', bottom: '3%', top: '8%', containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      splitLine: { lineStyle: { color: getChartGridColor() } },
      axisLabel: { color: textColor, fontSize: 10 }
    },
    yAxis: {
      type: 'category',
      data: ['Governance', 'Social', 'Environmental'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: textColor, fontSize: 11, fontWeight: 600 }
    },
    series: [{
      name: 'Score %',
      type: 'bar',
      data: [98, 84, 92],
      barMaxWidth: 28,
      itemStyle: {
        color: (params) => ['#a855f7','#3b82f6','#10b981'][params.dataIndex],
        borderRadius: [0, 6, 6, 0]
      },
      label: {
        show: true,
        position: 'right',
        color: textColor,
        fontSize: 11,
        formatter: '{c}%'
      }
    }]
  });
}

function renderInlineCarbonChart(domId) {
  const dom = document.getElementById(domId);
  if (!dom || typeof echarts === 'undefined') return;

  const existing = echarts.getInstanceByDom(dom);
  if (existing) existing.dispose();

  const chart = echarts.init(dom);
  const textColor = getChartTextColor();
  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,23,42,0.9)',
      textStyle: { color: '#fff', fontSize: 11 }
    },
    grid: { left: '3%', right: '8%', bottom: '3%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Q1', 'Q2', 'Q3 (Est)', 'Q4 (Proj)'],
      axisLine: { lineStyle: { color: getChartGridColor() } },
      axisLabel: { color: textColor, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: 'tCO₂e',
      nameTextStyle: { color: textColor, fontSize: 9 },
      splitLine: { lineStyle: { color: getChartGridColor() } },
      axisLabel: { color: textColor, fontSize: 10 }
    },
    series: [{
      name: 'Carbon tCO₂e',
      type: 'line',
      smooth: true,
      data: [8200, 7900, 7650, 7420],
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#a855f7' },
      lineStyle: { width: 3, color: '#a855f7' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(168,85,247,0.25)' },
          { offset: 1, color: 'rgba(168,85,247,0)' }
        ])
      }
    }]
  });
}

// ─── 10. Voice Assistant (workspace overlay) ──────────────────────────────────
function toggleVoiceAssistant() {
  const overlay = document.getElementById('voice-wave-overlay');
  if (!overlay) return;

  isListening = !isListening;

  if (isListening) {
    overlay.classList.add('active');

    // Use real Web Speech API if available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.lang = 'en-US';
      recog.interimResults = false;
      recog.maxAlternatives = 1;

      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        toggleVoiceAssistant();
        sendWorkspaceMessage(transcript);
      };

      recog.onerror = () => {
        // Fallback to demo if browser blocks mic
        setTimeout(() => {
          if (isListening) {
            toggleVoiceAssistant();
            sendWorkspaceMessage('What is our current ESG score?');
          }
        }, 2800);
      };

      recog.onend = () => {
        if (isListening) isListening = false;
      };

      try {
        recog.start();
      } catch(e) {
        // Fallback demo
        setTimeout(() => {
          if (isListening) {
            toggleVoiceAssistant();
            sendWorkspaceMessage('What is our current ESG score?');
          }
        }, 2800);
      }
    } else {
      // No speech API — simulate demo
      setTimeout(() => {
        if (isListening) {
          toggleVoiceAssistant();
          sendWorkspaceMessage('Draft a corporate volunteer policy');
        }
      }, 2800);
    }
  } else {
    overlay.classList.remove('active');
  }
}

// ─── 11. File Upload Handler ──────────────────────────────────────────────────
function triggerFileInput() {
  const uploader = document.getElementById('file-uploader');
  if (uploader) uploader.click();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const container = document.getElementById('chat-stream-container');
  if (!container) return;

  // Show attached file bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-msg user-msg';
  userBubble.innerHTML = `<p>📎 Attached: <strong>${file.name}</strong></p>`;
  container.appendChild(userBubble);
  autoScrollEl(container);

  // Scanning loader
  const loaderCard = document.createElement('div');
  loaderCard.className = 'chat-msg assistant-msg';
  loaderCard.innerHTML = `
    <div class="upload-progress-card">
      <span style="font-size:11px; font-weight:600; color:var(--text-secondary);">EcoSphere AI is scanning document structures...</span>
      <div class="modal-progress-bar" style="margin-top:8px;">
        <div class="upload-progress-fill" id="doc-upload-fill"></div>
      </div>
    </div>`;
  container.appendChild(loaderCard);
  autoScrollEl(container);

  setTimeout(() => {
    const fill = document.getElementById('doc-upload-fill');
    if (fill) fill.style.width = '100%';
  }, 80);

  setTimeout(() => {
    container.removeChild(loaderCard);
    const replyBubble = document.createElement('div');
    replyBubble.className = 'chat-msg assistant-msg';
    replyBubble.innerHTML = `
      <p>I completed scanning <strong>${file.name}</strong> against SEC and CSRD frameworks:</p>
      <ul>
        <li>✅ Board diversity ratios aligned (Section 3).</li>
        <li>❌ Anti-bribery G3.2 compliance guidelines missing international operations parameters.</li>
      </ul>
      <p style="color:#ef4444; font-weight:600;">1 compliance gap flagged. Recommendation: update international anti-corruption statements.</p>`;
    container.appendChild(replyBubble);
    autoScrollEl(container);

    // Reset file input so same file can be re-uploaded
    event.target.value = '';
  }, 2000);
}
