import { apiFetch } from './client.js';

export function postScan(zona, token) {
  return apiFetch('/api/scan', { method: 'POST', body: { zona, token: token ?? '' } });
}
