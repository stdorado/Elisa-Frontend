import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useStats } from '../hooks/useStats.js';
import { ZONAS_VALIDAS } from '../utils/zonas.js';

const TEMAS = {
  claro: {
    bg: '#FFFFFF',
    surface: '#FAFAFA',
    surface2: '#F4F4F5',
    border: '#E4E4E7',
    borderdim: '#F4F4F5',
    text: '#09090B',
    text2: '#52525B',
    muted: '#A1A1AA',
    dimmed: '#D4D4D8',
    sidebar: '#FAFAFA',
    topbar: 'rgba(255,255,255,0.9)',
    card: '#FFFFFF',
    cardHover: '0 2px 8px #00000008',
    input: '#FFFFFF',
    btnBg: '#FFFFFF',
    btnBorder: '#E4E4E7',
    btnHover: '#F4F4F5',
    navActive: '#FFFFFF',
    navBorder: '#E4E4E7',
    rowHover: '#FAFAFA',
    gridStroke: '#F4F4F5',
    barFill: '#09090B',
    areaStroke: '#09090B',
    areaStop: '#09090B',
    tooltipBg: '#FFFFFF',
    tooltipShadow: '0 4px 12px #00000010',
    donutColors: ['#09090B', '#6B7280', '#E4E4E7'],
  },
  oscuro: {
    bg: '#09090B',
    surface: '#18181B',
    surface2: '#1C1C1F',
    border: '#27272A',
    borderdim: '#1E1E21',
    text: '#FAFAFA',
    text2: '#A1A1AA',
    muted: '#52525B',
    dimmed: '#3F3F46',
    sidebar: '#111113',
    topbar: 'rgba(9,9,11,0.85)',
    card: '#18181B',
    cardHover: '0 2px 8px #FFFFFF06',
    input: '#1C1C1F',
    btnBg: '#18181B',
    btnBorder: '#27272A',
    btnHover: '#27272A',
    navActive: '#27272A',
    navBorder: '#27272A',
    rowHover: '#1C1C1F',
    gridStroke: '#27272A',
    barFill: '#FAFAFA',
    areaStroke: '#FAFAFA',
    areaStop: '#FAFAFA',
    tooltipBg: '#18181B',
    tooltipShadow: '0 4px 12px #00000040',
    donutColors: ['#FAFAFA', '#52525B', '#27272A'],
  },
};

const ThemeContext = createContext(TEMAS.claro);

const ZONA_COLORS = {
  centro: '#2563EB',
  banco: '#16A34A',
  padel: '#7C3AED',
  tero: '#D97706',
  'san-ceferino': '#DC2626',
  polideportivo: '#0891B2',
  boulevard: '#059669',
  clubes: '#EA580C',
};

const ZONAS_LABELS = {
  centro: 'Centro',
  banco: 'Banco',
  padel: 'Padel',
  tero: 'Tero',
  'san-ceferino': 'San Ceferino',
  polideportivo: 'Polideportivo',
  boulevard: 'Boulevard',
  clubes: 'Clubes',
};

const POR_PAGINA = 50;
const SEMANA_MS = 7 * 24 * 60 * 60 * 1000;

const MONO = 'IBM Plex Mono';

function IconResumen() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconEscaneos() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <circle cx="3" cy="6" r="1" fill="currentColor" />
      <circle cx="3" cy="12" r="1" fill="currentColor" />
      <circle cx="3" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

function IconAnalisis() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

const NAV_ITEMS = [
  { id: 'resumen', label: 'Resumen', Icon: IconResumen },
  { id: 'escaneos', label: 'Escaneos', Icon: IconEscaneos },
  { id: 'analisis', label: 'Análisis', Icon: IconAnalisis },
];

function useHover() {
  const [hover, setHover] = useState(false);
  return [hover, { onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) }];
}

function CustomTooltip({ active, payload, label }) {
  const t = useContext(ThemeContext);
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: t.tooltipBg,
        border: `1px solid ${t.border}`,
        borderRadius: 6,
        padding: '8px 12px',
        boxShadow: t.tooltipShadow,
      }}
    >
      <p style={{ fontSize: 11, color: t.muted, fontFamily: MONO, marginBottom: 3, margin: 0 }}>{label}</p>
      <p style={{ fontSize: 13, color: t.text, fontFamily: MONO, fontWeight: 600, margin: 0 }}>
        {payload[0].value} escaneos
      </p>
    </div>
  );
}

function thBaseStyle(t) {
  return {
    fontSize: 11,
    fontFamily: MONO,
    color: t.muted,
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    padding: '10px 20px',
    borderBottom: `1px solid ${t.border}`,
    background: t.surface,
    fontWeight: 500,
    textAlign: 'left',
  };
}

function tdBaseStyle(t) {
  return {
    fontSize: 14,
    color: t.text2,
    padding: '12px 20px',
    borderBottom: `1px solid ${t.borderdim}`,
  };
}

function cardBaseStyle(t) {
  return { background: t.card, border: `1px solid ${t.border}`, borderRadius: 12, overflow: 'hidden' };
}

function cardHeaderBaseStyle(t) {
  return { padding: '14px 18px', borderBottom: `1px solid ${t.border}` };
}

function cardTitleBaseStyle(t) {
  return { fontSize: 13, fontWeight: 500, color: t.text, margin: 0 };
}

function ghostButtonStyle(t, hover, disabled) {
  return {
    height: 28,
    padding: '0 10px',
    fontSize: 12,
    background: hover && !disabled ? t.btnHover : t.btnBg,
    color: disabled ? t.dimmed : t.text2,
    border: `1px solid ${t.btnBorder}`,
    borderRadius: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 150ms',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };
}

function fieldStyle(t) {
  return {
    height: 36,
    padding: '0 14px',
    background: t.input,
    border: `1px solid ${t.border}`,
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 150ms, box-shadow 150ms',
  };
}

function focusField(e, t) {
  e.target.style.borderColor = t.text;
  e.target.style.boxShadow = `0 0 0 3px ${t.text}10`;
}

function blurField(e, t) {
  e.target.style.borderColor = t.border;
  e.target.style.boxShadow = 'none';
}

function paginationButtonStyle(t, disabled) {
  return {
    height: 28,
    padding: '0 10px',
    fontSize: 12,
    background: t.btnBg,
    color: disabled ? t.dimmed : t.text2,
    border: `1px solid ${t.btnBorder}`,
    borderRadius: 6,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 150ms',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };
}

function paginationHover(e, t, disabled) {
  if (disabled) return;
  e.currentTarget.style.borderColor = t.dimmed;
  e.currentTarget.style.color = t.text;
}

function paginationLeave(e, t, disabled) {
  if (disabled) return;
  e.currentTarget.style.borderColor = t.btnBorder;
  e.currentTarget.style.color = t.text2;
}

function Card({ children, style }) {
  const t = useContext(ThemeContext);
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ children }) {
  const t = useContext(ThemeContext);
  return (
    <div style={cardHeaderBaseStyle(t)}>
      <p style={cardTitleBaseStyle(t)}>{children}</p>
    </div>
  );
}

function SectionTitle({ children }) {
  const t = useContext(ThemeContext);
  return (
    <p
      style={{
        fontSize: 12,
        color: t.muted,
        fontFamily: MONO,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

function formatFecha(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatHora(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function Admin() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem('elisa_admin_token');
  const { stats, data, loading, error } = useStats(token);
  const [vista, setVista] = useState('resumen');

  // Leer preferencia guardada o usar claro por defecto
  const [temaActivo, setTemaActivo] = useState(() => {
    return localStorage.getItem('elisa_tema') || 'claro';
  });

  const t = TEMAS[temaActivo];

  const toggleTema = () => {
    const nuevo = temaActivo === 'claro' ? 'oscuro' : 'claro';
    setTemaActivo(nuevo);
    localStorage.setItem('elisa_tema', nuevo);
  };

  useEffect(() => {
    if (error?.status === 401) {
      sessionStorage.removeItem('elisa_admin_token');
      navigate('/login', { replace: true });
    }
  }, [error, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('elisa_admin_token');
    navigate('/login', { replace: true });
  };

  const handleExport = () => {
    if (!data) return;
    const header = 'id,zona,created_at\n';
    const rows = data.map((r) => `${r.id},${r.zona},${r.created_at}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'elisa-scans.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const demo = Boolean(error) && error.status !== 401;
  const vistaActiva = NAV_ITEMS.find((item) => item.id === vista);

  // ── Vista Escaneos ──────────────────────────────────────────────
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroZona, setFiltroZona] = useState('todas');
  const [pagina, setPagina] = useState(1);

  const registrosFiltrados = useMemo(() => {
    if (!data) return [];
    const termino = filtroTexto.trim().toLowerCase();
    return data.filter((s) => {
      if (filtroZona !== 'todas' && s.zona !== filtroZona) return false;
      if (!termino) return true;
      const etiqueta = (ZONAS_LABELS[s.zona] ?? s.zona).toLowerCase();
      return etiqueta.includes(termino) || s.zona.toLowerCase().includes(termino);
    });
  }, [data, filtroTexto, filtroZona]);

  useEffect(() => {
    setPagina(1);
  }, [filtroTexto, filtroZona]);

  const totalPaginas = Math.max(1, Math.ceil(registrosFiltrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const paginatedData = useMemo(
    () => registrosFiltrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA),
    [registrosFiltrados, paginaActual]
  );

  // ── Vista Análisis ──────────────────────────────────────────────
  const estaSemana = useMemo(() => {
    if (!data) return 0;
    const desde = Date.now() - SEMANA_MS;
    return data.filter((r) => new Date(r.created_at).getTime() >= desde).length;
  }, [data]);

  const promedioPorDia = useMemo(() => {
    if (!data || data.length === 0 || !stats) return 0;
    const masAntiguo = data[data.length - 1];
    const dias = Math.max(
      1,
      Math.ceil((Date.now() - new Date(masAntiguo.created_at).getTime()) / (1000 * 60 * 60 * 24))
    );
    return (stats.total / dias).toFixed(1);
  }, [data, stats]);

  const pctMobile = useMemo(() => {
    const total = stats?.total ?? 0;
    if (!total) return 0;
    return Math.round(((stats?.por_device?.mobile ?? 0) / total) * 100);
  }, [stats]);

  const pctDesktop = useMemo(() => {
    const total = stats?.total ?? 0;
    if (!total) return 0;
    return Math.round(((stats?.por_device?.desktop ?? 0) / total) * 100);
  }, [stats]);

  const horaPico = useMemo(
    () => Object.entries(stats?.por_hora ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—',
    [stats]
  );

  const zonasActivas = useMemo(
    () => Object.values(stats?.por_zona ?? {}).filter((v) => v > 0).length,
    [stats]
  );

  const dataZonasConPromedio = useMemo(() => {
    const dataZonas = ZONAS_VALIDAS.map((zona) => ({
      zona: ZONAS_LABELS[zona] ?? zona,
      cantidad: stats?.por_zona?.[zona] ?? 0,
    }));
    const promedio = dataZonas.length
      ? dataZonas.reduce((sum, d) => sum + d.cantidad, 0) / dataZonas.length
      : 0;
    return dataZonas.map((d) => ({ ...d, promedio: Number(promedio.toFixed(1)) }));
  }, [stats]);

  // ── Vista Resumen ───────────────────────────────────────────────
  const dataZonasResumen = useMemo(() => {
    return ZONAS_VALIDAS.map((zona) => ({
      zona,
      cantidad: stats?.por_zona?.[zona] ?? 0,
    })).sort((a, b) => b.cantidad - a.cantidad);
  }, [stats]);

  const dataHorasResumen = useMemo(() => {
    return Object.entries(stats?.por_hora ?? {})
      .map(([hora, cantidad]) => ({ hora, cantidad }))
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }, [stats]);

  const dataDispositivos = useMemo(
    () => [
      { name: 'Móvil', value: stats?.por_device?.mobile ?? 0 },
      { name: 'Desktop', value: stats?.por_device?.desktop ?? 0 },
      { name: 'Otro', value: stats?.por_device?.unknown ?? 0 },
    ],
    [stats]
  );

  const sinDatosZonas = dataZonasResumen.every((z) => z.cantidad === 0);

  const hoyFecha = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

  const KPIS = [
    { label: 'Total escaneos', valor: stats?.total ?? 0, sub: 'desde el inicio' },
    { label: 'Hoy', valor: stats?.hoy ?? 0, sub: hoyFecha },
    { label: 'Esta semana', valor: estaSemana, sub: 'últimos 7 días' },
    {
      label: 'Zona líder',
      valor: stats?.zona_lider
        ? ZONAS_LABELS[stats.zona_lider.nombre] ?? stats.zona_lider.nombre
        : '—',
      sub: stats?.zona_lider ? `${stats.zona_lider.cantidad} escaneos` : 'sin datos aún',
    },
    { label: 'Acceso móvil', valor: `${pctMobile}%`, sub: `${pctDesktop}% desktop` },
    { label: 'Hora pico', valor: horaPico, sub: 'mayor actividad' },
  ];

  const METRICAS = [
    { label: 'Total de escaneos', valor: stats?.total ?? 0 },
    { label: 'Escaneos hoy', valor: stats?.hoy ?? 0 },
    { label: 'Escaneos esta semana', valor: estaSemana },
    { label: 'Promedio por día', valor: promedioPorDia },
    {
      label: 'Zona más activa',
      valor: stats?.zona_lider
        ? ZONAS_LABELS[stats.zona_lider.nombre] ?? stats.zona_lider.nombre
        : '—',
    },
    { label: 'Hora pico', valor: horaPico },
    { label: '% Acceso móvil', valor: `${pctMobile}%` },
    { label: '% Acceso desktop', valor: `${pctDesktop}%` },
    { label: 'Zonas con actividad', valor: `${zonasActivas} de 8` },
  ];

  const [hoverRefresh, hoverRefreshProps] = useHover();
  const [hoverCsv, hoverCsvProps] = useHover();
  const [hoverLogout, hoverLogoutProps] = useHover();
  const [hoverTema, hoverTemaProps] = useHover();
  const [hoveredNav, setHoveredNav] = useState(null);

  return (
    <ThemeContext.Provider value={t}>
      <div className="flex h-dvh overflow-hidden" style={{ background: t.bg }}>
        <div
          className="w-[200px] flex-shrink-0 flex flex-col"
          style={{ background: t.sidebar, borderRight: `1px solid ${t.border}` }}
        >
          <div style={{ padding: 16, borderBottom: `1px solid ${t.border}` }}>
            <p style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: t.text, letterSpacing: '0.08em', margin: 0 }}>
              ELISA
            </p>
            <p style={{ fontSize: 11, color: t.muted, marginTop: 2, margin: '2px 0 0' }}>Panel de control</p>
          </div>

          <div style={{ padding: 8, flex: 1 }}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.Icon;
              const activo = item.id === vista;
              const hover = hoveredNav === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setVista(item.id)}
                  onMouseEnter={() => setHoveredNav(item.id)}
                  onMouseLeave={() => setHoveredNav(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    marginBottom: 2,
                    fontSize: 13,
                    background: activo ? t.navActive : 'transparent',
                    border: activo ? `1px solid ${t.navBorder}` : '1px solid transparent',
                    color: activo ? t.text : hover ? t.text : t.muted,
                    transition: 'all 150ms',
                  }}
                >
                  <Icon />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>

          <div style={{ borderTop: `1px solid ${t.border}`, padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#3ECF8E',
                  boxShadow: '0 0 6px #3ECF8E80',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
              <span style={{ fontSize: 11, color: t.muted }}>Servidor activo</span>
            </div>
            <div
              onClick={handleLogout}
              {...hoverLogoutProps}
              style={{
                fontSize: 12,
                color: hoverLogout ? '#F04444' : t.muted,
                cursor: 'pointer',
                transition: 'color 150ms',
              }}
            >
              Cerrar sesión →
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ background: t.bg }}>
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              background: t.topbar,
              backdropFilter: 'blur(8px)',
              borderBottom: `1px solid ${t.border}`,
              padding: '0 24px',
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ color: t.muted }}>ELISA</span>
              <span style={{ color: t.dimmed }}>/</span>
              <span style={{ color: t.text2 }}>{vistaActiva.label}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {demo && (
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: MONO,
                    background: '#F59E0B15',
                    color: '#F59E0B',
                    border: '1px solid #F59E0B30',
                    borderRadius: 4,
                    padding: '2px 8px',
                  }}
                >
                  DEMO
                </span>
              )}
              <button
                type="button"
                onClick={toggleTema}
                title={temaActivo === 'claro' ? 'Cambiar a oscuro' : 'Cambiar a claro'}
                {...hoverTemaProps}
                style={{
                  width: 30,
                  height: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: t.btnBg,
                  border: `1px solid ${hoverTema ? t.dimmed : t.border}`,
                  borderRadius: 7,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  color: hoverTema ? t.text : t.text2,
                  fontSize: 14,
                }}
              >
                {temaActivo === 'claro' ? '🌙' : '☀️'}
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                {...hoverRefreshProps}
                style={ghostButtonStyle(t, hoverRefresh, false)}
              >
                ↺ Actualizar
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={!data}
                {...hoverCsvProps}
                style={ghostButtonStyle(t, hoverCsv, !data)}
              >
                ⬇ Exportar CSV
              </button>
              <span style={{ fontSize: 11, color: t.dimmed, fontFamily: MONO }}>Auto · 30s</span>
            </div>
          </div>

          <div style={{ padding: 24 }}>
            {loading ? (
              <p style={{ fontSize: 13, color: t.muted }}>Cargando...</p>
            ) : (
              <>
                {vista === 'resumen' && (
                  <VistaResumen
                    kpis={KPIS}
                    dataZonasResumen={dataZonasResumen}
                    dataHorasResumen={dataHorasResumen}
                    dataDispositivos={dataDispositivos}
                    pctMobile={pctMobile}
                    sinDatosZonas={sinDatosZonas}
                  />
                )}

                {vista === 'escaneos' && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <input
                        placeholder="Filtrar por zona..."
                        value={filtroTexto}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                        onFocus={(e) => focusField(e, t)}
                        onBlur={(e) => blurField(e, t)}
                        style={{ ...fieldStyle(t), color: t.text, width: 220 }}
                      />
                      <select
                        value={filtroZona}
                        onChange={(e) => setFiltroZona(e.target.value)}
                        style={{ ...fieldStyle(t), color: t.text2, width: 180 }}
                      >
                        <option value="todas">Todas las zonas</option>
                        {ZONAS_VALIDAS.map((zona) => (
                          <option key={zona} value={zona}>
                            {ZONAS_LABELS[zona]}
                          </option>
                        ))}
                      </select>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: t.muted, marginLeft: 'auto' }}>
                        Mostrando {paginatedData.length} de {registrosFiltrados.length}
                      </span>
                    </div>

                    <div style={cardBaseStyle(t)}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={thBaseStyle(t)}>#</th>
                            <th style={thBaseStyle(t)}>Zona</th>
                            <th style={thBaseStyle(t)}>Fecha</th>
                            <th style={thBaseStyle(t)}>Hora</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedData.map((s, i) => (
                            <tr
                              key={s.id}
                              style={{ transition: 'background 150ms' }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = t.rowHover)}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            >
                              <td style={{ ...tdBaseStyle(t), fontFamily: MONO, color: t.muted }}>
                                {(paginaActual - 1) * POR_PAGINA + i + 1}
                              </td>
                              <td style={tdBaseStyle(t)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <span
                                    style={{
                                      width: 7,
                                      height: 7,
                                      borderRadius: '50%',
                                      background: ZONA_COLORS[s.zona],
                                      display: 'inline-block',
                                      flexShrink: 0,
                                    }}
                                  />
                                  <span style={{ color: t.text }}>{ZONAS_LABELS[s.zona]}</span>
                                </div>
                              </td>
                              <td style={{ ...tdBaseStyle(t), fontFamily: MONO, fontSize: 13, color: t.muted }}>
                                {formatFecha(s.created_at)}
                              </td>
                              <td style={{ ...tdBaseStyle(t), fontFamily: MONO, fontSize: 13, color: t.muted }}>
                                {formatHora(s.created_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: t.muted }}>
                        {paginaActual} / {totalPaginas}
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => setPagina((p) => Math.max(1, p - 1))}
                          disabled={paginaActual <= 1}
                          onMouseEnter={(e) => paginationHover(e, t, paginaActual <= 1)}
                          onMouseLeave={(e) => paginationLeave(e, t, paginaActual <= 1)}
                          style={paginationButtonStyle(t, paginaActual <= 1)}
                        >
                          ← Anterior
                        </button>
                        <button
                          type="button"
                          onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                          disabled={paginaActual >= totalPaginas}
                          onMouseEnter={(e) => paginationHover(e, t, paginaActual >= totalPaginas)}
                          onMouseLeave={(e) => paginationLeave(e, t, paginaActual >= totalPaginas)}
                          style={paginationButtonStyle(t, paginaActual >= totalPaginas)}
                        >
                          Siguiente →
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {vista === 'analisis' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div style={cardBaseStyle(t)}>
                        <div style={cardHeaderBaseStyle(t)}>
                          <p style={cardTitleBaseStyle(t)}>Resumen estadístico</p>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <tbody>
                            {METRICAS.map(({ label, valor }, i) => (
                              <tr
                                key={label}
                                style={{ borderBottom: i < METRICAS.length - 1 ? `1px solid ${t.borderdim}` : 'none' }}
                              >
                                <td style={{ padding: '10px 20px', fontSize: 13, color: t.muted }}>{label}</td>
                                <td
                                  style={{
                                    padding: '10px 20px',
                                    fontSize: 13,
                                    fontFamily: MONO,
                                    fontWeight: 500,
                                    color: t.text,
                                    textAlign: 'right',
                                  }}
                                >
                                  {valor}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div style={cardBaseStyle(t)}>
                        <div style={cardHeaderBaseStyle(t)}>
                          <p style={cardTitleBaseStyle(t)}>Conclusión del experimento</p>
                        </div>
                        <div style={{ padding: 20 }}>
                          {stats?.total > 0 ? (
                            <p style={{ fontSize: 15, color: t.text2, lineHeight: 1.75, margin: 0 }}>
                              La zona más activa es{' '}
                              <span style={{ color: t.text, fontWeight: 500 }}>
                                {ZONAS_LABELS[stats.zona_lider?.nombre] ?? stats.zona_lider?.nombre}
                              </span>{' '}
                              con{' '}
                              <span style={{ color: t.text, fontWeight: 500 }}>
                                {stats.zona_lider?.cantidad}
                              </span>{' '}
                              escaneos registrados. El{' '}
                              <span style={{ color: t.text, fontWeight: 500 }}>{pctMobile}%</span> del
                              acceso fue desde dispositivos móviles. La hora de mayor actividad fue las{' '}
                              <span style={{ color: t.text, fontWeight: 500 }}>{horaPico}</span>.
                            </p>
                          ) : (
                            <p style={{ fontSize: 13, color: t.muted, fontStyle: 'italic', margin: 0 }}>
                              Aún no hay suficientes datos para generar conclusiones. Los resultados
                              aparecerán a medida que avance el experimento.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={cardBaseStyle(t)}>
                      <div style={cardHeaderBaseStyle(t)}>
                        <p style={cardTitleBaseStyle(t)}>Escaneos vs promedio por zona</p>
                      </div>
                      <div style={{ padding: '16px 8px 8px' }}>
                        <ResponsiveContainer width="100%" height={280}>
                          <ComposedChart data={dataZonasConPromedio} margin={{ left: 8, right: 16 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} vertical={false} />
                            <XAxis dataKey="zona" tick={{ fill: t.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: t.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: `${t.barFill}0d` }} />
                            <Bar dataKey="cantidad" fill={t.barFill} fillOpacity={0.7} radius={[3, 3, 0, 0]} />
                            <Line
                              type="monotone"
                              dataKey="promedio"
                              stroke="#6366F1"
                              strokeWidth={1.5}
                              strokeDasharray="4 4"
                              dot={false}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

function VistaResumen({
  kpis,
  dataZonasResumen,
  dataHorasResumen,
  dataDispositivos,
  pctMobile,
  sinDatosZonas,
}) {
  const t = useContext(ThemeContext);

  const ZONA_COLORS = {
    centro: '#09090B',
    banco: '#374151',
    padel: '#6366F1',
    tero: '#F59E0B',
    'san-ceferino': '#EF4444',
    polideportivo: '#06B6D4',
    boulevard: '#10B981',
    clubes: '#F97316',
  };

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <SectionTitle>Métricas del experimento</SectionTitle>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: t.card,
              border: `1px solid ${t.border}`,
              borderRadius: 12,
              padding: '18px 20px',
              transition: 'box-shadow 200ms',
              cursor: 'default',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = t.cardHover)}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
          >
            <p
              style={{
                fontFamily: 'Geist Mono, monospace',
                fontSize: 11,
                color: t.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                marginBottom: 10,
                margin: '0 0 10px',
              }}
            >
              {kpi.label}
            </p>
            <p
              style={{
                fontFamily: 'Geist Mono, monospace',
                fontSize: 28,
                fontWeight: 600,
                color: t.text,
                lineHeight: 1,
                marginBottom: 4,
                margin: '0 0 4px',
              }}
            >
              {kpi.valor}
            </p>
            <p style={{ fontSize: 12, color: t.muted, margin: 0 }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <SectionTitle>Distribución</SectionTitle>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Card>
          <CardHeader>Escaneos por zona</CardHeader>
          <div style={{ padding: '16px 8px 8px' }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                layout="vertical"
                data={dataZonasResumen}
                margin={{ left: 20, right: 20, top: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} horizontal={false} />
                <XAxis type="number" tick={{ fill: t.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="zona"
                  tickFormatter={(z) => ZONAS_LABELS[z] ?? z}
                  width={120}
                  tick={{ fill: t.text2, fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: `${t.barFill}0d` }} />
                <Bar dataKey="cantidad" fill={t.barFill} fillOpacity={0.8} radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <Card>
          <CardHeader>Actividad 24hs</CardHeader>
          <div style={{ padding: '16px 8px 8px' }}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={dataHorasResumen}>
                <defs>
                  <linearGradient id="arealight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={t.areaStop} stopOpacity={0.06} />
                    <stop offset="95%" stopColor={t.areaStop} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={t.gridStroke} strokeDasharray="3 3" />
                <XAxis
                  dataKey="hora"
                  interval={5}
                  tick={{ fill: t.muted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: t.muted, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={25}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: t.areaStroke, strokeOpacity: 0.15 }} />
                <Area
                  type="monotone"
                  dataKey="cantidad"
                  stroke={t.areaStroke}
                  strokeWidth={1.5}
                  fill="url(#arealight)"
                  dot={false}
                  activeDot={{ r: 3, fill: t.areaStroke }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>Top zonas</CardHeader>
          {sinDatosZonas ? (
            <div style={{ padding: 40, textAlign: 'center', fontSize: 12, color: t.muted }}>
              Sin escaneos registrados
            </div>
          ) : (
            <div>
              {dataZonasResumen.map((z, i) => (
                <div
                  key={z.zona}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 20px',
                    borderBottom: i < dataZonasResumen.length - 1 ? `1px solid ${t.borderdim}` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: t.muted, width: 16 }}>{i + 1}</span>
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: ZONA_COLORS[z.zona],
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 13, color: t.text }}>{ZONAS_LABELS[z.zona]}</span>
                  </div>
                  <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: t.text }}>
                    {z.cantidad}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>Dispositivos</CardHeader>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, padding: 20 }}>
          <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={dataDispositivos}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {dataDispositivos.map((entry, i) => (
                    <Cell key={entry.name} fill={t.donutColors[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <p style={{ fontFamily: MONO, fontSize: 20, fontWeight: 700, color: t.text, lineHeight: 1, margin: 0 }}>
                {pctMobile}%
              </p>
              <p style={{ fontSize: 10, color: t.muted, marginTop: 3, margin: '3px 0 0' }}>móvil</p>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            {dataDispositivos.map((d, i) => (
              <div
                key={d.name}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.donutColors[i] }} />
                  <span style={{ fontSize: 13, color: t.text2 }}>{d.name}</span>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: t.text }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </>
  );
}
