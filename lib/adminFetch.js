/**
 * Cookie-based admin API client (httpOnly JWT — no localStorage).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://living-result-backend.onrender.com/api';

export async function adminFetch(path, options = {}) {
  const { headers: customHeaders, ...rest } = options;
  const headers = { ...customHeaders };
  if (rest.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: 'include',
    headers,
  });
}

export async function adminGetMe() {
  const res = await adminFetch('/auth/me');
  return res.json();
}

export async function adminLogout() {
  const res = await adminFetch('/auth/logout', { method: 'POST' });
  return res.json();
}
