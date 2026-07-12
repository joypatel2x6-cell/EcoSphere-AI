// EcoSphere AI - Environmental Module Logic & Calculations

let emissionsPieChart = null;
let currentTheme = 'dark';

// Default chart data
let pieData = [
  { value: 2450, name: 'Fleet Scope 1' },
  { value: 3820, name: 'Manufacturing' },
  { value: 4890, name: 'Purchase Grid' },
  { value: 1200, name: 'Expense Logs' }
];

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Initialize Theme Mode
  initEnvTheme();

  // 3. Initialize Topbar Notification Bell
  initNotificationsToggler();

  // 4. Initialize Animated Progress Rings
  animateProgressRings();

  // 5. Initialize ECharts Emissions Pie
  initEmissionsPieChart();

  // 6. Generate Procedural Grid Heat Map
  generateGridHeatmap();

  // 7. Load Default Carbon Transactions
  loadDefaultTransactions();

  // 8. Bind Search filters for transaction ledger
  initLedgerSearch();

  // 9. Bind dynamic changes to calculator readouts
  const inputs = ['calc-fuel', 'calc-elec', 'calc-purchase', 'calc-expense', 'calc-waste'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', runRealTimeCalculation);
    }
  });

  // Run initial calculation to sync UI
  runRealTimeCalculation();
});

// 1. Theme Management Sync
function initEnvTheme() {
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

      // Redraw ECharts pie with corrected theme label colors
      if (emissionsPieChart) {
        emissionsPieChart.setOption(getPieChartOptions(currentTheme === 'light'));
      }
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

// 3. SVG Progress Rings Animation
function animateProgressRings() {
  // Sets percentages dynamically
  setProgressRing('renewable', 85);
  setProgressRing('carbon', 78);
  setProgressRing('elec', 64);
  setProgressRing('water', 90);
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

// 4. Emissions distribution Pie Chart
function initEmissionsPieChart() {
  const pieDom = document.getElementById('emissions-pie-chart');
  if (!pieDom || typeof echarts === 'undefined') return;

  emissionsPieChart = echarts.init(pieDom);
  const isLight = document.documentElement.classList.contains('light');
  emissionsPieChart.setOption(getPieChartOptions(isLight));

  window.addEventListener('resize', () => {
    if (emissionsPieChart) emissionsPieChart.resize();
  });
}

function getPieChartOptions(isLight) {
  const textColor = isLight ? '#475569' : '#9ca3af';
  const totalVal = pieData.reduce((acc, curr) => acc + curr.value, 0);

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(15, 23, 42, 0.95)',
      borderColor: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      textStyle: { color: isLight ? '#0f172a' : '#f9fafb' },
      formatter: '{b}: <b>{c} MT</b> ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      textStyle: { color: textColor, fontFamily: 'Inter' }
    },
    series: [
      {
        name: 'Emissions Scope',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: isLight ? '#ffffff' : '#0b0f19',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: isLight ? '#0f172a' : '#f9fafb',
            formatter: '{b}\n{c} MT'
          }
        },
        labelLine: {
          show: false
        },
        color: ['#3b82f6', '#10b981', '#a855f7', '#eab308'],
        data: pieData
      }
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '46%',
        style: {
          text: `Total Scope\n${totalVal.toLocaleString()} MT`,
          textAlign: 'center',
          fill: isLight ? '#0f172a' : '#ffffff',
          fontSize: 15,
          fontWeight: 'bold'
        }
      }
    ]
  };
}

// 5. Grid Heat Map Generator (GitHub Style matrix)
function generateGridHeatmap() {
  const container = document.getElementById('heatmap-cells-container');
  if (!container) return;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  for (let d = 0; d < 7; d++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'heatmap-week-row';

    for (let h = 0; h < 24; h++) {
      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';

      // Generate simulated grid loads
      let load = 120 + Math.floor(Math.random() * 450);
      // Peak hours (9:00 - 17:00) get higher loads
      if (h >= 9 && h <= 17) load += 200;
      // Weekends get lower loads
      if (d >= 5) load = Math.round(load * 0.4);

      // Determine cell color intensity
      if (load < 180) {
        cell.classList.add('cell-low');
      } else if (load < 350) {
        cell.classList.add('cell-med');
      } else if (load < 550) {
        cell.classList.add('cell-high');
      } else {
        cell.classList.add('cell-max');
      }

      cell.setAttribute('data-tooltip', `${days[d]}, ${h.toString().padStart(2, '0')}:00h - ${load} kW/h Load`);
      rowDiv.appendChild(cell);
    }
    
    container.appendChild(rowDiv);
  }
}

// 6. Carbon Calculator Calculations
function runRealTimeCalculation() {
  const fuel = parseFloat(document.getElementById('calc-fuel').value) || 0;
  const elec = parseFloat(document.getElementById('calc-elec').value) || 0;
  const purchase = parseFloat(document.getElementById('calc-purchase').value) || 0;
  const expense = parseFloat(document.getElementById('calc-expense').value) || 0;
  const waste = parseFloat(document.getElementById('calc-waste').value) || 0;

  // Real-time calculations using approximate EPA factors
  const co2Fuel = fuel * 0.0101;     // ~10.1 kg CO2/gallon
  const co2Elec = elec * 0.00038;    // ~0.38 kg CO2/kWh
  const co2Purchase = purchase * 0.00015; // ~0.15 kg CO2/dollar
  const co2Expense = expense * 0.0001;  // ~0.1 kg CO2/dollar
  const co2WasteOffset = waste * -0.0012; // Recycled credit offset

  const total = Math.max(0, co2Fuel + co2Elec + co2Purchase + co2Expense + co2WasteOffset);
  document.getElementById('calc-result-co2').innerText = `${total.toFixed(2)} MT`;
}

function calculateCarbonFootprint(e) {
  e.preventDefault();

  const fuel = parseFloat(document.getElementById('calc-fuel').value) || 0;
  const elec = parseFloat(document.getElementById('calc-elec').value) || 0;
  const purchase = parseFloat(document.getElementById('calc-purchase').value) || 0;
  const expense = parseFloat(document.getElementById('calc-expense').value) || 0;
  const waste = parseFloat(document.getElementById('calc-waste').value) || 0;

  const co2Fuel = fuel * 0.0101;
  const co2Elec = elec * 0.00038;
  const co2Purchase = purchase * 0.00015;
  const co2Expense = expense * 0.0001;
  const co2WasteOffset = waste * -0.0012;

  const total = Math.max(0, co2Fuel + co2Elec + co2Purchase + co2Expense + co2WasteOffset);

  // Animate calculated total display
  gsap.fromTo('#calc-result-co2', { scale: 0.9, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.3 });

  // Update ECharts Pie Data variables dynamically
  pieData[0].value += Math.round(co2Fuel);
  pieData[2].value += Math.round(co2Elec);
  pieData[1].value += Math.round(co2Purchase);
  pieData[3].value += Math.round(co2Expense + co2WasteOffset);

  if (emissionsPieChart) {
    const isLight = document.documentElement.classList.contains('light');
    emissionsPieChart.setOption(getPieChartOptions(isLight));
  }

  // Prepend row to table
  const tableBody = document.getElementById('trans-table-body');
  if (tableBody) {
    const now = new Date();
    const timeStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const txId = 'TX-' + Math.floor(10000 + Math.random() * 90000);

    const newRow = document.createElement('tr');
    newRow.style.animation = 'message-fade 0.5s ease forwards';
    newRow.innerHTML = `
      <td>${timeStr}</td>
      <td class="font-mono" style="font-size: 11px;">${txId}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="trans-cat-icon cat-mfg"><i data-lucide="leaf" style="width: 12px; height: 12px;"></i></span>
          <span>Scope 1 Manufacturing</span>
        </div>
      </td>
      <td style="font-size: 11.5px; color: var(--text-secondary);">Fuel: ${fuel}g, Elec: ${elec}kWh</td>
      <td style="font-size: 11px; color: var(--text-muted);">EPA Scope v2.4</td>
      <td style="font-weight: 600; color: #ef4444;">+${total.toFixed(2)} MT</td>
      <td><span class="status-pill status-completed">Audited</span></td>
    `;
    tableBody.insertBefore(newRow, tableBody.firstChild);

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // Update progress rings slightly to simulate dynamic updates
  setProgressRing('elec', Math.min(100, Math.round(64 + (elec * 0.001))));
  setProgressRing('carbon', Math.min(100, Math.round(78 - (total * 0.05))));
}

// 7. Load Default Audited Transactions
function loadDefaultTransactions() {
  const tableBody = document.getElementById('trans-table-body');
  if (!tableBody) return;

  const data = [
    { time: 'Jul 12, 09:30', tx: 'TX-89402', cat: 'Fleet Scope 1', icon: 'truck', catClass: 'cat-fleet', desc: 'Logistics Fleet Fuel: 850 gal', factor: 'CARB Fleet v1.8', co2: '+8.58 MT', status: 'Audited', type: 'danger' },
    { time: 'Jul 11, 14:10', tx: 'TX-45210', cat: 'Purchase Grid', icon: 'zap', catClass: 'cat-mfg', desc: 'Electricity Billing: 12,200 kWh', factor: 'EPA eGRID 2026', co2: '+4.64 MT', status: 'Audited', type: 'danger' },
    { time: 'Jul 10, 18:30', tx: 'TX-32451', cat: 'Expense Logs', icon: 'dollar-sign', catClass: 'cat-expense', desc: 'CSR Paper Purchases Offset', factor: 'EPA Scope 3.12', co2: '-1.45 MT', status: 'Audited', type: 'success' },
    { time: 'Jul 09, 11:22', tx: 'TX-10492', cat: 'Scope 3 Supply', icon: 'package', catClass: 'cat-purchase', desc: 'Raw Board purchases: $18,400', factor: 'DEFRA Supply 2.0', co2: '+2.76 MT', status: 'Audited', type: 'danger' }
  ];

  tableBody.innerHTML = '';
  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.time}</td>
      <td class="font-mono" style="font-size: 11px;">${item.tx}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="trans-cat-icon ${item.catClass}"><i data-lucide="${item.icon}" style="width: 12px; height: 12px;"></i></span>
          <span>${item.cat}</span>
        </div>
      </td>
      <td style="font-size: 11.5px; color: var(--text-secondary);">${item.desc}</td>
      <td style="font-size: 11px; color: var(--text-muted);">${item.factor}</td>
      <td style="font-weight: 600; color: ${item.type === 'danger' ? '#ef4444' : 'var(--primary)'};">${item.co2}</td>
      <td><span class="status-pill status-completed">${item.status}</span></td>
    `;
    tableBody.appendChild(tr);
  });

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// 8. Search Ledger items
function initLedgerSearch() {
  const searchInput = document.getElementById('table-search');
  const globalSearchInput = document.getElementById('environmental-search');

  const filterTable = (query) => {
    const rows = document.querySelectorAll('#trans-table-body tr');
    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });
  };

  if (searchInput) {
    searchInput.addEventListener('input', (e) => filterTable(e.target.value.toLowerCase()));
  }

  if (globalSearchInput) {
    globalSearchInput.addEventListener('input', (e) => filterTable(e.target.value.toLowerCase()));
  }
}

// 9. Simulated File Exporters (PDF/Excel)
function exportDataFile(fileType) {
  const btn = document.getElementById(`export-${fileType}-btn`);
  if (!btn) return;

  btn.classList.add('loading');
  btn.disabled = true;

  setTimeout(() => {
    btn.classList.remove('loading');
    btn.disabled = false;
    alert(`Initiating download for: EcoSphere_Carbon_Ledger_Q3.${fileType === 'pdf' ? 'pdf' : 'xlsx'}`);
  }, 1500);
}

// 10. Quick Actions Audits compilation (Modals)
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
