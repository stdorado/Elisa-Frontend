import { apiFetch } from './client.js';

export function postScan(zona) {
  return apiFetch('/api/scan', { method: 'POST', body: { zona } });
}
