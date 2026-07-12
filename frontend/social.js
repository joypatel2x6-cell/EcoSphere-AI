// EcoSphere AI - Social ESG Module Logic & Interactions

let volunteerChart = null;
let diversityRadarChart = null;
let currentTheme = 'dark';

// Default ECharts Data
let actualHours = [120, 240, 410, 620, 880, 1100, 1280];
let targetHours = [150, 300, 450, 600, 750, 900, 1050, 1200, 1350, 1500, 1650, 1800];

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Initialize Theme System
  initSocialTheme();

  // 3. Initialize Notifications
  initNotificationsToggler();

  // 4. Initialize SVG Progress Rings
  animateProgressRings();

  // 5. Initialize ECharts (Line & Radar)
  initSocialCharts();

  // 6. Generate July Volunteer Calendar Grid
  generateVolunteerCalendar();

  // 7. Load Department Leaderboards
  loadDepartmentLeaderboard();

  // 8. Bind search logs filter
  initSocialSearch();
});

// 1. Theme Synchronization
function initSocialTheme() {
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
      syncChartThemes();
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
  setProgressRing('diversity', 52);
  setProgressRing('participation', 84);
  setProgressRing('wellness', 82);
  setProgressRing('training', 96);
}

function setProgressRing(id, percent) {
  const circle = document.getElementById(`ring-${id}`);
  const textVal = document.getElementById(`ring-val-${id}`);
  if (!circle || !textVal) return;

  const circumference = 2 * Math.PI * 30; // r = 30
  const offset = circumference - (percent / 100) * circumference;

  circle.style.strokeDashoffset = offset;
  textVal.innerText = `${percent}%`;
}

// 4. ECharts Configurations
function initSocialCharts() {
  const lineDom = document.getElementById('volunteer-hours-chart');
  const radarDom = document.getElementById('diversity-radar-chart');

  if (lineDom && typeof echarts !== 'undefined') {
    volunteerChart = echarts.init(lineDom);
    volunteerChart.setOption(getLineChartOptions(currentTheme === 'light'));
  }

  if (radarDom && typeof echarts !== 'undefined') {
    diversityRadarChart = echarts.init(radarDom);
    diversityRadarChart.setOption(getRadarChartOptions(currentTheme === 'light'));
  }

  window.addEventListener('resize', () => {
    if (volunteerChart) volunteerChart.resize();
    if (diversityRadarChart) diversityRadarChart.resize();
  });
}

function getLineChartOptions(isLight) {
  const textColor = isLight ? '#475569' : '#9ca3af';
  const gridLineColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.05)';

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(15, 23, 42, 0.95)',
      borderColor: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: { color: isLight ? '#0f172a' : '#f9fafb' }
    },
    legend: {
      data: ['Actual Volunteer Hours', 'Target Pathway'],
      textStyle: { color: textColor, fontFamily: 'Inter' },
      bottom: '0%'
    },
    grid: {
      left: '4%',
      right: '4%',
      bottom: '12%',
      top: '8%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      axisLine: { lineStyle: { color: gridLineColor } },
      axisLabel: { color: textColor, fontFamily: 'Inter' }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: gridLineColor } },
      axisLabel: { 
        color: textColor, 
        fontFamily: 'Inter',
        formatter: '{value} h'
      }
    },
    series: [
      {
        name: 'Actual Volunteer Hours',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#3b82f6' }, // Blue
        lineStyle: { width: 3, color: '#3b82f6' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.2)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0)' }
          ])
        },
        data: actualHours
      },
      {
        name: 'Target Pathway',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, type: 'dashed', color: '#10b981' }, // Green dashed
        itemStyle: { color: '#10b981' },
        data: targetHours
      }
    ]
  };
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
        { name: 'Gender Equity', max: 100 },
        { name: 'Cultural Representation', max: 100 },
        { name: 'Age Balanced Distribution', max: 100 },
        { name: 'Leadership Diversity', max: 100 },
        { name: 'Adjusted Pay Equity', max: 100 }
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
        name: 'Diversity Indices',
        type: 'radar',
        data: [
          {
            value: [82, 78, 85, 68, 88],
            name: 'EcoSphere Actual Index',
            itemStyle: { color: '#3b82f6' },
            lineStyle: { width: 2 },
            areaStyle: { color: 'rgba(59, 130, 246, 0.25)' }
          },
          {
            value: [90, 90, 90, 90, 90],
            name: 'Target Threshold Pathway',
            itemStyle: { color: '#10b981' },
            lineStyle: { width: 1, type: 'dashed' }
          }
        ]
      }
    ]
  };
}

function syncChartThemes() {
  const isLight = currentTheme === 'light';
  if (volunteerChart) volunteerChart.setOption(getLineChartOptions(isLight));
  if (diversityRadarChart) diversityRadarChart.setOption(getRadarChartOptions(isLight));
}

// 5. CSR Volunteer Calendar Generator (July 2026 starts on Wednesday)
function generateVolunteerCalendar() {
  const container = document.getElementById('calendar-days-container');
  if (!container) return;

  // July 2026 starts on a Wednesday, so offset is 2 days
  for (let empty = 0; empty < 2; empty++) {
    const emptyBox = document.createElement('div');
    emptyBox.className = 'calendar-day-box';
    emptyBox.style.opacity = '0.1';
    container.appendChild(emptyBox);
  }

  for (let day = 1; day <= 31; day++) {
    const dayBox = document.createElement('div');
    dayBox.className = 'calendar-day-box';
    
    // Highlight today (say, July 12)
    if (day === 12) {
      dayBox.classList.add('today');
    }

    dayBox.innerHTML = `<span class="calendar-day-num">${day}</span>`;

    // Add specific scheduled events
    if (day === 18) {
      dayBox.innerHTML += `
        <div class="calendar-event" id="event-river" onclick="joinVolunteerEvent('river', 18)">
          River Clean-up
        </div>
      `;
    }

    if (day === 25) {
      dayBox.innerHTML += `
        <div class="calendar-event" id="event-solar" onclick="joinVolunteerEvent('solar', 25)">
          Solar Installation
        </div>
      `;
    }

    container.appendChild(dayBox);
  }
}

function joinVolunteerEvent(eventId, dayNum) {
  const eventCard = document.getElementById(`event-${eventId}`);
  if (!eventCard || eventCard.classList.contains('joined')) return;

  eventCard.innerText = 'Joined ✔';
  eventCard.classList.add('joined');

  // Increment KPI progress values
  const currentParticipation = 84;
  setProgressRing('participation', currentParticipation + 2); // Simulates participation increment

  // Shift volunteer hours chart data slightly
  actualHours[6] += 24; // Add 24 volunteer hours to July actual data
  if (volunteerChart) {
    volunteerChart.setOption({
      series: [
        { data: actualHours }
      ]
    });
  }

  // Prepend activity to table logs
  const tableBody = document.getElementById('leaderboard-table-body');
  if (tableBody) {
    const newRow = document.createElement('tr');
    newRow.style.animation = 'message-fade 0.5s ease forwards';
    newRow.innerHTML = `
      <td style="font-weight: 600; color: var(--primary);">Personal Participation</td>
      <td>1 Employee</td>
      <td>100.0%</td>
      <td>+24 Hrs (Registered)</td>
      <td>9.8/10</td>
      <td><span class="status-pill status-completed">Active Joined</span></td>
    `;
    tableBody.insertBefore(newRow, tableBody.firstChild);
  }
}

// 6. Notion AI Employee Sentiment scan
function runSentimentScan() {
  const scanBtn = document.getElementById('sentiment-scan-btn');
  const face = document.getElementById('sentiment-face');
  const pct = document.getElementById('sentiment-percentage');
  const bar = document.getElementById('sentiment-bar');
  const barPct = document.getElementById('sentiment-bar-pct');
  const summary = document.getElementById('sentiment-summary');

  if (!scanBtn) return;

  scanBtn.innerHTML = 'Scanning logs...';
  scanBtn.disabled = true;

  // Sentiment faces animation
  const faces = ['😐', '🤔', '😊', '🤩'];
  let idx = 0;
  const faceInterval = setInterval(() => {
    if (face) face.innerText = faces[idx];
    idx = (idx + 1) % faces.length;
  }, 250);

  setTimeout(() => {
    clearInterval(faceInterval);
    scanBtn.innerHTML = 'Scan Completed ✓';
    scanBtn.classList.add('approved');

    // Update readouts
    if (face) face.innerText = '🤩';
    if (pct) pct.innerText = '88% Positive';
    if (barPct) barPct.innerText = '88%';
    if (bar) {
      bar.style.width = '88%';
      bar.style.backgroundColor = '#10b981'; // Green
    }
    if (summary) {
      summary.innerText = "Key satisfaction drivers: Paid volunteer hours expansion (Jul 12), solar grid integration, and modern employee feedback loops.";
    }

    // Update Wellness KPI
    setProgressRing('wellness', 86);
  }, 1800);
}

// 7. Load Department engagement table
function loadDepartmentLeaderboard() {
  const tableBody = document.getElementById('leaderboard-table-body');
  if (!tableBody) return;

  const departments = [
    { name: 'Research & Development', size: 120, training: '98.5%', hours: '840 Hrs', wellness: '8.4/10', status: 'Optimal involvement' },
    { name: 'Logistics Operations', size: 250, training: '94.2%', hours: '1,120 Hrs', wellness: '7.9/10', status: 'Optimal involvement' },
    { name: 'Sales & Customer Success', size: 85, training: '96.0%', hours: '310 Hrs', wellness: '8.2/10', status: 'Stable involvement' },
    { name: 'Facilities Management', size: 45, training: '100.0%', hours: '480 Hrs', wellness: '8.8/10', status: 'Optimal involvement' }
  ];

  tableBody.innerHTML = '';
  departments.forEach(dept => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600;">${dept.name}</td>
      <td>${dept.size} Employees</td>
      <td>${dept.training}</td>
      <td style="font-weight: 600; color: var(--primary);">${dept.hours}</td>
      <td>${dept.wellness}</td>
      <td><span class="status-pill status-completed">${dept.status}</span></td>
    `;
    tableBody.appendChild(tr);
  });
}

// 8. Search Filter
function initSocialSearch() {
  const searchInput = document.getElementById('social-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#leaderboard-table-body tr');
    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });
  });
}

// 9. Simulated exporters
function exportSocialReport(fileType) {
  const btn = document.getElementById(`export-${fileType}-btn`);
  if (!btn) return;

  btn.classList.add('loading');
  btn.disabled = true;

  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;
    alert(`Initiating download for: EcoSphere_Social_Involvement_Q3.${fileType === 'pdf' ? 'pdf' : 'xlsx'}`);
  }, 1500);
}

// 10. Quick Actions (Compiler modals)
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
