/* ============================================================
   EcoSphere AI — Admin Portal JavaScript
   Section navigation, data tables, modals, ECharts, health
   ============================================================ */
'use strict';

// ── Theme ───────────────────────────────────────────────────
(function() {
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') document.documentElement.classList.add('light');
  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', () => {
      document.documentElement.classList.toggle('light');
      localStorage.setItem('theme', document.documentElement.classList.contains('light') ? 'light' : 'dark');
      setTimeout(initAnalyticsCharts, 100);
    });
  });
})();

// ── Data Sources ─────────────────────────────────────────────
const DATA = {
  departments: [
    { name: 'Engineering',    head: 'Priya Sharma',   employees: 58, target: '1,200 tCO₂', score: 88, status: 'active' },
    { name: 'Operations',     head: 'Raj Mehta',      employees: 72, target: '2,400 tCO₂', score: 76, status: 'active' },
    { name: 'HR & People',    head: 'Anita Patel',    employees: 24, target: '200 tCO₂',   score: 90, status: 'active' },
    { name: 'Finance',        head: 'Kunal Joshi',    employees: 18, target: '150 tCO₂',   score: 85, status: 'active' },
    { name: 'Manufacturing',  head: 'Suresh Nair',    employees: 96, target: '3,800 tCO₂', score: 72, status: 'active' },
    { name: 'Supply Chain',   head: 'Deepa Verma',    employees: 34, target: '1,800 tCO₂', score: 68, status: 'active' },
    { name: 'Legal',          head: 'Amit Kapoor',    employees: 10, target: '80 tCO₂',    score: 99, status: 'active' },
    { name: 'Marketing',      head: 'Neha Singh',     employees: 22, target: '220 tCO₂',   score: 82, status: 'active' },
    { name: 'R&D',            head: 'Vikram Bose',    employees: 40, target: '400 tCO₂',   score: 91, status: 'active' },
    { name: 'IT & Systems',   head: 'Kavya Reddy',    employees: 28, target: '300 tCO₂',   score: 93, status: 'active' },
    { name: 'Quality',        head: 'Rohan Das',      employees: 16, target: '180 tCO₂',   score: 87, status: 'inactive' },
    { name: 'Sustainability', head: 'Joy Patel',      employees: 8,  target: '50 tCO₂',    score: 98, status: 'active' },
  ],

  employees: [
    { name: 'Joy Patel',     email: 'joy@ecosphere.ai',  dept: 'Sustainability', role: 'CSO',             level: 'Diamond',  xp: 12480, status: 'active' },
    { name: 'Priya Sharma',  email: 'priya@ecosphere.ai', dept: 'Engineering',   role: 'Head of Dept',    level: 'Gold',     xp: 8920,  status: 'active' },
    { name: 'Raj Mehta',     email: 'raj@ecosphere.ai',  dept: 'Operations',    role: 'Head of Dept',    level: 'Gold',     xp: 7340,  status: 'active' },
    { name: 'Anita Patel',   email: 'anita@ecosphere.ai', dept: 'HR & People',  role: 'HR Director',     level: 'Silver',   xp: 5820,  status: 'active' },
    { name: 'Kunal Joshi',   email: 'kunal@ecosphere.ai', dept: 'Finance',      role: 'CFO',             level: 'Silver',   xp: 4960,  status: 'active' },
    { name: 'Suresh Nair',   email: 'suresh@ecosphere.ai', dept: 'Manufacturing', role: 'Plant Manager', level: 'Bronze',   xp: 3780,  status: 'active' },
    { name: 'Deepa Verma',   email: 'deepa@ecosphere.ai', dept: 'Supply Chain', role: 'Manager',         level: 'Bronze',   xp: 3120,  status: 'active' },
    { name: 'Amit Kapoor',   email: 'amit@ecosphere.ai', dept: 'Legal',         role: 'General Counsel', level: 'Gold',     xp: 6200,  status: 'active' },
    { name: 'Neha Singh',    email: 'neha@ecosphere.ai', dept: 'Marketing',     role: 'CMO',             level: 'Silver',   xp: 4300,  status: 'active' },
    { name: 'Vikram Bose',   email: 'vikram@ecosphere.ai', dept: 'R&D',         role: 'Head of R&D',     level: 'Platinum', xp: 11200, status: 'active' },
    { name: 'Kavya Reddy',   email: 'kavya@ecosphere.ai', dept: 'IT & Systems', role: 'CTO',             level: 'Platinum', xp: 9800,  status: 'active' },
    { name: 'Rohan Das',     email: 'rohan@ecosphere.ai', dept: 'Quality',      role: 'QA Lead',         level: 'Bronze',   xp: 2900,  status: 'inactive' },
  ],

  categories: [
    { name: 'Electricity',      scope: 'Scope 2', unit: 'kWh',    factor: 0.4328, updated: 'Jul 1, 2026',  status: 'active' },
    { name: 'Natural Gas',      scope: 'Scope 1', unit: 'MMBtu',  factor: 53.06,  updated: 'Jul 1, 2026',  status: 'active' },
    { name: 'Fleet Diesel',     scope: 'Scope 1', unit: 'litre',  factor: 2.6880, updated: 'Jun 15, 2026', status: 'active' },
    { name: 'Air Travel',       scope: 'Scope 3', unit: 'km',     factor: 0.2550, updated: 'Jun 1, 2026',  status: 'active' },
    { name: 'Manufacturing',    scope: 'Scope 1', unit: 'tonne',  factor: 1.8400, updated: 'May 20, 2026', status: 'active' },
    { name: 'Purchased Goods',  scope: 'Scope 3', unit: 'USD',    factor: 0.0081, updated: 'May 1, 2026',  status: 'pending' },
    { name: 'Waste to Landfill',scope: 'Scope 3', unit: 'tonne',  factor: 0.4570, updated: 'Apr 10, 2026', status: 'active' },
    { name: 'Water Abstraction',scope: 'Scope 3', unit: 'm³',     factor: 0.2440, updated: 'Mar 5, 2026',  status: 'inactive' },
  ],

  emissionFactors: [
    { name: 'Grid Electricity (National)',     scope: 'Scope 2', category: 'Electricity',    value: 0.4328, unit: 'kgCO₂/kWh',   source: 'IEA 2025',      year: 2025 },
    { name: 'Diesel Combustion',               scope: 'Scope 1', category: 'Fleet',          value: 2.6880, unit: 'kgCO₂/litre', source: 'DEFRA 2025',    year: 2025 },
    { name: 'Petrol Combustion',               scope: 'Scope 1', category: 'Fleet',          value: 2.3120, unit: 'kgCO₂/litre', source: 'DEFRA 2025',    year: 2025 },
    { name: 'Natural Gas',                     scope: 'Scope 1', category: 'Energy',         value: 2.0200, unit: 'kgCO₂/m³',    source: 'EPA 2024',      year: 2024 },
    { name: 'Domestic Short-Haul Flight',      scope: 'Scope 3', category: 'Air Travel',     value: 0.2550, unit: 'kgCO₂/km',    source: 'ICAO 2025',     year: 2025 },
    { name: 'International Long-Haul Flight',  scope: 'Scope 3', category: 'Air Travel',     value: 0.1950, unit: 'kgCO₂/km',    source: 'ICAO 2025',     year: 2025 },
    { name: 'Waste to Landfill (Mixed)',       scope: 'Scope 3', category: 'Waste',          value: 0.4570, unit: 'kgCO₂/tonne', source: 'DEFRA 2025',    year: 2025 },
    { name: 'Water Supply',                    scope: 'Scope 3', category: 'Water',          value: 0.3440, unit: 'kgCO₂/m³',    source: 'WRAP 2024',     year: 2024 },
  ],

  rewards: [
    { name: 'Eco Coffee Voucher',    type: 'Voucher',   coins: 200,  stock: 150, redeemed: 42,  status: 'active'   },
    { name: '1 Day WFH Bonus',       type: 'Perk',      coins: 500,  stock: 50,  redeemed: 18,  status: 'active'   },
    { name: 'Bamboo Water Bottle',   type: 'Product',   coins: 350,  stock: 80,  redeemed: 31,  status: 'active'   },
    { name: 'Tree Planting Certificate', type: 'Digital', coins: 100, stock: 999, redeemed: 124, status: 'active'  },
    { name: 'Gym Membership (1 Mo)',  type: 'Perk',      coins: 800,  stock: 20,  redeemed: 7,   status: 'active'   },
    { name: 'Eco Tote Bag Bundle',    type: 'Product',   coins: 250,  stock: 60,  redeemed: 29,  status: 'active'   },
    { name: 'Carbon Offset Credit',  type: 'Digital',   coins: 600,  stock: 999, redeemed: 15,  status: 'active'   },
    { name: 'Premium ESG Course',    type: 'Education', coins: 1000, stock: 30,  redeemed: 4,   status: 'inactive' },
  ],

  badges: [
    { emoji: '🌱', name: 'First Steps',     rarity: 'Common',    awarded: 312 },
    { emoji: '🔥', name: 'Carbon Crusher',  rarity: 'Rare',      awarded: 87  },
    { emoji: '⚡', name: 'Energy Saver',    rarity: 'Rare',      awarded: 64  },
    { emoji: '🌊', name: 'Water Guardian',  rarity: 'Uncommon',  awarded: 143 },
    { emoji: '♻️', name: 'Zero Waste Hero', rarity: 'Epic',      awarded: 29  },
    { emoji: '🌍', name: 'Planet Protector',rarity: 'Epic',      awarded: 18  },
    { emoji: '🏆', name: 'ESG Champion',    rarity: 'Legendary', awarded: 6   },
    { emoji: '💎', name: 'Diamond Mind',    rarity: 'Legendary', awarded: 3   },
    { emoji: '🤝', name: 'Team Player',     rarity: 'Common',    awarded: 280 },
    { emoji: '📚', name: 'Policy Expert',   rarity: 'Uncommon',  awarded: 95  },
    { emoji: '🚗', name: 'Fleet Fighter',   rarity: 'Rare',      awarded: 52  },
    { emoji: '☀️', name: 'Solar Pioneer',   rarity: 'Epic',      awarded: 22  },
  ],

  policies: [
    { name: 'Anti-Bribery & Corruption Policy',   category: 'Governance',    owner: 'Amit Kapoor',  version: 'v3.2', due: 'Aug 1, 2026',  acks: '310/324', status: 'review'   },
    { name: 'Environmental Management System',     category: 'Environmental', owner: 'Joy Patel',    version: 'v2.1', due: 'Sep 15, 2026', acks: '298/324', status: 'active'   },
    { name: 'Carbon Reduction Roadmap 2030',       category: 'Environmental', owner: 'Joy Patel',    version: 'v1.0', due: 'Dec 31, 2026', acks: '280/324', status: 'active'   },
    { name: 'Diversity, Equity & Inclusion',       category: 'Social',        owner: 'Anita Patel',  version: 'v2.0', due: 'Jul 31, 2026', acks: '322/324', status: 'active'   },
    { name: 'Supply Chain Sustainability',         category: 'Environmental', owner: 'Deepa Verma',  version: 'v1.3', due: 'Oct 1, 2026',  acks: '145/324', status: 'pending'  },
    { name: 'Data Privacy & GDPR Compliance',      category: 'Governance',    owner: 'Amit Kapoor',  version: 'v4.1', due: 'Jul 15, 2026', acks: '318/324', status: 'active'   },
    { name: 'Whistleblower Protection',            category: 'Governance',    owner: 'Amit Kapoor',  version: 'v1.1', due: 'Nov 1, 2026',  acks: '290/324', status: 'pending'  },
  ],

  challenges: [
    { name: 'Zero Paper Week',        type: 'Weekly',  xp: 200, participants: 248, completion: 72, deadline: 'Jul 18, 2026', status: 'active'   },
    { name: 'Bike to Work Day',       type: 'Daily',   xp: 100, participants: 89,  completion: 89, deadline: 'Jul 12, 2026', status: 'active'   },
    { name: 'Plant-Based Lunch',      type: 'Daily',   xp: 50,  participants: 312, completion: 94, deadline: 'Jul 12, 2026', status: 'active'   },
    { name: 'Carbon Audit Month',     type: 'Monthly', xp: 800, participants: 324, completion: 38, deadline: 'Jul 31, 2026', status: 'active'   },
    { name: 'ESG Training Marathon',  type: 'Monthly', xp: 500, participants: 187, completion: 61, deadline: 'Jul 31, 2026', status: 'active'   },
    { name: 'Waste Sorting Drive',    type: 'Weekly',  xp: 150, participants: 196, completion: 55, deadline: 'Jul 18, 2026', status: 'active'   },
    { name: 'Solar Awareness Quiz',   type: 'Daily',   xp: 75,  participants: 203, completion: 80, deadline: 'Jul 12, 2026', status: 'inactive' },
    { name: 'Team Carbon Race Q3',    type: 'Team',    xp: 2000, participants: 12, completion: 25, deadline: 'Sep 30, 2026', status: 'active'   },
  ],

  csr: [
    { name: 'Coastal Cleanup Drive',    category: 'Environment', date: 'Jul 5, 2026',  volunteers: 84,  budget: 8500,  impact: 92, status: 'complete' },
    { name: 'Tree Plantation 5000',     category: 'Environment', date: 'Jun 21, 2026', volunteers: 124, budget: 12000, impact: 97, status: 'complete' },
    { name: 'School ESG Workshop',      category: 'Education',   date: 'Jul 8, 2026',  volunteers: 32,  budget: 3200,  impact: 85, status: 'complete' },
    { name: 'Rural Solar Lighting',     category: 'Energy',      date: 'Aug 10, 2026', volunteers: 48,  budget: 45000, impact: 0,  status: 'pending'  },
    { name: 'Food Bank Support',        category: 'Social',      date: 'Jun 10, 2026', volunteers: 62,  budget: 6800,  impact: 88, status: 'complete' },
    { name: 'Skill Development Camp',   category: 'Education',   date: 'Aug 20, 2026', volunteers: 28,  budget: 15000, impact: 0,  status: 'pending'  },
    { name: 'Water Conservation Study', category: 'Environment', date: 'Sep 1, 2026',  volunteers: 16,  budget: 9000,  impact: 0,  status: 'pending'  },
  ],

  notifications: [
    { title: 'Q2 ESG Report Ready',         audience: 'All Employees',  priority: 'Normal',  sent: 'Jul 10, 10:00', reach: 324, read: 87 },
    { title: 'Carbon Audit Reminder',       audience: 'Operations',     priority: 'High',    sent: 'Jul 9, 09:30',  reach: 72,  read: 92 },
    { title: 'New Policy Acknowledgement',  audience: 'All Employees',  priority: 'High',    sent: 'Jul 8, 14:00',  reach: 324, read: 95 },
    { title: 'Eco League Season 4 Launch',  audience: 'All Employees',  priority: 'Normal',  sent: 'Jul 5, 08:00',  reach: 324, read: 78 },
    { title: 'System Maintenance Window',   audience: 'Admin Only',     priority: 'Critical',sent: 'Jul 4, 16:00',  reach: 5,   read: 100},
  ],

  auditLogs: [
    { ts: 'Jul 12, 11:18', user: 'Joy Patel',   action: 'Permission Change', module: 'Role Permissions', ip: '192.168.1.4',  risk: 'high'   },
    { ts: 'Jul 12, 10:42', user: 'Amit Kapoor', action: 'Policy Published',  module: 'Policies',         ip: '192.168.1.12', risk: 'low'    },
    { ts: 'Jul 12, 09:31', user: 'Kavya Reddy', action: 'Data Export',       module: 'Reports',          ip: '192.168.1.8',  risk: 'medium' },
    { ts: 'Jul 12, 08:55', user: 'Raj Mehta',   action: 'Employee Deleted',  module: 'Employees',        ip: '192.168.1.20', risk: 'high'   },
    { ts: 'Jul 11, 17:22', user: 'Joy Patel',   action: 'Backup Initiated',  module: 'System',           ip: '192.168.1.4',  risk: 'low'    },
    { ts: 'Jul 11, 16:44', user: 'Priya Sharma',action: 'Challenge Created', module: 'Challenges',       ip: '192.168.1.15', risk: 'low'    },
    { ts: 'Jul 11, 15:10', user: 'Anita Patel', action: 'Login (2FA)',       module: 'Auth',             ip: '192.168.1.6',  risk: 'low'    },
    { ts: 'Jul 11, 14:30', user: 'Unknown',      action: 'Failed Login ×3',  module: 'Auth',             ip: '203.0.113.42', risk: 'high'   },
  ],

  activityLog: [
    { color: '#10b981', text: 'Joy Patel generated the Q2 ESG Summary Report', time: '2 min ago' },
    { color: '#3b82f6', text: 'Raj Mehta updated Operations carbon data for June 2026', time: '8 min ago' },
    { color: '#a855f7', text: 'System: Daily backup completed successfully (4.2 GB)', time: '15 min ago' },
    { color: '#eab308', text: 'Priya Sharma acknowledged the Anti-Bribery Policy v3.2', time: '22 min ago' },
    { color: '#10b981', text: 'New challenge "Carbon Audit Month" hit 38% completion', time: '30 min ago' },
    { color: '#ef4444', text: 'Alert: Scope 3 Logistics emission factor missing — review needed', time: '45 min ago' },
    { color: '#3b82f6', text: 'Vikram Bose redeemed "Tree Planting Certificate" (100 coins)', time: '1 hr ago' },
    { color: '#94a3b8', text: 'System health check passed — all 6 services operational', time: '1 hr ago' },
    { color: '#a855f7', text: 'Neha Singh earned the "Team Player" badge 🤝', time: '2 hrs ago' },
    { color: '#eab308', text: 'Supply Chain Sustainability Policy sent for approval', time: '3 hrs ago' },
  ],

  services: [
    { name: 'API Gateway',        status: 'online', uptime: '99.98%', response: '48ms',  check: '30s ago' },
    { name: 'Authentication',     status: 'online', uptime: '100%',   response: '22ms',  check: '30s ago' },
    { name: 'AI Recommendation',  status: 'online', uptime: '99.84%', response: '340ms', check: '30s ago' },
    { name: 'Report Engine',      status: 'online', uptime: '99.91%', response: '120ms', check: '30s ago' },
    { name: 'Carbon Calculator',  status: 'online', uptime: '99.99%', response: '55ms',  check: '30s ago' },
    { name: 'Email / Notify',     status: 'online', uptime: '99.72%', response: '90ms',  check: '30s ago' },
  ],

  dbTables: [
    { table: 'employees',       rows: '324',    size: '2.1 MB',  indexes: 8,  vacuum: 'Jul 11', status: 'healthy' },
    { table: 'emissions',       rows: '48,920', size: '14.3 MB', indexes: 12, vacuum: 'Jul 10', status: 'healthy' },
    { table: 'challenges',      rows: '1,240',  size: '820 KB',  indexes: 6,  vacuum: 'Jul 11', status: 'healthy' },
    { table: 'audit_logs',      rows: '94,801', size: '38.6 MB', indexes: 4,  vacuum: 'Jul 9',  status: 'healthy' },
    { table: 'reports',         rows: '2,148',  size: '6.8 MB',  indexes: 7,  vacuum: 'Jul 10', status: 'healthy' },
    { table: 'notifications',   rows: '8,430',  size: '3.2 MB',  indexes: 4,  vacuum: 'Jul 8',  status: 'warn'    },
    { table: 'reward_catalog',  rows: '248',    size: '180 KB',  indexes: 3,  vacuum: 'Jul 5',  status: 'healthy' },
    { table: 'badges',          rows: '12',     size: '40 KB',   indexes: 2,  vacuum: 'Jul 1',  status: 'healthy' },
  ],

  backups: [
    { date: 'Jul 12, 02:00', type: 'Full',        size: '4.2 GB', duration: '8 min',  status: 'success' },
    { date: 'Jul 11, 02:00', type: 'Full',        size: '4.1 GB', duration: '7 min',  status: 'success' },
    { date: 'Jul 10, 14:00', type: 'Incremental', size: '340 MB', duration: '1 min',  status: 'success' },
    { date: 'Jul 10, 02:00', type: 'Full',        size: '4.0 GB', duration: '8 min',  status: 'success' },
    { date: 'Jul 9, 02:00',  type: 'Full',        size: '3.9 GB', duration: '7 min',  status: 'success' },
    { date: 'Jul 8, 02:00',  type: 'Full',        size: '3.9 GB', duration: '9 min',  status: 'failed'  },
    { date: 'Jul 7, 02:00',  type: 'Full',        size: '3.8 GB', duration: '7 min',  status: 'success' },
  ],
};

// ── Permission Matrix Data ───────────────────────────────────
const ROLES = ['Super Admin', 'Admin', 'Manager', 'Employee', 'Viewer'];
const MODULES = ['Dashboard','Environmental','Social','Governance','AI Insights','Reports','Eco League','Admin Portal'];
const PERMS_DEFAULT = {
  'Super Admin': [1,1,1,1,1,1,1,1],
  'Admin':       [1,1,1,1,1,1,1,1],
  'Manager':     [1,1,1,1,1,1,1,0],
  'Employee':    [1,1,1,0,1,1,1,0],
  'Viewer':      [1,1,0,0,0,1,0,0],
};

// ── DOM Ready ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();
  initTheme();
  animateOverviewKPIs();
  populateAllTables();
  renderBadgeGallery();
  renderPermissionMatrix();
  renderActivityLog();
  renderOverviewActivity();
  simulateHealthMetrics();
  initAnalyticsCharts();

  // Read query params or URL hash to switch section on load (e.g. settings)
  const urlParams = new URLSearchParams(window.location.search);
  const sectionParam = urlParams.get('section') || (window.location.hash ? window.location.hash.substring(1) : null);
  if (sectionParam) {
    switchSection(sectionParam);
  }
});


// ── Theme ────────────────────────────────────────────────────
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    localStorage.setItem('theme', document.documentElement.classList.contains('light') ? 'light' : 'dark');
    setTimeout(initAnalyticsCharts, 120);
  });
}

// ── Section Navigation ────────────────────────────────────────
function switchSection(id) {
  // Hide all sections
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  // Show target section
  const target = document.getElementById('section-' + id);
  if (target) target.classList.add('active');
  // Update sidebar active state
  document.querySelectorAll('.admin-nav-item').forEach(n => n.classList.remove('active'));
  const navItem = document.querySelector(`[data-section="${id}"]`);
  if (navItem) navItem.classList.add('active');
  // Update topbar title
  const labels = {
    overview: 'Admin Dashboard', analytics: 'Analytics', 'activity-logs': 'Activity Logs',
    'audit-logs': 'Audit Logs', departments: 'Department Management', employees: 'Employee Management',
    categories: 'Category Management', 'emission-factors': 'Emission Factors',
    policies: 'Policy Management', challenges: 'Challenge Management',
    csr: 'CSR Activity Management', rewards: 'Rewards Management',
    badges: 'Badge Management', notifications: 'Notification Center',
    'role-permissions': 'Role & Permissions', 'system-health': 'System Health',
    database: 'Database Status', backup: 'Backup Management', settings: 'System Settings',
  };
  const title = document.getElementById('topbar-title');
  if (title) title.textContent = labels[id] || 'Admin Portal';
  // Re-init charts if navigating to analytics
  if (id === 'analytics') setTimeout(initAnalyticsCharts, 80);
  // Re-init health animation if navigating there
  if (id === 'system-health') simulateHealthMetrics();
}

// ── KPI Counter Animation ─────────────────────────────────────
function animateOverviewKPIs() {
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 50));
    const t = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(t);
    }, 20);
  });
}

// ── Populate All Tables ───────────────────────────────────────
function populateAllTables() {
  renderTable('dept-tbody', DATA.departments, d =>
    `<td style="font-weight:600;color:var(--text-primary);">${d.name}</td>
     <td>${d.head}</td><td>${d.employees}</td><td>${d.target}</td>
     <td><span style="font-weight:700;color:${d.score>=85?'#10b981':d.score>=70?'#eab308':'#ef4444'}">${d.score}</span></td>
     <td>${pill(d.status)}</td><td>${actionBtns()}</td>`
  );

  renderTable('emp-tbody', DATA.employees, e =>
    `<td style="font-weight:600;color:var(--text-primary);">${e.name}</td>
     <td style="font-size:11.5px;">${e.email}</td><td>${e.dept}</td><td>${e.role}</td>
     <td>${levelBadge(e.level)}</td>
     <td style="font-family:'Space Mono',monospace;font-size:11.5px;">${e.xp.toLocaleString()}</td>
     <td>${pill(e.status)}</td><td>${actionBtns()}</td>`
  );

  renderTable('cat-tbody', DATA.categories, c =>
    `<td style="font-weight:600;color:var(--text-primary);">${c.name}</td>
     <td>${scopePill(c.scope)}</td><td>${c.unit}</td>
     <td style="font-family:'Space Mono',monospace;">${c.factor}</td>
     <td>${c.updated}</td><td>${pill(c.status)}</td><td>${actionBtns()}</td>`
  );

  renderTable('ef-tbody', DATA.emissionFactors, e =>
    `<td style="font-weight:600;color:var(--text-primary);">${e.name}</td>
     <td>${scopePill(e.scope)}</td><td>${e.category}</td>
     <td style="font-family:'Space Mono',monospace;font-weight:700;">${e.value}</td>
     <td>${e.unit}</td><td style="font-size:11.5px;color:var(--text-muted);">${e.source}</td>
     <td>${e.year}</td><td>${actionBtns()}</td>`
  );

  renderTable('rew-tbody', DATA.rewards, r =>
    `<td style="font-weight:600;color:var(--text-primary);">${r.name}</td>
     <td><span class="a-pill pill-info">${r.type}</span></td>
     <td><span style="font-weight:700;color:#eab308;">🪙 ${r.coins}</span></td>
     <td>${r.stock}</td><td>${r.redeemed}</td><td>${pill(r.status)}</td><td>${actionBtns()}</td>`
  );

  renderTable('pol-tbody', DATA.policies, p =>
    `<td style="font-weight:600;color:var(--text-primary);max-width:200px;">${p.name}</td>
     <td><span class="a-pill pill-purple">${p.category}</span></td>
     <td>${p.owner}</td><td><span style="font-family:'Space Mono',monospace;font-size:11px;">${p.version}</span></td>
     <td>${p.due}</td>
     <td>
       <div style="font-size:11.5px;">${p.acks}</div>
       <div style="height:3px;background:rgba(255,255,255,0.06);border-radius:2px;margin-top:4px;width:80px;">
         <div style="height:100%;background:#10b981;border-radius:2px;width:${Math.round((parseInt(p.acks)/324)*100)}%;"></div>
       </div>
     </td>
     <td>${pill(p.status, {review:'In Review'})}</td><td>${actionBtns('view')}</td>`
  );

  renderTable('chal-tbody', DATA.challenges, c =>
    `<td style="font-weight:600;color:var(--text-primary);">${c.name}</td>
     <td><span class="a-pill pill-info">${c.type}</span></td>
     <td><span style="font-weight:700;color:#a855f7;">⭐ ${c.xp}</span></td>
     <td>${c.participants}</td>
     <td>
       <div style="font-size:11.5px;font-weight:700;">${c.completion}%</div>
       <div style="height:3px;background:rgba(255,255,255,0.06);border-radius:2px;margin-top:4px;width:80px;">
         <div style="height:100%;background:#10b981;border-radius:2px;width:${c.completion}%;"></div>
       </div>
     </td>
     <td>${c.deadline}</td><td>${pill(c.status)}</td><td>${actionBtns()}</td>`
  );

  renderTable('csr-tbody', DATA.csr, c =>
    `<td style="font-weight:600;color:var(--text-primary);">${c.name}</td>
     <td><span class="a-pill pill-info">${c.category}</span></td>
     <td>${c.date}</td><td>${c.volunteers}</td>
     <td style="font-weight:600;">$${c.budget.toLocaleString()}</td>
     <td>${c.impact > 0 ? `<span style="font-weight:700;color:#10b981;">${c.impact}</span>` : '–'}</td>
     <td>${pill(c.status, {complete:'Complete'})}</td><td>${actionBtns()}</td>`
  );

  renderTable('notif-tbody', DATA.notifications, n =>
    `<td style="font-weight:600;color:var(--text-primary);">${n.title}</td>
     <td>${n.audience}</td>
     <td><span class="a-pill ${n.priority==='Critical'?'pill-danger':n.priority==='High'?'pill-pending':'pill-info'}">${n.priority}</span></td>
     <td style="font-size:11.5px;color:var(--text-muted);">${n.sent}</td>
     <td>${n.reach}</td>
     <td><span style="font-weight:700;color:#10b981;">${n.read}%</span></td>
     <td><button class="btn-icon-action" title="Delete"><i data-lucide="trash-2" style="width:13px;height:13px;"></i></button></td>`
  );

  renderTable('audit-tbody', DATA.auditLogs, a =>
    `<td style="font-family:'Space Mono',monospace;font-size:11px;">${a.ts}</td>
     <td style="font-weight:600;color:var(--text-primary);">${a.user}</td>
     <td>${a.action}</td><td>${a.module}</td>
     <td style="font-family:'Space Mono',monospace;font-size:11px;">${a.ip}</td>
     <td><span class="a-pill ${a.risk==='high'?'pill-danger':a.risk==='medium'?'pill-pending':'pill-info'}">${a.risk}</span></td>
     <td><button class="btn-icon-action" title="View"><i data-lucide="eye" style="width:13px;height:13px;"></i></button></td>`
  );

  renderTable('service-tbody', DATA.services, s =>
    `<td style="font-weight:600;color:var(--text-primary);">${s.name}</td>
     <td><span class="a-pill pill-active"><span class="db-status-dot dot-online" style="display:inline-block;"></span> ${s.status}</span></td>
     <td style="font-weight:700;color:#10b981;">${s.uptime}</td>
     <td style="font-family:'Space Mono',monospace;">${s.response}</td>
     <td style="font-size:11px;color:var(--text-muted);">${s.check}</td>`
  );

  renderTable('db-tbody', DATA.dbTables, d =>
    `<td style="font-weight:600;color:var(--text-primary);font-family:'Space Mono',monospace;">${d.table}</td>
     <td>${d.rows}</td><td>${d.size}</td><td>${d.indexes}</td>
     <td style="font-size:11.5px;color:var(--text-muted);">${d.vacuum}</td>
     <td>${pill(d.status, {healthy:'Healthy', warn:'Warning'})}</td>`
  );

  renderTable('bk-tbody', DATA.backups, b =>
    `<td style="font-family:'Space Mono',monospace;font-size:11.5px;">${b.date}</td>
     <td><span class="a-pill pill-info">${b.type}</span></td>
     <td>${b.size}</td><td>${b.duration}</td>
     <td><span class="a-pill ${b.status==='success'?'pill-active':'pill-danger'}">${b.status==='success'?'✓ Success':'✗ Failed'}</span></td>
     <td>
       <div class="btn-action-group">
         <button class="btn-icon-action" onclick="adminToast('Download started','#10b981')" title="Download"><i data-lucide="download" style="width:13px;height:13px;"></i></button>
         ${b.status==='failed'?`<button class="btn-icon-action" onclick="adminToast('Restore initiated','#3b82f6')" title="Retry"><i data-lucide="refresh-cw" style="width:13px;height:13px;"></i></button>`:''}
       </div>
     </td>`
  );

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderTable(tbodyId, data, rowFn) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = data.map(d => `<tr>${rowFn(d)}</tr>`).join('');
}

function pill(status, labels = {}) {
  const map = {
    active:   ['pill-active',   labels.active   || 'Active'],
    inactive: ['pill-inactive', labels.inactive  || 'Inactive'],
    pending:  ['pill-pending',  labels.pending   || 'Pending'],
    review:   ['pill-info',     labels.review    || 'In Review'],
    complete: ['pill-active',   labels.complete  || 'Complete'],
    draft:    ['pill-inactive', labels.draft     || 'Draft'],
    healthy:  ['pill-active',   labels.healthy   || 'Healthy'],
    warn:     ['pill-pending',  labels.warn      || 'Warning'],
    failed:   ['pill-danger',   labels.failed    || 'Failed'],
  };
  const [cls, label] = map[status] || ['pill-info', status];
  return `<span class="a-pill ${cls}">${label}</span>`;
}

function scopePill(scope) {
  const map = { 'Scope 1': 'pill-danger', 'Scope 2': 'pill-pending', 'Scope 3': 'pill-info' };
  return `<span class="a-pill ${map[scope] || 'pill-info'}">${scope}</span>`;
}

function levelBadge(level) {
  const colors = { Diamond: '#06b6d4', Platinum: '#a855f7', Gold: '#eab308', Silver: '#94a3b8', Bronze: '#f97316' };
  const c = colors[level] || '#94a3b8';
  return `<span style="font-size:10.5px;font-weight:800;color:${c};background:${c}22;padding:2px 8px;border-radius:10px;">${level}</span>`;
}

function actionBtns(extra = '') {
  const viewBtn = extra === 'view' || extra === 'all' ? `<button class="btn-icon-action" onclick="adminToast('Opening record…','#3b82f6')"><i data-lucide="eye" style="width:13px;height:13px;"></i></button>` : '';
  return `<div class="btn-action-group">
    ${viewBtn}
    <button class="btn-icon-action" onclick="adminToast('Edit mode opened','#eab308')"><i data-lucide="edit-3" style="width:13px;height:13px;"></i></button>
    <button class="btn-icon-action danger" onclick="adminToast('Record deleted','#ef4444')"><i data-lucide="trash-2" style="width:13px;height:13px;"></i></button>
  </div>`;
}

// ── Badge Gallery ─────────────────────────────────────────────
function renderBadgeGallery() {
  const gallery = document.getElementById('badge-gallery');
  if (!gallery) return;
  const rarityColors = { Common: '#94a3b8', Uncommon: '#10b981', Rare: '#3b82f6', Epic: '#a855f7', Legendary: '#eab308' };
  gallery.innerHTML = DATA.badges.map(b => `
    <div class="badge-card" onclick="adminToast('${b.name} selected','#a855f7')">
      <span class="badge-emoji">${b.emoji}</span>
      <div class="badge-name">${b.name}</div>
      <div class="badge-rarity" style="color:${rarityColors[b.rarity] || '#94a3b8'};">${b.rarity}</div>
      <div style="font-size:10px;color:var(--text-muted);margin-top:4px;">Awarded: ${b.awarded}×</div>
    </div>
  `).join('');
}

// ── Permission Matrix ─────────────────────────────────────────
function renderPermissionMatrix() {
  const table = document.getElementById('perm-matrix');
  if (!table) return;
  const header = `<thead><tr><th>Module</th>${ROLES.map(r => `<th>${r}</th>`).join('')}</tr></thead>`;
  const body = MODULES.map(m => {
    const cells = ROLES.map(r => {
      const checked = PERMS_DEFAULT[r][MODULES.indexOf(m)] ? 'checked' : '';
      return `<td><label class="toggle-switch"><input type="checkbox" ${checked} onchange="adminToast('Permission updated','#10b981')"><span class="toggle-slider"></span></label></td>`;
    }).join('');
    return `<tr><td>${m}</td>${cells}</tr>`;
  }).join('');
  table.innerHTML = `${header}<tbody>${body}</tbody>`;
}

// ── Activity / Audit Logs ─────────────────────────────────────
function renderActivityLog() {
  const container = document.getElementById('activity-log-container');
  if (!container) return;
  container.innerHTML = DATA.activityLog.map(e => `
    <div class="log-entry">
      <div class="log-dot" style="background:${e.color};box-shadow:0 0 4px ${e.color};"></div>
      <span class="log-text">${e.text}</span>
      <span class="log-time">${e.time}</span>
    </div>
  `).join('');
}

function renderOverviewActivity() {
  const container = document.getElementById('overview-activity-log');
  if (!container) return;
  container.innerHTML = DATA.activityLog.slice(0, 6).map(e => `
    <div class="log-entry">
      <div class="log-dot" style="background:${e.color};box-shadow:0 0 4px ${e.color};"></div>
      <span class="log-text">${e.text}</span>
      <span class="log-time">${e.time}</span>
    </div>
  `).join('');
}

// ── Table Search Filter ───────────────────────────────────────
function filterAdminTable(tbodyId, query) {
  const q = query.toLowerCase();
  const rows = document.querySelectorAll(`#${tbodyId} tr`);
  rows.forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function filterByDept(dept) {
  const rows = document.querySelectorAll('#emp-tbody tr');
  rows.forEach(row => {
    if (!dept) { row.style.display = ''; return; }
    row.style.display = row.textContent.includes(dept) ? '' : 'none';
  });
}

// ── System Health Simulation ──────────────────────────────────
function simulateHealthMetrics() {
  const metrics = [
    { valId: 'cpu-val', barId: 'cpu-bar', min: 20, max: 65, fillClass: 'fill-green', suffix: '%' },
    { valId: 'mem-val', barId: 'mem-bar', min: 55, max: 78, fillClass: 'fill-yellow', suffix: '%' },
    { valId: 'disk-val', barId: 'disk-bar', min: 45, max: 52, fillClass: 'fill-blue', suffix: '%' },
    { valId: 'net-val', barId: 'net-bar', min: 5, max: 30, fillClass: 'fill-purple', suffix: ' MB/s', scale: 0.5 },
  ];

  metrics.forEach(m => {
    const val = Math.floor(Math.random() * (m.max - m.min + 1)) + m.min;
    const valEl = document.getElementById(m.valId);
    const barEl = document.getElementById(m.barId);
    if (valEl) valEl.textContent = (m.scale ? (val * m.scale).toFixed(1) : val) + m.suffix;
    if (barEl) barEl.style.width = val + '%';
  });
}

// ── Modal System ──────────────────────────────────────────────
const MODAL_FORMS = {
  dept: {
    title: 'Add Department',
    fields: [
      { label: 'Department Name', name: 'name', type: 'text', full: false },
      { label: 'Head of Department', name: 'head', type: 'text', full: false },
      { label: 'Carbon Target (tCO₂)', name: 'target', type: 'text', full: false },
      { label: 'Status', name: 'status', type: 'select', options: ['Active','Inactive'], full: false },
    ]
  },
  emp: {
    title: 'Add Employee',
    fields: [
      { label: 'Full Name', name: 'name', type: 'text', full: false },
      { label: 'Email', name: 'email', type: 'text', full: false },
      { label: 'Department', name: 'dept', type: 'select', options: ['Engineering','Operations','HR & People','Finance','Manufacturing','Supply Chain','Legal','Marketing','R&D','IT & Systems'], full: false },
      { label: 'Role', name: 'role', type: 'text', full: false },
      { label: 'Status', name: 'status', type: 'select', options: ['Active','Inactive'], full: false },
    ]
  },
  cat: {
    title: 'Add Category',
    fields: [
      { label: 'Category Name', name: 'name', type: 'text', full: false },
      { label: 'Scope', name: 'scope', type: 'select', options: ['Scope 1','Scope 2','Scope 3'], full: false },
      { label: 'Unit', name: 'unit', type: 'text', full: false },
      { label: 'Emission Factor', name: 'factor', type: 'text', full: false },
    ]
  },
  ef: { title: 'Add Emission Factor', fields: [
    { label: 'Factor Name', name: 'name', type: 'text', full: true },
    { label: 'Scope', name: 'scope', type: 'select', options: ['Scope 1','Scope 2','Scope 3'], full: false },
    { label: 'Value (kgCO₂e)', name: 'value', type: 'text', full: false },
    { label: 'Unit', name: 'unit', type: 'text', full: false },
    { label: 'Source', name: 'source', type: 'text', full: false },
  ]},
  rew: { title: 'Add Reward', fields: [
    { label: 'Reward Name', name: 'name', type: 'text', full: false },
    { label: 'Type', name: 'type', type: 'select', options: ['Voucher','Perk','Product','Digital','Education'], full: false },
    { label: 'Green Coins Cost', name: 'coins', type: 'text', full: false },
    { label: 'Stock', name: 'stock', type: 'text', full: false },
  ]},
  badge: { title: 'Create Badge', fields: [
    { label: 'Badge Name', name: 'name', type: 'text', full: false },
    { label: 'Emoji Icon', name: 'emoji', type: 'text', full: false },
    { label: 'Rarity', name: 'rarity', type: 'select', options: ['Common','Uncommon','Rare','Epic','Legendary'], full: false },
    { label: 'XP Required', name: 'xp', type: 'text', full: false },
    { label: 'Description', name: 'desc', type: 'textarea', full: true },
  ]},
  pol: { title: 'New Policy', fields: [
    { label: 'Policy Name', name: 'name', type: 'text', full: true },
    { label: 'Category', name: 'cat', type: 'select', options: ['Governance','Environmental','Social'], full: false },
    { label: 'Owner', name: 'owner', type: 'text', full: false },
    { label: 'Due Date', name: 'due', type: 'text', full: false },
    { label: 'Description', name: 'desc', type: 'textarea', full: true },
  ]},
  chal: { title: 'New Challenge', fields: [
    { label: 'Challenge Name', name: 'name', type: 'text', full: false },
    { label: 'Type', name: 'type', type: 'select', options: ['Daily','Weekly','Monthly','Team'], full: false },
    { label: 'XP Reward', name: 'xp', type: 'text', full: false },
    { label: 'Deadline', name: 'deadline', type: 'text', full: false },
    { label: 'Description', name: 'desc', type: 'textarea', full: true },
  ]},
  csr: { title: 'New CSR Activity', fields: [
    { label: 'Activity Name', name: 'name', type: 'text', full: false },
    { label: 'Category', name: 'cat', type: 'select', options: ['Environment','Education','Social','Energy','Health'], full: false },
    { label: 'Date', name: 'date', type: 'text', full: false },
    { label: 'Budget (USD)', name: 'budget', type: 'text', full: false },
  ]},
};

function openModal(type) {
  const config = MODAL_FORMS[type];
  if (!config) return;
  document.getElementById('modal-title').textContent = config.title;
  const body = document.getElementById('modal-body');
  const formRows = config.fields.map(f => `
    <div class="admin-form-group ${f.full ? 'full' : ''}">
      <label>${f.label}</label>
      ${f.type === 'select'
        ? `<select>${f.options.map(o => `<option>${o}</option>`).join('')}</select>`
        : f.type === 'textarea'
        ? `<textarea rows="3" placeholder="${f.label}…"></textarea>`
        : `<input type="text" placeholder="${f.label}…">`
      }
    </div>
  `).join('');

  body.innerHTML = `
    <div class="admin-form-grid">${formRows}</div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:4px;">
      <button class="btn-admin-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-admin-primary" onclick="saveModal('${config.title}')"><i data-lucide="save" style="width:13px;height:13px;"></i> Save</button>
    </div>
  `;
  document.getElementById('admin-modal').classList.add('active');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeModal() {
  document.getElementById('admin-modal').classList.remove('active');
}

function saveModal(title) {
  closeModal();
  adminToast(`✅ ${title} saved successfully!`, '#10b981');
}

// Close on overlay click
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('admin-modal');
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
});

// ── Notification ───────────────────────────────────────────────
function sendNotification() {
  const title = document.getElementById('notif-title')?.value;
  if (!title) { adminToast('Please enter a notification title.', '#ef4444'); return; }
  adminToast(`📣 Notification "${title}" sent!`, '#10b981');
}

// ── Toast ─────────────────────────────────────────────────────
function adminToast(message, color = '#10b981') {
  const stack = document.getElementById('admin-toast-stack');
  if (!stack) return;
  const toast = document.createElement('div');
  toast.className = 'admin-toast';
  toast.innerHTML = `
    <div style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></div>
    <span>${message}</span>
  `;
  stack.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 350);
  }, 3000);
}

// ── Analytics Charts ──────────────────────────────────────────
let analyticsCharts = [];

function initAnalyticsCharts() {
  analyticsCharts.forEach(c => c && c.dispose());
  analyticsCharts = [];

  const isDark = !document.documentElement.classList.contains('light');
  const axisColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)';
  const tooltipText = isDark ? '#f8fafc' : '#1e293b';

  const sharedTooltip = { backgroundColor: tooltipBg, borderColor: 'rgba(255,255,255,0.06)', textStyle: { color: tooltipText, fontSize: 12 } };

  // DAU chart
  const dau = initChart('chart-dau');
  if (dau) {
    const days = Array.from({length:30}, (_,i) => `Jun ${i+12}`);
    const values = [180,192,210,198,220,234,215,240,258,270,245,280,290,275,310,298,324,308,340,322,355,340,368,352,380,365,392,378,410,395];
    dau.setOption({
      backgroundColor:'transparent',
      tooltip:{trigger:'axis',...sharedTooltip},
      grid:{left:'3%',right:'3%',bottom:'3%',top:'8%',containLabel:true},
      xAxis:{type:'category',data:days,axisLabel:{color:textColor,fontSize:9},axisLine:{lineStyle:{color:axisColor}}},
      yAxis:{type:'value',splitLine:{lineStyle:{color:axisColor}},axisLabel:{color:textColor,fontSize:9}},
      series:[{type:'line',smooth:true,data:values,itemStyle:{color:'#10b981'},lineStyle:{width:2.5},areaStyle:{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:'rgba(16,185,129,0.25)'},{offset:1,color:'rgba(16,185,129,0)'}]}}}]
    });
    analyticsCharts.push(dau);
  }

  // Module usage
  const mod = initChart('chart-modules');
  if (mod) {
    mod.setOption({
      backgroundColor:'transparent',
      tooltip:{trigger:'item',...sharedTooltip},
      legend:{orient:'vertical',right:'2%',top:'center',textStyle:{color:textColor,fontSize:10}},
      series:[{type:'pie',radius:['38%','68%'],center:['38%','50%'],
        itemStyle:{borderRadius:5,borderColor:'transparent',borderWidth:2},
        label:{show:false},
        data:[
          {value:4280,name:'Dashboard',       itemStyle:{color:'#10b981'}},
          {value:3120,name:'Environmental',   itemStyle:{color:'#3b82f6'}},
          {value:2840,name:'Reports',         itemStyle:{color:'#a855f7'}},
          {value:2210,name:'Social',          itemStyle:{color:'#eab308'}},
          {value:1980,name:'AI Insights',     itemStyle:{color:'#06b6d4'}},
          {value:1640,name:'Eco League',      itemStyle:{color:'#f97316'}},
        ]
      }]
    });
    analyticsCharts.push(mod);
  }

  // Reports chart
  const rep = initChart('chart-reports');
  if (rep) {
    const days14 = Array.from({length:14}, (_,i) => `Jul ${i+1}`);
    const vals = [12,18,24,15,30,22,28,34,20,38,32,41,36,45];
    rep.setOption({
      backgroundColor:'transparent',
      tooltip:{trigger:'axis',...sharedTooltip},
      grid:{left:'3%',right:'3%',bottom:'3%',top:'8%',containLabel:true},
      xAxis:{type:'category',data:days14,axisLabel:{color:textColor,fontSize:9},axisLine:{lineStyle:{color:axisColor}}},
      yAxis:{type:'value',splitLine:{lineStyle:{color:axisColor}},axisLabel:{color:textColor,fontSize:9}},
      series:[{type:'bar',data:vals,barMaxWidth:28,itemStyle:{color:'#3b82f6',borderRadius:4}}]
    });
    analyticsCharts.push(rep);
  }

  // ESG trend
  const esg = initChart('chart-esg-trend');
  if (esg) {
    esg.setOption({
      backgroundColor:'transparent',
      tooltip:{trigger:'axis',...sharedTooltip},
      grid:{left:'3%',right:'3%',bottom:'3%',top:'8%',containLabel:true},
      xAxis:{type:'category',data:['Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'],axisLabel:{color:textColor,fontSize:9},axisLine:{lineStyle:{color:axisColor}}},
      yAxis:{type:'value',min:80,max:100,splitLine:{lineStyle:{color:axisColor}},axisLabel:{color:textColor,fontSize:9}},
      series:[{type:'line',smooth:true,data:[85,86,87,88,88,89,89,90,90,91,91,91],itemStyle:{color:'#10b981'},lineStyle:{width:3},areaStyle:{color:{type:'linear',x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:'rgba(16,185,129,0.2)'},{offset:1,color:'rgba(16,185,129,0)'}]}}}]
    });
    analyticsCharts.push(esg);
  }

  window.addEventListener('resize', () => analyticsCharts.forEach(c => c && c.resize()));
}

function initChart(id) {
  const dom = document.getElementById(id);
  if (!dom || typeof echarts === 'undefined') return null;
  return echarts.init(dom, null, { renderer: 'canvas' });
}
