import { useEffect, useMemo, useState } from 'react';
import styles from './ScanLoader.module.css';

const TYPEWRITER_TEXT = 'PROCESANDO ESCANEO...';
const GRID_SIZE = 7;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;
const PARTICLE_COUNT = 8;
const ORBIT_DURATION_MS = 3000;

export default function ScanLoader({ fadingOut = false }) {
  const [typedChars, setTypedChars] = useState(0);
  const [showBottomText, setShowBottomText] = useState(false);

  const cellDelays = useMemo(
    () => Array.from({ length: CELL_COUNT }, () => Math.random() * 2000),
    []
  );
  const particleDelays = useMemo(
    () =>
      Array.from(
        { length: PARTICLE_COUNT },
        (_, i) => -(i * (ORBIT_DURATION_MS / PARTICLE_COUNT))
      ),
    []
  );

  useEffect(() => {
    const id = setInterval(() => {
      setTypedChars((n) => (n < TYPEWRITER_TEXT.length ? n + 1 : n));
    }, 60);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowBottomText(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`${styles.wrapper} ${fadingOut ? styles.fadingOut : ''}`}>
      <p className={styles.typewriter}>{TYPEWRITER_TEXT.slice(0, typedChars)}</p>

      <div className={styles.qrStage}>
        <div className={styles.particlesRing}>
          {particleDelays.map((delay, i) => (
            <div key={i} className={styles.particle} style={{ animationDelay: `${delay}ms` }}>
              <div className={styles.particleDot} />
            </div>
          ))}
        </div>

        <div className={styles.qrBox}>
          <div className={styles.qrGrid}>
            {cellDelays.map((delay, i) => (
              <div key={i} className={styles.cell} style={{ animationDelay: `${delay}ms` }} />
            ))}
          </div>
          <div className={styles.scanLine} />
        </div>
      </div>

      {showBottomText && (
        <div className={styles.bottomText}>
          <p className={styles.titleEs}>Bienvenido a ELISA</p>
          <p className={styles.titleEn}>Welcome to ELISA</p>
        </div>
      )}
    </div>
  );
}
