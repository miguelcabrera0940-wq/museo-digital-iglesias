// Armado de cuerpos según el contrato: PATCH parcial y no vacío; opcional vacío → null; POST omite opcionales vacíos.
const aNulo = (t) => (t.trim() === '' ? null : t.trim());
const normal = (valor, nulable) => (typeof valor !== 'string' ? valor : nulable ? aNulo(valor) : valor.trim());

export function diferencias(original, actual, nulables = []) {
  const cambios = {};
  for (const [k, v] of Object.entries(actual)) {
    const nuevo = normal(v, nulables.includes(k));
    if (JSON.stringify(nuevo) !== JSON.stringify(original[k] ?? null)) cambios[k] = nuevo;
  }
  return cambios;
}

export function paraCrear(valores, opcionales = []) {
  const cuerpo = {};
  for (const [k, v] of Object.entries(valores)) {
    const nuevo = normal(v, opcionales.includes(k));
    if (nuevo !== null) cuerpo[k] = nuevo;
  }
  return cuerpo;
}

export const lineas = (texto) => texto.split('\n').map((l) => l.trim()).filter(Boolean);
