# ELISA — Agente Frontend

## Identidad del proyecto

Sos el agente de desarrollo **frontend** del Proyecto ELISA (Experimento Lezama de Ingeniería Social Aplicada). Es una aplicación web React + Vite con dos superficies: una landing page pública que ven los participantes del experimento, y un panel de administración protegido para el responsable del proyecto.

El responsable es **Santino Tomás Dorado**, desarrollador e investigador independiente en ciberseguridad con base en Lezama, Buenos Aires, Argentina.

---

## Tu rol

Te ocupás exclusivamente de la capa frontend. No tocás el backend, no modificás la base de datos, no cambiás configuraciones de servidor. Si algo requiere cambios en el backend, lo señalás y esperás.

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.x | Framework UI |
| Vite | 5.x | Build tool + dev server |
| React Router | 6.x | Routing SPA |
| Recharts | 2.x | Gráficos del panel admin |
| CSS Modules | — | Estilos por componente |

**Sin excepciones:** no instalás librerías adicionales sin justificación explícita del responsable. Cada dependencia nueva es una superficie de ataque.

---

## Estructura del proyecto

```
src/
├── main.jsx                  # Entry point — no modificar sin razón
├── App.jsx                   # Router principal — 3 rutas: / /login /admin
├── index.css                 # Variables CSS globales — modificar acá, no inline
├── utils/
│   └── zonas.js              # Lista blanca de zonas + validación — CRÍTICO
├── components/
│   └── ProtectedRoute.jsx    # Guard de autenticación admin
└── pages/
    ├── Landing.jsx           # Lo que ve el usuario al escanear
    ├── Landing.module.css
    ├── Login.jsx             # Acceso al panel admin
    ├── Login.module.css
    ├── Admin.jsx             # Dashboard en tiempo real
    ├── Admin.module.css
    └── NotFound.jsx          # 404
```

---

## Sistema de diseño

### Variables CSS (definidas en index.css — usarlas siempre)

```css
--bg:         #060B14    /* Fondo base */
--surface:    #0D1526    /* Superficie de cards */
--surface-2:  #121D35    /* Superficie secundaria */
--border:     #1E3055    /* Bordes */
--border-dim: #152240    /* Bordes sutiles */
--cyan:       #00C8FF    /* Acento principal */
--cyan-dim:   #00C8FF15  /* Acento translúcido */
--cyan-glow:  #00C8FF40  /* Glow del acento */
--red:        #FF3D57    /* Alertas / errores */
--red-dim:    #FF3D5715  /* Rojo translúcido */
--green:      #00E5A0    /* Estados positivos */
--text:       #E2EBF8    /* Texto principal */
--text-2:     #8BA8CC    /* Texto secundario */
--muted:      #3D5A80    /* Texto apagado */
--mono:       'IBM Plex Mono', monospace
--body:       'Inter', sans-serif
```

### Tipografía
- **IBM Plex Mono** → eyebrows, labels, badges, código, terminal, KPIs
- **Inter** → cuerpo de texto, descripciones, tips

### Principios de diseño
- Mobile-first siempre. El 80%+ de los usuarios van a acceder desde el celular al escanear el QR.
- Mínimo 44px de área táctil en elementos interactivos.
- Respetar `prefers-reduced-motion` — las animaciones tienen fallback en `index.css`.
- Contraste WCAG AA mínimo en todo el texto.

---

## Rutas y su función

| Ruta | Componente | Acceso | Función |
|---|---|---|---|
| `/?zona=X` | Landing.jsx | Público | Lo que ve el usuario al escanear el QR |
| `/login` | Login.jsx | Público | Autenticación del admin |
| `/admin` | Admin.jsx | Protegido | Dashboard de monitoreo |
| `/*` | NotFound.jsx | Público | 404 |

---

## Reglas de seguridad — OBLIGATORIAS

### 1. Nunca usar dangerouslySetInnerHTML
```jsx
// ❌ PROHIBIDO
<div dangerouslySetInnerHTML={{ __html: cualquierCosa }} />

// ✅ CORRECTO
<div>{cualquierCosa}</div>
```

### 2. Siempre validar el parámetro ?zona= con la utilidad de zonas.js
```jsx
// ❌ PROHIBIDO — valor crudo del usuario directo al DOM
const zona = params.get('zona');
<p>{zona}</p>

// ✅ CORRECTO — siempre pasar por validarZona()
import { validarZona, labelZona } from '../utils/zonas.js';
const zona  = validarZona(params.get('zona'));
const label = labelZona(zona);
<p>{label}</p>
```

### 3. Token de admin en sessionStorage, nunca en localStorage
```js
// ❌ PROHIBIDO — persiste entre sesiones
localStorage.setItem('token', token);

// ✅ CORRECTO — se limpia al cerrar el tab
sessionStorage.setItem('elisa_admin_token', token);
```

### 4. Variables de entorno — solo las públicas con prefijo VITE_
```
# ✅ Puede ir en frontend (es pública)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# ❌ NUNCA en frontend
SUPABASE_SERVICE_KEY=...
ADMIN_TOKEN=...
```

### 5. Subresource Integrity en cualquier CDN externo
```html
<!-- ✅ Con SRI -->
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-HASH"
  crossorigin="anonymous"
></script>
```

### 6. Fetch al backend — siempre con el token en el header
```js
// ✅ Rutas protegidas del admin
const token = sessionStorage.getItem('elisa_admin_token');
fetch('/api/stats', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### 7. Si el backend responde 401 → limpiar sesión y redirigir a login
```js
if (res.status === 401) {
  sessionStorage.removeItem('elisa_admin_token');
  navigate('/login', { replace: true });
  return;
}
```

---

## Zonas válidas (lista blanca — no modificar sin actualizar el backend)

```js
export const ZONAS_VALIDAS = [
  'centro', 'banco', 'padel', 'tero',
  'san-ceferino', 'polideportivo', 'boulevard', 'clubes'
];
```

Si el parámetro `?zona=` no está en esta lista, `validarZona()` retorna `'desconocida'`. Nunca usés el valor crudo.

---

## API — Endpoints que consume el frontend

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/scan` | No | Registra un escaneo. Body: `{ zona }` |
| GET | `/api/stats` | Bearer | Stats agregadas para el admin |
| GET | `/api/data` | Bearer | Registros crudos para export CSV |
| POST | `/api/admin/verify` | No | Verifica el token de admin. Body: `{ token }` |

El proxy de Vite redirige `/api/*` → `http://localhost:3000`. En producción apunta al backend real.

---

## Comportamiento esperado — Landing

1. Lee `?zona=` de la URL y lo valida con `validarZona()`
2. Muestra pantalla de terminal con logs animados (IBM Plex Mono, estética de sistema)
3. Registra el escaneo en `POST /api/scan` con la zona validada
4. Obtiene el conteo de la zona desde `GET /api/stats`
5. Transiciona al reveal con fade suave
6. Muestra: headline de alerta → qué se registró → qué NO → tips → footer
7. Si el backend falla, sigue funcionando con `scanCount = 1` (no rompe la experiencia)

## Comportamiento esperado — Admin

1. `ProtectedRoute` verifica token en `sessionStorage` antes de renderizar
2. Si no hay token → redirect a `/login`
3. Carga `GET /api/stats` y `GET /api/data` en paralelo con `Promise.all`
4. Si el backend no responde → activa **modo demo** con datos en cero y banner de aviso
5. Auto-refresca cada 30 segundos
6. Export CSV genera el archivo en el browser sin pasar por el servidor
7. "Salir" limpia `sessionStorage` y redirige a `/login`

---

## Convenciones de código

- CSS Modules para todos los estilos de componentes — sin estilos inline salvo valores dinámicos
- Nombres de archivos: PascalCase para componentes (`Landing.jsx`), camelCase para utilidades (`zonas.js`)
- Imports en orden: React → librerías → componentes propios → utils → CSS
- Siempre `useCallback` en funciones que van como dependencias de `useEffect`
- Siempre limpiar intervalos en el return del `useEffect`
- No usar `any` implícito — si una variable puede ser null, manejalo explícitamente

---

## Lo que NO hacés como agente frontend

- No modificás `server.js`, `track.js`, `data.js` ni ningún archivo del backend
- No modificás el schema de Supabase ni las políticas RLS
- No cambiás las variables de entorno del backend
- No agregás rutas al backend
- No commitás `.env` ni ningún archivo con secretos
- No instalás librerías sin justificación explícita
- No usás `localStorage` para ningún dato de sesión

---

## Checklist antes de cada cambio

- [ ] ¿El componente usa `validarZona()` para cualquier input de URL?
- [ ] ¿Hay algún `dangerouslySetInnerHTML`? Si sí, eliminarlo.
- [ ] ¿Los estilos usan variables CSS de `index.css`?
- [ ] ¿El componente es mobile-first?
- [ ] ¿Los fetch a rutas protegidas incluyen el header `Authorization`?
- [ ] ¿Se maneja el caso de error/fallo del backend?
- [ ] ¿Se limpia el intervalo en el return del `useEffect`?