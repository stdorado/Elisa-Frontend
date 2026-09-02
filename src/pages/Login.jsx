import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyAdminToken } from '../api/admin.api.js';

// Prefill de pruebas — solo en dev, Vite lo elimina del build de producción.
const DEV_TOKEN = import.meta.env.DEV ? 'dev-admin-token-elisa' : '';

export default function Login() {
  const [token, setToken] = useState(DEV_TOKEN);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const trimmedToken = token.trim();
      await verifyAdminToken(trimmedToken);
      sessionStorage.setItem('elisa_admin_token', trimmedToken);
      navigate('/admin', { replace: true });
    } catch {
      setError('Token inválido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FFFFFF',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 360,
          background: '#FAFAFA',
          border: '1px solid #E4E4E7',
          borderRadius: 16,
          padding: '32px 28px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 14,
              fontWeight: 600,
              color: '#09090B',
              letterSpacing: '0.06em',
              marginBottom: 4,
            }}
          >
            ELISA
          </p>
          <p style={{ fontSize: 13, color: '#A1A1AA' }}>Panel de administración</p>
        </div>

        {/* Separador */}
        <div style={{ height: 1, background: '#E4E4E7', marginBottom: 24 }} />

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="token"
            style={{
              display: 'block',
              fontSize: 13,
              fontWeight: 500,
              color: '#09090B',
              marginBottom: 8,
            }}
          >
            Token de acceso
          </label>

          <input
            id="token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="••••••••••••••••"
            autoComplete="current-password"
            disabled={loading}
            style={{
              width: '100%',
              height: 40,
              padding: '0 14px',
              background: '#FFFFFF',
              border: '1px solid #D1D5DB',
              borderRadius: 8,
              fontSize: 14,
              fontFamily: 'Geist Mono, monospace',
              color: '#09090B',
              outline: 'none',
              marginBottom: 8,
              transition: 'border-color 150ms, box-shadow 150ms',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#09090B';
              e.target.style.boxShadow = '0 0 0 3px #09090B10';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#D1D5DB';
              e.target.style.boxShadow = 'none';
            }}
          />

          {error && <p style={{ fontSize: 13, color: '#EF4444', marginBottom: 8 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading || !token.trim()}
            style={{
              width: '100%',
              height: 40,
              background: loading || !token.trim() ? '#F4F4F5' : '#18181B',
              color: loading || !token.trim() ? '#A1A1AA' : '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: loading || !token.trim() ? 'not-allowed' : 'pointer',
              transition: 'background 150ms',
              marginTop: 4,
            }}
            onMouseEnter={(e) => {
              if (!loading && token.trim()) e.target.style.background = '#27272A';
            }}
            onMouseLeave={(e) => {
              if (!loading && token.trim()) e.target.style.background = '#18181B';
            }}
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ height: 1, background: '#E4E4E7', margin: '24px 0 16px' }} />

        <p style={{ textAlign: 'center', fontSize: 12, color: '#A1A1AA' }}>
          Acceso restringido · Proyecto ELISA
        </p>
      </div>
    </div>
  );
}
