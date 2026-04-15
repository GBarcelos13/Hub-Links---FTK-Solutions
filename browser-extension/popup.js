const SUPABASE_URL = 'https://qxlkjlqdpynvuipmgdei.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bGtqbHFkcHludnVpcG1nZGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzExMjksImV4cCI6MjA5MTUwNzEyOX0.6G5_I3sa2fKGhoEXTSKBFdHCYVw3kCjufz3RpzpMaPM';

// ── Storage helpers ────────────────────────────────────────────────────────
function getSession() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['hub_session'], (r) => resolve(r.hub_session || null));
  });
}
function saveSession(session) {
  return new Promise((resolve) => chrome.storage.local.set({ hub_session: session }, resolve));
}
function clearSession() {
  return new Promise((resolve) => chrome.storage.local.remove(['hub_session'], resolve));
}

// ── Supabase API ───────────────────────────────────────────────────────────
async function signIn(email, password) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.msg || 'Credenciais inválidas');
  return data;
}

async function getMaxOrder(token, userId) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/links?user_id=eq.${userId}&select=display_order&order=display_order.desc&limit=1`,
    { headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_KEY } },
  );
  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0 ? rows[0].display_order : -1;
}

async function addLink(token, userId, name, url, description) {
  const maxOrder = await getMaxOrder(token, userId);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/links`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      name: name.trim().toUpperCase(),
      url: url.trim(),
      description: description.trim() || null,
      display_order: maxOrder + 1,
      user_id: userId,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    let msg = 'Erro ao salvar link';
    try {
      const body = JSON.parse(text);
      if (body.message?.includes('LINK_LIMIT_REACHED')) {
        msg = 'Limite de links atingido. Faça upgrade do plano.';
      } else {
        msg = body.message || body.error || msg;
      }
    } catch { /* ignore */ }
    throw new Error(msg);
  }
}

// ── Screen helpers ─────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.querySelector('.btn-text').classList.toggle('hidden', loading);
  btn.querySelector('.btn-spinner').classList.toggle('hidden', !loading);
}

function showError(elId, msg) {
  const el = document.getElementById(elId);
  el.textContent = msg;
  el.classList.remove('hidden');
}

function hideError(elId) {
  document.getElementById(elId).classList.add('hidden');
}

// ── Current tab ────────────────────────────────────────────────────────────
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// ── Main ───────────────────────────────────────────────────────────────────
(async () => {
  const session = await getSession();

  // ── Login screen ────────────────────────────────────────────────────────
  document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError('login-error');
    const btn = document.getElementById('btn-login');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    setLoading(btn, true);
    try {
      const data = await signIn(email, password);
      await saveSession({ access_token: data.access_token, user: data.user });
      await loadSaveScreen();
    } catch (err) {
      showError('login-error', err.message);
    } finally {
      setLoading(btn, false);
    }
  });

  // ── Logout ───────────────────────────────────────────────────────────────
  document.getElementById('btn-logout').addEventListener('click', async () => {
    await clearSession();
    showScreen('screen-login');
  });

  // ── Save screen ──────────────────────────────────────────────────────────
  async function loadSaveScreen() {
    showScreen('screen-save');
    const tab = await getCurrentTab();

    const nameInput = document.getElementById('link-name');
    const urlInput  = document.getElementById('link-url');

    // Pre-fill with tab info (skip chrome:// pages)
    if (tab?.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
      urlInput.value  = tab.url;
      nameInput.value = tab.title || '';
    }

    nameInput.focus();
    nameInput.select();
  }

  document.getElementById('form-save').addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError('save-error');
    const btn     = document.getElementById('btn-save');
    const session = await getSession();

    if (!session) { showScreen('screen-login'); return; }

    const name = document.getElementById('link-name').value;
    const url  = document.getElementById('link-url').value;
    const desc = document.getElementById('link-desc').value;

    setLoading(btn, true);
    try {
      await addLink(session.access_token, session.user.id, name, url, desc);

      // Success screen
      document.getElementById('success-name').textContent = name.toUpperCase();
      showScreen('screen-success');
    } catch (err) {
      // Session expired — go back to login
      if (err.message.includes('JWT') || err.message.includes('Unauthorized')) {
        await clearSession();
        showScreen('screen-login');
        return;
      }
      showError('save-error', err.message);
    } finally {
      setLoading(btn, false);
    }
  });

  // ── "Salvar outro" ───────────────────────────────────────────────────────
  document.getElementById('btn-another').addEventListener('click', async () => {
    document.getElementById('link-name').value = '';
    document.getElementById('link-url').value  = '';
    document.getElementById('link-desc').value = '';
    await loadSaveScreen();
  });

  // ── Initial render ───────────────────────────────────────────────────────
  if (session) {
    await loadSaveScreen();
  } else {
    showScreen('screen-login');
  }
})();
