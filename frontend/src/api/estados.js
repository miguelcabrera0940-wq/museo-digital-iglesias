// Catálogo fijo del contrato (no hay endpoint de estados). El orden es el de la API.
export const ESTADOS = [
  { clave: 'yucatan', nombre: 'Yucatán' },
  { clave: 'campeche', nombre: 'Campeche' },
  { clave: 'puebla', nombre: 'Puebla' },
];
export const ESTADO_INICIAL = 'yucatan';
export const nombreEstado = (clave) => ESTADOS.find((e) => e.clave === clave)?.nombre ?? clave;
