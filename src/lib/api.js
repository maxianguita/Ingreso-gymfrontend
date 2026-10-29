// src/lib/api.js
// En producción Vercel deriva /api y /auth a Render, conservando las cookies
// en el mismo origen que la página. Las URLs locales se usan solo en desarrollo.
export const API_BASE = (import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || "http://localhost:3001")
  : window.location.origin).replace(/\/$/, "");
const API = API_BASE;

export async function authenticatedFetch(url, options = {}) {
  const response = await fetch(url, { ...options, credentials: 'include' });
  if (response.status === 401) window.dispatchEvent(new Event('gym-session-expired'));
  return response;
}

export async function api(path, { method='GET', body, headers } = {}) {
  const res = await fetch(API + path, {
    credentials: 'include',
    method,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(()=> ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.error || data.message || `HTTP ${res.status}`), { status: res.status, data });
  }
  return data;
}
