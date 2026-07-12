// EcoSphere AI - Governance ESG Module Logic & Risk Analyzers

let riskRadarChart = null;
let currentTheme = 'dark';

// Default Risk Radar data values
let riskRadarValues = [80, 65, 40, 52]; // Reg, Climate, Financial, Ops

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Initialize Theme System
  initGovTheme();

  // 3. Initialize Notifications
  initNotificationsToggler();

  // 4. Initialize SVG Progress Rings
  animateProgressRings();

  // 5. Initialize ECharts Radar Chart
  initRiskRadarChart();

  // 6. Load default timeline logs
  loadDefaultTimeline();

  // 7. Bind search filters for timelines
  initTimelineSearch();
});

// 1. Theme Management Sync
function initGovTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') {
    htmlRoot.classList.add('light');
    currentTheme = 'light';
  } else {
    htmlRoot.classList.remove('light');
    currentTheme = 'dark';
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      htmlRoot.classList.toggle('light');
      currentTheme = htmlRoot.classList.contains('light') ? 'light' : 'dark';
      localStorage.setItem('theme', currentTheme);

      // Redraw ECharts
      if (riskRadarChart) {
        riskRadarChart.setOption(getRadarChartOptions(currentTheme === 'light'));
      }
    });
  }
}

// 2. Notifications Drawer Toggle
function initNotificationsToggler() {
  const notifBtn = document.getElementById('notif-toggle-btn');
  const notifBox = document.getElementById('notifications-box');

  if (notifBtn && notifBox) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifBox.classList.toggle('active');
      const badge = notifBtn.querySelector('.notification-badge');
      if (badge) badge.style.display = 'none';
    });

    document.addEventListener('click', (e) => {
      if (!notifBox.contains(e.target) && e.target !== notifBtn) {
        notifBox.classList.remove('active');
      }
    });
  }
}

// 3. SVG Progress Rings
function animateProgressRings() {
  setProgressRing('policy', 98);
  setProgressRing('audit', 100);
  setProgressRing('flags', 10); // 1 active flag = 10%
  setProgressRing('risk', 24); // Low risk base index
}

function setProgressRing(id, percent) {
  const circle = document.getElementById(`ring-${id}`);
  const textVal = document.getElementById(`ring-val-${id}`);
  if (!circle || !textVal) return;

  const circumference = 2 * Math.PI * 30; // r = 30
  const offset = circumference - (percent / 100) * circumference;

  circle.style.strokeDashoffset = offset;
  
  // Custom display overrides for count values
  if (id === 'flags') {
    textVal.innerText = percent === 0 ? '0' : '1';
  } else {
    textVal.innerText = `${percent}%`;
  }
}

// 4. ECharts Risk Radar Chart
function initRiskRadarChart() {
  const radarDom = document.getElementById('risk-radar-chart');
  if (!radarDom || typeof echarts === 'undefined') return;

  riskRadarChart = echarts.init(radarDom);
  const isLight = document.documentElement.classList.contains('light');
  riskRadarChart.setOption(getRadarChartOptions(isLight));

  window.addEventListener('resize', () => {
    if (riskRadarChart) riskRadarChart.resize();
  });
}

function getRadarChartOptions(isLight) {
  const textColor = isLight ? '#475569' : '#9ca3af';
  const gridLineColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.05)';

  return {
    backgroundColor: 'transparent',
    tooltip: {
      backgroundColor: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(15, 23, 42, 0.95)',
      borderColor: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: { color: isLight ? '#0f172a' : '#f9fafb' }
    },
    radar: {
      indicator: [
        { name: 'Regulatory & compliance', max: 100 },
        { name: 'Climate & transition', max: 100 },
        { name: 'ESG greenwashing risk', max: 100 },
        { name: 'Supply Chain operations', max: 100 }
      ],
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: textColor, fontFamily: 'Inter', fontSize: 11 },
      splitLine: { lineStyle: { color: gridLineColor } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: gridLineColor } }
    },
    series: [
      {
        name: 'ESG Risk Vectors',
        type: 'radar',
        data: [
          {
            value: riskRadarValues,
            name: 'Audit Actual Probability',
            itemStyle: { color: '#a855f7' },
            lineStyle: { width: 3 },
            areaStyle: { color: 'rgba(168, 85, 247, 0.25)' }
          }
        ]
      }
    ]
  };
}

// 5. AI Risk Calculator prediction
function calculateOperationalRisk(e) {
  e.preventDefault();

  const category = document.getElementById('risk-category').value;
  const scope = document.getElementById('risk-scope').value;
  const desc = document.getElementById('risk-desc').value;

  const resultType = document.getElementById('risk-result-type');
  const resultLevel = document.getElementById('risk-result-level');
  const resultRecom = document.getElementById('risk-result-recommendation');

  if (!resultType || !resultLevel || !resultRecom) return;

  // Set Loading
  resultLevel.innerText = 'Calculating...';
  resultLevel.style.color = 'var(--text-muted)';
  resultRecom.innerText = 'EcoSphere AI is running Monte Carlo simulations across Scope 1-3 audit paths.';

  setTimeout(() => {
    let level = 'Low Risk';
    let color = '#10b981'; // Green
    let recommendation = 'Optimal compliance setup. Proceed with standard reporting.';
    let factorValue = 18;

    if (category === 'regulatory') {
      level = 'Extreme Risk';
      color = '#ef4444'; // Red
      recommendation = 'SEC filing rules requires audited grid records. Restrict supplier contracts until logs are provided.';
      factorValue = 88;
    } else if (category === 'financial') {
      level = 'High Risk';
      color = '#f59e0b'; // Orange
      recommendation = 'Greenwashing threat detected. Verify carbon offset metrics before publishing public CSR reports.';
      factorValue = 72;
    } else if (category === 'operational') {
      level = 'Medium Risk';
      color = '#f59e0b';
      recommendation = 'Supply chain bottleneck potential. Verify supplier energy sources.';
      factorValue = 54;
    }

    resultType.innerText = scope;
    resultLevel.innerText = level;
    resultLevel.style.color = color;
    resultRecom.innerText = recommendation;

    // Shift KPI Risk Index ring
    setProgressRing('risk', factorValue);
    const kpiRiskText = document.getElementById('kpi-risk-text');
    if (kpiRiskText) {
      kpiRiskText.innerText = factorValue > 70 ? 'High Risk Index' : factorValue > 40 ? 'Medium Risk Index' : 'Low Risk Index';
    }

    // Update ECharts Risk Radar variables dynamically
    if (category === 'regulatory') riskRadarValues[0] = factorValue;
    else if (category === 'environmental') riskRadarValues[1] = factorValue;
    else if (category === 'financial') riskRadarValues[2] = factorValue;
    else if (category === 'operational') riskRadarValues[3] = factorValue;

    if (riskRadarChart) {
      riskRadarChart.setOption({
        series: [
          { data: [{ value: riskRadarValues }] }
        ]
      });
    }

    // Prepend row to table
    const tableBody = document.getElementById('gov-table-body');
    if (tableBody) {
      const now = new Date();
      const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      const regId = 'REG-' + Math.floor(10000 + Math.random() * 90000);

      const newRow = document.createElement('tr');
      newRow.style.animation = 'message-fade 0.5s ease forwards';
      newRow.innerHTML = `
        <td>${timeStr}</td>
        <td class="font-mono" style="font-size: 11px;">${regId}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="trans-cat-icon cat-purchase"><i data-lucide="shield-alert" style="width: 12px; height: 12px;"></i></span>
            <span>AI Risk Assessment</span>
          </div>
        </td>
        <td>CSO Executive</td>
        <td style="font-size: 11.5px; color: var(--text-secondary);">Scope: ${scope} (${level})</td>
        <td><span class="status-pill status-completed">Evaluated</span></td>
      `;
      tableBody.insertBefore(newRow, tableBody.firstChild);

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }
  }, 1500);
}

// 6. Board document approvals workflows
function approveDocument(docId) {
  const card = document.getElementById(`approve-${docId}`);
  if (!card) return;

  card.classList.add('approved');
  const btn = card.querySelector('.btn-approve');
  if (btn) {
    btn.innerText = 'Approved ✓';
    btn.disabled = true;
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
  }

  // If G3.2 Anti-Bribery is approved, remove active compliance flags!
  if (docId === 'anti-bribery') {
    // Sync sidebar badges and topbar notifications
    const sidebarBadge = document.getElementById('sidebar-notif-flag');
    if (sidebarBadge) {
      sidebarBadge.style.display = 'none';
    }
    
    const headerBadge = document.getElementById('header-notif-badge');
    if (headerBadge) {
      headerBadge.style.display = 'none';
    }

    const notifItem = document.getElementById('notif-flag-item');
    if (notifItem) {
      notifItem.style.opacity = '0.4';
      notifItem.classList.remove('unread');
    }

    // Update KPI rings from 1 flags to 0 flags
    setProgressRing('flags', 0);
    const kpiFlagsText = document.getElementById('kpi-flags-text');
    if (kpiFlagsText) kpiFlagsText.innerText = '0 Active Flags';

    // Update Policy compliance rate to 100%
    setProgressRing('policy', 100);
  }

  // Prepend timeline log
  const tableBody = document.getElementById('gov-table-body');
  if (tableBody) {
    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const regId = 'REG-' + Math.floor(10000 + Math.random() * 90000);

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>${timeStr}</td>
      <td class="font-mono" style="font-size: 11px;">${regId}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="trans-cat-icon cat-mfg"><i data-lucide="check-square" style="width: 12px; height: 12px;"></i></span>
          <span>Board Approval</span>
        </div>
      </td>
      <td>CSO Joy Patel</td>
      <td style="font-size: 11.5px; color: var(--text-secondary);">Approved: ${card.querySelector('h6').innerText}</td>
      <td><span class="status-pill status-completed">Signed Off</span></td>
    `;
    tableBody.insertBefore(newRow, tableBody.firstChild);

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
}

// 7. Policy Acknowledgment Document Repository
function acknowledgePolicy(docId) {
  const item = document.getElementById(`doc-${docId}`);
  if (!item) return;

  const btn = item.querySelector('.doc-acknowledge-btn');
  if (btn) {
    btn.innerText = 'Acknowledged ✓';
    btn.classList.add('acknowledged');
    btn.disabled = true;
  }

  // Update Policy compliance progress ring
  setProgressRing('policy', 99); // Simulates increment
}

// 8. Load Default Timelines table logs
function loadDefaultTimeline() {
  const tableBody = document.getElementById('gov-table-body');
  if (!tableBody) return;

  const logs = [
    { due: 'Jul 30, 2026', id: 'REG-84092', cat: 'G3.2 Anti-Bribery', owner: 'Joy Patel', desc: 'Board review anti-bribery revision disclosure', status: 'Pending Approval', type: 'pending' },
    { due: 'Aug 15, 2026', id: 'REG-12408', cat: 'SEC Disclosure', owner: 'Compliance Bot', desc: 'Scope 1-2 carbon disclosure ledger submission', status: 'In Review', type: 'pending' },
    { due: 'Jun 30, 2026', id: 'REG-90240', cat: 'CSRD EU Mandate', owner: 'David Vance', desc: 'CSRD Directive G1.4 alignment audit', status: 'Filing Complete', type: 'completed' },
    { due: 'Jun 15, 2026', id: 'REG-30495', cat: 'Board Ethics G2', owner: 'Sarah Jenkins', desc: 'Code of Ethical Conduct board signature', status: 'Filing Complete', type: 'completed' }
  ];

  tableBody.innerHTML = '';
  logs.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.due}</td>
      <td class="font-mono" style="font-size: 11px;">${item.id}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="trans-cat-icon ${item.type === 'completed' ? 'cat-mfg' : 'cat-expense'}"><i data-lucide="${item.type === 'completed' ? 'check' : 'alert-circle'}" style="width: 12px; height: 12px;"></i></span>
          <span>${item.cat}</span>
        </div>
      </td>
      <td>${item.owner}</td>
      <td style="font-size: 11.5px; color: var(--text-secondary);">${item.desc}</td>
      <td><span class="status-pill ${item.type === 'completed' ? 'status-completed' : 'status-pending'}">${item.status}</span></td>
    `;
    tableBody.appendChild(tr);
  });

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// 9. Timeline Search Filter
function initTimelineSearch() {
  const searchInput = document.getElementById('governance-search');
  const tableSearchInput = document.getElementById('table-search');

  const filterTable = (query) => {
    const rows = document.querySelectorAll('#gov-table-body tr');
    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });
  };

  if (searchInput) {
    searchInput.addEventListener('input', (e) => filterTable(e.target.value.toLowerCase()));
  }

  if (tableSearchInput) {
    tableSearchInput.addEventListener('input', (e) => filterTable(e.target.value.toLowerCase()));
  }
}

// 10. Simulated Exporters
function exportGovernanceReport(fileType) {
  const btn = document.getElementById(`export-${fileType}-btn`);
  if (!btn) return;

  btn.classList.add('loading');
  btn.disabled = true;

  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;
    alert(`Initiating download for: EcoSphere_Governance_Compliance_Q3.${fileType === 'pdf' ? 'pdf' : 'xlsx'}`);
  }, 1500);
}

// 11. Quick Actions Modal Compiler
function openQuickActionModal() {
  const modal = document.getElementById('quick-action-modal');
  if (modal) {
    modal.classList.add('active');
    modal.querySelector('.modal-card').style.transform = 'scale(0.95)';
    gsap.to(modal.querySelector('.modal-card'), { transform: 'scale(1)', duration: 0.3, ease: 'back.out(1.5)' });
  }
}

function closeQuickActionModal() {
  const modal = document.getElementById('quick-action-modal');
  if (modal) {
    gsap.to(modal.querySelector('.modal-card'), {
      transform: 'scale(0.95)',
      duration: 0.2,
      onComplete: () => {
        modal.classList.remove('active');
      }
    });
  }
}

function runSimulatedAudit() {
  const body = document.getElementById('modal-body-content');
  if (!body) return;

  body.innerHTML = `
    <div style="text-align: center; padding: 20px 0;">
      <i data-lucide="sparkles" class="weather-icon-animated" style="color: #a855f7; width: 44px; height: 44px; margin-bottom: 16px;"></i>
      <h5 style="font-weight: 700; font-size: 16px; margin-bottom: 6px;">Analyzing Ledger Blocks...</h5>
      <p style="font-size: 12px; color: var(--text-secondary);">EcoSphere AI is scanning 84 utility registers and Scope 3 databases.</p>
      
      <div class="modal-progress-bar">
        <div class="modal-progress-fill" id="audit-progress-fill"></div>
      </div>
      <span id="audit-progress-text" style="font-size: 11px; font-weight: 600; color: var(--primary); margin-top: 10px; display: block;">0% Complete</span>
    </div>
  `;

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  setTimeout(() => {
    const bar = document.getElementById('audit-progress-fill');
    const txt = document.getElementById('audit-progress-text');
    if (bar) bar.style.width = '100%';

    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(100, progress + 4);
      if (txt) txt.innerText = `${progress}% Complete`;
      if (progress === 100) {
        clearInterval(interval);
        showAuditCompletion();
      }
    }, 100);
  }, 100);
}

function showAuditCompletion() {
  const body = document.getElementById('modal-body-content');
  if (!body) return;

  body.innerHTML = `
    <div style="text-align: center; padding: 20px 0; animation: message-fade 0.5s ease forwards;">
      <div style="width: 50px; height: 50px; border-radius: 50%; background: rgba(16, 185, 129, 0.1); border: 2px solid var(--primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px auto; color: var(--primary);">
        <i data-lucide="check" style="width: 24px; height: 24px;"></i>
      </div>
      <h5 style="font-weight: 700; font-size: 16px; margin-bottom: 6px;">Audit Scope Compiled</h5>
      <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.5; max-width: 320px; margin: 0 auto;">
        CSRD compliance report successfully generated and saved to document directory.
      </p>
      
      <button class="btn btn-secondary" style="margin-top: 24px; width: 100%; justify-content: center;" onclick="closeQuickActionModal(); reloadModalOriginalState();">Close Panel</button>
    </div>
  `;

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function reloadModalOriginalState() {
  setTimeout(() => {
    const body = document.getElementById('modal-body-content');
    if (!body) return;
    body.innerHTML = `
      <p style="font-size: 13.5px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 20px;">
        Trigger EcoSphere AI Core to run an instant Scope 1-3 audit sweep across all department ledgers and compile an audit-ready CSR report.
      </p>
      <div class="form-group">
        <label style="font-size: 11px; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 8px;">Target Framework</label>
        <select class="form-control" style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); color: var(--text-primary);">
          <option>CSRD Directive (EU Mandate)</option>
          <option>SEC Climate Disclosure Rule</option>
          <option>GRI Disclosure Framework</option>
          <option>GRESB Real Estate Standard</option>
        </select>
      </div>
      <button class="btn btn-premium" style="width: 100%; justify-content: center; margin-top: 24px;" onclick="runSimulatedAudit()">Compile Disclosures <i data-lucide="sparkles"></i></button>
    `;
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }, 300);
}
