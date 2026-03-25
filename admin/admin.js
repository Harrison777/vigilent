/**
 * admin.js — VIGILENT Admin Panel Client
 */

const API_BASE = window.location.origin;
let authToken = sessionStorage.getItem('vigilent_token');

// ── Boot ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  if (authToken) {
    showDashboard();
  }

  // Login form
  document.getElementById('loginForm').addEventListener('submit', handleLogin);

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);

  // Save
  document.getElementById('saveBtn').addEventListener('click', saveSettings);

  // Test buttons
  document.getElementById('testLlmBtn').addEventListener('click', testLLM);
  document.getElementById('testSearchBtn').addEventListener('click', testSearch);
  document.getElementById('testTtsBtn').addEventListener('click', testTTS);

  // Password change
  document.getElementById('changePassBtn').addEventListener('click', changePassword);

  // User management refresh
  document.getElementById('refreshUsersBtn').addEventListener('click', loadRegisteredUsers);

  // Temperature slider
  document.getElementById('llmTemp').addEventListener('input', (e) => {
    document.getElementById('tempValue').textContent = e.target.value;
  });

  // TTS provider toggle — show/hide VoiceBox vs ElevenLabs fields
  document.getElementById('ttsProvider').addEventListener('change', toggleTtsFields);

  // Toggle visibility buttons
  document.querySelectorAll('.toggle-vis').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      const icon = btn.querySelector('.material-symbols-outlined');
      if (target.type === 'password') {
        target.type = 'text';
        icon.textContent = 'visibility_off';
      } else {
        target.type = 'password';
        icon.textContent = 'visibility';
      }
    });
  });
});

// ── TTS Provider Toggle ──────────────────────────────────────

function toggleTtsFields() {
  const provider = document.getElementById('ttsProvider').value;
  const vbFields = document.getElementById('voiceboxFields');
  const elFields = document.getElementById('elevenlabsFields');
  if (provider === 'voicebox') {
    vbFields.style.display = '';
    elFields.style.display = 'none';
  } else {
    vbFields.style.display = 'none';
    elFields.style.display = '';
  }
}

// ── Auth ──────────────────────────────────────────────────────

async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUser').value;
  const password = document.getElementById('loginPass').value;
  const errorEl = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');

  btn.disabled = true;
  errorEl.textContent = '';

  try {
    const res = await fetch(`${API_BASE}/admin/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Login failed';
      return;
    }

    authToken = data.token;
    sessionStorage.setItem('vigilent_token', authToken);
    document.getElementById('userLabel').textContent = data.username;
    showDashboard();
  } catch (err) {
    errorEl.textContent = 'Connection failed: ' + err.message;
  } finally {
    btn.disabled = false;
  }
}

function handleLogout() {
  authToken = null;
  sessionStorage.removeItem('vigilent_token');
  document.getElementById('loginScreen').classList.add('active');
  document.getElementById('dashScreen').classList.remove('active');
}

function showDashboard() {
  document.getElementById('loginScreen').classList.remove('active');
  document.getElementById('dashScreen').classList.add('active');
  loadSettings();
  loadRegisteredUsers();
}

// ── Settings ─────────────────────────────────────────────────

async function loadSettings() {
  try {
    const res = await fetch(`${API_BASE}/admin/api/settings`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });

    if (res.status === 401) {
      handleLogout();
      return;
    }

    const data = await res.json();

    // LLM
    document.getElementById('llmProvider').value = data.llm?.provider || 'openrouter';
    document.getElementById('llmModel').value = data.llm?.model || '';
    document.getElementById('llmApiKey').placeholder = data.llm?.apiKey || 'Not set';
    document.getElementById('llmTemp').value = data.llm?.temperature ?? 0.7;
    document.getElementById('tempValue').textContent = data.llm?.temperature ?? 0.7;
    document.getElementById('llmMaxTokens').value = data.llm?.maxTokens || 8192;

    // Search
    document.getElementById('searchProvider').value = data.search?.provider || 'serper';
    document.getElementById('searchApiKey').placeholder = data.search?.apiKey || 'Not set';

    // TTS
    document.getElementById('ttsProvider').value = data.tts?.provider || 'voicebox';
    document.getElementById('ttsApiKey').placeholder = data.tts?.apiKey || 'Not set';
    document.getElementById('ttsVoiceId').value = data.tts?.voiceId || '';

    // VoiceBox specific
    document.getElementById('voiceboxHost').value = data.tts?.voiceboxHost || 'http://localhost:17493';
    document.getElementById('voiceboxProfileId').value = data.tts?.voiceboxProfileId || '';
    document.getElementById('voiceboxEngine').value = data.tts?.voiceboxEngine || 'chatterbox-turbo';

    // Toggle correct fields
    toggleTtsFields();

  } catch (err) {
    console.error('[Admin] Failed to load settings:', err);
  }
}

async function saveSettings() {
  const statusEl = document.getElementById('saveStatus');
  statusEl.textContent = 'Saving...';
  statusEl.style.color = 'var(--warning)';

  const ttsProvider = document.getElementById('ttsProvider').value;

  const updates = {
    llm: {
      provider: document.getElementById('llmProvider').value,
      model: document.getElementById('llmModel').value,
      temperature: parseFloat(document.getElementById('llmTemp').value),
      maxTokens: parseInt(document.getElementById('llmMaxTokens').value),
    },
    search: {
      provider: document.getElementById('searchProvider').value,
    },
    tts: {
      provider: ttsProvider,
      voiceId: document.getElementById('ttsVoiceId').value,
      voiceboxHost: document.getElementById('voiceboxHost').value,
      voiceboxProfileId: document.getElementById('voiceboxProfileId').value,
      voiceboxEngine: document.getElementById('voiceboxEngine').value,
    },
  };

  // Only include API keys if the user typed something new
  const llmKey = document.getElementById('llmApiKey').value;
  if (llmKey) updates.llm.apiKey = llmKey;

  const searchKey = document.getElementById('searchApiKey').value;
  if (searchKey) updates.search.apiKey = searchKey;

  const ttsKey = document.getElementById('ttsApiKey').value;
  if (ttsKey) updates.tts.apiKey = ttsKey;

  try {
    const res = await fetch(`${API_BASE}/admin/api/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(updates),
    });

    if (res.status === 401) { handleLogout(); return; }

    const data = await res.json();
    statusEl.textContent = '✓ Settings saved';
    statusEl.style.color = 'var(--success)';

    // Reload to show masked keys
    loadSettings();

    // Clear new key values from inputs
    document.getElementById('llmApiKey').value = '';
    document.getElementById('searchApiKey').value = '';
    document.getElementById('ttsApiKey').value = '';

    setTimeout(() => { statusEl.textContent = ''; }, 3000);
  } catch (err) {
    statusEl.textContent = 'Error: ' + err.message;
    statusEl.style.color = 'var(--error)';
  }
}

// ── Test Connections ─────────────────────────────────────────

async function testLLM() {
  const statusEl = document.getElementById('llmStatus');
  statusEl.textContent = 'Testing...';
  statusEl.className = 'card-status loading';

  try {
    const res = await fetch(`${API_BASE}/admin/api/test-llm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await res.json();
    if (data.success) {
      statusEl.textContent = `✓ Connected — ${data.model} responded: "${data.response}"`;
      statusEl.className = 'card-status success';
    } else {
      statusEl.textContent = `✗ Failed: ${data.error}`;
      statusEl.className = 'card-status error';
    }
  } catch (err) {
    statusEl.textContent = `✗ Error: ${err.message}`;
    statusEl.className = 'card-status error';
  }
}

async function testSearch() {
  const statusEl = document.getElementById('searchStatus');
  statusEl.textContent = 'Testing...';
  statusEl.className = 'card-status loading';

  try {
    const res = await fetch(`${API_BASE}/admin/api/test-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await res.json();
    if (data.success) {
      statusEl.textContent = `✓ Connected — ${data.results} results returned`;
      statusEl.className = 'card-status success';
    } else {
      statusEl.textContent = `✗ Failed: ${data.error}`;
      statusEl.className = 'card-status error';
    }
  } catch (err) {
    statusEl.textContent = `✗ Error: ${err.message}`;
    statusEl.className = 'card-status error';
  }
}

async function testTTS() {
  const statusEl = document.getElementById('ttsStatus');
  statusEl.textContent = 'Testing...';
  statusEl.className = 'card-status loading';

  try {
    const res = await fetch(`${API_BASE}/api/tts/health`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });

    const data = await res.json();
    if (data.available) {
      statusEl.textContent = `✓ ${data.provider === 'voicebox' ? 'VoiceBox' : 'ElevenLabs'} is reachable`;
      statusEl.className = 'card-status success';
    } else {
      statusEl.textContent = `✗ Not available${data.error ? ': ' + data.error : ''}`;
      statusEl.className = 'card-status error';
    }
  } catch (err) {
    statusEl.textContent = `✗ Error: ${err.message}`;
    statusEl.className = 'card-status error';
  }
}

// ── Password Change ──────────────────────────────────────────

async function changePassword() {
  const statusEl = document.getElementById('passStatus');
  const currentPass = document.getElementById('currentPass').value;
  const newPass = document.getElementById('newPass').value;

  if (!currentPass || !newPass) {
    statusEl.textContent = 'Both fields required';
    statusEl.className = 'card-status error';
    return;
  }

  statusEl.textContent = 'Updating...';
  statusEl.className = 'card-status loading';

  try {
    const res = await fetch(`${API_BASE}/admin/api/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
    });

    const data = await res.json();
    if (data.success) {
      statusEl.textContent = '✓ Password updated';
      statusEl.className = 'card-status success';
      document.getElementById('currentPass').value = '';
      document.getElementById('newPass').value = '';
    } else {
      statusEl.textContent = `✗ ${data.error}`;
      statusEl.className = 'card-status error';
    }
  } catch (err) {
    statusEl.textContent = `✗ Error: ${err.message}`;
    statusEl.className = 'card-status error';
  }
}

// ── User Management ──────────────────────────────────────────

async function loadRegisteredUsers() {
  const tbody = document.getElementById('usersBody');
  const countEl = document.getElementById('usersCount');
  if (!tbody) return;

  try {
    const res = await fetch(`${API_BASE}/admin/api/users`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });

    if (res.status === 401) { handleLogout(); return; }
    if (res.status === 403) {
      tbody.innerHTML = '<tr><td colspan="5" class="users-empty">Admin access required</td></tr>';
      return;
    }

    const users = await res.json();

    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="users-empty">No registered users yet</td></tr>';
      countEl.textContent = '';
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr data-id="${u.id}">
        <td class="user-cell-name">${escapeHtml(u.username)}</td>
        <td class="user-cell-email">${escapeHtml(u.email)}</td>
        <td>
          <select class="role-select role-${u.role}" data-id="${u.id}" onchange="handleRoleChange(this)">
            <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
          </select>
        </td>
        <td class="user-cell-date">${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
        <td>
          <button class="btn-delete" onclick="handleDeleteUser('${u.id}', '${escapeHtml(u.username)}')">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </td>
      </tr>
    `).join('');

    countEl.textContent = `${users.length} registered user${users.length !== 1 ? 's' : ''}`;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="users-empty">Failed to load: ${err.message}</td></tr>`;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

window.handleRoleChange = async function(select) {
  const userId = select.dataset.id;
  const newRole = select.value;

  try {
    const res = await fetch(`${API_BASE}/admin/api/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ role: newRole }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(`Failed: ${data.error}`);
      loadRegisteredUsers();
      return;
    }

    // Update select styling
    select.className = `role-select role-${newRole}`;
  } catch (err) {
    alert('Error: ' + err.message);
    loadRegisteredUsers();
  }
};

window.handleDeleteUser = async function(userId, username) {
  if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;

  try {
    const res = await fetch(`${API_BASE}/admin/api/users/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` },
    });

    if (!res.ok) {
      const data = await res.json();
      alert(`Failed: ${data.error}`);
      return;
    }

    loadRegisteredUsers();
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

