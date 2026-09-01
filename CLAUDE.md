# ELISA — Frontend · Contexto para Claude Code

## Qué es este proyecto

**ELISA** (Experimento Lezama de Ingeniería Social Aplicada) es una aplicación web de investigación en ciberseguridad. Esta carpeta contiene **exclusivamente el frontend** — React + Vite.

**Responsable:** Santino Tomás Dorado — desarrollador e investigador independiente, Lezama, Buenos Aires.
**Marco legal:** Ley 25.326, Art. 28 — investigación científica con datos disociados.

---

## Antes de cualquier tarea → leer AGENT_FRONTEND.md

Ese archivo tiene todo: sistema de diseño, reglas de seguridad, endpoints, convenciones de código y restricciones. No empezar a editar sin haberlo leído.

```bash
cat AGENT_FRONTEND.md
```

---

## Estructura de esta carpeta

```
Front/
├── CLAUDE.md
├── AGENT_FRONTEND.md
├── .claude/
│   └── settings.json
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── utils/
    │   └── zonas.js          ← lista blanca — CRÍTICO
    ├── components/
    │   └── ProtectedRoute.jsx
    └── pages/
        ├── Landing.jsx + Landing.module.css
        ├── Login.jsx   + Login.module.css
        ├── Admin.jsx   + Admin.module.css
        └── NotFound.jsx
```

---

## Reglas globales

- **Nunca** `dangerouslySetInnerHTML`
- **Nunca** secrets en variables `VITE_` que no sean públicas
- **Nunca** `localStorage` para tokens — solo `sessionStorage`
- **Siempre** validar `?zona=` con `validarZona()` de `utils/zonas.js`
- **Nunca** tocar nada de la carpeta `Back/`

---

## Zonas válidas

```
centro · banco · padel · tero · san-ceferino · polideportivo · boulevard · clubes
```

Si cambian, avisar — hay que sincronizar con el backend.

---

## Comandos

```bash
npm install
npm run dev      # http://localhost:5173/?zona=centro
npm run build
npm audit
```

---

## Estado actual

| Archivo | Estado |
|---|---|
| Landing.jsx + CSS | ✅ Completo |
| Login.jsx + CSS | ✅ Completo |
| Admin.jsx + CSS | ✅ Completo |
| ProtectedRoute.jsx | ✅ Completo |
| zonas.js | ✅ Completo |
| App.jsx, main.jsx, index.css | ✅ Completo |
| NotFound.jsx | ⏳ Pendiente |
| .env.example | ⏳ Pendiente |
| .gitignore | ⏳ Pendiente |
| README.md | ⏳ Pendiente |