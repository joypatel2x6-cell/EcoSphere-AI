/* ============================================================
   EcoSphere AI — Report Center JavaScript
   Interactive tables, ECharts, wizard, AI summary, exports
   ============================================================ */

'use strict';

// ── Dataset ────────────────────────────────────────────────────────────────
const REPORT_DATA = [
  { name: 'Environmental Performance Q2', category: 'environmental', dept: 'All', generated: 'Jul 10, 2026', period: 'Q2 2026', score: 92, status: 'complete' },
  { name: 'Social Impact Summary',        category: 'social',       dept: 'All', generated: 'Jul 10, 2026', period: 'Q2 2026', score: 84, status: 'complete' },
  { name: 'Governance Compliance Report', category: 'governance',   dept: 'All', generated: 'Jul 09, 2026', period: 'Q2 2026', score: 98, status: 'review'   },
  { name: 'ESG Consolidated Summary',     category: 'esg',          dept: 'All', generated: 'Jul 09, 2026', period: 'Q2 2026', score: 91, status: 'complete' },
  { name: 'Engineering Carbon Audit',     category: 'department',   dept: 'Engineering', generated: 'Jul 08, 2026', period: 'Q2 2026', score: 88, status: 'complete' },
  { name: 'Operations Sustainability',    category: 'department',   dept: 'Operations',  generated: 'Jul 07, 2026', period: 'Q2 2026', score: 76, status: 'pending'  },
  { name: 'HR Diversity & Wellness',      category: 'department',   dept: 'HR & People', generated: 'Jul 07, 2026', period: 'Q2 2026', score: 90, status: 'complete' },
  { name: 'Finance ESG Risk Review',      category: 'department',   dept: 'Finance',     generated: 'Jul 06, 2026', period: 'Q2 2026', score: 85, status: 'draft'    },
  { name: 'Manufacturing Emission Log',   category: 'department',   dept: 'Manufacturing', generated: 'Jul 05, 2026', period: 'Q2 2026', score: 72, status: 'pending' },
  { name: 'Employee XP & Training Q2',    category: 'employee',     dept: 'All', generated: 'Jul 05, 2026', period: 'Q2 2026', score: 87, status: 'complete' },
  { name: 'Top Performer ESG Scores',     category: 'employee',     dept: 'All', generated: 'Jul 04, 2026', period: 'Q2 2026', score: 95, status: 'complete' },
  { name: 'Volunteer Hours Breakdown',    category: 'social',       dept: 'HR & People', generated: 'Jul 04, 2026', period: 'Q2 2026', score: 80, status: 'complete' },
  { name: 'Anti-Bribery Audit G3.2',      category: 'governance',   dept: 'Legal', generated: 'Jul 03, 2026', period: 'H1 2026', score: 70, status: 'review'   },
  { name: 'Carbon Prediction Q3',         category: 'environmental', dept: 'Operations', generated: 'Jul 03, 2026', period: 'Q3 2026 (proj.)', score: 89, status: 'draft' },
  { name: 'CSR Calendar Activities',      category: 'social',       dept: 'All', generated: 'Jul 02, 2026', period: 'H1 2026', score: 83, status: 'complete' },
  { name: 'Monthly Mission Report',       category: 'challenge',    dept: 'All', generated: 'Jul 02, 2026', period: 'Jun 2026', score: 92, status: 'complete' },
  { name: 'Diamond League Rankings',      category: 'challenge',    dept: 'All', generated: 'Jul 01, 2026', period: 'Q2 2026', score: 96, status: 'complete' },
  { name: 'Renewable Energy Usage',       category: 'environmental', dept: 'Operations', generated: 'Jun 30, 2026', period: 'Q2 2026', score: 94, status: 'complete' },
  { name: 'Scope 3 Logistics Audit',      category: 'environmental', dept: 'Supply Chain', generated: 'Jun 28, 2026', period: 'Q2 2026', score: 68, status: 'review' },
  { name: 'Board Approval Compliance',    category: 'governance',   dept: 'Legal', generated: 'Jun 25, 2026', period: 'H1 2026', score: 99, status: 'complete' },
];

const METRICS = [
  'Carbon Emissions (tCO₂e)', 'Renewable Energy %', 'Water Usage (m³)',
  'Waste Recycled %', 'Scope 1 Emissions', 'Scope 2 Emissions', 'Scope 3 Emissions',
  'Volunteer Hours', 'CSR Participation %', 'Diversity Ratio', 'Training Completion %',
  'Employee Wellness Score', 'Policy Compliance %', 'Audit Findings', 'Risk Score',
  'Board Diversity %', 'ESG Overall Score', 'XP Earned', 'Badges Awarded', 'Challenge Completion %',
  'Department Carbon Rank', 'Energy Intensity'
];

const PREVIEW_ROWS = [
  { metric: 'Carbon Emissions',    value: '7,840 tCO₂e', target: '7,500', variance: '+4.5%',  status: 'review'   },
  { metric: 'Renewable Energy',    value: '68%',          target: '70%',   variance: '-2%',    status: 'pending'  },
  { metric: 'Volunteer Hours',     value: '4,280 hrs',    target: '4,000', variance: '+7%',    status: 'complete' },
  { metric: 'CSR Participation',   value: '87%',          target: '85%',   variance: '+2%',    status: 'complete' },
  { metric: 'Policy Compliance',   value: '98.2%',        target: '100%',  variance: '-1.8%',  status: 'review'   },
  { metric: 'ESG Overall Score',   value: '91.2 / 100',   target: '90',    variance: '+1.2',   status: 'complete' },
];

const AI_SUMMARIES = [
  `EcoSphere's Q2 2026 performance reflects a strong upward trajectory across all three ESG pillars. Environmental metrics show a 4.2% carbon reduction year-over-year, driven by accelerated renewable energy adoption in Operations. Social scores maintain an 84% composite index with exceptional volunteer programme participation exceeding targets by 7%. Governance remains the highest-performing pillar at 98%, though the unresolved G3.2 Anti-Bribery flag requires attention before the H2 audit cycle begins.`,
  `The consolidated ESG analysis indicates EcoSphere is on track to achieve its 2026 sustainability targets. Carbon intensity per employee has decreased 9.1% since the 2023 baseline. The Eco League gamification programme has contributed significantly to employee engagement, with 87% participation in Q2 missions. Key risk areas include Scope 3 supplier emissions disclosure gaps and pending department-level carbon audits in Operations and Manufacturing.`,
  `Cross-functional analysis reveals that departments with high Eco League participation consistently outperform peers on sustainability KPIs. Engineering leads in carbon efficiency, while HR & People drives diversity and wellness scores. The AI-powered carbon prediction model projects a 6.8% further reduction in Scope 2 emissions by Q4 2026 if current electrification plans proceed. Recommended priority: close the Scope 3 logistics audit gap before the next board ESG review.`
];

// ── State ──────────────────────────────────────────────────────────────────
let currentTab = 'all';
let sortColIndex = -1;
let sortAsc = true;
let currentPage = 1;
const rowsPerPage = 10;
let filteredData = [...REPORT_DATA];
let selectedMetrics = new Set();
let currentWizardStep = 1;
let aiSummaryIndex = 0;

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();

  initTheme();
  animateKPIs();
  initTabPills();
  renderTable();
  initECharts();
  drawMiniCharts();
  buildMetricsGrid();
  triggerAISummary();
});

// ── 1. Theme ───────────────────────────────────────────────────────────────
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') html.classList.add('light');

  if (btn) {
    btn.addEventListener('click', () => {
      html.classList.toggle('light');
      localStorage.setItem('theme', html.classList.contains('light') ? 'light' : 'dark');
      setTimeout(refreshCharts, 100);
    });
  }
}

// ── 2. KPI Counter Animation ───────────────────────────────────────────────
function animateKPIs() {
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(timer);
    }, 18);
  });
}

// ── 3. Tab Pills ───────────────────────────────────────────────────────────
function initTabPills() {
  document.querySelectorAll('.report-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      filterCards();
      currentPage = 1;
      filteredData = currentTab === 'all' ? [...REPORT_DATA]
        : REPORT_DATA.filter(r => r.category === currentTab);
      renderTable();
    });
  });
}

function filterCards() {
  document.querySelectorAll('.report-card').forEach(card => {
    const cat = card.dataset.category;
    card.style.display = (currentTab === 'all' || cat === currentTab || cat === 'all') ? '' : 'none';
  });
}

// ── 4. ECharts — Main Charts ──────────────────────────────────────────────
let trendChart, donutChart, barChart;

function getChartTextColor() {
  return document.documentElement.classList.contains('light') ? '#475569' : '#94a3b8';
}

function initECharts() {
  const isDark = !document.documentElement.classList.contains('light');
  const axisLineColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = getChartTextColor();

  // Trend Line Chart
  const trendDom = document.getElementById('chart-trend');
  if (trendDom && typeof echarts !== 'undefined') {
    trendChart = echarts.init(trendDom, null, { renderer: 'canvas' });
    trendChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(255,255,255,0.06)', textStyle: { color: '#f8fafc', fontSize: 12 } },
      legend: { data: ['Environmental', 'Social', 'Governance'], textStyle: { color: textColor, fontSize: 10 }, top: 0 },
      grid: { left: '3%', right: '3%', bottom: '3%', top: '30px', containLabel: true },
      xAxis: { type: 'category', data: ['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'], axisLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor, fontSize: 10 } },
      yAxis: { type: 'value', min: 60, max: 100, splitLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor, fontSize: 10 } },
      series: [
        { name: 'Environmental', type: 'line', smooth: true, data: [82,83,84,86,85,87,88,90,89,91,92,92], itemStyle: { color: '#10b981' }, lineStyle: { width: 2.5 }, areaStyle: { color: { type: 'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:'rgba(16,185,129,0.2)'},{offset:1,color:'rgba(16,185,129,0)'}] } } },
        { name: 'Social',        type: 'line', smooth: true, data: [74,75,76,77,78,79,80,81,82,83,84,84], itemStyle: { color: '#3b82f6' }, lineStyle: { width: 2.5 }, areaStyle: { color: { type: 'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:'rgba(59,130,246,0.15)'},{offset:1,color:'rgba(59,130,246,0)'}] } } },
        { name: 'Governance',    type: 'line', smooth: true, data: [92,93,94,95,96,96,97,97,98,98,98,98], itemStyle: { color: '#a855f7' }, lineStyle: { width: 2.5 }, areaStyle: { color: { type: 'linear', x:0,y:0,x2:0,y2:1, colorStops:[{offset:0,color:'rgba(168,85,247,0.15)'},{offset:1,color:'rgba(168,85,247,0)'}] } } },
      ]
    });
  }

  // Donut Chart
  const donutDom = document.getElementById('chart-donut');
  if (donutDom && typeof echarts !== 'undefined') {
    donutChart = echarts.init(donutDom, null, { renderer: 'canvas' });
    donutChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', formatter: '{b}: {d}%', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(255,255,255,0.06)', textStyle: { color: '#f8fafc', fontSize: 12 } },
      legend: { orient: 'vertical', right: '2%', top: 'center', textStyle: { color: textColor, fontSize: 10 } },
      series: [{
        type: 'pie', radius: ['40%', '72%'], center: ['38%', '50%'],
        itemStyle: { borderRadius: 6, borderColor: 'transparent', borderWidth: 2 },
        label: { show: false },
        data: [
          { value: 40, name: 'Environmental', itemStyle: { color: '#10b981' } },
          { value: 35, name: 'Social',        itemStyle: { color: '#3b82f6' } },
          { value: 25, name: 'Governance',    itemStyle: { color: '#a855f7' } },
        ]
      }]
    });
  }

  // Bar Chart
  const barDom = document.getElementById('chart-bar');
  if (barDom && typeof echarts !== 'undefined') {
    barChart = echarts.init(barDom, null, { renderer: 'canvas' });
    barChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(255,255,255,0.06)', textStyle: { color: '#f8fafc', fontSize: 12 } },
      grid: { left: '2%', right: '4%', bottom: '2%', top: '8%', containLabel: true },
      xAxis: { type: 'value', splitLine: { lineStyle: { color: axisLineColor } }, axisLabel: { color: textColor, fontSize: 10 } },
      yAxis: { type: 'category', data: ['Manufacturing', 'Supply Chain', 'Finance', 'Operations', 'HR', 'Engineering'], axisLabel: { color: textColor, fontSize: 10 }, axisLine: { show: false } },
      series: [{
        type: 'bar', barMaxWidth: 16,
        data: [
          { value: 2840, itemStyle: { color: '#ef4444', borderRadius: 4 } },
          { value: 2110, itemStyle: { color: '#f97316', borderRadius: 4 } },
          { value: 1420, itemStyle: { color: '#eab308', borderRadius: 4 } },
          { value: 1980, itemStyle: { color: '#3b82f6', borderRadius: 4 } },
          { value:  680, itemStyle: { color: '#10b981', borderRadius: 4 } },
          { value:  940, itemStyle: { color: '#a855f7', borderRadius: 4 } },
        ]
      }]
    });
  }

  window.addEventListener('resize', () => {
    [trendChart, donutChart, barChart].forEach(c => c && c.resize());
  });
}

function refreshCharts() {
  [trendChart, donutChart, barChart].forEach(c => { if (c) { c.dispose(); } });
  initECharts();
}

// ── 5. Mini Sparkline Charts (Canvas) ────────────────────────────────────
function drawMiniCharts() {
  const configs = [
    { id: 'mini-env',  data: [60,65,70,72,78,82,88,92],  color: '#10b981' },
    { id: 'mini-soc',  data: [55,60,63,68,71,75,80,84],  color: '#3b82f6' },
    { id: 'mini-gov',  data: [88,90,91,93,94,96,97,98],  color: '#a855f7' },
    { id: 'mini-esg',  data: [72,75,78,80,83,86,89,91],  color: '#10b981' },
    { id: 'mini-dept', data: [50,55,58,61,65,68,72,76],  color: '#f97316' },
    { id: 'mini-emp',  data: [65,68,72,75,79,82,85,87],  color: '#06b6d4' },
    { id: 'mini-chal', data: [40,48,55,62,70,78,86,92],  color: '#eab308' },
  ];

  configs.forEach(({ id, data, color }) => {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 80; canvas.height = 36;
    const max = Math.max(...data), min = Math.min(...data);
    const scaleY = v => 36 - ((v - min) / (max - min)) * 28 - 4;
    const scaleX = i => (i / (data.length - 1)) * 80;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    data.forEach((v, i) => i === 0 ? ctx.moveTo(scaleX(i), scaleY(v)) : ctx.lineTo(scaleX(i), scaleY(v)));
    ctx.stroke();

    const grad = ctx.createLinearGradient(0, 0, 0, 36);
    grad.addColorStop(0, color + '33');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    data.forEach((v, i) => i === 0 ? ctx.moveTo(scaleX(i), scaleY(v)) : ctx.lineTo(scaleX(i), scaleY(v)));
    ctx.lineTo(80, 36); ctx.lineTo(0, 36);
    ctx.fill();
  });
}

// ── 6. Data Table Render ──────────────────────────────────────────────────
const STATUS_LABELS = { complete: 'Complete', pending: 'Pending', review: 'In Review', draft: 'Draft' };
const STATUS_CLASSES = { complete: 'pill-complete', pending: 'pill-pending', review: 'pill-review', draft: 'pill-draft' };
const CAT_LABELS = { environmental: '🌱 Environmental', social: '🤝 Social', governance: '⚖️ Governance', esg: '📊 ESG Summary', department: '🏢 Department', employee: '👤 Employee', challenge: '🏆 Challenge' };

function renderTable() {
  const tbody = document.getElementById('table-body');
  if (!tbody) return;

  const start = (currentPage - 1) * rowsPerPage;
  const slice = filteredData.slice(start, start + rowsPerPage);

  tbody.innerHTML = slice.map(r => `
    <tr>
      <td style="font-weight:600;color:var(--text-primary);">${r.name}</td>
      <td>${CAT_LABELS[r.category] || r.category}</td>
      <td>${r.dept}</td>
      <td>${r.generated}</td>
      <td>${r.period}</td>
      <td>
        <span style="font-weight:700;color:${r.score >= 90 ? '#10b981' : r.score >= 75 ? '#eab308' : '#ef4444'};">${r.score}</span>
        <span style="font-size:10px;color:var(--text-muted);"> / 100</span>
      </td>
      <td><span class="table-status-pill ${STATUS_CLASSES[r.status]}">${STATUS_LABELS[r.status]}</span></td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="rc-btn rc-btn-ghost" style="padding:4px 8px;font-size:10.5px;" onclick="exportReport('PDF','${r.name}')">PDF</button>
          <button class="rc-btn rc-btn-ghost" style="padding:4px 8px;font-size:10.5px;" onclick="exportReport('Excel','${r.name}')">XLS</button>
        </div>
      </td>
    </tr>
  `).join('');

  renderPagination();
  updateInfo();
}

function renderPagination() {
  const container = document.getElementById('pagination-btns');
  if (!container) return;
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  container.innerHTML =
    `<button class="page-btn" onclick="goToPage(${currentPage-1})" ${currentPage===1?'disabled':''}>‹</button>` +
    html +
    `<button class="page-btn" onclick="goToPage(${currentPage+1})" ${currentPage===totalPages?'disabled':''}>›</button>`;
}

function updateInfo() {
  const el = document.getElementById('pagination-info');
  if (!el) return;
  const start = (currentPage - 1) * rowsPerPage + 1;
  const end = Math.min(currentPage * rowsPerPage, filteredData.length);
  el.textContent = `Showing ${start}–${end} of ${filteredData.length}`;
}

function goToPage(page) {
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTable();
}

// ── 7. Table Sort ─────────────────────────────────────────────────────────
function sortTable(col) {
  if (sortColIndex === col) { sortAsc = !sortAsc; }
  else { sortColIndex = col; sortAsc = true; }

  document.querySelectorAll('.data-table thead th').forEach((th, i) => {
    th.classList.remove('sort-asc', 'sort-desc');
    if (i === col) th.classList.add(sortAsc ? 'sort-asc' : 'sort-desc');
  });

  const keys = ['name','category','dept','generated','period','score','status'];
  filteredData.sort((a, b) => {
    const va = a[keys[col]], vb = b[keys[col]];
    if (typeof va === 'number') return sortAsc ? va - vb : vb - va;
    return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });
  currentPage = 1;
  renderTable();
}

// ── 8. Table Search Filter ────────────────────────────────────────────────
function filterTable() {
  const q = (document.getElementById('table-search')?.value || '').toLowerCase();
  const base = currentTab === 'all' ? REPORT_DATA : REPORT_DATA.filter(r => r.category === currentTab);
  filteredData = q ? base.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.dept.toLowerCase().includes(q) ||
    r.category.toLowerCase().includes(q)
  ) : [...base];
  currentPage = 1;
  renderTable();
}

// ── 9. Report Generation Toast ────────────────────────────────────────────
function generateReport(name) {
  showToast(`🔄 Generating ${name} Report…`, '#3b82f6', 'loader');
  setTimeout(() => showToast(`✅ ${name} Report ready for export!`, '#10b981', 'check-circle'), 1800);
}

function generateAllReports() {
  showToast('🔄 Generating all 8 reports…', '#3b82f6', 'loader');
  setTimeout(() => showToast('✅ All reports ready. Export queue updated.', '#10b981', 'check-circle'), 2200);
}

// ── 10. Export Functions ──────────────────────────────────────────────────
function exportReport(format, name) {
  const icons = { PDF: '📄', Excel: '📊', CSV: '📋' };
  const colors = { PDF: '#ef4444', Excel: '#10b981', CSV: '#3b82f6' };
  showToast(`${icons[format]} Preparing ${name} as ${format}…`, colors[format], 'download');

  setTimeout(() => {
    if (format === 'CSV') {
      downloadCSV(name);
    } else if (format === 'Excel') {
      downloadCSVAsExcel(name);
    } else if (format === 'PDF') {
      showPDFExportModal(name);
    }
    showToast(`✅ ${name}.${format === 'PDF' ? 'pdf' : format === 'Excel' ? 'xlsx' : 'csv'} downloaded successfully.`, '#10b981', 'check-circle');
  }, 1000);
}

function downloadCSV(reportName) {
  const headers = ['Report Name','Category','Department','Generated','Period','ESG Score','Status'];
  const rows = filteredData.map(r => [
    `"${r.name}"`,
    r.category,
    `"${r.dept}"`,
    r.generated,
    r.period,
    r.score,
    r.status
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(csvContent, `${reportName.replace(/\s/g, '_')}.csv`, 'text/csv');
}

function downloadCSVAsExcel(reportName) {
  const headers = ['Report Name','Category','Department','Generated','Period','ESG Score','Status'];
  const rows = filteredData.map(r => [
    `"${r.name}"`,
    r.category,
    `"${r.dept}"`,
    r.generated,
    r.period,
    r.score,
    r.status
  ]);
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  triggerDownload(csvContent, `${reportName.replace(/\s/g, '_')}.xlsx`, 'application/vnd.ms-excel');
}

function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showPDFExportModal(reportName) {
  // Build a printable summary and open print dialog
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;
  const rows = filteredData.slice(0, 20);
  const tableRows = rows.map(r => `
    <tr>
      <td>${r.name}</td>
      <td>${r.category}</td>
      <td>${r.dept}</td>
      <td>${r.generated}</td>
      <td>${r.score}/100</td>
      <td>${r.status}</td>
    </tr>
  `).join('');
  printWindow.document.write(`
    <!DOCTYPE html><html><head>
    <title>EcoSphere AI — ${reportName}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #0f172a; }
      h1 { color: #10b981; margin-bottom: 4px; }
      p { color: #64748b; font-size: 12px; margin-bottom: 24px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th { background: #0f172a; color: #fff; padding: 10px 12px; text-align: left; }
      td { padding: 9px 12px; border-bottom: 1px solid #e2e8f0; }
      tr:nth-child(even) td { background: #f8fafc; }
      .footer { margin-top: 32px; font-size: 11px; color: #94a3b8; }
    </style>
    </head><body>
    <h1>EcoSphere AI — ${reportName}</h1>
    <p>Generated: ${new Date().toLocaleString()} | Period: Q2 2026 | Powered by EcoSphere AI</p>
    <table>
      <thead><tr><th>Report Name</th><th>Category</th><th>Department</th><th>Generated</th><th>Score</th><th>Status</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    <div class="footer">EcoSphere AI ESG Platform · Confidential · ${new Date().getFullYear()}</div>
    <script>window.onload = () => { window.print(); }</script>
    </body></html>
  `);
  printWindow.document.close();
}

function exportCustomReport(format) {
  const dept = document.getElementById('filter-dept')?.value || 'All Departments';
  const period = document.getElementById('filter-date')?.value || 'Q2 2026';
  const name = `Custom_${dept.replace(/\s/g,'_')}_${period.split(' ')[0]}`;
  if (format === 'CSV') {
    const headers = ['Metric','Value','Target','Variance','Status'];
    const rows = PREVIEW_ROWS.map(r => [`"${r.metric}"`, `"${r.value}"`, `"${r.target}"`, r.variance, r.status]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerDownload(csvContent, `${name}.csv`, 'text/csv');
    showToast('📋 Custom Report exported as CSV!', '#3b82f6', 'file-spreadsheet');
  } else {
    exportReport(format, name);
  }
}

// ── 11. Toast Notification ────────────────────────────────────────────────
function showToast(message, accentColor = '#10b981', iconName = 'info') {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerHTML = `
    <div class="toast-icon" style="background:${accentColor}22;">
      <i data-lucide="${iconName}" style="width:14px;height:14px;color:${accentColor};"></i>
    </div>
    <span>${message}</span>
  `;
  stack.appendChild(toast);
  if (typeof lucide !== 'undefined') lucide.createIcons();

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

// ── 12. Custom Builder Wizard ─────────────────────────────────────────────
function openBuilder() {
  const section = document.getElementById('builder-section');
  if (!section) return;
  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeBuilder() {
  const section = document.getElementById('builder-section');
  if (section) section.style.display = 'none';
}

function wizardNext(step) {
  currentWizardStep = step;
  document.querySelectorAll('.wizard-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`wizard-step-${step}`);
  if (panel) panel.classList.add('active');

  document.querySelectorAll('.wizard-step-item').forEach((item, i) => {
    item.classList.remove('active', 'completed');
    if (i + 1 < step) item.classList.add('completed');
    else if (i + 1 === step) item.classList.add('active');
  });

  if (step === 3) buildPreviewTable();
}

function buildMetricsGrid() {
  const grid = document.getElementById('metrics-grid');
  if (!grid) return;
  grid.innerHTML = METRICS.map(m => `
    <div class="metric-checkbox-item" onclick="toggleMetric(this, '${m}')">
      <div class="metric-check"><i data-lucide="check" style="width:10px;height:10px;color:#000;display:none;"></i></div>
      <span>${m}</span>
    </div>
  `).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function toggleMetric(el, metric) {
  el.classList.toggle('selected');
  const checkIcon = el.querySelector('.metric-check i');
  if (el.classList.contains('selected')) {
    selectedMetrics.add(metric);
    if (checkIcon) checkIcon.style.display = 'block';
  } else {
    selectedMetrics.delete(metric);
    if (checkIcon) checkIcon.style.display = 'none';
  }
  const countEl = document.getElementById('selected-count');
  if (countEl) countEl.textContent = `${selectedMetrics.size} metric${selectedMetrics.size !== 1 ? 's' : ''} selected`;
}

function buildPreviewTable() {
  const tbody = document.getElementById('preview-tbody');
  const deptLabel = document.getElementById('preview-dept-label');
  const dateLabel = document.getElementById('preview-date-label');
  const dept = document.getElementById('filter-dept')?.value || 'All Departments';
  const date = document.getElementById('filter-date')?.value || 'Q2 2026';
  if (deptLabel) deptLabel.textContent = dept;
  if (dateLabel) dateLabel.textContent = date;

  if (!tbody) return;
  tbody.innerHTML = PREVIEW_ROWS.map(r => `
    <tr>
      <td style="font-weight:600;color:var(--text-primary);">${r.metric}</td>
      <td>${r.value}</td>
      <td>${r.target}</td>
      <td style="font-weight:700;color:${r.variance.startsWith('+') ? '#10b981' : '#eab308'};">${r.variance}</td>
      <td><span class="table-status-pill ${STATUS_CLASSES[r.status]}">${STATUS_LABELS[r.status]}</span></td>
    </tr>
  `).join('');
}

// ── 13. AI Summary Typing Animation ───────────────────────────────────────
function triggerAISummary() {
  const textEl = document.getElementById('ai-summary-text');
  const bulletsEl = document.getElementById('ai-bullets');
  if (!textEl) return;

  const summary = AI_SUMMARIES[aiSummaryIndex];
  textEl.innerHTML = '';
  if (bulletsEl) bulletsEl.innerHTML = '';

  // Use a single text node to avoid per-character DOM fragmentation (which caused vertical text stacking)
  const textNode = document.createTextNode('');
  const cursor = document.createElement('span');
  cursor.className = 'ai-typing-cursor';
  textEl.appendChild(textNode);
  textEl.appendChild(cursor);

  let i = 0;
  const typeTimer = setInterval(() => {
    textNode.data += summary[i];
    i++;
    if (i >= summary.length) {
      clearInterval(typeTimer);
      cursor.remove();
      showAIBullets();
    }
  }, 12);
}

function showAIBullets() {
  const bulletsEl = document.getElementById('ai-bullets');
  if (!bulletsEl) return;

  const bullets = [
    'Carbon emissions reduced 4.2% vs. 2023 baseline — on track for 2026 target.',
    'Volunteer programme exceeded target by 7% — 4,280 hours logged in Q2.',
    'Governance at 98% — G3.2 Anti-Bribery flag requires resolution before H2 audit.',
    'Scope 3 supplier disclosure gaps identified in logistics chain — action required.',
    'AI carbon model projects 6.8% further Scope 2 reduction by Q4 if electrification continues.',
  ];

  bulletsEl.innerHTML = bullets.map(b =>
    `<div class="ai-bullet"><div class="ai-bullet-dot"></div><span>${b}</span></div>`
  ).join('');

  setTimeout(() => {
    document.querySelectorAll('.ai-bullet').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 180);
    });
  }, 50);

  const timeEl = document.getElementById('ai-gen-time');
  if (timeEl) timeEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function regenerateAISummary() {
  aiSummaryIndex = (aiSummaryIndex + 1) % AI_SUMMARIES.length;
  triggerAISummary();
  showToast('♻️ Regenerating AI Summary…', '#a855f7', 'refresh-cw');
}
