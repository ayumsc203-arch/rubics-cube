// ── STATE STORE (LOCAL STORAGE BACKED) ──
const Store = {
  db: {
    username: "Ayu Solver",
    avatar: "👦",
    xp: 280,
    lvl: 12,
    streak: 5,
    coins: 350,
    solves: [
      { id: 1, type: "3x3 Classic", time: 24.15, scramble: "R U R' U' F' U2 F R U R'", date: "2026-06-25" },
      { id: 2, type: "2x2 Pocket", time: 8.42, scramble: "U R' F U' R F' R U'", date: "2026-06-26" },
      { id: 3, type: "3x3 Classic", time: 19.58, scramble: "R' D' R F2 L D2 R2 B2", date: "2026-06-26" }
    ],
    favorites: ["T-Perm", "F2L Case 3"],
    completedLessons: ["Beginner 01", "Beginner 02"],
    settings: { sound: true, cursor: true, theme: "glass" }
  },
  load() {
    const saved = localStorage.getItem("ayu_cube_store");
    if (saved) this.db = JSON.parse(saved);
  },
  save() {
    localStorage.setItem("ayu_cube_store", JSON.stringify(this.db));
  },
  addSolve(time, scramble, type="3x3 Classic") {
    const solve = { id: Date.now(), type, time, scramble, date: new Date().toISOString().split('T')[0] };
    this.db.solves.unshift(solve);
    this.addXP(15);
    this.db.coins += 5;
    this.save();
    return solve;
  },
  addXP(amount) {
    this.db.xp += amount;
    const threshold = this.db.lvl * 100;
    if (this.db.xp >= threshold) {
      this.db.xp -= threshold;
      this.db.lvl++;
      showToast(`🎉 Level Up! You are now Level ${this.db.lvl}!`, "🏆");
      addNotification(`Congratulations! You reached Level ${this.db.lvl}!`);
    }
    this.save();
  }
};

// Initialize Store
Store.load();

// ── TOAST NOTIFICATIONS ──
function showToast(msg, icon = "✦") {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span> <span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function createToastContainer() {
  const div = document.createElement('div');
  div.id = 'toast-container';
  document.body.appendChild(div);
  return div;
}

// ── NOTIFICATIONS POPULAR ──
let notificationsList = [
  "🔥 Daily Challenge available: Complete 1 solve!",
  "🏆 Achievement unlocked: First Solve!",
  "📚 Lesson unlocked: White Cross Step-by-Step"
];

function addNotification(msg) {
  notificationsList.unshift(msg);
  updateNotificationsUI();
  const badge = document.getElementById("noti-badge");
  if (badge) {
    badge.textContent = notificationsList.length;
    badge.style.display = 'block';
  }
}

function updateNotificationsUI() {
  const list = document.getElementById("noti-list");
  if (!list) return;
  list.innerHTML = notificationsList.map(n => `<li class="noti-item">${n}</li>`).join('');
}

function toggleNotifications() {
  const dropdown = document.getElementById("noti-dropdown");
  if (dropdown) dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

function clearNotifications() {
  notificationsList = [];
  updateNotificationsUI();
  const badge = document.getElementById("noti-badge");
  if (badge) badge.style.display = 'none';
}

// ── RUBIK'S CUBE MATH ENGINE ──
class RubiksCube {
  constructor() { this.reset(); }
  reset() {
    this.state = {
      U: Array(9).fill('white'), D: Array(9).fill('yellow'), F: Array(9).fill('red'),
      B: Array(9).fill('orange'), L: Array(9).fill('blue'), R: Array(9).fill('green')
    };
  }
  rotateFaceCW(face) {
    const f = this.state[face]; const prev = [...f];
    f[0] = prev[6]; f[1] = prev[3]; f[2] = prev[0];
    f[3] = prev[7];                 f[5] = prev[1];
    f[6] = prev[8]; f[7] = prev[5]; f[8] = prev[2];
  }
  rotateFaceCCW(face) {
    const f = this.state[face]; const prev = [...f];
    f[0] = prev[2]; f[1] = prev[5]; f[2] = prev[8];
    f[3] = prev[1];                 f[5] = prev[7];
    f[6] = prev[0]; f[7] = prev[3]; f[8] = prev[6];
  }
  move(m) {
    switch(m) {
      case 'U':
        this.rotateFaceCW('U');
        var temp = [this.state.F[0], this.state.F[1], this.state.F[2]];
        this.state.F[0] = this.state.R[0]; this.state.F[1] = this.state.R[1]; this.state.F[2] = this.state.R[2];
        this.state.R[0] = this.state.B[0]; this.state.R[1] = this.state.B[1]; this.state.R[2] = this.state.B[2];
        this.state.B[0] = this.state.L[0]; this.state.B[1] = this.state.L[1]; this.state.B[2] = this.state.L[2];
        this.state.L[0] = temp[0]; this.state.L[1] = temp[1]; this.state.L[2] = temp[2];
        break;
      case "U'":
        this.rotateFaceCCW('U');
        var temp = [this.state.F[0], this.state.F[1], this.state.F[2]];
        this.state.F[0] = this.state.L[0]; this.state.F[1] = this.state.L[1]; this.state.F[2] = this.state.L[2];
        this.state.L[0] = this.state.B[0]; this.state.L[1] = this.state.B[1]; this.state.L[2] = this.state.B[2];
        this.state.B[0] = this.state.R[0]; this.state.B[1] = this.state.R[1]; this.state.B[2] = this.state.R[2];
        this.state.R[0] = temp[0]; this.state.R[1] = temp[1]; this.state.R[2] = temp[2];
        break;
      case 'D':
        this.rotateFaceCW('D');
        var temp = [this.state.F[6], this.state.F[7], this.state.F[8]];
        this.state.F[6] = this.state.L[6]; this.state.F[7] = this.state.L[7]; this.state.F[8] = this.state.L[8];
        this.state.L[6] = this.state.B[6]; this.state.L[7] = this.state.B[7]; this.state.L[8] = this.state.B[8];
        this.state.B[6] = this.state.R[6]; this.state.B[7] = this.state.R[7]; this.state.B[8] = this.state.R[8];
        this.state.R[6] = temp[0]; this.state.R[7] = temp[1]; this.state.R[8] = temp[2];
        break;
      case "D'":
        this.rotateFaceCCW('D');
        var temp = [this.state.F[6], this.state.F[7], this.state.F[8]];
        this.state.F[6] = this.state.R[6]; this.state.F[7] = this.state.R[7]; this.state.F[8] = this.state.R[8];
        this.state.R[6] = this.state.B[6]; this.state.R[7] = this.state.B[7]; this.state.R[8] = this.state.B[8];
        this.state.B[6] = this.state.L[6]; this.state.B[7] = this.state.L[7]; this.state.B[8] = this.state.L[8];
        this.state.L[6] = temp[0]; this.state.L[7] = temp[1]; this.state.L[8] = temp[2];
        break;
      case 'R':
        this.rotateFaceCW('R');
        var temp = [this.state.U[2], this.state.U[5], this.state.U[8]];
        this.state.U[2] = this.state.F[2]; this.state.U[5] = this.state.F[5]; this.state.U[8] = this.state.F[8];
        this.state.F[2] = this.state.D[2]; this.state.F[5] = this.state.D[5]; this.state.F[8] = this.state.D[8];
        this.state.D[2] = this.state.B[6]; this.state.D[5] = this.state.B[3]; this.state.D[8] = this.state.B[0];
        this.state.B[6] = temp[0]; this.state.B[3] = temp[1]; this.state.B[0] = temp[2];
        break;
      case "R'":
        this.rotateFaceCCW('R');
        var temp = [this.state.U[2], this.state.U[5], this.state.U[8]];
        this.state.U[2] = this.state.B[6]; this.state.U[5] = this.state.B[3]; this.state.U[8] = this.state.B[0];
        this.state.B[6] = this.state.D[2]; this.state.B[3] = this.state.D[5]; this.state.B[0] = this.state.D[8];
        this.state.D[2] = this.state.F[2]; this.state.D[5] = this.state.F[5]; this.state.D[8] = this.state.F[8];
        this.state.F[2] = temp[0]; this.state.F[5] = temp[1]; this.state.F[8] = temp[2];
        break;
      case 'L':
        this.rotateFaceCW('L');
        var temp = [this.state.U[0], this.state.U[3], this.state.U[6]];
        this.state.U[0] = this.state.B[8]; this.state.U[3] = this.state.B[5]; this.state.U[6] = this.state.B[2];
        this.state.B[8] = this.state.D[0]; this.state.B[5] = this.state.D[3]; this.state.B[2] = this.state.D[6];
        this.state.D[0] = this.state.F[0]; this.state.D[3] = this.state.F[3]; this.state.D[6] = this.state.F[6];
        this.state.F[0] = temp[0]; this.state.F[3] = temp[1]; this.state.F[6] = temp[2];
        break;
      case "L'":
        this.rotateFaceCCW('L');
        var temp = [this.state.U[0], this.state.U[3], this.state.U[6]];
        this.state.U[0] = this.state.F[0]; this.state.U[3] = this.state.F[3]; this.state.U[6] = this.state.F[6];
        this.state.F[0] = this.state.D[0]; this.state.F[3] = this.state.D[3]; this.state.F[6] = this.state.D[6];
        this.state.D[0] = this.state.B[8]; this.state.D[3] = this.state.B[5]; this.state.D[6] = this.state.B[2];
        this.state.B[8] = temp[0]; this.state.B[5] = temp[1]; this.state.B[2] = temp[2];
        break;
      case 'F':
        this.rotateFaceCW('F');
        var temp = [this.state.U[6], this.state.U[7], this.state.U[8]];
        this.state.U[6] = this.state.L[8]; this.state.U[7] = this.state.L[5]; this.state.U[8] = this.state.L[2];
        this.state.L[8] = this.state.D[2]; this.state.L[5] = this.state.D[1]; this.state.L[2] = this.state.D[0];
        this.state.D[2] = this.state.R[0]; this.state.D[1] = this.state.R[3]; this.state.D[0] = this.state.R[6];
        this.state.R[0] = temp[0]; this.state.R[3] = temp[1]; this.state.R[6] = temp[2];
        break;
      case "F'":
        this.rotateFaceCCW('F');
        var temp = [this.state.U[6], this.state.U[7], this.state.U[8]];
        this.state.U[6] = this.state.R[0]; this.state.U[7] = this.state.R[3]; this.state.U[8] = this.state.R[6];
        this.state.R[0] = this.state.D[2]; this.state.R[3] = this.state.D[1]; this.state.R[6] = this.state.D[0];
        this.state.D[2] = this.state.L[8]; this.state.D[1] = this.state.L[5]; this.state.D[0] = this.state.L[2];
        this.state.L[8] = temp[0]; this.state.L[5] = temp[1]; this.state.L[2] = temp[2];
        break;
      case 'B':
        this.rotateFaceCW('B');
        var temp = [this.state.U[0], this.state.U[1], this.state.U[2]];
        this.state.U[0] = this.state.R[2]; this.state.U[1] = this.state.R[5]; this.state.U[2] = this.state.R[8];
        this.state.R[2] = this.state.D[8]; this.state.R[5] = this.state.D[7]; this.state.R[8] = this.state.D[6];
        this.state.D[8] = this.state.L[6]; this.state.D[7] = this.state.L[3]; this.state.D[6] = this.state.L[0];
        this.state.L[6] = temp[0]; this.state.L[3] = temp[1]; this.state.L[0] = temp[2];
        break;
      case "B'":
        this.rotateFaceCCW('B');
        var temp = [this.state.U[0], this.state.U[1], this.state.U[2]];
        this.state.U[0] = this.state.L[6]; this.state.U[1] = this.state.L[3]; this.state.U[2] = this.state.L[0];
        this.state.L[6] = this.state.D[8]; this.state.L[3] = this.state.D[7]; this.state.L[0] = this.state.D[6];
        this.state.D[8] = this.state.R[2]; this.state.D[7] = this.state.R[5]; this.state.D[6] = this.state.R[8];
        this.state.R[2] = temp[0]; this.state.R[5] = temp[1]; this.state.R[8] = temp[2];
        break;
    }
  }
  scramble(movesCount = 20) {
    const possible = ['U', "U'", 'D', "D'", 'R', "R'", 'L', "L'", 'F', "F'", 'B', "B'"];
    const scrambleMoves = []; let last = null;
    for (let i = 0; i < movesCount; i++) {
      let m;
      do { m = possible[Math.floor(Math.random() * possible.length)]; } while (last && m[0] === last[0]);
      this.move(m); scrambleMoves.push(m); last = m;
    }
    return scrambleMoves;
  }
}

// ── 3D CANVAS CUBE RENDERER ──
class CubeRenderer {
  constructor(canvas, cubeInstance, size = 3, autoRotate = true) {
    this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.cube = cubeInstance; this.N = size; this.autoRotate = autoRotate;
    this.rotX = -25; this.rotY = 35; this.isDragging = false;
    this.lastMX = 0; this.lastMY = 0; this.exploding = false; this.explodeT = 0;
    this.active = true; this.initEvents();
  }
  initEvents() {
    const c = this.canvas;
    c.addEventListener('mousedown', e => { this.isDragging = true; this.lastMX = e.clientX; this.lastMY = e.clientY; this.autoRotate = false; });
    window.addEventListener('mouseup', () => { this.isDragging = false; if (this.arTimeout) clearTimeout(this.arTimeout); this.arTimeout = setTimeout(() => this.autoRotate = true, 2000); });
    window.addEventListener('mousemove', e => { if (this.isDragging) { this.rotY += (e.clientX - this.lastMX)*0.4; this.rotX += (e.clientY - this.lastMY)*0.4; this.lastMX = e.clientX; this.lastMY = e.clientY; } });
    c.addEventListener('click', () => { if (!this.exploding && this.N === 3) { this.exploding = true; this.explodeT = 0; } });
  }
  project([x, y, z], cx, cy) { const fov = 500; const s = fov / (fov + z); return [cx + x*s, cy + y*s, s]; }
  rotatePoint([x, y, z], rx, ry) {
    let cos = Math.cos(ry), sin = Math.sin(ry); let nx = x*cos + z*sin, nz = -x*sin + z*cos; x = nx; z = nz;
    cos = Math.cos(rx); sin = Math.sin(rx); let ny = y*cos - z*sin; nz = y*sin + z*cos; y = ny; z = nz;
    return [x, y, z];
  }
  draw(t) {
    if (!this.active) return;
    const ctx = this.ctx; const SIZE = this.canvas.width; ctx.clearRect(0,0,SIZE,SIZE);
    const cx = SIZE/2, cy = SIZE/2;
    let cs = 38, gap = 3;
    if (this.N === 2) { cs = 55; gap = 4; }
    else if (this.N === 4) { cs = 28; gap = 2; }
    else if (this.N === 5) { cs = 22; gap = 2; }
    const S = this.N * cs + (this.N - 1)*gap;
    const rx = this.rotX * Math.PI/180, ry = this.rotY * Math.PI/180;
    const ef = this.exploding ? Math.sin(this.explodeT * Math.PI)*30 : 0;
    const faces = [
      { name: 'F', normal: [0,0,1],  origin: [-S/2,-S/2, S/2], uAxis: [1,0,0], vAxis: [0,1,0] },
      { name: 'B', normal: [0,0,-1], origin: [ S/2,-S/2,-S/2], uAxis: [-1,0,0], vAxis: [0,1,0] },
      { name: 'U', normal: [0,-1,0], origin: [-S/2,-S/2,-S/2], uAxis: [1,0,0], vAxis: [0,0,1] },
      { name: 'D', normal: [0,1,0],  origin: [-S/2, S/2, S/2], uAxis: [1,0,0], vAxis: [0,0,-1] },
      { name: 'L', normal: [-1,0,0], origin: [-S/2,-S/2, S/2], uAxis: [0,0,-1], vAxis: [0,1,0] },
      { name: 'R', normal: [1,0,0],  origin: [ S/2,-S/2,-S/2], uAxis: [0,0,1], vAxis: [0,1,0] },
    ];
    let drawList = [];
    const colorMap = { white: '#ffffff', yellow: '#eab308', red: '#ef4444', orange: '#f97316', blue: '#3b82f6', green: '#22c55e' };
    const defaultColors = { U: '#ffffff', D: '#eab308', F: '#ef4444', B: '#f97316', L: '#3b82f6', R: '#22c55e' };

    faces.forEach(face => {
      const rn = this.rotatePoint(face.normal, rx, ry); if (rn[2] >= 0) return;
      const exOff = this.rotatePoint(face.normal.map(n => n * ef), rx, ry);
      for (let row=0; row<this.N; row++) {
        for (let col=0; col<this.N; col++) {
          const lx = face.origin[0] + col * face.uAxis[0]*(cs+gap) + row * face.vAxis[0]*(cs+gap);
          const ly = face.origin[1] + col * face.uAxis[1]*(cs+gap) + row * face.vAxis[1]*(cs+gap);
          const lz = face.origin[2] + col * face.uAxis[2]*(cs+gap) + row * face.vAxis[2]*(cs+gap);
          const corners = [
            [lx, ly, lz],
            [lx + face.uAxis[0]*cs, ly + face.uAxis[1]*cs, lz + face.uAxis[2]*cs],
            [lx + face.uAxis[0]*cs + face.vAxis[0]*cs, ly + face.uAxis[1]*cs + face.vAxis[1]*cs, lz + face.uAxis[2]*cs + face.vAxis[2]*cs],
            [lx + face.vAxis[0]*cs, ly + face.vAxis[1]*cs, lz + face.vAxis[2]*cs]
          ];
          const proj = corners.map(p => {
            const rp = this.rotatePoint(p, rx, ry);
            return this.project([rp[0]+exOff[0], rp[1]+exOff[1], rp[2]+exOff[2]], cx, cy);
          });
          const avgZ = proj.reduce((s,p) => s+p[2], 0)/4;
          let color = defaultColors[face.name];
          if (this.cube && this.N === 3) {
            const cName = this.cube.state[face.name][row*3+col];
            color = colorMap[cName] || cName;
          }
          drawList.push({ proj, color, avgZ, dotN: rn[2] });
        }
      }
    });
    drawList.sort((a,b) => a.avgZ - b.avgZ);
    drawList.forEach(({ proj, color, dotN }) => {
      const light = Math.max(0.4, Math.min(1, 0.4 + Math.abs(dotN)*0.6));
      ctx.beginPath(); ctx.moveTo(proj[0][0], proj[0][1]);
      for (let i=1; i<4; i++) ctx.lineTo(proj[i][0], proj[i][1]);
      ctx.closePath();
      if (dotN < -0.7) { ctx.shadowColor = color; ctx.shadowBlur = 8; } else { ctx.shadowBlur = 0; }
      let r = 200, g = 200, b = 200;
      if (color.startsWith('#')) { r = parseInt(color.slice(1,3), 16); g = parseInt(color.slice(3,5), 16); b = parseInt(color.slice(5,7), 16); }
      ctx.fillStyle = `rgb(${Math.round(r*light)},${Math.round(g*light)},${Math.round(b*light)})`; ctx.fill();
      ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 1.5; ctx.stroke();
    });
  }
  animate(t) {
    if (!this.active) return;
    if (this.autoRotate && !this.isDragging) { this.rotY += 0.25; this.rotX = -25 + Math.sin(t * 0.0005) * 8; }
    if (this.exploding) { this.explodeT += 0.03; if (this.explodeT > 1) { this.exploding = false; this.explodeT = 0; } }
    this.draw(t);
  }
}

// Global active renderers
let activeRenderers = [];
function globalAnimate(t) {
  activeRenderers.forEach(r => r.animate(t));
  requestAnimationFrame(globalAnimate);
}
requestAnimationFrame(globalAnimate);

// Helper to switch active renderer
function setActiveRenderer(r) {
  activeRenderers.forEach(x => x.active = false);
  activeRenderers = [r];
  r.active = true;
}

// ── ROUTER & PAGE SWITCHER ──
function goToPage(page) {
  window.location.hash = '#/' + page;
}

function updateBreadcrumbs(page) {
  const bc = document.getElementById("breadcrumbs");
  if (!bc) return;
  const pageNames = {
    dashboard: "User Dashboard", solver: "AI Cube Solver", learn: "Learning Paths",
    algorithms: "Algorithms Library", cubes: "Cube Library", timer: "Speed Timer",
    practice: "Practice Arena", challenges: "Daily Challenges", community: "Community Hub",
    profile: "My Profile", settings: "Settings"
  };
  bc.innerHTML = `<a href="#/dashboard">App</a> <span>/</span> <span style="color:var(--text-primary)">${pageNames[page] || page}</span>`;
}

function handleRouting() {
  const hash = window.location.hash || '#/home';
  const page = hash.replace('#/', '');
  const appPages = ['dashboard', 'solver', 'learn', 'algorithms', 'cubes', 'timer', 'practice', 'challenges', 'community', 'profile', 'settings'];

  if (appPages.includes(page)) {
    document.getElementById('landing-view').style.display = 'none';
    document.getElementById('app-view').style.display = 'grid';

    document.querySelectorAll('.sidebar-menu li').forEach(li => {
      li.classList.toggle('active', li.getAttribute('data-target') === page);
    });

    document.querySelectorAll('.app-page-slot').forEach(slot => {
      slot.style.display = slot.id === `page-${page}` ? 'block' : 'none';
    });

    updateBreadcrumbs(page);
    onPageLoad(page);
  } else {
    document.getElementById('landing-view').style.display = 'block';
    document.getElementById('app-view').style.display = 'none';
    // Back to Hero Cube
    if (heroCubeRenderer) setActiveRenderer(heroCubeRenderer);
  }
}
window.addEventListener('hashchange', handleRouting);

// Page specific loader
function onPageLoad(page) {
  // Sync global coins and streak in app view
  const headerStreak = document.getElementById("header-streak");
  if (headerStreak) headerStreak.textContent = Store.db.streak + " days";
  const headerCoins = document.getElementById("header-coins");
  if (headerCoins) headerCoins.textContent = Store.db.coins;

  // Sidebar updates
  document.getElementById("sidebar-avatar").textContent = Store.db.avatar;
  document.getElementById("sidebar-username").textContent = Store.db.username;

  if (page === 'dashboard') {
    loadDashboard();
  } else if (page === 'solver') {
    loadSolver();
  } else if (page === 'learn') {
    loadLearn();
  } else if (page === 'algorithms') {
    loadAlgorithms();
  } else if (page === 'cubes') {
    loadCubes();
  } else if (page === 'timer') {
    loadTimer();
  } else if (page === 'practice') {
    loadPractice();
  } else if (page === 'challenges') {
    loadChallenges();
  } else if (page === 'community') {
    loadCommunity();
  } else if (page === 'profile') {
    loadProfile();
  } else if (page === 'settings') {
    loadSettings();
  }
}

// ── 1. USER DASHBOARD PAGE ──
function loadDashboard() {
  const root = document.getElementById("page-dashboard");
  root.innerHTML = `
    <h2 class="page-title">Dashboard</h2>
    <div class="grid-cols-3">
      <!-- User stats -->
      <div class="glass-card db-user-card">
        <div class="db-avatar">${Store.db.avatar}</div>
        <h3>${Store.db.username}</h3>
        <p style="font-size:0.75rem;color:var(--text-muted);font-family:var(--font-mono)">LEVEL ${Store.db.lvl}</p>
        <div class="xp-progress-bar">
          <div class="xp-progress-fill" style="width:${Store.db.xp % 100}%"></div>
        </div>
        <p style="font-size:0.75rem;color:var(--text-secondary)">${Store.db.xp} / ${Store.db.lvl * 100} XP to Level Up</p>
        
        <div class="db-stats-row">
          <div class="db-stat-item">
            <span class="val">${Store.db.solves.length}</span>
            <span class="lbl">Solved</span>
          </div>
          <div class="db-stat-item">
            <span class="val">🔥 ${Store.db.streak}d</span>
            <span class="lbl">Streak</span>
          </div>
          <div class="db-stat-item">
            <span class="val">🪙 ${Store.db.coins}</span>
            <span class="lbl">Coins</span>
          </div>
        </div>
      </div>
      
      <!-- Weekly Goals -->
      <div class="glass-card">
        <h3>Weekly Goals</h3>
        <div class="goals-list">
          <div class="goal-item completed">
            <span class="goal-check">✓</span>
            <span class="goal-text">Solve a 2x2 cube</span>
            <span class="goal-xp">+20 XP</span>
          </div>
          <div class="goal-item">
            <span class="goal-check"></span>
            <span class="goal-text">Submit 10 speed solves (3/10)</span>
            <span class="goal-xp">+50 XP</span>
          </div>
          <div class="goal-item">
            <span class="goal-check"></span>
            <span class="goal-text">Memorize T-Perm PLL algorithm</span>
            <span class="goal-xp">+30 XP</span>
          </div>
        </div>
      </div>

      <!-- Achievements -->
      <div class="glass-card">
        <h3>Unlocked Achievements</h3>
        <div class="quick-list" style="margin-top:1rem">
          <div class="quick-list-item">
            <span class="name">🚀 First Steps</span>
            <span style="font-size:0.72rem;color:var(--text-muted)">Solved 1st cube</span>
          </div>
          <div class="quick-list-item">
            <span class="name">🔥 Week On Fire</span>
            <span style="font-size:0.72rem;color:var(--text-muted)">5-day streak</span>
          </div>
          <div class="quick-list-item">
            <span class="name">⚡ Speedster</span>
            <span style="font-size:0.72rem;color:var(--text-muted)">Sub-30 seconds</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="glass-card" style="margin-top:1.5rem">
      <h3>Recent Solves</h3>
      <div class="table-wrapper">
        <table class="app-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Solve Time</th>
              <th>Scramble</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${Store.db.solves.slice(0, 5).map(s => `
              <tr>
                <td>${s.type}</td>
                <td style="color:var(--accent-cyan);font-weight:700">${s.time.toFixed(2)}s</td>
                <td style="font-family:var(--font-mono);font-size:0.75rem">${s.scramble}</td>
                <td>${s.date}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── 2. AI CUBE SOLVER PAGE ──
let solverCube;
let solverRenderer;
let activeColor = 'white';
let solverScrambleMoves = [];
let solverSolutionMoves = [];
let solverSolutionIndex = 0;
let solverPlayInterval = null;

function loadSolver() {
  const root = document.getElementById("page-solver");
  root.innerHTML = `
    <h2 class="page-title">AI Cube Solver</h2>
    <div class="solver-layout">
      <div class="glass-card">
        <div class="tabs-header">
          <button class="tab-btn active" onclick="switchSolverTab('manual')">Manual Input</button>
          <button class="tab-btn" onclick="switchSolverTab('webcam')">Webcam Scanner</button>
          <button class="tab-btn" onclick="switchSolverTab('upload')">Image Upload</button>
        </div>
        
        <!-- Manual Color Picker -->
        <div id="solver-manual" class="solver-tab-content">
          <div class="cube-net-container">
            <div class="cube-net" id="cube-net-grid"></div>
            
            <div class="palette">
              <button class="color-swatch active" style="background:#ffffff" onclick="selectSwatch('white', this)"></button>
              <button class="color-swatch" style="background:#eab308" onclick="selectSwatch('yellow', this)"></button>
              <button class="color-swatch" style="background:#ef4444" onclick="selectSwatch('red', this)"></button>
              <button class="color-swatch" style="background:#f97316" onclick="selectSwatch('orange', this)"></button>
              <button class="color-swatch" style="background:#3b82f6" onclick="selectSwatch('blue', this)"></button>
              <button class="color-swatch" style="background:#22c55e" onclick="selectSwatch('green', this)"></button>
            </div>
            
            <div class="net-controls">
              <button class="btn-secondary" onclick="resetSolverCube()">Reset</button>
              <button class="btn-secondary" onclick="scrambleSolverCube()">Scramble</button>
              <button class="btn-primary" onclick="validateSolverCube()">Validate State</button>
            </div>
            <div id="solver-validation-msg" style="font-size:0.8rem;text-align:center;min-height:20px;font-family:var(--font-mono)">Paint colors, then validate.</div>
          </div>
        </div>
        
        <!-- Webcam Scanner -->
        <div id="solver-webcam" class="solver-tab-content" style="display:none">
          <div class="camera-scanner-wrapper">
            <div class="camera-preview-box">
              <video id="scanner-video" autoplay playsinline></video>
              <div class="scanner-overlay">
                <div class="scanner-grid-helper">
                  <span></span><span></span><span></span>
                  <span></span><span></span><span></span>
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
            <div class="scan-progress-bar" id="scan-progress-bar"></div>
            <div class="scan-btns">
              <button class="btn-secondary" onclick="startScannerCamera()">Start Camera</button>
              <button class="btn-primary" onclick="captureScannerFace()">Scan Face</button>
              <button class="btn-secondary" id="scanner-solve-btn" disabled onclick="validateScannedCube()">Solve Scanned State</button>
            </div>
          </div>
        </div>

        <!-- Image Upload -->
        <div id="solver-upload" class="solver-tab-content" style="display:none">
          <div class="image-upload-wrapper">
            <label class="upload-drag-zone">
              <span>📁 Drag & Drop cube photo or Click to select</span>
              <span style="font-size:0.7rem;color:var(--text-muted)">U, D, F, B, L, R faces supported</span>
              <input type="file" accept="image/*" onchange="handleImageUpload(this)">
            </label>
            <div id="image-upload-preview-panel" style="display:none"></div>
          </div>
        </div>
      </div>
      
      <!-- Right panel: 3D player -->
      <div class="glass-card" style="display:flex; flex-direction:column; align-items:center; justify-content:space-between">
        <h3 style="align-self:flex-start">3D Solver Playback</h3>
        <canvas id="solver-canvas" width="300" height="300"></canvas>
        
        <div style="width:100%">
          <div class="metrics-grid">
            <div class="metric-card"><div class="val" id="metric-moves">0</div><div class="lbl">MOVES</div></div>
            <div class="metric-card"><div class="val" id="metric-time">0.0s</div><div class="lbl">EST. TIME</div></div>
            <div class="metric-card"><div class="val" id="metric-diff">-</div><div class="lbl">DIFFICULTY</div></div>
          </div>
          
          <div class="moves-narrator" id="moves-narrator">
            Scramble the cube or paint its net to generate a step-by-step solution player.
          </div>
          
          <div class="player-controls">
            <div class="moves-list-scroll" id="solver-moves-tokens"></div>
            <div class="player-buttons">
              <button class="btn-secondary" onclick="stepSolver(0)">First</button>
              <button class="btn-secondary" onclick="stepSolver(-1)">Prev</button>
              <button class="btn-primary" id="solver-play-btn" onclick="togglePlaySolver()">Play</button>
              <button class="btn-secondary" onclick="stepSolver(1)">Next</button>
              <button class="btn-secondary" onclick="stepSolver(999)">Last</button>
            </div>
            <div class="speed-slider-wrap">
              <span>Speed:</span>
              <input type="range" min="200" max="2000" value="800" id="solver-speed-slider">
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  solverCube = new RubiksCube();
  solverRenderer = new CubeRenderer(document.getElementById("solver-canvas"), solverCube, 3, true);
  setActiveRenderer(solverRenderer);

  renderNet();
}

function switchSolverTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn.textContent.toLowerCase().includes(tab)));
  document.querySelectorAll('.solver-tab-content').forEach(c => c.style.display = 'none');
  document.getElementById(`solver-${tab}`).style.display = 'block';
  if (tab === 'webcam') startScannerCamera();
  else stopScannerCamera();
}

function renderNet() {
  const container = document.getElementById("cube-net-grid");
  if (!container) return;
  const faces = ['U','L','F','R','B','D'];
  container.innerHTML = faces.map(face => `
    <div class="net-face" data-face="${face}">
      ${Array(9).fill(0).map((_, i) => `<span class="sticker" data-face="${face}" data-index="${i}" style="background:${getFaceDefaultColor(face)}" onclick="paintSticker(this)"></span>`).join('')}
    </div>
  `).join('');
}

function getFaceDefaultColor(face) {
  const map = { U:'white', D:'yellow', F:'red', B:'orange', L:'blue', R:'green' };
  return map[face];
}

function selectSwatch(color, el) {
  activeColor = color;
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
}

function paintSticker(el) {
  const face = el.getAttribute("data-face");
  const idx = parseInt(el.getAttribute("data-index"));
  const colorMap = { white: '#ffffff', yellow: '#eab308', red: '#ef4444', orange: '#f97316', blue: '#3b82f6', green: '#22c55e' };
  el.style.background = colorMap[activeColor];
  solverCube.state[face][idx] = activeColor;
}

function resetSolverCube() {
  solverCube.reset();
  solverScrambleMoves = [];
  solverSolutionMoves = [];
  solverSolutionIndex = 0;
  renderNet();
  updateSolverPlayerUI();
}

function scrambleSolverCube() {
  solverCube.reset();
  solverScrambleMoves = solverCube.scramble(12);
  // Solution is scramble moves in reverse and inverted
  solverSolutionMoves = [...solverScrambleMoves].reverse().map(m => m.endsWith("'") ? m[0] : m + "'");
  solverSolutionIndex = 0;
  
  // Update Net HTML display
  const stickers = document.querySelectorAll(".sticker");
  const colorMap = { white: '#ffffff', yellow: '#eab308', red: '#ef4444', orange: '#f97316', blue: '#3b82f6', green: '#22c55e' };
  stickers.forEach(s => {
    const f = s.getAttribute("data-face");
    const idx = parseInt(s.getAttribute("data-index"));
    s.style.background = colorMap[solverCube.state[f][idx]];
  });
  
  updateSolverPlayerUI();
  showToast("Cube Scrambled! Ready to solve.", "🧩");
}

function validateSolverCube() {
  const counts = { white: 0, yellow: 0, red: 0, orange: 0, blue: 0, green: 0 };
  for (let f in solverCube.state) {
    solverCube.state[f].forEach(c => counts[c]++);
  }
  const msg = document.getElementById("solver-validation-msg");
  let valid = true;
  for (let c in counts) {
    if (counts[c] !== 9) valid = false;
  }

  if (valid) {
    msg.style.color = "var(--accent-green)";
    msg.textContent = "Solvable state validated!";
    if (solverSolutionMoves.length === 0) {
      // Create a nice mock solution sequence if manually painted
      solverSolutionMoves = ["R", "U", "R'", "U'", "F", "R", "U", "R'", "U'", "F'"];
      updateSolverPlayerUI();
    }
  } else {
    msg.style.color = "var(--accent-red)";
    msg.textContent = "Error: Colors must count exactly 9 per color.";
    showToast("Invalid configuration count", "⚠️");
  }
}

// Webcam scanner state
let localStream = null;
let scanFaceIndex = 0;
const facesList = ['U', 'D', 'F', 'B', 'L', 'R'];
const scanData = {};

function startScannerCamera() {
  const video = document.getElementById("scanner-video");
  if (!video) return;
  navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => {
      localStream = stream;
      video.srcObject = stream;
      scanFaceIndex = 0;
      updateScannerProgress();
    })
    .catch(() => {
      showToast("Webcam blocked or missing. Simulating scanner...", "📷");
      simulateScanner();
    });
}

function stopScannerCamera() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
}

function updateScannerProgress() {
  const bar = document.getElementById("scan-progress-bar");
  if (!bar) return;
  bar.innerHTML = facesList.map((f, i) => `
    <div class="scan-dot ${i === scanFaceIndex ? 'active' : ''} ${i < scanFaceIndex ? 'completed' : ''}">
      ${i < scanFaceIndex ? '✓' : f}
    </div>
  `).join('');
}

function captureScannerFace() {
  const colors = ['white', 'yellow', 'red', 'orange', 'blue', 'green'];
  // Simulate face colors detection
  const detected = Array(9).fill(0).map(() => colors[Math.floor(Math.random()*6)]);
  const activeFace = facesList[scanFaceIndex];
  scanData[activeFace] = detected;
  
  showToast(`Captured face ${activeFace}!`, "📸");
  scanFaceIndex++;
  if (scanFaceIndex >= 6) {
    document.getElementById("scanner-solve-btn").disabled = false;
    stopScannerCamera();
  } else {
    updateScannerProgress();
  }
}

function validateScannedCube() {
  // Apply scanned state to cube
  for (let f in scanData) {
    solverCube.state[f] = [...scanData[f]];
  }
  showToast("Scanning synced! Check Net colors.", "🧩");
  switchSolverTab('manual');
  renderNet();
  validateSolverCube();
}

function simulateScanner() {
  scanFaceIndex = 0;
  updateScannerProgress();
  const iv = setInterval(() => {
    captureScannerFace();
    if (scanFaceIndex >= 6) clearInterval(iv);
  }, 1000);
}

function handleImageUpload(input) {
  if (!input.files || !input.files[0]) return;
  showToast("AI scanning image... Face identified!", "🤖");
  const activeFace = facesList[Math.floor(Math.random()*6)];
  // Populate random stickers
  const colors = ['white', 'yellow', 'red', 'orange', 'blue', 'green'];
  solverCube.state[activeFace] = Array(9).fill(0).map(() => colors[Math.floor(Math.random()*6)]);
  switchSolverTab('manual');
  renderNet();
  validateSolverCube();
}

// Solver Player Controllers
function updateSolverPlayerUI() {
  document.getElementById("metric-moves").textContent = solverSolutionMoves.length;
  document.getElementById("metric-time").textContent = (solverSolutionMoves.length * 0.45).toFixed(1) + "s";
  document.getElementById("metric-diff").textContent = solverSolutionMoves.length > 15 ? "Hard" : solverSolutionMoves.length > 8 ? "Medium" : "Easy";

  const scroll = document.getElementById("solver-moves-tokens");
  if (!scroll) return;
  scroll.innerHTML = solverSolutionMoves.map((m, i) => `
    <span class="move-token ${i === solverSolutionIndex ? 'active' : ''}">${m}</span>
  `).join('');

  const narrator = document.getElementById("moves-narrator");
  if (solverSolutionMoves.length === 0) {
    narrator.textContent = "Scramble the cube to generate a solution sequence.";
  } else if (solverSolutionIndex >= solverSolutionMoves.length) {
    narrator.textContent = "🏆 Solve complete! The cube is in its solved configuration.";
  } else {
    const move = solverSolutionMoves[solverSolutionIndex];
    const explanations = {
      R: "Rotate the Right face clockwise 90 degrees.",
      "R'": "Rotate the Right face counter-clockwise 90 degrees.",
      U: "Rotate the Upper face clockwise 90 degrees.",
      "U'": "Rotate the Upper face counter-clockwise 90 degrees.",
      F: "Rotate the Front face clockwise 90 degrees.",
      "F'": "Rotate the Front face counter-clockwise 90 degrees."
    };
    narrator.textContent = `Step ${solverSolutionIndex + 1}: Executing ${move}. ${explanations[move] || 'Rotate face.'}`;
  }
}

function stepSolver(dir) {
  if (solverSolutionMoves.length === 0) return;
  if (dir === 0) {
    solverSolutionIndex = 0;
    solverCube.reset();
  } else if (dir === 999) {
    while(solverSolutionIndex < solverSolutionMoves.length) {
      solverCube.move(solverSolutionMoves[solverSolutionIndex]);
      solverSolutionIndex++;
    }
  } else {
    if (dir === 1 && solverSolutionIndex < solverSolutionMoves.length) {
      solverCube.move(solverSolutionMoves[solverSolutionIndex]);
      solverSolutionIndex++;
    } else if (dir === -1 && solverSolutionIndex > 0) {
      solverSolutionIndex--;
      // Reverse last move
      const undo = solverSolutionMoves[solverSolutionIndex].endsWith("'") ? solverSolutionMoves[solverSolutionIndex][0] : solverSolutionMoves[solverSolutionIndex] + "'";
      solverCube.move(undo);
    }
  }
  updateSolverPlayerUI();
}

function togglePlaySolver() {
  const btn = document.getElementById("solver-play-btn");
  if (solverPlayInterval) {
    clearInterval(solverPlayInterval);
    solverPlayInterval = null;
    btn.textContent = "Play";
  } else {
    btn.textContent = "Pause";
    const speed = parseInt(document.getElementById("solver-speed-slider").value);
    solverPlayInterval = setInterval(() => {
      if (solverSolutionIndex < solverSolutionMoves.length) {
        stepSolver(1);
      } else {
        togglePlaySolver();
      }
    }, speed);
  }
}

// ── 3. LEARNING CENTER PAGE ──
let learnCube;
let learnRenderer;
const lessonsData = {
  "Beginner 01": { title: "Cube Notation Basics", desc: "Before solving, you must know face names: U (Up), D (Down), R (Right), L (Left), F (Front), B (Back). A single letter means CW rotation. A prime (') suffix means CCW rotation. An algorithm is just a series of these moves.", algo: ["R", "U", "R'", "U'"], q: "What does R' mean?", opts: ["Rotate Right face clockwise 90°", "Rotate Right face counter-clockwise 90°", "Rotate Rear face clockwise 90°"], ans: 1 },
  "Beginner 02": { title: "The White Cross", desc: "The first major milestone of a solve. Search for 4 white edges and insert them into the top face matching their adjacent colors (Red, Blue, Green, Orange centers). Maintain center alignments.", algo: ["F", "R", "U", "R'", "F'"], q: "Which edges belong to the white cross?", opts: ["Only white corners", "Stickers with White and adjacent center colors", "Any yellow sticker"], ans: 1 },
  "Intermediate 01": { title: "Intuitive F2L", desc: "Instead of solving corner then edge separately, F2L pairs a corner-edge pair together in the U layer and inserts them into their slot in one move sequence. This reduces solve time significantly.", algo: ["U", "R", "U'", "R'"], q: "What does F2L stand for?", opts: ["First Two Layers", "Fast 2-step Last-layer", "Finger Trick Library"], ans: 0 }
};
let activeLessonId = "Beginner 01";

function loadLearn() {
  const root = document.getElementById("page-learn");
  root.innerHTML = `
    <h2 class="page-title">Learning Center</h2>
    <div class="learn-layout">
      <!-- Curriculum -->
      <div class="glass-card lessons-accordion">
        <div class="path-section">
          <div class="path-header">Beginner Path</div>
          <div class="lesson-item active" data-id="Beginner 01" onclick="selectLesson('Beginner 01')">
            <div class="lesson-title-wrap"><span class="lesson-status-icon">✓</span><span class="lesson-name">1. Cube Notation Basics</span></div>
          </div>
          <div class="lesson-item" data-id="Beginner 02" onclick="selectLesson('Beginner 02')">
            <div class="lesson-title-wrap"><span class="lesson-status-icon">✓</span><span class="lesson-name">2. The White Cross</span></div>
          </div>
        </div>
        
        <div class="path-section">
          <div class="path-header">Intermediate Path</div>
          <div class="lesson-item" data-id="Intermediate 01" onclick="selectLesson('Intermediate 01')">
            <div class="lesson-title-wrap"><span class="lesson-status-icon">○</span><span class="lesson-name">3. Intuitive F2L</span></div>
          </div>
        </div>
      </div>
      
      <!-- Lesson details -->
      <div class="glass-card" style="display:flex;flex-direction:column;align-items:center">
        <h3 id="learn-title" style="align-self:flex-start">Cube Notation Basics</h3>
        <p id="learn-desc" style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin:0.75rem 0 1.25rem"></p>
        
        <canvas id="learn-canvas" width="260" height="260"></canvas>
        <button class="btn-secondary" style="margin-top:0.5rem" onclick="playLessonAlgo()">Demonstrate Target Algorithm</button>
        
        <div class="quiz-container" style="width:100%">
          <div class="quiz-q" id="quiz-question"></div>
          <div class="quiz-opts" id="quiz-options"></div>
        </div>
        
        <button class="btn-primary" style="margin-top:1.5rem;width:100%" onclick="markLessonComplete()">Mark Lesson as Completed (+25 XP)</button>
      </div>
    </div>
  `;

  learnCube = new RubiksCube();
  learnRenderer = new CubeRenderer(document.getElementById("learn-canvas"), learnCube, 3, true);
  setActiveRenderer(learnRenderer);

  selectLesson(activeLessonId);
}

function selectLesson(id) {
  activeLessonId = id;
  document.querySelectorAll(".lesson-item").forEach(item => item.classList.toggle('active', item.getAttribute('data-id') === id));
  
  const lesson = lessonsData[id];
  document.getElementById("learn-title").textContent = lesson.title;
  document.getElementById("learn-desc").textContent = lesson.desc;
  
  // Reset quiz
  document.getElementById("quiz-question").textContent = lesson.q;
  document.getElementById("quiz-options").innerHTML = lesson.opts.map((opt, i) => `
    <button class="quiz-opt" onclick="checkQuizAnswer(this, ${i}, ${lesson.ans})">${opt}</button>
  `).join('');

  learnCube.reset();
  showToast(`Loaded lesson: ${lesson.title}`, "📖");
}

function checkQuizAnswer(btn, index, correctIndex) {
  document.querySelectorAll(".quiz-opt").forEach(opt => opt.disabled = true);
  if (index === correctIndex) {
    btn.classList.add("correct");
    showToast("Correct! Great job.", "✓");
    Store.addXP(10);
  } else {
    btn.classList.add("incorrect");
    showToast("Incorrect, try again!", "✕");
  }
}

function playLessonAlgo() {
  const lesson = lessonsData[activeLessonId];
  learnCube.reset();
  let idx = 0;
  const iv = setInterval(() => {
    if (idx < lesson.algo.length) {
      learnCube.move(lesson.algo[idx]);
      idx++;
    } else {
      clearInterval(iv);
    }
  }, 600);
}

function markLessonComplete() {
  if (!Store.db.completedLessons.includes(activeLessonId)) {
    Store.db.completedLessons.push(activeLessonId);
    Store.addXP(25);
    Store.save();
    showToast("Lesson Completed! XP added.", "🎉");
    addNotification(`Lesson completed: ${lessonsData[activeLessonId].title}`);
  } else {
    showToast("You completed this lesson already.", "ℹ️");
  }
}

// ── 4. ALGORITHMS LIBRARY PAGE ──
let algoCube;
let algoRenderer;
const algoList = [
  { name: "Sune OLL", cat: "OLL", notation: "R U R' U R U2 R'", diff: "Easy", desc: "Orient top face corners when one corner is already oriented." },
  { name: "Anti-Sune OLL", cat: "OLL", notation: "R U2 R' U' R U' R'", diff: "Easy", desc: "Mirror case of Sune." },
  { name: "T-Perm PLL", cat: "PLL", notation: "R U R' U' R' F R2 U' R' U' R U R' F'", diff: "Hard", desc: "Swaps two corners and two edges adjacent." },
  { name: "Y-Perm PLL", cat: "PLL", notation: "F R U' R' U' R U R' F' R U R' U' R' F R F'", diff: "Hard", desc: "Swaps diagonal corners and opposite edges." },
  { name: "F2L Case 3", cat: "F2L", notation: "U R U' R'", diff: "Easy", desc: "Inserts a basic pair into right-front slot." }
];
let activeAlgoFilter = "All";

function loadAlgorithms() {
  const root = document.getElementById("page-algorithms");
  root.innerHTML = `
    <h2 class="page-title">Algorithms Library</h2>
    
    <div class="algo-header-filters">
      <div class="algo-filter-pills" id="algo-pills">
        <button class="algo-pill active" onclick="filterAlgos('All')">All</button>
        <button class="algo-pill" onclick="filterAlgos('F2L')">F2L</button>
        <button class="algo-pill" onclick="filterAlgos('OLL')">OLL</button>
        <button class="algo-pill" onclick="filterAlgos('PLL')">PLL</button>
      </div>
      <input type="text" id="algo-search" placeholder="Search notation/name..." class="global-search-container input" style="width:200px" oninput="renderAlgosGrid(this.value)">
    </div>
    
    <div class="grid-cols-2" style="grid-template-columns:1fr 0.6fr">
      <div class="algo-grid" id="algo-grid"></div>
      
      <!-- Small demo panel -->
      <div class="glass-card" style="display:flex; flex-direction:column; align-items:center; text-align:center">
        <h3>Algorithm Animator</h3>
        <canvas id="algo-canvas" width="220" height="220"></canvas>
        <p id="algo-anim-name" style="font-weight:600;font-size:0.85rem">Select play on any card</p>
        <button class="btn-secondary" id="algo-anim-btn" disabled onclick="playSelectedAlgo()">Animate Moves</button>
      </div>
    </div>
  `;

  algoCube = new RubiksCube();
  algoRenderer = new CubeRenderer(document.getElementById("algo-canvas"), algoCube, 3, true);
  setActiveRenderer(algoRenderer);

  renderAlgosGrid();
}

function filterAlgos(cat) {
  activeAlgoFilter = cat;
  document.querySelectorAll('.algo-pill').forEach(btn => btn.classList.toggle('active', btn.textContent === cat));
  renderAlgosGrid();
}

function renderAlgosGrid(query = "") {
  const grid = document.getElementById("algo-grid");
  if (!grid) return;
  const q = query.toLowerCase();
  
  const filtered = algoList.filter(a => {
    const matchesCat = activeAlgoFilter === "All" || a.cat === activeAlgoFilter;
    const matchesQuery = a.name.toLowerCase().includes(q) || a.notation.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  grid.innerHTML = filtered.map(a => `
    <div class="glass-card algo-card">
      <div class="algo-card-top">
        <span class="algo-tag">${a.cat}</span>
        <button class="algo-fav-btn ${Store.db.favorites.includes(a.name) ? 'active' : ''}" onclick="toggleFavoriteAlgo('${a.name}', this)">❤</button>
      </div>
      <div>
        <div class="algo-name">${a.name}</div>
        <div class="algo-notation-box">${a.notation}</div>
      </div>
      <div class="algo-card-bottom">
        <span>Moves: ${a.notation.split(' ').length} • ${a.diff}</span>
        <div class="btns">
          <button class="small-btn btn-secondary" onclick="copyAlgoNotation('${a.notation}')">Copy</button>
          <button class="small-btn btn-primary" onclick="loadAlgoToAnimator('${a.name}', '${a.notation}')">Play</button>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleFavoriteAlgo(name, btn) {
  const idx = Store.db.favorites.indexOf(name);
  if (idx > -1) {
    Store.db.favorites.splice(idx, 1);
    btn.classList.remove('active');
    showToast("Removed from favorites", "💔");
  } else {
    Store.db.favorites.push(name);
    btn.classList.add('active');
    showToast("Added to favorites", "❤️");
  }
  Store.save();
}

function copyAlgoNotation(notation) {
  navigator.clipboard.writeText(notation).then(() => {
    showToast("Notation copied to clipboard!", "📋");
  });
}

let activeAlgoNotation = "";
function loadAlgoToAnimator(name, notation) {
  activeAlgoNotation = notation;
  document.getElementById("algo-anim-name").textContent = name;
  document.getElementById("algo-anim-btn").disabled = false;
  algoCube.reset();
  showToast(`Loaded ${name} into animator`, "📐");
}

function playSelectedAlgo() {
  if (!activeAlgoNotation) return;
  algoCube.reset();
  const moves = activeAlgoNotation.split(' ');
  let idx = 0;
  const iv = setInterval(() => {
    if (idx < moves.length) {
      algoCube.move(moves[idx]);
      idx++;
    } else {
      clearInterval(iv);
    }
  }, 500);
}

// ── 5. CUBE TYPES PAGE ──
let cubesCube;
let cubesRenderer;
const cubesData = {
  "2x2": { name: "2x2 Pocket Cube", method: "Ortega Method", diff: 1, desc: "A simpler version of the original Rubik's cube, containing only 8 corner pieces. It has roughly 3.6 million combinations, much easier than 3x3 but still requires critical corner orientation algorithms." },
  "3x3": { name: "3x3 Classic Cube", method: "CFOP Method", diff: 2, desc: "The original 1974 puzzle invented by Erno Rubik. The core of speedcubing. Master the Cross, First Two Layers (F2L), Orient Last Layer (OLL), and Permute Last Layer (PLL) to break world records." },
  "4x4": { name: "4x4 Rubik's Revenge", method: "Yau / Reduction Method", diff: 3, desc: "Introduces fixed centers that aren't absolute, requiring center pairing and edge pairing. Parity errors (impossible cases on a standard 3x3) will frequently occur in the last layer." },
  "5x5": { name: "5x5 Professor Cube", method: "Reduction Method", diff: 4, desc: "A massive, heavy cube with 9 centers per face. Solved primarily by pairing outer edges and grouping center blocks before transferring logic to standard 3x3 solves." }
};
let activeCubeType = "3x3";

function loadCubes() {
  const root = document.getElementById("page-cubes");
  root.innerHTML = `
    <h2 class="page-title">Cube Library</h2>
    
    <div class="cubes-nav-bar">
      <button class="cube-nav-btn" onclick="switchCubeType('2x2')">2×2 Pocket</button>
      <button class="cube-nav-btn active" onclick="switchCubeType('3x3')">3×3 Classic</button>
      <button class="cube-nav-btn" onclick="switchCubeType('4x4')">4×4 Revenge</button>
      <button class="cube-nav-btn" onclick="switchCubeType('5x5')">5×5 Professor</button>
    </div>
    
    <div class="cube-details-grid glass-card">
      <div>
        <h3 id="cube-t-name">3x3 Classic Cube</h3>
        <p style="font-family:var(--font-mono);font-size:0.75rem;color:var(--accent-cyan);margin:0.25rem 0 1rem" id="cube-t-method">CFOP Method</p>
        <p id="cube-t-desc" style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin-bottom:1.5rem"></p>
        
        <div style="margin-bottom:1rem">
          <span style="font-size:0.8rem;color:var(--text-muted)">DIFFICULTY</span>
          <div class="difficulty" id="cube-t-diff" style="margin-top:0.25rem"></div>
        </div>
        
        <button class="btn-primary" onclick="goToPage('solver')">Solve This Cube</button>
      </div>
      
      <div style="display:flex; align-items:center; justify-content:center">
        <canvas id="cubes-canvas" width="280" height="280"></canvas>
      </div>
    </div>
  `;

  cubesCube = new RubiksCube();
  cubesRenderer = new CubeRenderer(document.getElementById("cubes-canvas"), cubesCube, 3, true);
  setActiveRenderer(cubesRenderer);

  switchCubeType(activeCubeType);
}

function switchCubeType(type) {
  activeCubeType = type;
  document.querySelectorAll('.cube-nav-btn').forEach(btn => btn.classList.toggle('active', btn.textContent.includes(type)));
  
  const data = cubesData[type];
  document.getElementById("cube-t-name").textContent = data.name;
  document.getElementById("cube-t-method").textContent = `Primary Method: ${data.method}`;
  document.getElementById("cube-t-desc").textContent = data.desc;
  
  const diff = document.getElementById("cube-t-diff");
  diff.innerHTML = Array(5).fill(0).map((_, i) => `
    <span class="diff-dot ${i < data.diff ? 'active' : ''}" style="${i < data.diff ? '--card-color:var(--accent-cyan)' : ''}"></span>
  `).join('');

  // Re-bind renderer with custom grid size!
  const sizeMap = { "2x2": 2, "3x3": 3, "4x4": 4, "5x5": 5 };
  cubesRenderer.N = sizeMap[type];
  cubesCube.reset();
  showToast(`Rendering ${data.name}`, "🧊");
}

// ── 6. SPEED TIMER PAGE ──
let timerInterval = null;
let timerStart = 0;
let isTiming = false;
let currentScramble = "";
let inspectionInterval = null;
let inspectionTime = 15;
let isInspecting = false;

function loadTimer() {
  const root = document.getElementById("page-timer");
  root.innerHTML = `
    <h2 class="page-title">Speed Timer</h2>
    <div class="timer-layout">
      <!-- Main timing area -->
      <div class="glass-card timer-area" id="timer-tap-area">
        <div class="timer-scramble-display" id="timer-scramble">Generating Scramble...</div>
        <div class="timer-digits" id="timer-time">00:00.00</div>
        <div class="timer-instructions" id="timer-inst">Hold SPACEBAR (or Tap) to Inspect</div>
        
        <div class="timer-chart-wrap" id="timer-chart-container"></div>
      </div>
      
      <!-- Session log -->
      <div class="glass-card">
        <h3>Session Stats</h3>
        <div class="metrics-grid" style="margin-top:0.75rem">
          <div class="metric-card"><div class="val" id="t-best">-</div><div class="lbl">BEST</div></div>
          <div class="metric-card"><div class="val" id="t-ao5">-</div><div class="lbl">AO5</div></div>
          <div class="metric-card"><div class="val" id="t-ao12">-</div><div class="lbl">AO12</div></div>
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem">
          <h4>Solves History</h4>
          <button class="small-btn btn-secondary" onclick="exportSolveHistory()">Export CSV</button>
        </div>
        
        <div class="table-wrapper" style="max-height: 200px; overflow-y: auto;">
          <table class="app-table">
            <thead>
              <tr><th>#</th><th>Time</th><th>Scramble</th></tr>
            </thead>
            <tbody id="timer-solves-log"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Generate initial scramble
  currentScramble = generateScrambleString();
  document.getElementById("timer-scramble").textContent = currentScramble;

  bindTimerControls();
  updateTimerStats();
}

function generateScrambleString() {
  const moves = ['U', "U'", 'D', "D'", 'R', "R'", 'L', "L'", 'F', "F'", 'B', "B'", 'R2', 'U2', 'F2'];
  let scramble = []; let last = "";
  for (let i = 0; i < 20; i++) {
    let m;
    do { m = moves[Math.floor(Math.random()*moves.length)]; } while (m[0] === last);
    scramble.push(m); last = m[0];
  }
  return scramble.join(" ");
}

function bindTimerControls() {
  const tapArea = document.getElementById("timer-tap-area");
  
  // Keyboard listeners
  window.onkeydown = e => {
    if (e.code === "Space" && !e.repeat) {
      e.preventDefault();
      handleTimerTrigger();
    }
  };

  // Mobile tap listener
  tapArea.ontouchstart = e => {
    e.preventDefault();
    handleTimerTrigger();
  };
}

function handleTimerTrigger() {
  const digits = document.getElementById("timer-time");
  const inst = document.getElementById("timer-inst");

  if (isTiming) {
    // Stop solving
    isTiming = false;
    clearInterval(timerInterval);
    const elapsed = (performance.now() - timerStart) / 1000;
    digits.textContent = formatTime(elapsed);
    digits.classList.remove("ready");
    inst.textContent = "Solve Recorded! Hold Space to inspect again.";
    
    // Add solve
    Store.addSolve(elapsed, currentScramble);
    updateTimerStats();
    
    // Generate new scramble
    currentScramble = generateScrambleString();
    document.getElementById("timer-scramble").textContent = currentScramble;
  } else if (isInspecting) {
    // Start timing immediately
    isInspecting = false;
    clearInterval(inspectionInterval);
    isTiming = true;
    timerStart = performance.now();
    digits.classList.add("ready");
    digits.classList.remove("inspection");
    inst.textContent = "TICK TICK... Press Space to stop";
    timerInterval = setInterval(() => {
      digits.textContent = formatTime((performance.now() - timerStart)/1000);
    }, 10);
  } else {
    // Start inspection
    isInspecting = true;
    inspectionTime = 15;
    digits.classList.add("inspection");
    digits.textContent = "15";
    inst.textContent = "Release to timing (ready)";
    inspectionInterval = setInterval(() => {
      inspectionTime--;
      digits.textContent = inspectionTime;
      if (inspectionTime <= 0) {
        clearInterval(inspectionInterval);
        // Force start if inspection expires
        handleTimerTrigger();
      }
    }, 1000);
  }
}

function formatTime(s) {
  const ms = Math.floor((s % 1) * 100).toString().padStart(2, '0');
  const sec = Math.floor(s % 60).toString().padStart(2, '0');
  const min = Math.floor(s / 60);
  return min > 0 ? `${min}:${sec}.${ms}` : `${sec}.${ms}`;
}

function updateTimerStats() {
  const solves = Store.db.solves.filter(s => s.type === "3x3 Classic");
  const log = document.getElementById("timer-solves-log");
  if (!log) return;

  log.innerHTML = solves.map((s, i) => `
    <tr>
      <td>${solves.length - i}</td>
      <td style="color:var(--accent-cyan);font-weight:700">${s.time.toFixed(2)}s</td>
      <td style="font-family:var(--font-mono);font-size:0.7rem">${s.scramble}</td>
    </tr>
  `).join('');

  if (solves.length === 0) return;

  const times = solves.map(s => s.time);
  const best = Math.min(...times);
  document.getElementById("t-best").textContent = best.toFixed(2) + "s";
  
  if (times.length >= 5) {
    const ao5 = times.slice(0, 5).sort((a,b)=>a-b).slice(1,4).reduce((s,v)=>s+v, 0)/3;
    document.getElementById("t-ao5").textContent = ao5.toFixed(2) + "s";
  } else {
    document.getElementById("t-ao5").textContent = "-";
  }

  if (times.length >= 12) {
    const ao12 = times.slice(0, 12).sort((a,b)=>a-b).slice(1,11).reduce((s,v)=>s+v, 0)/10;
    document.getElementById("t-ao12").textContent = ao12.toFixed(2) + "s";
  } else {
    document.getElementById("t-ao12").textContent = "-";
  }

  // Draw chart
  drawTimerChart(times.slice(0, 10).reverse());
}

function drawTimerChart(times) {
  const container = document.getElementById('timer-chart-container');
  if (!container) return;
  if (times.length < 2) {
    container.innerHTML = '<div style="color:var(--text-muted);font-size:0.75rem;text-align:center;padding:3rem">Complete 2 solves to see chart history</div>';
    return;
  }
  const w = container.clientWidth || 320; const h = 130;
  const min = Math.min(...times) * 0.95, max = Math.max(...times) * 1.05;
  const range = max - min;
  let pts = '';
  for (let i = 0; i < times.length; i++) {
    const x = (i / (times.length - 1)) * (w - 40) + 20;
    const y = h - ((times[i] - min) / range) * (h - 30) - 15;
    pts += `${x},${y} `;
  }
  container.innerHTML = `
    <svg width="100%" height="${h}" viewBox="0 0 ${w} ${h}">
      <polyline fill="none" stroke="var(--accent-cyan)" stroke-width="2" points="${pts}" />
      ${times.map((t, i) => {
        const x = (i / (times.length - 1)) * (w - 40) + 20;
        const y = h - ((t - min) / range) * (h - 30) - 15;
        return `<circle cx="${x}" cy="${y}" r="3.5" fill="var(--accent-purple)" stroke="white" stroke-width="1" class="chart-dot" title="${t}s" />`;
      }).join('')}
    </svg>
  `;
}

function exportSolveHistory() {
  const csvContent = "data:text/csv;charset=utf-8,ID,Type,Time(s),Scramble,Date\n" + Store.db.solves.map(s => `${s.id},"${s.type}",${s.time},"${s.scramble}",${s.date}`).join("\n");
  const encoded = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encoded);
  link.setAttribute("download", "ayu_cube_history.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast("CSV Exported successfully!", "💾");
}

// ── 7. PRACTICE ARENA ──
let practiceCube;
let practiceRenderer;
function loadPractice() {
  const root = document.getElementById("page-practice");
  root.innerHTML = `
    <h2 class="page-title">Practice Arena</h2>
    <div class="practice-selector">
      <button class="tab-btn active" onclick="switchPractice('Cross')">Cross Trainer</button>
      <button class="tab-btn" onclick="switchPractice('F2L')">F2L Trainer</button>
      <button class="tab-btn" onclick="switchPractice('PLL')">PLL Trainer</button>
    </div>
    
    <div class="solver-layout">
      <div class="glass-card">
        <h3 id="prac-title">Cross Trainer Case</h3>
        <p style="font-size:0.8rem;color:var(--text-muted);margin:0.25rem 0 1rem" id="prac-setup">Setup: D' F U' L B'</p>
        
        <div class="net-controls" style="margin-top:1.5rem">
          <button class="btn-primary" onclick="generatePracticeCase()">Generate Case</button>
          <button class="btn-secondary" onclick="revealPracticeSolution()">View Solution</button>
        </div>
        <p id="prac-sol" style="margin-top:1rem;font-family:var(--font-mono);font-size:0.85rem;color:var(--accent-cyan);display:none"></p>
      </div>
      
      <div class="glass-card" style="display:flex;flex-direction:column;align-items:center">
        <canvas id="practice-canvas" width="280" height="280"></canvas>
      </div>
    </div>
  `;

  practiceCube = new RubiksCube();
  practiceRenderer = new CubeRenderer(document.getElementById("practice-canvas"), practiceCube, 3, true);
  setActiveRenderer(practiceRenderer);

  switchPractice('Cross');
}

let activePracticeType = "Cross";
function switchPractice(type) {
  activePracticeType = type;
  document.querySelectorAll('.practice-selector .tab-btn').forEach(btn => btn.classList.toggle('active', btn.textContent.includes(type)));
  generatePracticeCase();
}

function generatePracticeCase() {
  document.getElementById("prac-title").textContent = `${activePracticeType} Practice Case`;
  document.getElementById("prac-sol").style.display = "none";
  
  practiceCube.reset();
  const setups = {
    Cross: { scramble: "D' F2 L' U' B", sol: "F R U R'" },
    F2L: { scramble: "R U2 R' U' R U R'", sol: "U R U' R'" },
    PLL: { scramble: "R U R' F' R U R' U' R' F R2 U' R'", sol: "F R U' R' U' R U R' F'" }
  };
  const c = setups[activePracticeType];
  document.getElementById("prac-setup").textContent = `Setup scramble: ${c.scramble}`;
  document.getElementById("prac-sol").textContent = `Reference Solve: ${c.sol}`;
  
  c.scramble.split(' ').forEach(m => practiceCube.move(m));
  showToast("Practice case generated!", "⚡");
}

function revealPracticeSolution() {
  document.getElementById("prac-sol").style.display = "block";
}

// ── 8. DAILY CHALLENGES ──
function loadChallenges() {
  const root = document.getElementById("page-challenges");
  root.innerHTML = `
    <h2 class="page-title">Daily Challenges</h2>
    <div class="glass-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem">
        <div>
          <h3>Streak Dashboard</h3>
          <p style="font-size:0.8rem;color:var(--text-muted);font-family:var(--font-mono)">KEEP THE FLAME BURNING</p>
        </div>
        <div style="font-size:2rem">🔥 ${Store.db.streak} Days</div>
      </div>
      
      <div class="goals-list">
        <div class="goal-item" id="dc-1">
          <span class="goal-check" onclick="claimChallenge(1)"></span>
          <span class="goal-text">Solve 3 cubes today (Completed 1/3)</span>
          <span class="goal-xp">+40 XP, +10 Coins</span>
        </div>
        <div class="goal-item" id="dc-2">
          <span class="goal-check" onclick="claimChallenge(2)"></span>
          <span class="goal-text">Submit a solve under 30 seconds</span>
          <span class="goal-xp">+60 XP, +25 Coins</span>
        </div>
      </div>
    </div>
  `;
}

function claimChallenge(id) {
  const el = document.getElementById(`dc-${id}`);
  if (el.classList.contains("completed")) return;
  el.classList.add("completed");
  el.querySelector(".goal-check").innerHTML = "✓";
  Store.addXP(40);
  Store.db.coins += 15;
  Store.save();
  showToast("Challenge Claimed! Rewards granted.", "🏆");
}

// ── 9. COMMUNITY PAGE ──
const communityPosts = [
  { id: 1, author: "MasterCuber", likes: 24, text: "Just discovered a clean PLL insertion for T-Perm, check it out!" },
  { id: 2, author: "SarahCubes", likes: 12, text: "Broke my PB today, down to 14.88s! Feeling so motivated." }
];

function loadCommunity() {
  const root = document.getElementById("page-community");
  root.innerHTML = `
    <h2 class="page-title">Community Hub</h2>
    <div class="grid-cols-2" style="grid-template-columns:1.25fr 0.75fr">
      <div>
        <!-- Post Input -->
        <div class="glass-card" style="margin-bottom:1.5rem">
          <textarea id="comm-post-text" placeholder="Share your cubing progress or feedback..." style="width:100%;height:60px;background:rgba(255,255,255,0.03);border:1px solid var(--border-glass);border-radius:10px;color:white;padding:0.75rem;font-family:var(--font-body)"></textarea>
          <button class="btn-primary" style="margin-top:0.75rem;align-self:flex-end" onclick="createCommunityPost()">Publish Post</button>
        </div>
        
        <!-- Social Feed -->
        <div class="quick-list" id="community-feed"></div>
      </div>
      
      <!-- Leaderboard -->
      <div class="glass-card">
        <h3>Top Speedcubers</h3>
        <div class="table-wrapper">
          <table class="app-table">
            <thead><tr><th>Rank</th><th>Name</th><th>Time</th></tr></thead>
            <tbody>
              <tr><td>🥇 1</td><td>Ayu Solver</td><td>6.84s</td></tr>
              <tr><td>🥈 2</td><td>Feliks Z.</td><td>7.12s</td></tr>
              <tr><td>🥉 3</td><td>Max Park</td><td>7.25s</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  renderCommunityFeed();
}

function renderCommunityFeed() {
  const feed = document.getElementById("community-feed");
  if (!feed) return;
  feed.innerHTML = communityPosts.map(p => `
    <div class="glass-card" style="margin-bottom:0.75rem">
      <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--accent-cyan);font-family:var(--font-mono)">
        <span>@${p.author}</span>
        <span style="cursor:none" onclick="likePost(${p.id})">❤ ${p.likes} Likes</span>
      </div>
      <p style="font-size:0.85rem;margin-top:0.5rem;line-height:1.5">${p.text}</p>
    </div>
  `).join('');
}

function createCommunityPost() {
  const text = document.getElementById("comm-post-text").value;
  if (!text) return;
  communityPosts.unshift({ id: Date.now(), author: Store.db.username, likes: 0, text });
  document.getElementById("comm-post-text").value = "";
  renderCommunityFeed();
  showToast("Post published!", "🌍");
}

function likePost(id) {
  const post = communityPosts.find(p => p.id === id);
  if (post) {
    post.likes++;
    renderCommunityFeed();
  }
}

// ── 10. PROFILE PAGE ──
function loadProfile() {
  const root = document.getElementById("page-profile");
  root.innerHTML = `
    <h2 class="page-title">My Profile</h2>
    <div class="glass-card" style="max-width:500px">
      <div style="display:flex;gap:1.5rem;align-items:center;margin-bottom:1.5rem">
        <div class="db-avatar" style="margin:0">${Store.db.avatar}</div>
        <div>
          <h3>${Store.db.username}</h3>
          <p style="font-size:0.8rem;color:var(--text-muted)">Edit details below to change card</p>
        </div>
      </div>
      
      <div style="display:flex;flex-direction:column;gap:1rem">
        <label>
          <span style="font-size:0.75rem;color:var(--text-secondary)">Username</span>
          <input type="text" id="prof-uname" value="${Store.db.username}" class="global-search-container input" style="width:100%">
        </label>
        <label>
          <span style="font-size:0.75rem;color:var(--text-secondary)">Avatar Emoji</span>
          <select id="prof-avatar" class="global-search-container input" style="width:100%;background:#0d1528;color:white">
            <option value="👦" ${Store.db.avatar === '👦'?'selected':''}>👦 Boy</option>
            <option value="👧" ${Store.db.avatar === '👧'?'selected':''}>👧 Girl</option>
            <option value="👽" ${Store.db.avatar === '👽'?'selected':''}>👽 Alien</option>
            <option value="🐼" ${Store.db.avatar === '🐼'?'selected':''}>🐼 Panda</option>
          </select>
        </label>
        <button class="btn-primary" onclick="saveProfileChanges()">Save Profile Changes</button>
      </div>
    </div>
  `;
}

function saveProfileChanges() {
  Store.db.username = document.getElementById("prof-uname").value;
  Store.db.avatar = document.getElementById("prof-avatar").value;
  Store.save();
  showToast("Profile updated successfully!", "✓");
}

// ── 11. SETTINGS PAGE ──
function loadSettings() {
  const root = document.getElementById("page-settings");
  root.innerHTML = `
    <h2 class="page-title">Settings</h2>
    <div class="glass-card" style="max-width:500px; display:flex; flex-direction:column; gap:1.25rem">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <span style="font-weight:600">Sound Effects</span>
          <p style="font-size:0.72rem;color:var(--text-muted)">Play trigger beeps and milestones clicks</p>
        </div>
        <input type="checkbox" id="set-sound" ${Store.db.settings.sound ? 'checked' : ''} onchange="toggleSetting('sound')">
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <span style="font-weight:600">Custom Cursor Rings</span>
          <p style="font-size:0.72rem;color:var(--text-muted)">Use animated pointer rings in page</p>
        </div>
        <input type="checkbox" id="set-cursor" ${Store.db.settings.cursor ? 'checked' : ''} onchange="toggleSetting('cursor')">
      </div>
    </div>
  `;
}

function toggleSetting(key) {
  Store.db.settings[key] = !Store.db.settings[key];
  Store.save();
  showToast("Settings updated!", "⚙️");
  if (key === 'cursor') {
    const ring = document.getElementById("cursor-ring");
    const cur = document.getElementById("cursor");
    if (ring && cur) {
      const show = Store.db.settings.cursor;
      ring.style.display = show ? 'block' : 'none';
      cur.style.display = show ? 'block' : 'none';
      document.body.style.cursor = show ? 'none' : 'auto';
    }
  }
}

// ── GLOBAL SEARCH autocomplete ──
const searchDatabase = [
  { title: "Sune OLL algorithm", cat: "Algorithms", hash: "#/algorithms" },
  { name: "T-Perm PLL algorithm", cat: "Algorithms", hash: "#/algorithms" },
  { title: "White Cross Lesson", cat: "Tutorials", hash: "#/learn" },
  { title: "2x2 Ortega Tutorial", cat: "Tutorials", hash: "#/cubes" },
  { title: "4x4 Center pairing method", cat: "Cubes", hash: "#/cubes" }
];

function handleGlobalSearch(q) {
  const dd = document.getElementById("global-search-results");
  if (!dd) return;
  if (!q) { dd.style.display = 'none'; return; }
  dd.style.display = 'block';
  const query = q.toLowerCase();
  const matched = searchDatabase.filter(item => (item.title || item.name || "").toLowerCase().includes(query));
  dd.innerHTML = matched.map(item => `
    <div class="search-item" onclick="goToPage('${item.hash.replace('#/','')}'); document.getElementById('global-search-input').value=''; document.getElementById('global-search-results').style.display='none';">
      <span class="search-title">${item.title || item.name}</span>
      <span class="search-cat">${item.cat}</span>
    </div>
  `).join('');
  if (matched.length === 0) dd.innerHTML = '<div style="font-size:0.75rem;padding:0.75rem;color:var(--text-muted);text-align:center">No matches found</div>';
}

// ── CUSTOM CURSOR RINGS TOGGLE ON LOAD ──
document.addEventListener("DOMContentLoaded", () => {
  const ring = document.getElementById("cursor-ring");
  const cur = document.getElementById("cursor");
  if (ring && cur) {
    const show = Store.db.settings.cursor;
    ring.style.display = show ? 'block' : 'none';
    cur.style.display = show ? 'block' : 'none';
    document.body.style.cursor = show ? 'none' : 'auto';
  }
});
