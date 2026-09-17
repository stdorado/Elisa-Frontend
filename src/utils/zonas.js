export const ZONAS_VALIDAS = [
  'centro',
  'banco',
  'tero',
  'san-ceferino',
  'boulevard',
];

const LABELS = {
  centro: 'El Centro',
  banco: 'Municipio / Banco',
  tero: 'Barrio El Tero',
  'san-ceferino': 'Barrio San Ceferino',
  boulevard: 'El Boulevard',
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
