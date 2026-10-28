// src/lib/api.js
export const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE || (import.meta.env.DEV ? "http://localhost:3001" : window.location.origin)).replace(/\/$/, "");
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
