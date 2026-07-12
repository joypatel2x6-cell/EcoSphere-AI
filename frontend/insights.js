// EcoSphere AI - AI Assistant Suite & Floating Chatbot logic

let isListening = false;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Initialize Theme synchronization
  initInsightsTheme();

  // 3. Check if we are inside the dedicated AI Workspace
  if (document.getElementById('insights-workspace')) {
    initInsightsWorkspace();
  }
});

// 1. Theme Configuration
// On the dedicated Insights page: restore theme AND bind toggle button.
// On other pages: only restore saved theme — the page's own JS handles the toggle.
function initInsightsTheme() {
  const htmlRoot = document.documentElement;

  // Always restore saved theme from localStorage
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') {
    htmlRoot.classList.add('light');
  } else {
    htmlRoot.classList.remove('light');
  }

  // Only bind the click listener on the AI Insights page itself
  // (identified by body#insights-body-page). Other pages handle their own toggle.
  const isInsightsPage = document.body.id === 'insights-body-page';
  if (!isInsightsPage) return;

  const toggleBtn = document.getElementById('theme-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      htmlRoot.classList.toggle('light');
      const isLight = htmlRoot.classList.contains('light');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
  }
}

// 2. Cross-Page Floating Chatbot Overlay Controls
function toggleFloatingChat() {
  const drawer = document.getElementById('chat-widget-drawer');
  if (!drawer) return;

  if (drawer.classList.contains('active')) {
    if (typeof gsap !== 'undefined') {
      gsap.to(drawer, {
        y: 20,
        opacity: 0,
        duration: 0.25,
        onComplete: () => {
          drawer.classList.remove('active');
        }
      });
    } else {
      drawer.classList.remove('active');
    }
  } else {
    drawer.classList.add('active');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(drawer, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
    }
  }
}

function handleDrawerKeyPress(event) {
  if (event.key === 'Enter') {
    sendDrawerMessage();
  }
}

function sendDrawerMessage() {
  const input = document.getElementById('chat-drawer-input');
  const messages = document.getElementById('chat-drawer-messages');

  if (!input || !messages || input.value.trim() === '') return;

  const query = input.value.trim();
  input.value = '';

  // Append User message
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-msg user-msg';
  userBubble.innerText = query;
  messages.appendChild(userBubble);
  autoScrollDrawer();

  // Append Typing indicator
  const typingBubble = document.createElement('div');
  typingBubble.className = 'chat-msg assistant-msg';
  typingBubble.innerHTML = '<span style="font-size:11px; color:var(--text-secondary);">EcoSphere is analyzing...</span>';
  messages.appendChild(typingBubble);
  autoScrollDrawer();

  setTimeout(() => {
    messages.removeChild(typingBubble);

    const q = query.toLowerCase();
    let reply = "I'm analyzing your platform data now. Could you give me more context — are you asking about Environmental, Social, Governance metrics, or a specific report?";

    if (q.includes('carbon') || q.includes('emission') || q.includes('scope')) {
      reply = "📊 <strong>Carbon Emissions Update:</strong><br>Current Scope 1+2 emissions stand at <strong>7,840 tCO₂e</strong> against a 7,500 target (4.5% above). Scope 3 logistics disclosure gaps remain. Electrification plans project a <strong>6.8% Scope 2 reduction by Q4</strong> if proceeding on schedule.";
    } else if (q.includes('esg') || q.includes('score') || q.includes('index') || q.includes('rating')) {
      reply = "🌿 <strong>ESG Score Breakdown (Q2 2026):</strong><br>• Environmental: <strong>92%</strong> ↑4.2% YoY<br>• Social: <strong>84%</strong> — volunteer targets exceeded by 7%<br>• Governance: <strong>98%</strong> — G3.2 flag under final review<br>Overall ESG Index: <strong>91.2 / 100</strong>";
    } else if (q.includes('governance') || q.includes('policy') || q.includes('compliance') || q.includes('audit')) {
      reply = "⚖️ <strong>Governance Status:</strong><br>Policy compliance is at <strong>98.2%</strong>. The G3.2 Anti-Bribery policy draft (v3.2) is in review with <strong>310/324</strong> employee signatures collected. The H2 2026 audit cycle begins in 3 weeks — close outstanding signatures to avoid flag escalation.";
    } else if (q.includes('social') || q.includes('csr') || q.includes('volunteer') || q.includes('wellness') || q.includes('diversity')) {
      reply = "🤝 <strong>Social Impact Summary:</strong><br>• Volunteer hours: <strong>4,280 hrs</strong> (7% above Q2 target)<br>• CSR participation: <strong>87%</strong> of workforce<br>• Employee wellness score: <strong>78/100</strong><br>• Diversity ratio: <strong>46% inclusive</strong><br>The Beach Clean-up and Tech Mentorship events drove the highest engagement.";
    } else if (q.includes('environment') || q.includes('energy') || q.includes('renewable') || q.includes('water') || q.includes('waste')) {
      reply = "🌱 <strong>Environmental Metrics:</strong><br>• Renewable energy adoption: <strong>68%</strong> (target: 70%)<br>• Water conservation savings: <strong>12,400 m³</strong> this quarter<br>• Waste recycled: <strong>73%</strong><br>• Fleet electrification: <strong>34%</strong> complete<br>Solar grid installation at Warehouse B projected to add +4% renewable capacity.";
    } else if (q.includes('report') || q.includes('export') || q.includes('download') || q.includes('pdf')) {
      reply = "📄 <strong>Report Center:</strong><br>You have <strong>148 total reports</strong> with 7 pending generation. Navigate to the Report Center to export Environmental, Social, Governance, or custom reports as PDF, Excel, or CSV. The AI Summary panel auto-generates executive summaries for each report cycle.";
    } else if (q.includes('gamification') || q.includes('badge') || q.includes('xp') || q.includes('league') || q.includes('reward') || q.includes('coins')) {
      reply = "🏆 <strong>Eco League Status:</strong><br>You are at <strong>Level 4 (Diamond)</strong> with 2,840 XP. You have 847 Green Coins available for redemption. Complete this week's challenge — <em>'Submit 3 Scope 2 logs'</em> — to earn an extra 150 XP and the Carbon Sentinel badge.";
    } else if (q.includes('admin') || q.includes('department') || q.includes('employee') || q.includes('user')) {
      reply = "🛡️ <strong>Admin Overview:</strong><br>Managing <strong>324 employees</strong> across <strong>12 departments</strong>. Current system health is at 99.8% uptime. 3 pending policy acknowledgements and 1 new admin alert in the notification queue. Visit the Admin Portal for full RBAC controls and audit logs.";
    } else if (q.includes('innovation') || q.includes('lab') || q.includes('predict') || q.includes('forecast') || q.includes('ai')) {
      reply = "🤖 <strong>AI Innovation Lab:</strong><br>The Neural ESG Predictor shows a projected score of <strong>94.9</strong> at 69% renewable sourcing. The Carbon Forecast model predicts emissions will drop to <strong>7,420 tCO₂e</strong> by Q4. The Waste Neural Classifier is active — try scanning a waste item for instant category prediction.";
    } else if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('help') || q.includes('what can')) {
      reply = "👋 Hi there! I'm <strong>EcoSphere AI</strong>. I can help you with:<br>• 📊 ESG scores & carbon metrics<br>• ⚖️ Governance compliance status<br>• 🌱 Environmental & social insights<br>• 📄 Report generation & export<br>• 🏆 Gamification & rewards<br>Just ask me anything!";
    }

    const replyBubble = document.createElement('div');
    replyBubble.className = 'chat-msg assistant-msg';
    replyBubble.innerHTML = `<p>${reply}</p>`;
    messages.appendChild(replyBubble);
    autoScrollDrawer();
  }, 1200);
}

function autoScrollDrawer() {
  const messages = document.getElementById('chat-drawer-messages');
  if (messages) {
    messages.scrollTop = messages.scrollHeight;
  }
}

// 3. Dedicated AI Workspace Logic (`insights.html`)
function initInsightsWorkspace() {
  // Clear any existing floats on the dedicated workspace page
  const floatWidget = document.getElementById('floating-chat-widget');
  if (floatWidget) floatWidget.style.display = 'none';

  // Load first default session logs
  loadChatHistory('scope-3');
}

function loadChatHistory(sessionId) {
  const container = document.getElementById('chat-stream-container');
  if (!container) return;

  // Update active sidebar item class
  const items = document.querySelectorAll('.history-item');
  items.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('onclick').includes(sessionId)) {
      item.classList.add('active');
    }
  });

  // Load preset session conversation streams
  let html = '';
  if (sessionId === 'scope-3') {
    html = `
      <div class="chat-msg assistant-msg">
        <p>Scope 3 Logistics Review opened. How can I help you analyze transportation grid compliance today?</p>
      </div>
      <div class="chat-msg user-msg">
        <p>Verify if vendor logistics RFP contains carbon indicators.</p>
      </div>
      <div class="chat-msg assistant-msg">
        <p>I scanned the vendor RFP documentation. Anti-greenwashing policies are aligned, but <strong>Scope 3 carbon metrics are missing</strong> for the third-party shipping fleet. Recommending adding EPA emissions disclosures contract clauses before approval.</p>
      </div>
    `;
  } else if (sessionId === 'decarbon') {
    html = `
      <div class="chat-msg assistant-msg">
        <p>Decarbonization pathway analyzer loaded. I can run carbon calculations or transition pathway forecasts.</p>
      </div>
      <div class="chat-msg user-msg">
        <p>Show decarb trends for Q4.</p>
      </div>
      <div class="chat-msg assistant-msg">
        <p>Projected carbon output is trending down to 7,420 MT (a 4% decrease) based on manufacturing operations updates.</p>
      </div>
    `;
  } else if (sessionId === 'anti-bribery') {
    html = `
      <div class="chat-msg assistant-msg">
        <p>Anti-Bribery Audit G3.2 flag analysis opened. Anti-corruption policies are missing for international regional operations.</p>
      </div>
    `;
  } else {
    html = `
      <div class="chat-msg assistant-msg">
        <p>New conversation started. Ask me to run carbon calculations, explain ESG scores, or evaluate regulatory risks.</p>
      </div>
    `;
  }

  container.innerHTML = html;
  autoScrollWorkspace();
}

function resetWorkspaceChat() {
  loadChatHistory('new');
}

function autoScrollWorkspace() {
  const container = document.getElementById('chat-stream-container');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

// 4. Input Message sender in Workspace
function handleKeyPress(event) {
  if (event.key === 'Enter') {
    sendWorkspaceMessage();
  }
}

function sendWorkspaceMessage(customQuery = '') {
  const input = document.getElementById('chat-input');
  const container = document.getElementById('chat-stream-container');

  if (!container) return;
  const query = customQuery !== '' ? customQuery : (input ? input.value.trim() : '');
  
  if (query === '') return;
  if (input) input.value = '';

  // Append user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-msg user-msg';
  userBubble.innerText = query;
  container.appendChild(userBubble);
  autoScrollWorkspace();

  // Hide quick prompts on input
  const promptsGrid = document.getElementById('quick-prompts-grid');
  if (promptsGrid) promptsGrid.style.display = 'none';

  // Typing bubble
  const typingBubble = document.createElement('div');
  typingBubble.className = 'chat-msg assistant-msg';
  typingBubble.innerHTML = '<span style="font-size:11px; color:var(--text-secondary);">EcoSphere AI is typing...</span>';
  container.appendChild(typingBubble);
  autoScrollWorkspace();

  setTimeout(() => {
    container.removeChild(typingBubble);

    const q = query.toLowerCase();
    let reply = `I've received your query about <strong>"${query}"</strong>. Let me cross-reference EcoSphere's live ESG database for the most accurate insight.`;

    if (q.includes('volunteer') || q.includes('policy') || q.includes('csr')) {
      reply = `Here is a drafted <strong>Corporate Volunteer Policy Framework</strong>:<br><br>
        <strong>1. Objective</strong>: Encourage workforce community contribution aligned with CSRD Article 29.<br>
        <strong>2. Scope</strong>: 16 paid CSR volunteer hours allocated per employee annually.<br>
        <strong>3. Eligible Activities</strong>: Environmental restoration, primary education support, and community food programs.<br>
        <strong>4. Reporting</strong>: Hours logged via EcoSphere Social module, synced to ESG disclosure system.<br><br>
        This framework matches <strong>SEC and CSRD social guidelines</strong> for workforce engagement disclosure.`;
    } else if (q.includes('carbon') || q.includes('emission') || q.includes('scope')) {
      reply = `📊 <strong>Carbon Analysis — Q2 2026:</strong><br><br>
        • Scope 1 emissions: <strong>2,840 tCO₂e</strong> (direct operations)<br>
        • Scope 2 emissions: <strong>3,120 tCO₂e</strong> (purchased energy)<br>
        • Scope 3 emissions: <strong>1,880 tCO₂e</strong> (supply chain — disclosure gaps noted)<br>
        • <strong>Total: 7,840 tCO₂e</strong> vs 7,500 target (4.5% above)<br><br>
        AI Recommendation: Accelerate Warehouse B solar installation (+4% renewable) and mandate Scope 3 logistics carbon disclosures from top 10 suppliers.`;
    } else if (q.includes('esg') || q.includes('score') || q.includes('rating') || q.includes('index')) {
      reply = `🌿 <strong>ESG Performance Dashboard — Q2 2026:</strong><br><br>
        • Environmental Index: <strong>92%</strong> ↑4.2% YoY<br>
        • Social Index: <strong>84%</strong> — volunteer programme +7% above target<br>
        • Governance Index: <strong>98%</strong> — G3.2 Anti-Bribery under final review<br>
        • <strong>Overall ESG Score: 91.2 / 100</strong><br><br>
        Key risk: Scope 3 supply chain disclosure gaps may impact Q3 Environmental index by -2 to -4 points.`;
    } else if (q.includes('governance') || q.includes('compliance') || q.includes('audit') || q.includes('risk')) {
      reply = `⚖️ <strong>Governance Compliance Report:</strong><br><br>
        • Overall compliance index: <strong>98.2%</strong><br>
        • Active policies: <strong>24</strong> (1 pending approval — G3.2 Anti-Bribery v3.2)<br>
        • Outstanding signatures: <strong>14/324</strong> employees<br>
        • Next audit cycle: <strong>H2 2026</strong> (starts in 3 weeks)<br><br>
        Priority action: Collect remaining 14 signatures for G3.2 to clear the open flag before the audit cycle begins.`;
    } else if (q.includes('social') || q.includes('diversity') || q.includes('wellness') || q.includes('employee')) {
      reply = `🤝 <strong>Social Impact Analysis:</strong><br><br>
        • Volunteer hours Q2: <strong>4,280 hrs</strong> (+7% vs target)<br>
        • CSR programme participation: <strong>87%</strong> workforce<br>
        • Employee wellness score: <strong>78/100</strong><br>
        • Diversity & Inclusion ratio: <strong>46%</strong> inclusive representation<br>
        • Top programme: Beach Clean-up Initiative (340 participants)<br><br>
        Recommendation: Launch Q3 Digital Skills mentorship programme to push Social Index above 90%.`;
    } else if (q.includes('report') || q.includes('export') || q.includes('pdf') || q.includes('excel')) {
      reply = `📄 <strong>Report Generation Ready:</strong><br><br>
        Available reports:<br>
        • 🌱 Environmental Performance Q2 — <em>Ready for export</em><br>
        • 🤝 Social Impact Summary — <em>Ready for export</em><br>
        • ⚖️ Governance Compliance Report — <em>In Review (G3.2 flag)</em><br>
        • 📊 ESG Consolidated Summary — <em>Ready for export</em><br><br>
        Navigate to the <strong>Report Center</strong> to export as PDF, Excel, or CSV with AI-powered executive summaries.`;
    } else if (q.includes('predict') || q.includes('forecast') || q.includes('q4') || q.includes('future')) {
      reply = `🤖 <strong>AI Carbon Forecast — Q4 2026 Projection:</strong><br><br>
        Based on current electrification trajectory:<br>
        • Projected total emissions: <strong>7,420 tCO₂e</strong> (5.4% reduction vs Q2)<br>
        • Scope 2 reduction if Warehouse B solar completes: <strong>-6.8%</strong><br>
        • Renewable energy forecast: <strong>72%</strong> (exceeding 70% target)<br><br>
        Confidence level: <strong>87%</strong> — contingent on Operations electrification plan proceeding as scheduled.`;
    }

    const replyBubble = document.createElement('div');
    replyBubble.className = 'chat-msg assistant-msg';
    replyBubble.innerHTML = `<p>${reply}</p>`;
    container.appendChild(replyBubble);
    autoScrollWorkspace();
  }, 1200);
}

// 5. Quick Prompt tiles triggers
function triggerQuickPrompt(promptType) {
  const container = document.getElementById('chat-stream-container');
  const promptsGrid = document.getElementById('quick-prompts-grid');

  if (!container) return;
  if (promptsGrid) promptsGrid.style.display = 'none';

  // Append User message bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-msg user-msg';

  let typingText = "Processing query...";
  let responseHTML = "";
  let chartId = "";

  if (promptType === 'explain-esg') {
    userBubble.innerText = "Explain EcoSphere ESG Scores";
    typingText = "Evaluating E, S, G sub-scores...";
    chartId = "inline-chart-esg";
    responseHTML = `
      <p>Here is the breakdown of your corporate ESG indices:</p>
      <ul>
        <li><strong>Environmental Index (92%)</strong>: Strong performance in solar carbon offsets, offset by Scope 3 shipping gaps.</li>
        <li><strong>Social Index (84%)</strong>: High volunteer hours compliance, with opportunities in wellness.</li>
        <li><strong>Governance Index (98%)</strong>: High rating, G3.2 anti-bribery flag resolved.</li>
      </ul>
      <div class="inline-chart-container" id="${chartId}"></div>
    `;
  } else if (promptType === 'predict-carbon') {
    userBubble.innerText = "Predict Carbon Emissions Q4";
    typingText = "Calculating emissions transition projections...";
    chartId = "inline-chart-carbon";
    responseHTML = `
      <p>I calculated emissions transition projections for the next 4 quarters. Electrification parameters reduce projected Scope 2 emissions by 14%.</p>
      <div class="inline-chart-container" id="${chartId}"></div>
    `;
  } else if (promptType === 'analyze-docs') {
    userBubble.innerText = "Analyze Compliance Document";
    typingText = "Parsing policy text...";
    responseHTML = `
      <p><strong>RFP Supply Chain Policy Audit</strong>:</p>
      <ul>
        <li>❌ Clause 4.2: Missing Scope 3 supplier carbon disclosures.</li>
        <li>✅ Clause 8.1: Anti-greenwashing policies verified.</li>
        <li>✅ Clause 12.3: Anti-corruption governance signed off.</li>
      </ul>
      <p style="color: #ef4444; font-weight: 600;">1 audit gap identified.</p>
    `;
  } else if (promptType === 'recommend-goals') {
    userBubble.innerText = "Recommend ESG Goals";
    typingText = "Drafting roadmaps...";
    responseHTML = `
      <p>Recommending the following Q4 sustainability targets:</p>
      <ol>
        <li>Establish Scope 3 supplier carbon disclosures rules.</li>
        <li>Achieve 90% volunteer participation.</li>
      </ol>
      <p>You can push these targets to dashboard trackers using this API payload block:</p>
      <pre class="code-block-markdown"><code>{
  <span class="code-keyword">"target"</span>: <span class="code-string">"Scope 3 Logistics"</span>,
  <span class="code-keyword">"targetYear"</span>: <span class="code-number">2026</span>,
  <span class="code-keyword">"compliance"</span>: <span class="code-string">"SEC Rule 4B"</span>
}</code></pre>
    `;
  }

  container.appendChild(userBubble);
  autoScrollWorkspace();

  // Typing indicator
  const typingBubble = document.createElement('div');
  typingBubble.className = 'chat-msg assistant-msg';
  typingBubble.innerHTML = `<span style="font-size:11px; color:var(--text-secondary);">${typingText}</span>`;
  container.appendChild(typingBubble);
  autoScrollWorkspace();

  setTimeout(() => {
    container.removeChild(typingBubble);

    const replyBubble = document.createElement('div');
    replyBubble.className = 'chat-msg assistant-msg';
    replyBubble.innerHTML = responseHTML;
    container.appendChild(replyBubble);
    autoScrollWorkspace();

    // Render EChart inside chat bubble if needed
    if (chartId === 'inline-chart-esg') {
      renderInlineESGChart(chartId);
    } else if (chartId === 'inline-chart-carbon') {
      renderInlineCarbonChart(chartId);
    }
  }, 1500);
}

// 6. Inline ECharts instantiations
function renderInlineESGChart(domId) {
  const dom = document.getElementById(domId);
  if (!dom || typeof echarts === 'undefined') return;

  const chart = echarts.init(dom);
  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '8%', bottom: '3%', top: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      max: 100,
      splitLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: ['Governance', 'Social', 'Environmental'],
      axisLine: { show: false }
    },
    series: [
      {
        name: 'Score %',
        type: 'bar',
        data: [98, 84, 92],
        itemStyle: {
          color: function (params) {
            const colors = ['#a855f7', '#3b82f6', '#10b981'];
            return colors[params.dataIndex];
          },
          borderRadius: 4
        }
      }
    ]
  });
}

function renderInlineCarbonChart(domId) {
  const dom = document.getElementById(domId);
  if (!dom || typeof echarts === 'undefined') return;

  const chart = echarts.init(dom);
  chart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '8%', bottom: '3%', top: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Q1', 'Q2', 'Q3', 'Q4 (Proj)'],
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
    },
    series: [
      {
        name: 'Carbon output MT',
        type: 'line',
        smooth: true,
        data: [8200, 7900, 7600, 7420],
        itemStyle: { color: '#a855f7' },
        lineStyle: { width: 3 }
      }
    ]
  });
}

// 7. Voice Assistant Controls
function toggleVoiceAssistant() {
  const overlay = document.getElementById('voice-wave-overlay');
  if (!overlay) return;

  isListening = !isListening;
  if (isListening) {
    overlay.classList.add('active');
    
    // Simulate listening speech timeout
    setTimeout(() => {
      if (isListening) {
        toggleVoiceAssistant(); // Close
        sendWorkspaceMessage("Draft a corporate volunteer policy");
      }
    }, 2800);
  } else {
    overlay.classList.remove('active');
  }
}

// 8. Smart Document attachments
function triggerFileInput() {
  const uploader = document.getElementById('file-uploader');
  if (uploader) uploader.click();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const container = document.getElementById('chat-stream-container');
  if (!container) return;

  // Append user bubble showing attached document name
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-msg user-msg';
  userBubble.innerHTML = `<p><i data-lucide="file-text" style="width:14px; height:14px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Attached: <strong>${file.name}</strong></p>`;
  container.appendChild(userBubble);
  autoScrollWorkspace();

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Loader card in chat stream
  const loaderCard = document.createElement('div');
  loaderCard.className = 'chat-msg assistant-msg';
  loaderCard.innerHTML = `
    <div class="upload-progress-card">
      <span style="font-size:11px; font-weight:600; color:var(--text-secondary);">EcoSphere AI is scanning document structures...</span>
      <div class="modal-progress-bar" style="margin-top:6px;">
        <div class="upload-progress-fill" id="doc-upload-fill"></div>
      </div>
    </div>
  `;
  container.appendChild(loaderCard);
  autoScrollWorkspace();

  // Animate progress bar
  setTimeout(() => {
    const fill = document.getElementById('doc-upload-fill');
    if (fill) fill.style.width = '100%';
  }, 100);

  setTimeout(() => {
    container.removeChild(loaderCard);

    // Append response audit checklist
    const replyBubble = document.createElement('div');
    replyBubble.className = 'chat-msg assistant-msg';
    replyBubble.innerHTML = `
      <p>I completed scanning <strong>${file.name}</strong> against SEC and CSRD frameworks.</p>
      <ul>
        <li>✅ Board diversity ratios aligned (Section 3).</li>
        <li>❌ Anti-bribery G3.2 compliance guidelines missing international operations parameters.</li>
      </ul>
      <p style="color:#ef4444; font-weight:600;">1 compliance gap flagged. Recommendation: update international anti-corruption statements.</p>
    `;
    container.appendChild(replyBubble);
    autoScrollWorkspace();
  }, 1800);
}
