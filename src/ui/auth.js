/**
 * auth.js — VIGILENT User Auth System
 * Optional sign-in for the main dashboard (anonymous access preserved)
 */

const API_BASE = window.location.port === '5173'
  ? 'http://localhost:3001'
  : window.location.origin;

let currentUser = null;
let authToken = localStorage.getItem('vigilent_user_token');

// ── Public API ────────────────────────────────────────────────

export function getAuthState() {
  return {
    isLoggedIn: !!currentUser,
    user: currentUser,
    role: currentUser?.role || 'anonymous',
    token: authToken,
  };
}

export function getAuthHeaders() {
  return authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
}

// ── Init ──────────────────────────────────────────────────────

export function initAuth() {
  buildAuthUI();
  wireEvents();
  // Validate saved token silently
  if (authToken) {
    validateToken();
  }
}

// ── Build HTML ────────────────────────────────────────────────

function buildAuthUI() {
  const topBarRight = document.querySelector('.top-bar-right');
  if (!topBarRight) return;

  // Sign In button
  const authBtn = document.createElement('button');
  authBtn.id = 'authBtn';
  authBtn.innerHTML = `
    <span class="material-symbols-outlined">person</span>
    SIGN IN
  `;
  topBarRight.prepend(authBtn);

  // User badge (hidden by default)
  const badge = document.createElement('div');
  badge.id = 'userBadge';
  badge.innerHTML = `
    <div class="user-avatar" id="userAvatar">--</div>
    <div style="display:flex;flex-direction:column;gap:1px">
      <span class="user-name" id="userName">—</span>
      <span class="user-role-tag role-user" id="userRoleTag">USER</span>
    </div>
    <div class="user-dropdown" id="userDropdown">
      <div class="dropdown-header">
        <div class="dropdown-username" id="dropdownName">—</div>
        <div class="dropdown-email" id="dropdownEmail">—</div>
      </div>
      <button class="dropdown-item logout" id="logoutBtn">
        <span class="material-symbols-outlined">logout</span>
        SIGN OUT
      </button>
    </div>
  `;
  topBarRight.prepend(badge);

  // Auth modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'auth-overlay';
  overlay.id = 'authOverlay';
  overlay.innerHTML = `
    <div class="auth-modal">
      <div class="auth-modal-header">
        <div class="auth-modal-brand">
          <span class="material-symbols-outlined auth-lock-icon">shield_person</span>
          <h2>VIGILENT</h2>
        </div>
        <button class="auth-close-btn" id="authCloseBtn">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="login">SIGN IN</button>
        <button class="auth-tab" data-tab="register">CREATE ACCOUNT</button>
      </div>
      <div class="auth-body">
        <!-- Login Form -->
        <form class="auth-form active" id="loginForm">
          <div class="auth-field">
            <label>USERNAME OR EMAIL</label>
            <input type="text" id="authLoginInput" placeholder="Enter username or email" autocomplete="username" required>
          </div>
          <div class="auth-field">
            <label>PASSWORD</label>
            <input type="password" id="authLoginPass" placeholder="Enter password" autocomplete="current-password" required>
          </div>
          <div class="auth-error" id="loginError"></div>
          <button type="submit" class="auth-submit-btn" id="loginSubmitBtn">
            <span class="material-symbols-outlined">login</span>
            AUTHENTICATE
          </button>
        </form>
        <!-- Register Form -->
        <form class="auth-form" id="registerForm">
          <div class="auth-field">
            <label>USERNAME</label>
            <input type="text" id="authRegUser" placeholder="Choose a username" autocomplete="username" required minlength="3" maxlength="30">
          </div>
          <div class="auth-field">
            <label>EMAIL</label>
            <input type="email" id="authRegEmail" placeholder="your@email.com" autocomplete="email" required>
          </div>
          <div class="auth-field">
            <label>PASSWORD</label>
            <input type="password" id="authRegPass" placeholder="Min 6 characters" autocomplete="new-password" required minlength="6">
          </div>
          <div class="auth-error" id="registerError"></div>
          <button type="submit" class="auth-submit-btn" id="registerSubmitBtn">
            <span class="material-symbols-outlined">person_add</span>
            CREATE ACCOUNT
          </button>
        </form>
      </div>
      <div class="auth-footer">
        No account needed to use VIGILENT — sign in for premium features
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

// ── Wire Events ───────────────────────────────────────────────

function wireEvents() {
  // Open modal
  document.getElementById('authBtn')?.addEventListener('click', openModal);

  // Close modal
  document.getElementById('authCloseBtn')?.addEventListener('click', closeModal);
  document.getElementById('authOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'authOverlay') closeModal();
  });

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Tabs
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Forms
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

  // Profile badge dropdown toggle
  document.getElementById('userBadge')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('userDropdown')?.classList.toggle('open');
  });
  document.addEventListener('click', () => {
    document.getElementById('userDropdown')?.classList.remove('open');
  });
}

// ── Modal Control ─────────────────────────────────────────────

function openModal() {
  document.getElementById('authOverlay')?.classList.add('visible');
  document.getElementById('authLoginInput')?.focus();
}

function closeModal() {
  document.getElementById('authOverlay')?.classList.remove('visible');
  clearErrors();
}

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('loginForm')?.classList.toggle('active', tab === 'login');
  document.getElementById('registerForm')?.classList.toggle('active', tab === 'register');
  clearErrors();
}

function clearErrors() {
  const loginErr = document.getElementById('loginError');
  const regErr = document.getElementById('registerError');
  if (loginErr) loginErr.textContent = '';
  if (regErr) regErr.textContent = '';
}

// ── Auth Handlers ─────────────────────────────────────────────

async function handleLogin(e) {
  e.preventDefault();
  const login = document.getElementById('authLoginInput').value;
  const password = document.getElementById('authLoginPass').value;
  const errorEl = document.getElementById('loginError');
  const btn = document.getElementById('loginSubmitBtn');

  btn.disabled = true;
  errorEl.textContent = '';

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Login failed';
      return;
    }

    setAuthState(data.token, data.user);
    closeModal();
    console.log(`%c[AUTH] ✓ Signed in as ${data.user.username}`, 'color: #00e676');
  } catch (err) {
    errorEl.textContent = 'Connection failed';
  } finally {
    btn.disabled = false;
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('authRegUser').value;
  const email = document.getElementById('authRegEmail').value;
  const password = document.getElementById('authRegPass').value;
  const errorEl = document.getElementById('registerError');
  const btn = document.getElementById('registerSubmitBtn');

  btn.disabled = true;
  errorEl.textContent = '';

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Registration failed';
      return;
    }

    setAuthState(data.token, data.user);
    closeModal();
    console.log(`%c[AUTH] ✓ Account created: ${data.user.username}`, 'color: #00e676');
  } catch (err) {
    errorEl.textContent = 'Connection failed';
  } finally {
    btn.disabled = false;
  }
}

function handleLogout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('vigilent_user_token');
  document.getElementById('userDropdown')?.classList.remove('open');
  showSignInButton();
  console.log('%c[AUTH] Signed out', 'color: #ff1744');
}

// ── State Management ──────────────────────────────────────────

function setAuthState(token, user) {
  authToken = token;
  currentUser = user;
  localStorage.setItem('vigilent_user_token', token);
  showProfileBadge(user);
}

async function validateToken() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });

    if (!res.ok) {
      throw new Error('Invalid token');
    }

    const user = await res.json();
    currentUser = user;
    showProfileBadge(user);
    console.log(`%c[AUTH] ✓ Session restored: ${user.username}`, 'color: #4A90D9');
  } catch {
    // Token invalid or expired — clear silently
    authToken = null;
    currentUser = null;
    localStorage.removeItem('vigilent_user_token');
    showSignInButton();
  }
}

// ── UI State ──────────────────────────────────────────────────

function showProfileBadge(user) {
  const authBtn = document.getElementById('authBtn');
  const badge = document.getElementById('userBadge');

  if (authBtn) authBtn.style.display = 'none';
  if (badge) {
    badge.classList.add('visible');

    // Initials
    const initials = user.username.slice(0, 2);
    const avatar = document.getElementById('userAvatar');
    if (avatar) avatar.textContent = initials;

    // Name
    const nameEl = document.getElementById('userName');
    if (nameEl) nameEl.textContent = user.username;

    // Role tag
    const roleTag = document.getElementById('userRoleTag');
    if (roleTag) {
      roleTag.textContent = user.role.toUpperCase();
      roleTag.className = `user-role-tag role-${user.role}`;
    }

    // Dropdown info
    const dName = document.getElementById('dropdownName');
    const dEmail = document.getElementById('dropdownEmail');
    if (dName) dName.textContent = user.username;
    if (dEmail) dEmail.textContent = user.email || '';
  }
}

function showSignInButton() {
  const authBtn = document.getElementById('authBtn');
  const badge = document.getElementById('userBadge');

  if (authBtn) authBtn.style.display = '';
  if (badge) badge.classList.remove('visible');
}
