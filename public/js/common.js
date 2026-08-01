const API = '/api/v1';

function getToken() {
  return localStorage.getItem('token');
}

function setToken(token) {
  if (token) localStorage.setItem('token', token);
}

function clearToken() {
  localStorage.removeItem('token');
}

function isLoggedIn() {
  return !!getToken();
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

function redirectIfAuthed() {
  if (isLoggedIn()) {
    window.location.href = '/dashboard.html';
    return true;
  }
  return false;
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    if (res.status === 401) {
      clearToken();
      if (!window.location.pathname.endsWith('login.html')) {
        window.location.href = '/login.html';
      }
    }
    throw err;
  }

  return data;
}

function showToast(message, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function formatPrice(sub) {
  return `${sub.currency} ${Number(sub.price).toFixed(2)} / ${sub.frequency}`;
}

function logout() {
  api('/auth/sign-out').catch(() => {});
  clearToken();
  window.location.href = '/login.html';
}
