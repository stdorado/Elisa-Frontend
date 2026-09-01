import { apiFetch } from './client.js';

export function verifyAdminToken(token) {
  return apiFetch('/api/admin/verify', { method: 'POST', body: { token } });
}
