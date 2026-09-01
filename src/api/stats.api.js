import { apiFetch } from './client.js';

export function getStats(token) {
  return apiFetch('/api/stats', { token });
}

export function getData(token) {
  return apiFetch('/api/data', { token });
}
