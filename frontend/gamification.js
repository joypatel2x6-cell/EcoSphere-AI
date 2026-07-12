// EcoSphere AI - Sustainability Eco League Logic, Spin Wheel & Confetti Engines

let userCoins = 350;
let userXP = 420;
let userLeaderboardXP = 1420;
let isSpinning = false;
let wheelCanvas = null;
let ctx = null;

// Slices on lucky spin wheel (8 slices)
const slices = [
  { name: "+50 Coins", color: "#3b82f6", type: "coins", value: 50 },
  { name: "+100 XP", color: "#a855f7", type: "xp", value: 100 },
  { name: "Gold Trophy", color: "#ffc200", type: "trophy", value: "Gold Wheel Trophy" },
  { name: "+20 Coins", color: "#1d4ed8", type: "coins", value: 20 },
  { name: "+50 XP", color: "#7e22ce", type: "xp", value: 50 },
  { name: "Try Again", color: "#475569", type: "nothing", value: 0 },
  { name: "+100 Coins", color: "#10b981", type: "coins", value: 100 },
  { name: "Bronze Badge", color: "#ff9600", type: "trophy", value: "Bronze Wheel Badge" }
];

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 2. Sync Theme Mode
  initGamingTheme();

  // 3. Draw HTML5 Spin Wheel Slices
  initSpinWheelCanvas();

  // 4. Set Initial Player State Progress Bars
  updatePlayerUI();

  // 5. Initialize Confetti Screen Canvas
  initConfettiCanvas();
});

// 1. Theme Configuration
function initGamingTheme() {
  const toggleBtn = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;

  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') {
    htmlRoot.classList.add('light');
  } else {
    htmlRoot.classList.remove('light');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      htmlRoot.classList.toggle('light');
      const isLight = htmlRoot.classList.contains('light');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      initSpinWheelCanvas(); // Redraw with proper light/dark texts
    });
  }
}

// 2. Player State Manager
function updatePlayerUI(animated = false) {
  const coinsText = document.getElementById('green-coins-count');
  const coinsBadge = document.getElementById('profile-coins-badge');
  const xpText = document.getElementById('profile-xp-text');
  const xpFill = document.getElementById('xp-progress-fill');
  const leaderboardXp = document.getElementById('leaderboard-xp-val');

  if (coinsText) coinsText.innerText = userCoins;
  if (xpText) xpText.innerText = `${userXP} / 1000 XP`;
  if (leaderboardXp) leaderboardXp.innerText = `${userLeaderboardXP.toLocaleString()} XP`;

  if (xpFill) {
    const pct = Math.min(100, (userXP / 1000) * 100);
    xpFill.style.width = `${pct}%`;
  }

  // Gaming bounce effect on coin increments
  if (animated && coinsBadge) {
    gsap.fromTo(coinsBadge, { scale: 1.15 }, { scale: 1, duration: 0.4, ease: "back.out(2)" });
  }
}

// 3. HTML5 Lucky Spin Wheel Drawing
function initSpinWheelCanvas() {
  wheelCanvas = document.getElementById('wheel-canvas');
  if (!wheelCanvas) return;

  ctx = wheelCanvas.getContext('2d');
  const width = wheelCanvas.width;
  const height = wheelCanvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const radius = width / 2 - 10;

  ctx.clearRect(0, 0, width, height);

  const angleStep = (2 * Math.PI) / slices.length;
  const isLight = document.documentElement.classList.contains('light');

  for (let i = 0; i < slices.length; i++) {
    const angle = i * angleStep;
    
    // Draw Slice Arc
    ctx.fillStyle = slices[i].color;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, angle, angle + angleStep);
    ctx.closePath();
    ctx.fill();

    // Slice Separators
    ctx.lineWidth = 2;
    ctx.strokeStyle = isLight ? "#ffffff" : "#0f172a";
    ctx.stroke();

    // Text Label inside Slices
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle + angleStep / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11.5px Inter';
    ctx.fillText(slices[i].name, radius - 20, 4);
    ctx.restore();
  }

  // Draw Center PlayStation Orb
  ctx.beginPath();
  ctx.arc(cx, cy, 32, 0, 2 * Math.PI);
  ctx.fillStyle = isLight ? '#0f172a' : '#1e293b';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffc200'; // Gold border
  ctx.stroke();

  // Draw central PS symbol text
  ctx.fillStyle = '#ffc200';
  ctx.font = 'bold 16px Space Grotesk';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('ES', cx, cy);
}

// 4. Spin Wheel Animation Trigger
function spinWheel() {
  if (isSpinning) return;

  if (userCoins < 50) {
    showGameToast('⚠️ Insufficient Green Coins! Complete daily missions to earn more coins.', '#eab308');
    return;
  }

  userCoins -= 50;
  updatePlayerUI(true);
  
  isSpinning = true;
  const btn = document.getElementById('btn-spin');
  if (btn) btn.disabled = true;

  // PlayStation spin sound and visual decelerating turns
  const extraDegrees = 1440 + Math.floor(Math.random() * 360); // 4 full turns + offset
  const finalRads = (extraDegrees * Math.PI) / 180;
  
  // Transition style spin
  const canvas = document.getElementById('wheel-canvas');
  if (canvas) {
    canvas.style.transform = `rotate(${extraDegrees}deg)`;
  }

  setTimeout(() => {
    isSpinning = false;
    if (btn) btn.disabled = false;
    // Keep canvas at final spin angle (do NOT reset to 0 — that causes visible snap)
    // The visual angle is tracked via CSS transform; we only record logical slice index

    // Calculate landing index
    // Slices go clockwise starting from angle 0 (east). Pointer is at north (-90deg = 270deg).
    // Land degrees relative offset:
    const relativeDeg = (360 - (extraDegrees % 360)) % 360;
    // Pointer is at top (270deg), so offset is:
    const pointerDeg = (relativeDeg + 270) % 360;
    const sliceAngle = 360 / slices.length;
    const winningIdx = Math.floor(pointerDeg / sliceAngle) % slices.length;
    
    const winItem = slices[winningIdx];

    // Trigger reward updates
    let title = "Trophy Earned!";
    let desc = `You landed on ${winItem.name}!`;

    if (winItem.type === 'coins') {
      userCoins += winItem.value;
      title = "Jackpot Coins Earned!";
      desc = `You scored +${winItem.value} Green Coins! Spend them in the rewards shop.`;
    } else if (winItem.type === 'xp') {
      userXP = Math.min(1000, userXP + winItem.value);
      userLeaderboardXP += winItem.value;
      title = "League XP Boost!";
      desc = `You earned +${winItem.value} XP points! Your Diamond League ranking has increased.`;
    } else if (winItem.type === 'trophy') {
      title = "PlayStation Gold Trophy!";
      desc = `Unbelievable! You unlocked the rare: "${winItem.value}"!`;
      
      // Unlock grayscale Wheel Master badge
      const badge = document.getElementById('badge-wheel');
      if (badge) badge.classList.add('unlocked');
    } else {
      title = "Lucky Spin Wheel Reset";
      desc = "Close slice. Try again to hit the Gold Trophy jackpot!";
    }

    triggerConfetti();
    openVictoryModal(title, desc);
    updatePlayerUI(true);
  }, 5000);
}

// 5. Daily/Weekly Mission Claiming
function claimMission(missionType, coinsReward, xpReward) {
  const card = document.getElementById(`mission-${missionType}`);
  const claimBtn = document.getElementById(`btn-claim-${missionType}`);

  if (!claimBtn || claimBtn.disabled) return;

  claimBtn.innerText = 'Claimed ✔';
  claimBtn.disabled = true;

  // Add rewards
  userCoins += coinsReward;
  userXP = Math.min(1000, userXP + xpReward);
  userLeaderboardXP += xpReward;

  triggerConfetti();
  openVictoryModal("Mission Completed!", `Successfully completed sustainability task! Earned +${coinsReward} Green Coins and +${xpReward} XP.`);
  updatePlayerUI(true);
}

// 6. Shop Rewards Redemption
function redeemShopReward(rewardId, cost, name) {
  if (userCoins < cost) {
    showGameToast(`⚠️ Insufficient Green Coins! You need ${cost} coins to redeem "${name}". Earn more by completing missions.`, '#eab308');
    return;
  }

  userCoins -= cost;
  updatePlayerUI(true);

  triggerConfetti();
  openVictoryModal("Voucher Redeemed!", `You have successfully redeemed the "${name}"! A verification download certificate has been sent to your files drawer.`);
}

// 7. Victory Modals Layout Toggles
function openVictoryModal(title, desc) {
  const modal = document.getElementById('victory-modal');
  const titleNode = document.getElementById('victory-title');
  const descNode = document.getElementById('victory-description');

  if (modal && titleNode && descNode) {
    titleNode.innerText = title;
    descNode.innerText = desc;
    modal.classList.add('active');
    
    // GSAP bounce scale
    modal.querySelector('.modal-card').style.transform = 'scale(0.8)';
    gsap.to(modal.querySelector('.modal-card'), { transform: 'scale(1)', duration: 0.4, ease: "back.out(2)" });
  }
}

function closeVictoryModal() {
  const modal = document.getElementById('victory-modal');
  if (modal) {
    gsap.to(modal.querySelector('.modal-card'), {
      transform: 'scale(0.8)',
      duration: 0.15,
      onComplete: () => {
        modal.classList.remove('active');
      }
    });
  }
}

// 8. Custom Canvas Confetti Animation Engine
let confettiCanvas = null;
let cctx = null;
let confettiParticles = [];

function initConfettiCanvas() {
  confettiCanvas = document.getElementById('confetti-canvas');
  if (confettiCanvas) {
    cctx = confettiCanvas.getContext('2d');
    resizeConfettiCanvas();
    window.addEventListener('resize', resizeConfettiCanvas);
  }
}

function resizeConfettiCanvas() {
  if (confettiCanvas) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
}

function triggerConfetti() {
  confettiParticles = [];
  const colors = ['#58cc02', '#0070d1', '#ffc200', '#ff4b4b', '#a855f7'];

  // Spawn 120 particles
  for (let i = 0; i < 120; i++) {
    confettiParticles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 50,
      y: window.innerHeight + 10,
      vx: (Math.random() - 0.5) * 15,
      vy: -15 - Math.random() * 15,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    });
  }

  animateConfetti();
}

function animateConfetti() {
  if (confettiParticles.length === 0) return;

  cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    
    // Physics
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.4; // gravity
    p.vx *= 0.98; // wind resistance
    p.rotation += p.rotationSpeed;

    // Draw particle
    cctx.save();
    cctx.translate(p.x, p.y);
    cctx.rotate((p.rotation * Math.PI) / 180);
    cctx.fillStyle = p.color;
    cctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    cctx.restore();

    // Remove if off screen
    if (p.y > window.innerHeight + 20) {
      confettiParticles.splice(i, 1);
    }
  }

  requestAnimationFrame(animateConfetti);
}

// 9. Premium In-Page Toast (replaces browser alert())
function showGameToast(message, color = '#10b981') {
  // Find or create toast container
  let stack = document.getElementById('game-toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'game-toast-stack';
    stack.style.cssText = `
      position: fixed; bottom: 90px; right: 24px; z-index: 9999;
      display: flex; flex-direction: column; gap: 10px; pointer-events: none;
    `;
    document.body.appendChild(stack);
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: rgba(15,23,42,0.97); border: 1px solid ${color}44;
    border-left: 3px solid ${color}; border-radius: 14px; padding: 14px 18px;
    font-size: 12.5px; color: #f8fafc; font-family: 'Inter', sans-serif;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5); max-width: 320px; pointer-events: all;
    animation: game-toast-in 0.35s cubic-bezier(0.16,1,0.3,1) forwards;
  `;
  toast.innerHTML = message;

  // Add keyframe if not already present
  if (!document.getElementById('game-toast-styles')) {
    const style = document.createElement('style');
    style.id = 'game-toast-styles';
    style.textContent = `
      @keyframes game-toast-in { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
    `;
    document.head.appendChild(style);
  }

  stack.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

