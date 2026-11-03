// Ayudas del selector de PDF SIMULADO: solo leen nombre, tipo y tamaño que ya expone el File. Nunca leen bytes.
export const esPdf = (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name);

export function formatoTamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const [valor, unidad] = bytes < 1024 ** 2 ? [bytes / 1024, 'KB'] : [bytes / 1024 ** 2, 'MB'];
  return `${valor.toFixed(1).replace('.', ',')} ${unidad}`;
}

// Título propuesto a partir del nombre del archivo: sin extensión y con separadores legibles.
export const tituloSugerido = (nombre) => nombre.replace(/\.pdf$/i, '').replace(/[_-]+/g, ' ').trim();
