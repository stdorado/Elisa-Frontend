import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { labelZona, validarZona } from '../utils/zonas.js';
import { useScan } from '../hooks/useScan.js';
import ScanLoader from '../components/ScanLoader.jsx';

const LOADER_DURATION_MS = 3000;
const LOADER_FADE_MS = 400;
const THEME_STORAGE_KEY = 'elisa_theme';

const THEMES = {
  light: {
    bg: '#FFFFFF',
    card: '#FAFAFA',
    cardAlt: '#FFFFFF',
    border: '#E4E4E7',
    text: '#09090B',
    text2: '#52525B',
    text3: '#71717A',
    muted: '#6B7280',
    accent: '#EF4444',
    alertBg: '#FEF2F2',
    alertBorder: '#FECACA',
    alertText: '#B91C1C',
    successBg: '#F0FDF4',
    successBorder: '#BBF7D0',
    successText: '#15803D',
    neutralBg: '#F4F4F5',
    neutralText: '#52525B',
    error: '#DC2626',
    toggleBg: '#FFFFFF',
    toggleIcon: '#52525B',
  },
  dark: {
    bg: '#0A0A0B',
    card: '#131316',
    cardAlt: '#1A1A1E',
    border: '#27272A',
    text: '#F4F4F5',
    text2: '#A1A1AA',
    text3: '#A1A1AA',
    muted: '#8B8B93',
    accent: '#F87171',
    alertBg: 'rgba(239, 68, 68, 0.12)',
    alertBorder: 'rgba(248, 113, 113, 0.35)',
    alertText: '#FCA5A5',
    successBg: 'rgba(34, 197, 94, 0.12)',
    successBorder: 'rgba(74, 222, 128, 0.35)',
    successText: '#4ADE80',
    neutralBg: '#1F1F23',
    neutralText: '#A1A1AA',
    error: '#F87171',
    toggleBg: '#1A1A1E',
    toggleIcon: '#F4F4F5',
  },
};

export default function Landing() {
  const [params] = useSearchParams();
  const zona = validarZona(params.get('zona'));
  const label = labelZona(zona);
  const { error, scanCount } = useScan(zona);
  const [showLoader, setShowLoader] = useState(true);
  const [loaderFadingOut, setLoaderFadingOut] = useState(false);
  const [visible, setVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  const t = darkMode ? THEMES.dark : THEMES.light;

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, darkMode ? 'dark' : 'light');
    } catch {
      // localStorage puede estar bloqueado (ej. modo privado) — no es crítico
    }
  }, [darkMode]);

  useEffect(() => {
    const prevBg = document.body.style.background;
    document.body.style.background = t.bg;
    return () => {
      document.body.style.background = prevBg;
    };
  }, [t.bg]);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setLoaderFadingOut(true), LOADER_DURATION_MS);
    const removeTimer = setTimeout(
      () => setShowLoader(false),
      LOADER_DURATION_MS + LOADER_FADE_MS
    );
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    if (!showLoader) {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
  }, [showLoader]);

  if (showLoader) {
    return <ScanLoader fadingOut={loaderFadingOut} />;
  }

  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: t.bg,
        opacity: visible ? 1 : 0,
        transition: 'opacity 400ms ease, background 200ms ease',
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: '0 auto',
          padding: '48px 24px 64px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* EYEBROW */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: t.accent,
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontFamily: 'Geist Mono, monospace',
                fontSize: 11,
                color: t.muted,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
              }}
            >
              Proyecto ELISA · Lezama, 2026
            </span>
          </div>

          <button
            type="button"
            onClick={() => setDarkMode((v) => !v)}
            aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
            aria-pressed={darkMode}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              flexShrink: 0,
              background: t.toggleBg,
              border: `1px solid ${t.border}`,
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'background 200ms ease, border-color 200ms ease',
            }}
          >
            {darkMode ? (
              <Sun size={17} color={t.toggleIcon} strokeWidth={2} />
            ) : (
              <Moon size={17} color={t.toggleIcon} strokeWidth={2} />
            )}
          </button>
        </div>

        {/* CARD PRINCIPAL — ALERTA */}
        <div
          style={{
            background: t.card,
            border: `1px solid ${t.border}`,
            borderTop: `3px solid ${t.accent}`,
            borderRadius: 12,
            padding: '28px 28px 24px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: t.alertBg,
              border: `1px solid ${t.alertBorder}`,
              borderRadius: 6,
              padding: '4px 10px',
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: t.alertText,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontFamily: 'Geist Mono, monospace',
                fontSize: 11,
                color: t.alertText,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Acción registrada
            </span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 700, color: t.text, lineHeight: 1.3, marginBottom: 12 }}>
            Acabás de demostrar cómo funciona{' '}
            <span style={{ color: t.accent }}>la ingeniería social.</span>
          </h1>

          <p style={{ fontSize: 15, color: t.text2, lineHeight: 1.7, marginBottom: 24 }}>
            Escaneaste un código QR desconocido en la vía pública sin saber adónde llevaba. Eso es
            exactamente lo que busca alguien con malas intenciones.
          </p>

          <div style={{ height: 1, background: t.border, marginBottom: 24 }} />

          {/* Bloque contador */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <p
                style={{
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: 72,
                  fontWeight: 600,
                  color: t.text,
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {scanCount !== null ? scanCount : '—'}
              </p>
              <p style={{ fontSize: 13, color: t.text3, lineHeight: 1.6 }}>
                personas en{' '}
                <strong style={{ color: t.text }}>{label}</strong> hicieron
                <br />
                lo mismo hoy.
              </p>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: zona === 'desconocida' ? t.neutralBg : t.successBg,
                border: `1px solid ${zona === 'desconocida' ? t.border : t.successBorder}`,
                borderRadius: 8,
                padding: '6px 12px',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: 12,
                  color: zona === 'desconocida' ? t.neutralText : t.successText,
                  fontWeight: 500,
                }}
              >
                {label}
              </span>
            </div>
          </div>
        </div>

        {/* CARD: QUÉ ES ESTO */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: '24px 28px' }}>
          <p
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 11,
              color: t.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 16,
            }}
          >
            ¿Qué acabas de hacer?
          </p>
          <p style={{ fontSize: 15, color: t.text2, lineHeight: 1.75 }}>
            A esto se le llama <strong style={{ color: t.text }}>ingeniería social</strong>: obtener
            información o acceso sin hackear nada, simplemente aprovechando el comportamiento humano.
            <br />
            <br />
            Bienvenido al <strong style={{ color: t.text }}>Proyecto ELISA.</strong>
          </p>
        </div>

        {/* CARD: QUÉ SE REGISTRÓ */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: '24px 28px' }}>
          <p
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 11,
              color: t.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 16,
            }}
          >
            ¿Qué se registró?
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[
              { icon: '📍', label: 'ZONA', valor: label },
              { icon: '🕐', label: 'HORA', valor: hora },
            ].map(({ icon, label: lbl, valor }) => (
              <div
                key={lbl}
                style={{
                  background: t.cardAlt,
                  border: `1px solid ${t.border}`,
                  borderRadius: 10,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 18 }}>{icon}</span>
                <div>
                  <p
                    style={{
                      fontFamily: 'Geist Mono, monospace',
                      fontSize: 10,
                      color: t.muted,
                      marginBottom: 3,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {lbl}
                  </p>
                  <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 13, fontWeight: 500, color: t.text }}>
                    {valor}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: t.border, marginBottom: 20 }} />

          <p
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 11,
              color: t.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 14,
            }}
          >
            ¿Qué NO se registró?
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Tu dirección IP', 'no la tenemos.'],
              ['Tu nombre o documento', 'nunca te los pedimos.'],
              ['Tu ubicación exacta', 'solo sabemos dónde estaba el QR.'],
              ['Tus datos de navegación', 'no hay cookies ni seguimiento.'],
              ['Nada de tu teléfono', 'no accedemos a ningún dato.'],
            ].map(([bold, rest]) => (
              <div key={bold} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span
                  style={{
                    fontFamily: 'Geist Mono, monospace',
                    fontSize: 12,
                    color: t.accent,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  ✕
                </span>
                <p style={{ fontSize: 14, color: t.text2, lineHeight: 1.5 }}>
                  <strong style={{ color: t.text, fontWeight: 500 }}>{bold}</strong>
                  {' — '}
                  {rest}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CARD: QUÉ PASA CON LOS DATOS */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: '24px 28px' }}>
          <p
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 11,
              color: t.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 16,
            }}
          >
            ¿Qué pasa con esos datos?
          </p>
          <p style={{ fontSize: 15, color: t.text2, lineHeight: 1.75 }}>
            Se usan para generar un informe estadístico sobre cuántas personas escanearon QRs en cada
            zona de Lezama. Al terminar el experimento, los registros individuales se eliminan para
            siempre. El informe final solo dice, por ejemplo,{' '}
            <em style={{ color: t.text }}>"en el Centro se registraron X escaneos"</em>. Nada que te
            identifique a vos.
          </p>
        </div>

        {/* CARD: QUIÉN ESTÁ DETRÁS */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: '24px 28px' }}>
          <p
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 11,
              color: t.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 16,
            }}
          >
            ¿Quién está detrás de esto?
          </p>
          <p style={{ fontSize: 15, color: t.text2, lineHeight: 1.75 }}>
            <strong style={{ color: t.text }}>Santino Tomás Dorado</strong>, vecino de Lezama,
            desarrollador e investigador independiente especializado en ciberseguridad e inteligencia
            artificial. El proyecto es personal, sin fines comerciales, y fue notificado al{' '}
            <strong style={{ color: t.text }}>Municipio de Lezama</strong>.
          </p>
        </div>

        {/* CARD: QUÉ APRENDER */}
        <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, padding: '24px 28px' }}>
          <p
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 11,
              color: t.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 16,
            }}
          >
            ¿Qué aprender de esto?
          </p>
          <p style={{ fontSize: 15, color: t.text2, lineHeight: 1.75, marginBottom: 16 }}>
            Antes de escanear un QR en la calle, preguntate:{' '}
            <strong style={{ color: t.text }}>¿sé de dónde viene esto?</strong> Los ataques de
            ingeniería social funcionan porque actuamos antes de pensar.
          </p>

          <div
            style={{
              background: t.cardAlt,
              border: `1px solid ${t.border}`,
              borderLeft: `3px solid ${t.text}`,
              borderRadius: '0 8px 8px 0',
              padding: '14px 18px',
            }}
          >
            <p style={{ fontSize: 14, color: t.text2, lineHeight: 1.7 }}>
              La próxima vez que encuentres un QR desconocido, primero fijate la URL de destino antes
              de abrirla.
            </p>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: 14, color: t.error, textAlign: 'center' }}>
            No se pudo contactar al servidor, pero tu escaneo quedó registrado localmente.
          </p>
        )}

        {/* FOOTER */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 14, color: t.text, fontWeight: 500, marginBottom: 16 }}>
            Gracias por participar, aunque no lo hayas elegido.
          </p>

          <div style={{ height: 1, background: t.border, marginBottom: 16 }} />

          <p style={{ fontSize: 12, color: t.muted, lineHeight: 1.8 }}>
            No recopilamos ningún dato personal tuyo.
            <br />
            Proyecto ELISA · Lezama, 2026 · Santino Tomás Dorado
          </p>
        </div>
      </div>
    </main>
  );
}
