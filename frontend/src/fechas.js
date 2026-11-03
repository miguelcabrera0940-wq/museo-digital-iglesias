// Fechas de calendario como texto AAAA-MM-DD en hora local. Nunca pasan por UTC (CONTRATO_API v1).
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const pad = (n) => String(n).padStart(2, '0');

export const aTexto = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const hoyLocal = (ahora = new Date()) => aTexto(ahora);

// Devuelve un Date local, o null si el texto no es una fecha real (p. ej. 2026-02-30).
export function aFecha(texto) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto ?? '');
  if (!m) return null;
  const [a, mes, dia] = [+m[1], +m[2], +m[3]];
  const d = new Date(a, mes - 1, dia);
  return d.getFullYear() === a && d.getMonth() === mes - 1 && d.getDate() === dia ? d : null;
}

export const esFechaValida = (texto) => aFecha(texto) !== null;
export const diaSemana = (texto) => aFecha(texto).getDay(); // 0 domingo – 6 sábado, como el contrato

export function sumarDias(texto, n) {
  const d = aFecha(texto);
  d.setDate(d.getDate() + n);
  return aTexto(d);
}

export const nombreDia = (n) => DIAS[n];
export const nombreDiaPlural = (n) => `${DIAS[n]}${DIAS[n].endsWith('o') ? 's' : ''}`;
export const cap = (s) => s[0].toUpperCase() + s.slice(1);

export function fechaParts(texto) {
  const d = aFecha(texto);
  return { dia: d.getDate(), mes: MESES[d.getMonth()], anio: d.getFullYear(), nombre: DIAS[d.getDay()] };
}

export function fechaLarga(texto) {
  const { dia, mes, anio, nombre } = fechaParts(texto);
  return cap(`${nombre} ${dia} de ${mes} de ${anio}`);
}

// "18:30" → "6:30 p. m."
export function formatoHora(hhmm) {
  const [h, min] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${pad(min)} ${h < 12 ? 'a. m.' : 'p. m.'}`;
}
