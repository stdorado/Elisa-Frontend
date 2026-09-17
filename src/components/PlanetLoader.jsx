import { useEffect } from 'react';
import styles from './PlanetLoader.module.css';

const LOADER_DURATION_MS = 3000;

export default function PlanetLoader({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), LOADER_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={styles.wrapper}>
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

          {/* Continentes — grupo animado con translateX en loop */}
          <g clipPath="url(#globe-clip)" className={styles.continents}>
            <ellipse cx="45" cy="72" rx="12" ry="18" fill="#4a9e3f" opacity="0.9" />
            <ellipse cx="38" cy="48" rx="14" ry="13" fill="#5ab04e" opacity="0.85" />
            <ellipse cx="72" cy="52" rx="10" ry="8" fill="#5ab04e" opacity="0.9" />
            <ellipse cx="75" cy="70" rx="9" ry="14" fill="#4a9e3f" opacity="0.85" />
            <ellipse cx="95" cy="45" rx="16" ry="12" fill="#5ab04e" opacity="0.8" />
            <ellipse cx="98" cy="72" rx="9" ry="7" fill="#4a9e3f" opacity="0.8" />

            {/* Copia desplazada 104px para que el loop del slide no deje un hueco */}
            <g transform="translate(104, 0)">
              <ellipse cx="45" cy="72" rx="12" ry="18" fill="#4a9e3f" opacity="0.9" />
              <ellipse cx="38" cy="48" rx="14" ry="13" fill="#5ab04e" opacity="0.85" />
              <ellipse cx="72" cy="52" rx="10" ry="8" fill="#5ab04e" opacity="0.9" />
              <ellipse cx="75" cy="70" rx="9" ry="14" fill="#4a9e3f" opacity="0.85" />
              <ellipse cx="95" cy="45" rx="16" ry="12" fill="#5ab04e" opacity="0.8" />
              <ellipse cx="98" cy="72" rx="9" ry="7" fill="#4a9e3f" opacity="0.8" />
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
