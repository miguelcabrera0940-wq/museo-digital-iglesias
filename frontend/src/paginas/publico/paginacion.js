// Qué páginas muestra el lector: una (móvil) o un par (escritorio, siempre empezando en índice par).
export function vista(total, inicio, doble) {
  const paso = doble ? 2 : 1;
  let ini = Math.min(Math.max(0, inicio), Math.max(total - 1, 0));
  if (doble) ini -= ini % 2;
  const indices = Array.from({ length: paso }, (_, k) => ini + k).filter((i) => i < total);
  return { ini, paso, indices, hayAnterior: ini > 0, haySiguiente: ini + paso < total };
}
