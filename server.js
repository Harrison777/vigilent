/**
 * server.js — VIGILENT Backend Server
 * Express server handling API proxies, admin auth, user accounts, settings management,
 * and Knowledge Graph integration (PHNK-G on localhost:3002).
 * Run: node server.js
 */

import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const CONFIG_PATH = join(__dirname, 'config.json');
const USERS_PATH = join(__dirname, 'users.json');
const KG_HOST = process.env.KG_HOST || 'http://localhost:3002';

// ── Middleware ─────────────────────────────────────────────────

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Serve admin panel static files
app.use('/admin', express.static(join(__dirname, 'admin')));

// ── Config Management (in-memory cache) ──────────────────────

let _configCache = null;

function loadConfig() {
  if (_configCache) return _configCache;
  try {
    if (!existsSync(CONFIG_PATH)) {
      const defaults = {
        llm: { provider: 'openrouter', model: 'minimax/minimax-m2.5', apiKey: '', temperature: 0.7, maxTokens: 8192 },
        search: { provider: 'serper', apiKey: '' },
        tts: { provider: 'voicebox', apiKey: '', voiceId: 'EXAVITQu4vr4xnSDxMaL', voiceboxHost: 'http://localhost:17493', voiceboxProfileId: '', voiceboxEngine: 'chatterbox-turbo' },
        admin: { username: 'admin', passwordHash: bcrypt.hashSync('admin', 10) },
      };
      writeFileSync(CONFIG_PATH, JSON.stringify(defaults, null, 2));
      _configCache = defaults;
      return defaults;
    }
    _configCache = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
    return _configCache;
  } catch (err) {
    console.error('[Config] Failed to load:', err.message);
    return {};
  }
}

function saveConfig(config) {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
  _configCache = config; // update in-memory cache
}

// ── Persistent JWT Secret ─────────────────────────────────────
// Generate once and persist so tokens survive server restarts.
const initialConfig = loadConfig();
if (!initialConfig.jwtSecret) {
  initialConfig.jwtSecret = crypto.randomBytes(48).toString('hex');
  saveConfig(initialConfig);
  console.log('[Server] Generated and persisted new JWT secret');
}
const JWT_SECRET = process.env.JWT_SECRET || initialConfig.jwtSecret;

if (initialConfig.admin?.passwordHash === '$2a$10$defaulthashwillbereplacedonsetup') {
  initialConfig.admin.passwordHash = bcrypt.hashSync('admin', 10);
  saveConfig(initialConfig);
  console.log('[Server] Default admin password set to "admin" — change it via /admin');
}

// ── User Data Store ───────────────────────────────────────────

function loadUsers() {
  try {
    if (!existsSync(USERS_PATH)) {
      writeFileSync(USERS_PATH, '[]');
      return [];
    }
    return JSON.parse(readFileSync(USERS_PATH, 'utf-8'));
  } catch (err) {
    console.error('[Users] Failed to load:', err.message);
    return [];
  }
}

function saveUsers(users) {
  writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

// ── Auth Middleware ────────────────────────────────────────────

function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Optional auth — attaches user if token present, but doesn't reject
function authOptional(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    } catch { /* ignore invalid tokens */ }
  }
  next();
}

// Role-based access — use after authRequired
function roleRequired(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// ── Admin Auth Routes ─────────────────────────────────────────

app.post('/admin/api/login', (req, res) => {
  const { username, password } = req.body;
  const config = loadConfig();

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  if (username !== config.admin?.username) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!bcrypt.compareSync(password, config.admin.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ username, role: 'admin', source: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, username, role: 'admin', expiresIn: '24h' });
});

// ── Admin Settings Routes ─────────────────────────────────────

app.get('/admin/api/settings', authRequired, roleRequired('admin'), (req, res) => {
  const config = loadConfig();
  // Return config but mask sensitive keys for display
  const safe = {
    llm: {
      ...config.llm,
      apiKey: config.llm?.apiKey ? '••••' + config.llm.apiKey.slice(-6) : '',
    },
    search: {
      ...config.search,
      apiKey: config.search?.apiKey ? '••••' + config.search.apiKey.slice(-6) : '',
    },
    tts: {
      ...config.tts,
      apiKey: config.tts?.apiKey ? '••••' + config.tts.apiKey.slice(-6) : '',
    },
    admin: { username: config.admin?.username },
  };
  res.json(safe);
});

app.put('/admin/api/settings', authRequired, roleRequired('admin'), (req, res) => {
  const config = loadConfig();
  const updates = req.body;

  // Update LLM settings
  if (updates.llm) {
    if (updates.llm.provider) config.llm.provider = updates.llm.provider;
    if (updates.llm.model) config.llm.model = updates.llm.model;
    if (updates.llm.apiKey && updates.llm.apiKey !== '••••') config.llm.apiKey = updates.llm.apiKey;
    if (updates.llm.temperature !== undefined) config.llm.temperature = parseFloat(updates.llm.temperature);
    if (updates.llm.maxTokens !== undefined) config.llm.maxTokens = parseInt(updates.llm.maxTokens);
  }

  // Update Search settings
  if (updates.search) {
    if (updates.search.provider) config.search.provider = updates.search.provider;
    if (updates.search.apiKey && updates.search.apiKey !== '••••') config.search.apiKey = updates.search.apiKey;
  }

  // Update TTS settings
  if (updates.tts) {
    if (updates.tts.provider) config.tts.provider = updates.tts.provider;
    if (updates.tts.apiKey && updates.tts.apiKey !== '••••') config.tts.apiKey = updates.tts.apiKey;
    if (updates.tts.voiceId) config.tts.voiceId = updates.tts.voiceId;
    if (updates.tts.voiceboxHost) config.tts.voiceboxHost = updates.tts.voiceboxHost;
    if (updates.tts.voiceboxProfileId !== undefined) config.tts.voiceboxProfileId = updates.tts.voiceboxProfileId;
    if (updates.tts.voiceboxEngine) config.tts.voiceboxEngine = updates.tts.voiceboxEngine;
  }

  saveConfig(config);
  res.json({ success: true, message: 'Settings saved' });
});

app.put('/admin/api/password', authRequired, roleRequired('admin'), (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const config = loadConfig();

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password required' });
  }

  if (!bcrypt.compareSync(currentPassword, config.admin.passwordHash)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  config.admin.passwordHash = bcrypt.hashSync(newPassword, 10);
  saveConfig(config);
  res.json({ success: true, message: 'Password updated' });
});

// ── User Auth Routes (Public) ─────────────────────────────────

app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ error: 'Username must be 3-30 characters' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const users = loadUsers();

  // Check for duplicate username or email
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(409).json({ error: 'Username already taken' });
  }
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const newUser = {
    id: crypto.randomUUID(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: bcrypt.hashSync(password, 10),
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  const token = jwt.sign(
    { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  console.log(`[Auth] New user registered: ${newUser.username} (${newUser.email})`);
  res.status(201).json({ token, user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role } });
});

app.post('/api/auth/login', (req, res) => {
  const { login, password } = req.body;

  if (!login || !password) {
    return res.status(400).json({ error: 'Username/email and password are required' });
  }

  const users = loadUsers();
  const user = users.find(
    u => u.username.toLowerCase() === login.toLowerCase() || u.email.toLowerCase() === login.toLowerCase()
  );

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

app.get('/api/auth/me', authRequired, (req, res) => {
  // For admin tokens (from /admin/api/login) return basic info
  if (req.user.source === 'admin') {
    return res.json({ id: 'admin', username: req.user.username, email: '', role: 'admin' });
  }

  // For user tokens, verify user still exists
  const users = loadUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(401).json({ error: 'User no longer exists' });
  }

  res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
});

// ── Admin User Management ─────────────────────────────────────

app.get('/admin/api/users', authRequired, roleRequired('admin'), (req, res) => {
  const users = loadUsers();
  const safe = users.map(u => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  }));
  res.json(safe);
});

app.put('/admin/api/users/:id/role', authRequired, roleRequired('admin'), (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be "user" or "admin"' });
  }

  const users = loadUsers();
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.role = role;
  saveUsers(users);
  console.log(`[Admin] User ${user.username} role changed to ${role}`);
  res.json({ success: true, message: `Role updated to ${role}` });
});

app.delete('/admin/api/users/:id', authRequired, roleRequired('admin'), (req, res) => {
  const users = loadUsers();
  const idx = users.findIndex(u => u.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const deleted = users.splice(idx, 1)[0];
  saveUsers(users);
  console.log(`[Admin] User ${deleted.username} deleted`);
  res.json({ success: true, message: `User ${deleted.username} deleted` });
});

// ── Health Check Endpoints ────────────────────────────────────

app.get('/api/search/health', (req, res) => {
  const config = loadConfig();
  const available = !!config.search?.apiKey;
  res.status(available ? 200 : 503).json({ available });
});

app.get('/api/generate/health', (req, res) => {
  const config = loadConfig();
  const available = !!config.llm?.apiKey;
  res.status(available ? 200 : 503).json({ available });
});

app.get('/api/tts/health', async (req, res) => {
  const config = loadConfig();
  if (config.tts?.provider === 'voicebox') {
    try {
      const host = config.tts.voiceboxHost || 'http://localhost:17493';
      const ping = await fetch(`${host}/health`, { signal: AbortSignal.timeout(3000) });
      const health = await ping.json();
      const ready = health.status === 'healthy' && health.model_loaded;
      res.status(ready ? 200 : 503).json({
        available: ready,
        provider: 'voicebox',
        model_loaded: health.model_loaded,
        gpu: health.gpu_available ? health.gpu_type : 'CPU',
        error: !health.model_loaded ? 'No model loaded — open VoiceBox app and download a model' : undefined,
      });
    } catch {
      res.status(503).json({ available: false, provider: 'voicebox', error: 'VoiceBox not running on ' + (config.tts.voiceboxHost || 'http://localhost:17493') });
    }
  } else {
    const available = !!config.tts?.apiKey;
    res.status(available ? 200 : 503).json({ available, provider: 'elevenlabs' });
  }
});

// ── Knowledge Graph Proxy (PHNK-G) ───────────────────────────

app.get('/api/kg/health', async (req, res) => {
  try {
    const ping = await fetch(`${KG_HOST}/stats`, { signal: AbortSignal.timeout(3000) });
    if (!ping.ok) throw new Error(`KG returned ${ping.status}`);
    const stats = await ping.json();
    res.json({ available: true, total_nodes: stats.total_nodes, host: KG_HOST });
  } catch {
    res.status(503).json({ available: false, error: `Knowledge Graph not running on ${KG_HOST}` });
  }
});

app.get('/api/kg/search', async (req, res) => {
  const { q, limit } = req.query;
  if (!q) return res.status(400).json({ error: 'Query parameter q is required' });
  try {
    const kgRes = await fetch(`${KG_HOST}/search?q=${encodeURIComponent(q)}&limit=${limit || 10}`, { signal: AbortSignal.timeout(5000) });
    if (!kgRes.ok) throw new Error(`KG ${kgRes.status}`);
    res.json(await kgRes.json());
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.get('/api/kg/nearby', async (req, res) => {
  const { lat, lng, r, limit } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'lat and lng are required' });
  try {
    const kgRes = await fetch(`${KG_HOST}/nearby?lat=${lat}&lng=${lng}&r=${r || 50}&limit=${limit || 20}`, { signal: AbortSignal.timeout(5000) });
    if (!kgRes.ok) throw new Error(`KG ${kgRes.status}`);
    res.json(await kgRes.json());
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.get('/api/kg/era/:tag', async (req, res) => {
  try {
    const kgRes = await fetch(`${KG_HOST}/era/${encodeURIComponent(req.params.tag)}?limit=${req.query.limit || 50}`, { signal: AbortSignal.timeout(5000) });
    if (!kgRes.ok) throw new Error(`KG ${kgRes.status}`);
    res.json(await kgRes.json());
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.get('/api/kg/stats', async (req, res) => {
  try {
    const kgRes = await fetch(`${KG_HOST}/stats`, { signal: AbortSignal.timeout(5000) });
    if (!kgRes.ok) throw new Error(`KG ${kgRes.status}`);
    res.json(await kgRes.json());
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.get('/api/kg/eras', async (req, res) => {
  try {
    const kgRes = await fetch(`${KG_HOST}/eras`, { signal: AbortSignal.timeout(5000) });
    if (!kgRes.ok) throw new Error(`KG ${kgRes.status}`);
    res.json(await kgRes.json());
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.get('/api/kg/node/:id', async (req, res) => {
  try {
    const kgRes = await fetch(`${KG_HOST}/node/${encodeURIComponent(req.params.id)}`, { signal: AbortSignal.timeout(5000) });
    if (!kgRes.ok) throw new Error(`KG ${kgRes.status}`);
    res.json(await kgRes.json());
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

app.get('/api/kg/node/:id/edges', async (req, res) => {
  try {
    const kgRes = await fetch(`${KG_HOST}/node/${encodeURIComponent(req.params.id)}/edges`, { signal: AbortSignal.timeout(5000) });
    if (!kgRes.ok) throw new Error(`KG ${kgRes.status}`);
    res.json(await kgRes.json());
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

/**
 * Fetch KG context for a query — used to enrich LLM prompts.
 * Returns a compact text summary of the top KG matches.
 */
async function fetchKGContext(query, limit = 5) {
  try {
    const kgRes = await fetch(`${KG_HOST}/search?q=${encodeURIComponent(query)}&limit=${limit}`, { signal: AbortSignal.timeout(3000) });
    if (!kgRes.ok) return null;
    const data = await kgRes.json();
    if (!data.results || data.results.length === 0) return null;

    const lines = data.results.map(n =>
      `• ${n.canonical_name} (${n.era_tag || 'Unknown era'}, ${n.lat?.toFixed(2)}°, ${n.lng?.toFixed(2)}°): ${(n.high_level_summary || '').slice(0, 200)}`
    );
    return `\n\n[KNOWLEDGE GRAPH CONTEXT — ${data.total} matches from PHNK-G]\n${lines.join('\n')}`;
  } catch {
    return null;
  }
}

// ── Test Connection Endpoints ─────────────────────────────────

app.post('/admin/api/test-llm', authRequired, async (req, res) => {
  const config = loadConfig();
  if (!config.llm?.apiKey) {
    return res.status(400).json({ success: false, error: 'No LLM API key configured' });
  }

  try {
    const testRes = await callLLM(config, 'Say "VIGILENT online" in 5 words or less.', 'You are a test assistant.');
    res.json({ success: true, response: testRes.text, model: config.llm.model, provider: config.llm.provider });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

app.post('/admin/api/test-search', authRequired, async (req, res) => {
  const config = loadConfig();
  if (!config.search?.apiKey) {
    return res.status(400).json({ success: false, error: 'No Search API key configured' });
  }

  try {
    const testRes = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': config.search.apiKey },
      body: JSON.stringify({ q: 'test', num: 1 }),
    });
    if (!testRes.ok) throw new Error(`Serper returned ${testRes.status}`);
    const data = await testRes.json();
    res.json({ success: true, results: data.organic?.length || 0 });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ── LLM Proxy (OpenRouter / Gemini / llama.cpp) ──────────────

const LLAMACPP_HOST = process.env.LLAMACPP_HOST || 'http://localhost:8080';

async function callLLM(config, prompt, systemPrompt = '') {
  const { provider, model, apiKey, temperature, maxTokens } = config.llm;

  if (provider === 'openrouter') {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://vigilent.app',
        'X-Title': 'VIGILENT Delta',
      },
      body: JSON.stringify({
        model: model || 'minimax/minimax-m2.5',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: temperature || 0.7,
        max_tokens: maxTokens || 8192,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenRouter ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    return { text, model: data.model, usage: data.usage };

  } else if (provider === 'gemini') {
    const geminiModel = model || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: temperature || 0.7, maxOutputTokens: maxTokens || 8192 },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return { text };

  } else if (provider === 'llamacpp') {
    // Local llama.cpp server — OpenAI-compatible API
    const host = config.llm.host || LLAMACPP_HOST;
    const res = await fetch(`${host}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'local',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        temperature: temperature || 0.7,
        max_tokens: maxTokens || 8192,
      }),
      signal: AbortSignal.timeout(120000), // 2min timeout for local inference
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`llama.cpp ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    return { text, model: data.model || 'local', usage: data.usage };

  } else {
    throw new Error(`Unknown LLM provider: ${provider}`);
  }
}

app.post('/api/generate', async (req, res) => {
  const config = loadConfig();
  const isLocal = config.llm?.provider === 'llamacpp';
  if (!isLocal && !config.llm?.apiKey) {
    return res.status(503).json({ error: 'LLM API key not configured. Visit /admin to set up.' });
  }

  let { prompt, system } = req.body;

  // ── Auto-enrich with Knowledge Graph context ──
  try {
    const kgContext = await fetchKGContext(prompt, 5);
    if (kgContext) {
      prompt = prompt + kgContext;
      console.log('[KG] Enriched prompt with knowledge graph context');
    }
  } catch (err) {
    console.warn('[KG] Context enrichment failed (non-fatal):', err.message);
  }

  try {
    const result = await callLLM(config, prompt, system || '');
    res.json({ text: result.text, model: result.model, usage: result.usage });
  } catch (err) {
    console.error('[LLM Proxy] Error:', err.message);
    res.status(502).json({ error: err.message });
  }
});

// ── Search Proxy (Serper) ────────────────────────────────────

app.post('/api/search', async (req, res) => {
  const config = loadConfig();
  if (!config.search?.apiKey) {
    return res.status(503).json({ error: 'Search API key not configured' });
  }

  const { q, type, num } = req.body;
  const endpoint = type === 'news'
    ? 'https://google.serper.dev/news'
    : 'https://google.serper.dev/search';

  try {
    const apiRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-KEY': config.search.apiKey },
      body: JSON.stringify({ q, num: num || 10 }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      res.status(apiRes.status).json({ error: errText });
      return;
    }

    const data = await apiRes.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// ── TTS Proxy (VoiceBox / ElevenLabs) ────────────────────────

app.post('/api/tts', async (req, res) => {
  const config = loadConfig();
  const provider = config.tts?.provider || 'elevenlabs';

  try {
    if (provider === 'voicebox') {
      // ── VoiceBox (local) ──
      const host = config.tts.voiceboxHost || 'http://localhost:17493';
      const profileId = req.body.profile_id || config.tts.voiceboxProfileId;

      if (!profileId) {
        return res.status(400).json({ error: 'VoiceBox profile_id not configured. Create a voice profile in VoiceBox and set it in Admin.' });
      }

      // Step 1: Start generation (async)
      const genRes = await fetch(`${host}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: req.body.text,
          profile_id: profileId,
          language: req.body.language || 'en',
          engine: config.tts.voiceboxEngine || 'qwen',
        }),
      });

      if (!genRes.ok) {
        const errText = await genRes.text();
        return res.status(genRes.status).json({ error: errText });
      }

      const generation = await genRes.json();
      const genId = generation.id;

      // Step 2: Poll until completed (max 120s)
      const maxWait = 120000;
      const pollInterval = 500;
      const start = Date.now();

      while (Date.now() - start < maxWait) {
        const statusRes = await fetch(`${host}/history/${genId}`, { signal: AbortSignal.timeout(5000) });
        if (!statusRes.ok) {
          await new Promise(r => setTimeout(r, pollInterval));
          continue;
        }
        const status = await statusRes.json();

        if (status.status === 'completed' && status.audio_path) {
          // Step 3: Fetch audio
          const audioRes = await fetch(`${host}/audio/${genId}`, { signal: AbortSignal.timeout(30000) });
          if (!audioRes.ok) {
            return res.status(502).json({ error: 'Failed to fetch generated audio' });
          }
          const audioBytes = Buffer.from(await audioRes.arrayBuffer());
          const contentType = audioRes.headers.get('content-type') || 'audio/wav';
          return res.json({
            audio_base64: audioBytes.toString('base64'),
            content_type: contentType,
            provider: 'voicebox',
          });
        }

        if (status.status === 'error' || status.error) {
          return res.status(500).json({ error: status.error || 'VoiceBox generation failed' });
        }

        await new Promise(r => setTimeout(r, pollInterval));
      }

      return res.status(504).json({ error: 'VoiceBox generation timed out (120s)' });

    } else {
      // ── ElevenLabs (cloud) ──
      if (!config.tts?.apiKey) {
        return res.status(503).json({ error: 'ElevenLabs API key not configured' });
      }

      const vid = config.tts.voiceId || 'EXAVITQu4vr4xnSDxMaL';

      const apiRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vid}/with-timestamps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'xi-api-key': config.tts.apiKey },
        body: JSON.stringify({
          text: req.body.text,
          model_id: 'eleven_multilingual_v2',
          output_format: 'mp3_44100_128',
        }),
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        res.status(apiRes.status).json({ error: errText });
        return;
      }

      const data = await apiRes.json();
      data.provider = 'elevenlabs';
      res.json(data);
    }
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

// ── Serve frontend in production ─────────────────────────────

const distPath = join(__dirname, 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('{*path}', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/admin')) {
      res.sendFile(join(distPath, 'index.html'));
    }
  });
}

// ── Start ────────────────────────────────────────────────────

app.listen(PORT, async () => {
  const config = loadConfig();

  // Check KG availability
  let kgStatus = '✗ Not running';
  try {
    const ping = await fetch(`${KG_HOST}/stats`, { signal: AbortSignal.timeout(2000) });
    if (ping.ok) {
      const stats = await ping.json();
      kgStatus = `✓ ${stats.total_nodes?.toLocaleString()} nodes`;
    }
  } catch { /* silent */ }

  console.log(`
╔══════════════════════════════════════════════╗
║         VIGILENT Backend Server              ║
╠══════════════════════════════════════════════╣
║  Port:     ${String(PORT).padEnd(33)}║
║  LLM:      ${(config.llm?.provider + ' / ' + config.llm?.model).padEnd(33)}║
║  Search:   ${(config.search?.apiKey ? '✓ Configured' : '✗ Not set').padEnd(33)}║
║  TTS:      ${(config.tts?.provider === 'voicebox' ? '✓ VoiceBox (local)' : config.tts?.apiKey ? '✓ ElevenLabs' : '✗ Not set').padEnd(33)}║
║  KG:       ${kgStatus.padEnd(33)}║
║  Admin:    http://localhost:${PORT}/admin${' '.repeat(Math.max(0, 12 - String(PORT).length))}║
╚══════════════════════════════════════════════╝
  `);
});
