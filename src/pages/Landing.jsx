import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { labelZona, validarZona } from '../utils/zonas.js';
import { useScan } from '../hooks/useScan.js';

export default function Landing() {
  const [params] = useSearchParams();
  const zona = validarZona(params.get('zona'));
  const label = labelZona(zona);
  const { loading, error, scanCount } = useScan(zona);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!loading) {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
  }, [loading]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
          gap: 20,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: '2px solid #E4E4E7',
            borderTopColor: '#18181B',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <p
          style={{
            fontFamily: 'Geist Mono, monospace',
            fontSize: 12,
            color: '#A1A1AA',
            letterSpacing: '0.08em',
          }}
        >
          ELISA · procesando
        </p>
      </div>
    );
  }

  const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#FFFFFF',
        opacity: visible ? 1 : 0,
        transition: 'opacity 400ms ease',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#EF4444',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 11,
              color: '#A1A1AA',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            Proyecto ELISA · Lezama, 2026
          </span>
        </div>

        {/* CARD PRINCIPAL — ALERTA */}
        <div
          style={{
            background: '#FAFAFA',
            border: '1px solid #E4E4E7',
            borderTop: '3px solid #EF4444',
            borderRadius: 12,
            padding: '28px 28px 24px',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: '#FEF2F2',
              border: '1px solid #FECACA',
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
                background: '#EF4444',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontFamily: 'Geist Mono, monospace',
                fontSize: 11,
                color: '#EF4444',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              Acción registrada
            </span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#09090B', lineHeight: 1.3, marginBottom: 12 }}>
            Acabás de demostrar cómo funciona{' '}
            <span style={{ color: '#EF4444' }}>la ingeniería social.</span>
          </h1>

          <p style={{ fontSize: 15, color: '#52525B', lineHeight: 1.7, marginBottom: 24 }}>
            Escaneaste un código QR desconocido en la vía pública sin saber adónde llevaba. Eso es
            exactamente lo que busca alguien con malas intenciones.
          </p>

          <div style={{ height: 1, background: '#E4E4E7', marginBottom: 24 }} />

          {/* Bloque contador */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <p
                style={{
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: 72,
                  fontWeight: 600,
                  color: '#09090B',
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {scanCount !== null ? scanCount : '—'}
              </p>
              <p style={{ fontSize: 13, color: '#71717A', lineHeight: 1.6 }}>
                personas en{' '}
                <strong style={{ color: '#09090B' }}>{label}</strong> hicieron
                <br />
                lo mismo hoy.
              </p>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: zona === 'desconocida' ? '#F4F4F5' : '#F0FDF4',
                border: `1px solid ${zona === 'desconocida' ? '#E4E4E7' : '#BBF7D0'}`,
                borderRadius: 8,
                padding: '6px 12px',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: 12,
                  color: zona === 'desconocida' ? '#A1A1AA' : '#16A34A',
                  fontWeight: 500,
                }}
              >
                {label}
              </span>
            </div>
          </div>
        </div>

        {/* CARD: QUÉ ES ESTO */}
        <div style={{ background: '#FAFAFA', border: '1px solid #E4E4E7', borderRadius: 12, padding: '24px 28px' }}>
          <p
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 11,
              color: '#A1A1AA',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 16,
            }}
          >
            ¿Qué acabas de hacer?
          </p>
          <p style={{ fontSize: 15, color: '#52525B', lineHeight: 1.75 }}>
            A esto se le llama <strong style={{ color: '#09090B' }}>ingeniería social</strong>: obtener
            información o acceso sin hackear nada, simplemente aprovechando el comportamiento humano.
            <br />
            <br />
            Bienvenido al <strong style={{ color: '#09090B' }}>Proyecto ELISA.</strong>
          </p>
        </div>

        {/* CARD: QUÉ SE REGISTRÓ */}
        <div style={{ background: '#FAFAFA', border: '1px solid #E4E4E7', borderRadius: 12, padding: '24px 28px' }}>
          <p
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 11,
              color: '#A1A1AA',
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
                  background: '#FFFFFF',
                  border: '1px solid #E4E4E7',
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
                      color: '#A1A1AA',
                      marginBottom: 3,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {lbl}
                  </p>
                  <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 13, fontWeight: 500, color: '#09090B' }}>
                    {valor}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: '#E4E4E7', marginBottom: 20 }} />

          <p
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 11,
              color: '#A1A1AA',
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
                    color: '#EF4444',
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  ✕
                </span>
                <p style={{ fontSize: 14, color: '#52525B', lineHeight: 1.5 }}>
                  <strong style={{ color: '#09090B', fontWeight: 500 }}>{bold}</strong>
                  {' — '}
                  {rest}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CARD: QUÉ PASA CON LOS DATOS */}
        <div style={{ background: '#FAFAFA', border: '1px solid #E4E4E7', borderRadius: 12, padding: '24px 28px' }}>
          <p
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 11,
              color: '#A1A1AA',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 16,
            }}
          >
            ¿Qué pasa con esos datos?
          </p>
          <p style={{ fontSize: 15, color: '#52525B', lineHeight: 1.75 }}>
            Se usan para generar un informe estadístico sobre cuántas personas escanearon QRs en cada
            zona de Lezama. Al terminar el experimento, los registros individuales se eliminan para
            siempre. El informe final solo dice, por ejemplo,{' '}
            <em style={{ color: '#09090B' }}>"en el Centro se registraron X escaneos"</em>. Nada que te
            identifique a vos.
          </p>
        </div>

        {/* CARD: QUIÉN ESTÁ DETRÁS */}
        <div style={{ background: '#FAFAFA', border: '1px solid #E4E4E7', borderRadius: 12, padding: '24px 28px' }}>
          <p
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 11,
              color: '#A1A1AA',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 16,
            }}
          >
            ¿Quién está detrás de esto?
          </p>
          <p style={{ fontSize: 15, color: '#52525B', lineHeight: 1.75 }}>
            <strong style={{ color: '#09090B' }}>Santino Tomás Dorado</strong>, vecino de Lezama,
            desarrollador e investigador independiente especializado en ciberseguridad e inteligencia
            artificial. El proyecto es personal, sin fines comerciales, y fue notificado al{' '}
            <strong style={{ color: '#09090B' }}>Municipio de Lezama</strong>.
            <br />
            <br />
            Consultas:{' '}
            <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 13, color: '#09090B' }}>
              [email de contacto]
            </span>
          </p>
        </div>

        {/* CARD: QUÉ APRENDER */}
        <div style={{ background: '#FAFAFA', border: '1px solid #E4E4E7', borderRadius: 12, padding: '24px 28px' }}>
          <p
            style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 11,
              color: '#A1A1AA',
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              marginBottom: 16,
            }}
          >
            ¿Qué aprender de esto?
          </p>
          <p style={{ fontSize: 15, color: '#52525B', lineHeight: 1.75, marginBottom: 16 }}>
            Antes de escanear un QR en la calle, preguntate:{' '}
            <strong style={{ color: '#09090B' }}>¿sé de dónde viene esto?</strong> Los ataques de
            ingeniería social funcionan porque actuamos antes de pensar.
          </p>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E4E4E7',
              borderLeft: '3px solid #09090B',
              borderRadius: '0 8px 8px 0',
              padding: '14px 18px',
            }}
          >
            <p style={{ fontSize: 14, color: '#52525B', lineHeight: 1.7 }}>
              La próxima vez que encuentres un QR desconocido, primero fijate la URL de destino antes
              de abrirla.
            </p>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: 13, color: '#EF4444', textAlign: 'center' }}>
            No se pudo contactar al servidor, pero tu escaneo quedó registrado localmente.
          </p>
        )}

        {/* FOOTER */}
        <div style={{ textAlign: 'center', paddingTop: 8 }}>
          <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 14, color: '#09090B', fontWeight: 500, marginBottom: 16 }}>
            Gracias por participar, aunque no lo hayas elegido.
          </p>

          <div style={{ height: 1, background: '#E4E4E7', marginBottom: 16 }} />

          <p style={{ fontSize: 12, color: '#A1A1AA', lineHeight: 1.8 }}>
            No recopilamos ningún dato personal tuyo.
            <br />
            Proyecto ELISA · Lezama, 2026 · Santino Tomás Dorado
          </p>
        </div>
      </div>
    </div>
  );
}
