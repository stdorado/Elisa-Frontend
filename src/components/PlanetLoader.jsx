import { useEffect, useRef, useState } from 'react';
import styles from './PlanetLoader.module.css';

const LOADER_DURATION_MS = 3000;

const CONTINENTS = [
  { cx: 45, cy: 72, rx: 13, ry: 19, fill: '#27ae60', opacity: 0.95 }, // América del Sur
  { cx: 37, cy: 47, rx: 15, ry: 14, fill: '#2ecc71', opacity: 0.9 }, // América del Norte
  { cx: 70, cy: 48, rx: 9, ry: 7, fill: '#2ecc71', opacity: 0.95 }, // Europa
  { cx: 74, cy: 67, rx: 10, ry: 15, fill: '#27ae60', opacity: 0.9 }, // África
  { cx: 94, cy: 43, rx: 18, ry: 13, fill: '#2ecc71', opacity: 0.85 }, // Asia
  { cx: 99, cy: 73, rx: 10, ry: 8, fill: '#27ae60', opacity: 0.85 }, // Australia
];

function ContinentShapes() {
  return (
    <>
      {CONTINENTS.map((c, i) => (
        <ellipse key={i} cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill={c.fill} opacity={c.opacity} />
      ))}
    </>
  );
}

// Ambiente espacial sutil: ruido filtrado + tono grave + dos "pings" de sonar.
// Requiere un gesto del usuario (mobile bloquea AudioContext sin interacción).
function iniciarSonidoEspacial() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  const ctx = new AudioCtx();

  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.03;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;

  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 1);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();

  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 55;
  const oscGain = ctx.createGain();
  oscGain.gain.value = 0.05;
  osc.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start();

  let pingCount = 0;
  const pingInterval = setInterval(() => {
    if (pingCount >= 2) {
      clearInterval(pingInterval);
      return;
    }
    const ping = ctx.createOscillator();
    const pingGain = ctx.createGain();
    ping.type = 'sine';
    ping.frequency.value = 880;
    pingGain.gain.value = 0.08;
    pingGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    ping.connect(pingGain);
    pingGain.connect(ctx.destination);
    ping.start();
    ping.stop(ctx.currentTime + 0.8);
    pingCount++;
  }, 1500);

  return () => {
    clearInterval(pingInterval);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    setTimeout(() => {
      try {
        noise.stop();
        osc.stop();
        ctx.close();
      } catch {
        // el contexto ya pudo haberse cerrado
      }
    }, 300);
  };
}

export default function PlanetLoader({ onComplete }) {
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const stopAudioRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), LOADER_DURATION_MS);
    return () => {
      clearTimeout(timer);
      stopAudioRef.current?.();
      stopAudioRef.current = null;
    };
  }, [onComplete]);

  const handleUnlock = () => {
    if (audioUnlocked) return;
    setAudioUnlocked(true);
    try {
      stopAudioRef.current = iniciarSonidoEspacial();
    } catch {
      stopAudioRef.current = null;
    }
  };

  return (
    <div className={styles.wrapper}>
      {!audioUnlocked && (
        <div
          className={styles.audioUnlock}
          aria-hidden="true"
          onClick={handleUnlock}
          onTouchStart={handleUnlock}
        />
      )}

      <div className={styles.globeWrapper}>
        <svg width="160" height="160" viewBox="0 0 120 120">
          <defs>
            <clipPath id="globe-clip">
              <circle cx="60" cy="60" r="52" />
            </clipPath>
            <radialGradient id="ocean" cx="38%" cy="32%">
              <stop offset="0%" stopColor="#7ec8e3" />
              <stop offset="50%" stopColor="#2980b9" />
              <stop offset="100%" stopColor="#1a5276" />
            </radialGradient>
            <radialGradient id="atmos" cx="50%" cy="50%">
              <stop offset="75%" stopColor="transparent" />
              <stop offset="90%" stopColor="#4488ff" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#88bbff" stopOpacity="0.4" />
            </radialGradient>
          </defs>

          {/* Océano base */}
          <circle cx="60" cy="60" r="52" fill="url(#ocean)" />

          {/* Ojo de buey fijo — el clip NO se anima, solo el contenido de adentro */}
          <g clipPath="url(#globe-clip)">
            <g className={styles.land}>
              <ContinentShapes />
            </g>
            {/* Wrapper estático desplazado 104px (offset fijo por atributo,
                no CSS, para que no choque con la animación del hijo) */}
            <g transform="translate(104, 0)">
              <g className={styles.land}>
                <ContinentShapes />
              </g>
            </g>
          </g>

          {/* Brillo principal */}
          <ellipse cx="44" cy="36" rx="22" ry="14" fill="white" opacity="0.18" />
          {/* Brillo secundario pequeño */}
          <ellipse cx="72" cy="30" rx="8" ry="5" fill="white" opacity="0.1" />

          {/* Atmósfera */}
          <circle cx="60" cy="60" r="54" fill="url(#atmos)" />

          {/* Borde del planeta */}
          <circle cx="60" cy="60" r="52" fill="none" stroke="#4488ff" strokeWidth="0.5" opacity="0.4" />
        </svg>
      </div>

      <div className={styles.textBlock}>
        <p className={styles.eyebrow}>PROYECTO ELISA</p>
        <p className={styles.location}>Lezama, Buenos Aires</p>
      </div>
    </div>
  );
}
