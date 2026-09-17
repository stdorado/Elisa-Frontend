import { useEffect, useRef, useState } from 'react';
import styles from './PlanetLoader.module.css';

const LOADER_DURATION_MS = 3000;

const CONTINENTS = [
  { cx: 45, cy: 72, rx: 12, ry: 18, fill: '#4a9e3f', opacity: 0.9 },
  { cx: 38, cy: 48, rx: 14, ry: 13, fill: '#5ab04e', opacity: 0.85 },
  { cx: 72, cy: 52, rx: 10, ry: 8, fill: '#5ab04e', opacity: 0.9 },
  { cx: 75, cy: 70, rx: 9, ry: 14, fill: '#4a9e3f', opacity: 0.85 },
  { cx: 95, cy: 45, rx: 16, ry: 12, fill: '#5ab04e', opacity: 0.8 },
  { cx: 98, cy: 72, rx: 9, ry: 7, fill: '#4a9e3f', opacity: 0.8 },
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
        <svg width="120" height="120" viewBox="0 0 120 120">
          <defs>
            <clipPath id="globe-clip">
              <circle cx="60" cy="60" r="52" />
            </clipPath>
            <radialGradient id="ocean" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#5bb8f5" />
              <stop offset="100%" stopColor="#1a6fa8" />
            </radialGradient>
            <radialGradient id="glow" cx="50%" cy="50%">
              <stop offset="70%" stopColor="transparent" />
              <stop offset="100%" stopColor="#4488ff" stopOpacity="0.3" />
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

          {/* Brillo superior izquierdo */}
          <ellipse cx="42" cy="38" rx="18" ry="12" fill="white" opacity="0.12" />

          {/* Atmósfera glow */}
          <circle cx="60" cy="60" r="52" fill="url(#glow)" />

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
