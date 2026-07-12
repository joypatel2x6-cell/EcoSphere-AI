// EcoSphere AI - SaaS Dashboard Logic (Linear/Stripe/Notion AI Integration)

let mainChart = null;
let deptChart = null;
let currentTheme = 'dark';

// Chart base data arrays
let actualEmissions = [12200, 11800, 11500, 10900, 10500, 9800, 9400, 9100];
let targetEmissions = [12000, 11500, 11000, 10500, 10000, 9500, 9000, 8500, 8000, 7500, 7000, 6500];
let forecastEmissions = [null, null, null, null, null, null, null, 9100, 8600, 8200, 7800, 7300];

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Initialize Theme Mode
  initDashboardTheme();

  // 3. Initialize Topbar Notification Bell
  initNotificationsToggler();

  // 4. Initialize ECharts Visualizations
  initDashboardCharts();

  // 5. Setup Clock update on Weather Widget
  initWeatherClock();

  // 6. Bind Search Bar filters
  initDashboardSearch();

  // 7. Initialize Global Shortcuts
  window.addEventListener('keydown', (e) => {
    // Check for Cmd + K or Ctrl + K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('dashboard-search').focus();
    }
    // Escape key closes modals
    if (e.key === 'Escape') {
      closeQuickActionModal();
    }
  });
});

// 1. Theme Management Sync
function initDashboardTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  // Sync state with localstorage or body class
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

      // Redraw charts with correct text styles
      syncChartThemes();
    });
  }
}

// 2. Notification Panel Toggle
function initNotificationsToggler() {
  const notifBtn = document.getElementById('notif-toggle-btn');
  const notifBox = document.getElementById('notifications-box');

  if (notifBtn && notifBox) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifBox.classList.toggle('active');
      
      // Hide red badge once clicked
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

// 3. ECharts Setup
function initDashboardCharts() {
  const mainDom = document.getElementById('emissions-ledgers-chart');
  const deptDom = document.getElementById('department-rankings-chart');

  if (mainDom && typeof echarts !== 'undefined') {
    mainChart = echarts.init(mainDom);
    mainChart.setOption(getMainChartOptions(currentTheme === 'light'));
  }

  if (deptDom && typeof echarts !== 'undefined') {
    deptChart = echarts.init(deptDom);
    deptChart.setOption(getDeptChartOptions(currentTheme === 'light'));
  }

  window.addEventListener('resize', () => {
    if (mainChart) mainChart.resize();
    if (deptChart) deptChart.resize();
  });
}

function getMainChartOptions(isLight) {
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
      data: ['Actual Emissions', 'Target Pathway', 'AI Forecast Projection'],
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
        formatter: '{value} MT'
      }
    },
    series: [
      {
        name: 'Actual Emissions',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#3b82f6' }, // Blue
        lineStyle: { width: 3, color: '#3b82f6' },
        data: actualEmissions
      },
      {
        name: 'Target Pathway',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, type: 'dashed', color: '#10b981' }, // Green dashed
        itemStyle: { color: '#10b981' },
        data: targetEmissions
      },
      {
        name: 'AI Forecast Projection',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3, type: 'dotted', color: '#a855f7' }, // Purple dotted
        itemStyle: { color: '#a855f7' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(168, 85, 247, 0.15)' },
            { offset: 1, color: 'rgba(168, 85, 247, 0)' }
          ])
        },
        data: forecastEmissions
      }
    ]
  };
}

function getDeptChartOptions(isLight) {
  const textColor = isLight ? '#475569' : '#9ca3af';
  const gridLineColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.05)';

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(15, 23, 42, 0.95)',
      borderColor: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: { color: isLight ? '#0f172a' : '#f9fafb' }
    },
    grid: {
      left: '3%',
      right: '6%',
      bottom: '3%',
      top: '4%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: gridLineColor } },
      axisLabel: { color: textColor, fontFamily: 'Inter' }
    },
    yAxis: {
      type: 'category',
      data: ['Admin', 'Facilities', 'R&D', 'Logistics'],
      axisLine: { lineStyle: { color: gridLineColor } },
      axisLabel: { color: textColor, fontFamily: 'Inter' }
    },
    series: [
      {
        name: 'Carbon Intensity (MT)',
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#10b981' }, // Green
            { offset: 1, color: '#3b82f6' }  // Blue
          ]),
          borderRadius: [0, 6, 6, 0]
        },
        data: [820, 2100, 3900, 4820]
      }
    ]
  };
}

function syncChartThemes() {
  const isLight = currentTheme === 'light';
  if (mainChart) mainChart.setOption(getMainChartOptions(isLight));
  if (deptChart) deptChart.setOption(getDeptChartOptions(isLight));
}

// 4. Highlight Chart Series on KPI clicks
function highlightChartSeries(seriesKey) {
  if (!mainChart) return;

  const isLight = currentTheme === 'light';
  const baseOptions = getMainChartOptions(isLight);

  // Apply visual opacity adjustments based on keys clicked
  if (seriesKey === 'all') {
    mainChart.setOption(baseOptions);
  } else if (seriesKey === 'env') {
    // Focus Target Pathway (Green)
    baseOptions.series[0].itemStyle.opacity = 0.2;
    baseOptions.series[0].lineStyle.opacity = 0.2;
    baseOptions.series[2].itemStyle.opacity = 0.2;
    baseOptions.series[2].lineStyle.opacity = 0.2;
    mainChart.setOption(baseOptions);
  } else if (seriesKey === 'soc') {
    // Focus Actual Emissions (Blue)
    baseOptions.series[1].itemStyle.opacity = 0.2;
    baseOptions.series[1].lineStyle.opacity = 0.2;
    baseOptions.series[2].itemStyle.opacity = 0.2;
    baseOptions.series[2].lineStyle.opacity = 0.2;
    mainChart.setOption(baseOptions);
  } else if (seriesKey === 'gov') {
    // Focus AI Forecast (Purple)
    baseOptions.series[0].itemStyle.opacity = 0.2;
    baseOptions.series[0].lineStyle.opacity = 0.2;
    baseOptions.series[1].itemStyle.opacity = 0.2;
    baseOptions.series[1].lineStyle.opacity = 0.2;
    mainChart.setOption(baseOptions);
  }
}

// 5. Notion AI Recommendations Approvals
function approveAIRecommendation(recomId, carbonSaving, indexIncrease) {
  const recomCard = document.getElementById(`recom-${recomId}`);
  if (!recomCard) return;

  const btn = recomCard.querySelector('.notion-action-trigger');
  
  // Set Loading/Approved states
  btn.innerText = 'Applying...';
  btn.classList.add('approved');
  btn.disabled = true;

  setTimeout(() => {
    btn.innerText = 'Applied ✓';
    btn.style.background = 'rgba(255,255,255,0.05)';
    btn.style.color = 'var(--text-muted)';
    btn.style.borderColor = 'var(--border-subtle)';

    // Update KPI Score values on screen
    const envValEl = document.getElementById('env-score-val');
    const esgValEl = document.getElementById('esg-score-val');

    if (envValEl && esgValEl) {
      let currentEnv = parseFloat(envValEl.innerText);
      let currentEsg = parseFloat(esgValEl.innerText);

      let newEnv = Math.min(100.0, currentEnv + indexIncrease);
      let newEsg = Math.min(100.0, currentEsg + (indexIncrease * 0.4)); // Weighted ESG increase

      gsap.to(envValEl, { textContent: newEnv, duration: 1.5, snap: { textContent: 0.1 } });
      gsap.to(esgValEl, { textContent: newEsg, duration: 1.5, snap: { textContent: 0.1 } });
    }

    // Modify AI Forecast values downwards on chart series!
    forecastEmissions = forecastEmissions.map(val => {
      if (val === null) return null;
      return Math.round(val - (carbonSaving / 4)); // Distribute saved carbon over remaining 4 forecast months
    });

    if (mainChart) {
      mainChart.setOption({
        series: [
          {}, {},
          { data: forecastEmissions }
        ]
      });
    }

    // Append activity to recent audited table logs
    const tableBody = document.getElementById('logs-table-body');
    if (tableBody) {
      const now = new Date();
      const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      
      const newRow = document.createElement('tr');
      newRow.style.animation = 'message-fade 0.5s ease forwards';
      newRow.innerHTML = `
        <td>${timeStr}</td>
        <td>AI Approved: ${recomCard.querySelector('h6').innerText}</td>
        <td>Facilities</td>
        <td style="color: var(--primary); font-weight: 600;">-${carbonSaving} MT</td>
        <td><span class="status-pill status-completed">Audited</span></td>
      `;
      tableBody.insertBefore(newRow, tableBody.firstChild);
    }
  }, 1200);
}

// 6. Interactive Prediction Slider System
function updatePredictionSlider(val) {
  const valDisplay = document.getElementById('slider-percentage-val');
  if (valDisplay) valDisplay.innerText = `${val}%`;

  recalculatePredictionEngine();
}

function updateGrowthSlider(val) {
  const valDisplay = document.getElementById('slider-growth-val');
  if (valDisplay) valDisplay.innerText = `${(val / 10).toFixed(1)}x`;

  recalculatePredictionEngine();
}

function recalculatePredictionEngine() {
  const electSlider = document.getElementById('carbon-predict-slider');
  const growthSlider = document.getElementById('growth-predict-slider');
  const offsetDisplay = document.getElementById('prediction-gauge-val');

  if (!electSlider || !growthSlider || !offsetDisplay) return;

  const elect = parseInt(electSlider.value);
  const growth = parseFloat(growthSlider.value) / 10;

  // Real-time offset calculator formula
  const baseOffset = (elect * 32.5) - (growth * 450) + 500;
  const finalOffset = Math.max(0, Math.round(baseOffset));

  offsetDisplay.innerText = `${finalOffset.toLocaleString()} MT`;

  // Dynamically shift chart forecast curve values based on live slider values!
  // Increase electrification dims forecast curve values; higher growth shifts them upwards.
  const modifier = (elect * -8) + ((growth - 1.0) * 1500);
  
  let modifiedForecast = [null, null, null, null, null, null, null, 9100, 8600, 8200, 7800, 7300].map((val, idx) => {
    if (val === null) return null;
    // apply scaling factor across forecast steps
    const stepWeight = (idx - 7) / 4; 
    return Math.round(val + (modifier * stepWeight));
  });

  if (mainChart) {
    mainChart.setOption({
      series: [
        {}, {},
        { data: modifiedForecast }
      ]
    });
  }
}

// 7. Real-Time clock sync on weather telemetry
function initWeatherClock() {
  const clockEl = document.getElementById('weather-clock');
  if (!clockEl) return;

  const syncTime = () => {
    const now = new Date();
    clockEl.innerText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) + ' PST';
  };

  syncTime();
  setInterval(syncTime, 1000);
}

// 8. Command Search menu filters
function initDashboardSearch() {
  const searchInput = document.getElementById('dashboard-search');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    // Filter Audited Activities rows
    const logRows = document.querySelectorAll('#logs-table-body tr');
    logRows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });

    // Filter reports items
    const reportItems = document.querySelectorAll('.report-item');
    reportItems.forEach(item => {
      const text = item.innerText.toLowerCase();
      item.style.display = text.includes(query) ? '' : 'none';
    });
  });
}

// 9. Modal triggers for quick actions
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

  // Inject loader bar
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

  // Trigger loader fill width transition
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

  // Append new document to reports list
  const reportsList = document.querySelector('.reports-list');
  if (reportsList) {
    const newItem = document.createElement('div');
    newItem.className = 'report-item';
    newItem.style.animation = 'message-fade 0.5s ease forwards';
    newItem.innerHTML = `
      <div class="report-meta-box">
        <div class="report-file-icon" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.15); color: var(--primary);"><i data-lucide="file-check"></i></div>
        <div class="report-file-text">
          <h6>CSRD_Audit_Compliance_Disclosures.pdf</h6>
          <p>Compiled: Just Now &bull; 1.8 MB &bull; EcoSphere AI Model</p>
        </div>
      </div>
      <button class="report-download-btn" onclick="simulateReportDownload('CSRD_Audit_Compliance_Disclosures.pdf')"><i data-lucide="download"></i></button>
    `;
    reportsList.insertBefore(newItem, reportsList.firstChild);
  }

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function reloadModalOriginalState() {
  // Resets modal structure for subsequent clicks
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

// 10. Simulate report downloads
function simulateReportDownload(filename) {
  alert(`Initiating download of: ${filename}`);
}
