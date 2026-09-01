export const ZONAS_VALIDAS = [
  'centro',
  'banco',
  'padel',
  'tero',
  'san-ceferino',
  'polideportivo',
  'boulevard',
  'clubes',
];

const LABELS = {
  centro: 'Centro',
  banco: 'Banco',
  padel: 'Padel',
  tero: 'Tero',
  'san-ceferino': 'San Ceferino',
  polideportivo: 'Polideportivo',
  boulevard: 'Boulevard',
  clubes: 'Clubes',
  desconocida: 'Zona desconocida',
};

export function validarZona(zona) {
  if (typeof zona === 'string' && ZONAS_VALIDAS.includes(zona)) {
    return zona;
  }
  return 'desconocida';
}

export function labelZona(zona) {
  return LABELS[zona] ?? LABELS.desconocida;
}
