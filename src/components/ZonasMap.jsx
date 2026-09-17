import { useEffect, useRef, useState } from 'react';
import { loadScript, loadStyle } from '../utils/loadExternalAsset.js';
import styles from './ZonasMap.module.css';

const LEAFLET_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
const LEAFLET_CSS_SRI =
  'sha512-h9FcoyWjHcOcmEVkxOfTLnmZFWIH0iZhZT1H2TbOq55xssQGEJHEaIm+PgoUaZbRvQTNTluNOEfb1ZRy6D3BOw==';
const LEAFLET_JS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
const LEAFLET_JS_SRI =
  'sha512-puJW3E/qXDqYp9IfhAI54BJEaWIfloJ7JWs7OeD5i6ruC9JZL1gERT1wjtwXFlh7CjE7ZJ+/vcRZRkIYIb6p4g==';

const LEZAMA_CENTER = [-35.8203, -57.9301];

const ZONAS_MAP = [
  { id: 'centro', label: 'El Centro', coords: [-35.8203, -57.9301] },
  { id: 'banco', label: 'Municipio / Banco', coords: [-35.8196, -57.9318] },
  { id: 'tero', label: 'Barrio El Tero', coords: [-35.8235, -57.9275] },
  { id: 'san-ceferino', label: 'Barrio San Ceferino', coords: [-35.8168, -57.9342] },
  { id: 'boulevard', label: 'El Boulevard', coords: [-35.8220, -57.9290] },
];

const DEFAULT_COLOR = '#09090B';
const ACTIVE_COLOR = '#EF4444';

function buildIcon(L, color, active) {
  const size = active ? 24 : 16;
  const half = size / 2;
  return L.divIcon({
    html: `<div class="${active ? 'elisaPinActive' : 'elisaPin'}" style="
      width: ${size}px; height: ${size}px;
      background: ${color};
      border: 2px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 0 0 2px ${color}, 0 1px 5px rgba(0, 0, 0, 0.5);
    "></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [half, half],
  });
}

export default function ZonasMap({ zona }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    let cancelled = false;

    loadStyle(LEAFLET_CSS, LEAFLET_CSS_SRI)
      .then(() => loadScript(LEAFLET_JS, LEAFLET_JS_SRI))
      .then(() => {
        if (cancelled || !containerRef.current || !window.L) return;
        const L = window.L;

        const map = L.map(containerRef.current, {
          center: LEZAMA_CENTER,
          zoom: 14,
          scrollWheelZoom: false,
        });
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);

        let activeMarker = null;
        ZONAS_MAP.forEach((z) => {
          const isActive = z.id === zona;
          const color = isActive ? ACTIVE_COLOR : DEFAULT_COLOR;
          const marker = L.marker(z.coords, { icon: buildIcon(L, color, isActive) })
            .bindPopup(`<b style="font-family:Arial">${z.label}</b>`)
            .addTo(map);
          if (isActive) activeMarker = marker;
        });

        if (activeMarker) activeMarker.openPopup();

        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [zona]);

  return (
    <div className={styles.mapWrapper}>
      <div ref={containerRef} className={styles.map} />
      {status === 'loading' && <p className={styles.status}>Cargando mapa…</p>}
      {status === 'error' && <p className={styles.status}>No se pudo cargar el mapa.</p>}
    </div>
  );
}
