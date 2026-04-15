const SUPABASE_URL = 'https://qxlkjlqdpynvuipmgdei.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4bGtqbHFkcHludnVpcG1nZGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5MzExMjksImV4cCI6MjA5MTUwNzEyOX0.6G5_I3sa2fKGhoEXTSKBFdHCYVw3kCjufz3RpzpMaPM';

// ── Storage ────────────────────────────────────────────────────────────────
const store = {
  get: () => new Promise((r) => chrome.storage.local.get(['hub_session'], (d) => r(d.hub_session || null))),
  set: (v) => new Promise((r) => chrome.storage.local.set({ hub_session: v }, r)),
  clear: () => new Promise((r) => chrome.storage.local.remove(['hub_session'], r)),
};

// ── API ────────────────────────────────────────────────────────────────────
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

async function saveLink(token, userId, name, url) {
  // Pega o maior display_order existente
  const ordRes = await fetch(
    `${SUPABASE_URL}/rest/v1/links?user_id=eq.${userId}&select=display_order&order=display_order.desc&limit=1`,
    { headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_KEY } },
  );
  const rows = await ordRes.json();
  const maxOrder = Array.isArray(rows) && rows.length ? rows[0].display_order : -1;

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
      description: null,
      display_order: maxOrder + 1,
      user_id: userId,
    }),
  });

  if (!res.ok) {
    let msg = 'Erro ao salvar link';
    try {
      const body = await res.json();
      if (body.message?.includes('LINK_LIMIT_REACHED')) msg = 'Limite de links atingido. Faça upgrade do plano.';
      else msg = body.message || body.error || msg;
    } catch { /* ignore */ }
    throw new Error(msg);
  }
}

// ── UI helpers ─────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

function show(screenId) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.add('hidden'));
  $(screenId).classList.remove('hidden');
}

function setLoading(btnId, on) {
  const btn = $(btnId);
  btn.disabled = on;
  btn.querySelector('.btn-text').classList.toggle('hidden', on);
  btn.querySelector('.btn-loader').classList.toggle('hidden', !on);
}

// ── Init ───────────────────────────────────────────────────────────────────
(async () => {
  const session = await store.get();
  if (!session) { show('screen-login'); return; }

  // Carrega a tela principal
  await loadSaveScreen(session);
})();

// ── Login ──────────────────────────────────────────────────────────────────
$('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('login-error').classList.add('hidden');
  setLoading('btn-login', true);

  try {
    const data = await signIn($('email').value, $('password').value);
    const session = { access_token: data.access_token, user: data.user };
    await store.set(session);
    await loadSaveScreen(session);
  } catch (err) {
    $('login-error').textContent = err.message;
    $('login-error').classList.remove('hidden');
  } finally {
    setLoading('btn-login', false);
  }
});

// ── Logout ─────────────────────────────────────────────────────────────────
$('btn-logout').addEventListener('click', async () => {
  await store.clear();
  show('screen-login');
});

// ── Tela de salvar ─────────────────────────────────────────────────────────
async function loadSaveScreen(session) {
  show('screen-save');
  $('save-error').classList.add('hidden');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Bloqueia páginas internas do browser
  if (!tab?.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about:')) {
    show('screen-unsupported');
    return;
  }

  // Preenche preview
  const origin = new URL(tab.url).origin;
  $('page-favicon').src = `${origin}/favicon.ico`;
  $('page-favicon').onerror = () => { $('page-favicon').src = 'icons/icon16.png'; };
  $('page-title').textContent = tab.title || tab.url;
  $('page-url').textContent   = tab.url;

  // Botão salvar
  $('btn-save').onclick = async () => {
    $('save-error').classList.add('hidden');
    setLoading('btn-save', true);
    try {
      await saveLink(session.access_token, session.user.id, tab.title || tab.url, tab.url);
      $('saved-title').textContent = (tab.title || tab.url).toUpperCase();
      show('screen-success');
      // Fecha o popup automaticamente após 1.5s
      setTimeout(() => window.close(), 1500);
    } catch (err) {
      if (err.message.includes('JWT') || err.message.includes('nauthorized')) {
        await store.clear();
        show('screen-login');
        return;
      }
      $('save-error').textContent = err.message;
      $('save-error').classList.remove('hidden');
    } finally {
      setLoading('btn-save', false);
    }
  };
}
