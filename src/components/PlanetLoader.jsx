import { useEffect, useRef, useState } from 'react';
import { loadScript } from '../utils/loadExternalAsset.js';
import styles from './PlanetLoader.module.css';

const THREE_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const THREE_SRI =
  'sha512-dLxUelApnYxpLt6K2iomGngnHO83iUvZytA3YjDUCjT0HDOHKXnVYdf3hU4JjM8uEhxf9nD1/ey98U3t2vZ0qQ==';

const LEZAMA_LAT = -35.82;
const LEZAMA_LON = -57.93;

const PHASE1_MS = 2000;
const PHASE2_MS = 1500;
const FLASH_IN_MS = 80;
const TOTAL_MS = PHASE1_MS + PHASE2_MS + 500; // ~4000ms

const BG_START = 0x000008;
const BG_END = 0x0a0a12;

function easeInQuart(t) {
  return t * t * t * t;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Conversión lat/long -> posición local sobre la esfera (sin aplicar la
// rotación del grupo, que se suma en tiempo de ejecución vía globeGroup).
function latLonToLocal(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (-lon - 90) * (Math.PI / 180);
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

function createEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1a4a7a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  function blob(cx, cy, rx, ry, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function landmass(cx, cy, baseRx, baseRy, color, seed) {
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < 10; i++) {
      const ox = (rand() - 0.5) * baseRx * 1.4;
      const oy = (rand() - 0.5) * baseRy * 1.4;
      const rx = baseRx * (0.35 + rand() * 0.5);
      const ry = baseRy * (0.35 + rand() * 0.5);
      blob(cx + ox, cy + oy, rx, ry, color, 0.85 + rand() * 0.15);
    }
  }

  // Masas de tierra aproximadas (proyección equirectangular 1024x512)
  landmass(300, 330, 70, 110, '#2d5a27', 11); // América del Sur
  landmass(260, 170, 90, 80, '#2d5a27', 23); // América del Norte
  landmass(560, 260, 90, 150, '#4a6741', 37); // Europa / África
  landmass(720, 190, 140, 110, '#4a6741', 51); // Asia
  landmass(860, 380, 60, 45, '#4a6741', 67); // Oceanía

  // Nubes: manchas difusas semitransparentes
  let cs = 99;
  const crand = () => {
    cs = (cs * 9301 + 49297) % 233280;
    return cs / 233280;
  };
  for (let i = 0; i < 40; i++) {
    const cx = crand() * canvas.width;
    const cy = crand() * canvas.height * 0.85 + canvas.height * 0.05;
    const rx = 30 + crand() * 60;
    const ry = 12 + crand() * 20;
    blob(cx, cy, rx, ry, '#ffffff', 0.08 + crand() * 0.1);
  }

  return canvas;
}

function initScene(THREE, canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(BG_START, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 6);

  // Estrellas
  const starCount = 2000;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 100;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.06 });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  const earthCanvas = createEarthTexture();
  const earthTexture = new THREE.CanvasTexture(earthCanvas);
  earthTexture.needsUpdate = true;

  const earthGeometry = new THREE.SphereGeometry(2.2, 64, 64);
  const earthMaterial = new THREE.MeshPhongMaterial({ map: earthTexture, shininess: 8 });
  const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  globeGroup.add(earthMesh);

  const atmosphereGeometry = new THREE.SphereGeometry(2.34, 64, 64);
  const atmosphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  });
  const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  globeGroup.add(atmosphereMesh);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1);
  sunLight.position.set(5, 2, 5);
  scene.add(sunLight);
  scene.add(new THREE.AmbientLight(0x404050, 1.2));

  // Pin de Lezama — hijo del globo, rota junto con él
  const pinLocal = latLonToLocal(LEZAMA_LAT, LEZAMA_LON, 2.2);

  const pinLight = new THREE.PointLight(0xffaa55, 0, 1.5);
  pinLight.position.set(pinLocal.x, pinLocal.y, pinLocal.z);
  globeGroup.add(pinLight);

  const pinGeometry = new THREE.SphereGeometry(0.025, 12, 12);
  const pinMaterial = new THREE.MeshBasicMaterial({
    color: 0xffcc88,
    transparent: true,
    opacity: 0,
  });
  const pinMesh = new THREE.Mesh(pinGeometry, pinMaterial);
  pinMesh.position.set(pinLocal.x * 1.02, pinLocal.y * 1.02, pinLocal.z * 1.02);
  globeGroup.add(pinMesh);

  // Ángulo de rotación Y que trae el pin a mirar de frente a la cámara (+Z)
  const targetOrientationY = Math.atan2(-pinLocal.x, pinLocal.z);

  const disposables = [
    starGeometry,
    starMaterial,
    earthGeometry,
    earthMaterial,
    earthTexture,
    atmosphereGeometry,
    atmosphereMaterial,
    pinGeometry,
    pinMaterial,
  ];

  return {
    renderer,
    scene,
    camera,
    globeGroup,
    pinLight,
    pinMaterial,
    pinMesh,
    targetOrientationY,
    disposables,
  };
}

export default function PlanetLoader({ onComplete }) {
  const canvasRef = useRef(null);
  const [flashPhase, setFlashPhase] = useState('none'); // 'none' | 'in' | 'out'
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timers = [];
    let cleanupScene = null;

    const finish = () => {
      if (cancelled) return;
      onComplete?.();
    };

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setFallback(true);
      timers.push(setTimeout(finish, 900));
      return () => {
        cancelled = true;
        timers.forEach(clearTimeout);
      };
    }

    timers.push(setTimeout(() => !cancelled && setFlashPhase('in'), PHASE1_MS + PHASE2_MS));
    timers.push(
      setTimeout(
        () => !cancelled && setFlashPhase('out'),
        PHASE1_MS + PHASE2_MS + FLASH_IN_MS
      )
    );
    timers.push(setTimeout(finish, TOTAL_MS));

    loadScript(THREE_SRC, THREE_SRI)
      .then(() => {
        if (cancelled || !canvasRef.current || !window.THREE) return;
        const THREE = window.THREE;
        const {
          renderer,
          scene,
          camera,
          globeGroup,
          pinLight,
          pinMaterial,
          pinMesh,
          targetOrientationY,
          disposables,
        } = initScene(THREE, canvasRef.current);

        const startTime = performance.now();
        let animationId = null;
        let zoomStart = null;
        const bgColorStart = new THREE.Color(BG_START);
        const bgColorEnd = new THREE.Color(BG_END);
        const bgColorNow = new THREE.Color();

        const handleResize = () => {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        function animate(now) {
          animationId = requestAnimationFrame(animate);
          const elapsed = now - startTime;

          if (elapsed <= PHASE1_MS) {
            globeGroup.rotation.y += 0.003;
          } else if (elapsed <= PHASE1_MS + PHASE2_MS) {
            if (!zoomStart) {
              zoomStart = {
                rotationY: globeGroup.rotation.y,
                // Camino más corto hasta la orientación objetivo + una vuelta
                // extra completa para el efecto de "gira rápido".
                targetRotationY:
                  globeGroup.rotation.y +
                  (((targetOrientationY - globeGroup.rotation.y + Math.PI) %
                    (2 * Math.PI)) -
                    Math.PI) +
                  Math.PI * 2,
              };
            }

            const zt = Math.min(1, (elapsed - PHASE1_MS) / PHASE2_MS);

            camera.position.z = lerp(6, 0.5, easeInQuart(zt));
            globeGroup.rotation.y = lerp(
              zoomStart.rotationY,
              zoomStart.targetRotationY,
              easeOutCubic(zt)
            );

            bgColorNow.copy(bgColorStart).lerp(bgColorEnd, zt);
            renderer.setClearColor(bgColorNow, 1);

            const pinT = smoothstep(0.4, 1, zt);
            const pulse = 1 + Math.sin(elapsed * 0.02) * 0.35 * pinT;
            pinMaterial.opacity = pinT;
            pinLight.intensity = pinT * (1.4 + Math.sin(elapsed * 0.02) * 0.6);
            pinMesh.scale.setScalar(pulse);
          } else {
            const pulse = 1 + Math.sin(elapsed * 0.02) * 0.35;
            pinLight.intensity = 1.4 + Math.sin(elapsed * 0.02) * 0.6;
            pinMesh.scale.setScalar(pulse);
          }

          renderer.render(scene, camera);
        }

        animationId = requestAnimationFrame(animate);

        cleanupScene = () => {
          if (animationId) cancelAnimationFrame(animationId);
          window.removeEventListener('resize', handleResize);
          disposables.forEach((d) => d.dispose?.());
          renderer.dispose();
          renderer.forceContextLoss?.();
        };
      })
      .catch(() => {
        if (!cancelled) {
          setFallback(true);
        }
      });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      cleanupScene?.();
    };
  }, [onComplete]);

  if (fallback) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.fallback}>
          <div className={styles.fallbackDot} />
          <p className={styles.eyebrow}>PROYECTO ELISA</p>
          <p className={styles.location}>Lezama, Buenos Aires</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.overlay}>
        <p className={styles.eyebrow}>PROYECTO ELISA</p>
        <p className={styles.location}>Lezama, Buenos Aires</p>
      </div>

      <div
        className={`${styles.flash} ${flashPhase === 'in' ? styles.flashVisible : ''} ${
          flashPhase === 'out' ? styles.flashFadeOut : ''
        }`}
      />
    </div>
  );
}
