export function esperaTexto(seg) {
  if (!seg) return 'unos minutos';
  if (seg < 60) return `${seg} segundos`;
  const m = Math.ceil(seg / 60);
  return `${m} ${m === 1 ? 'minuto' : 'minutos'}`;
}

// Texto para el usuario según el estado HTTP del contrato. Nunca afirma que algo se guardó.
export function mensajeError(e) {
  switch (e?.status) {
    case 0: return 'No se pudo conectar con el servidor. No se guardó nada.';
    case 400: return e.message || 'Revisa los campos indicados.';
    case 401: return e.message || 'Tu sesión terminó. Inicia sesión de nuevo.';
    case 403: return 'No se aceptó la acción: no tienes permiso o la solicitud no es válida.';
    case 404: return 'Este elemento ya no existe.';
    case 409: return 'Ese registro ya existe o entra en conflicto con otro.';
    case 413: return 'El contenido es demasiado grande.';
    case 429: return `Demasiados intentos. Espera ${esperaTexto(e.retryAfter)} e inténtalo de nuevo.`;
    default: return 'El servidor tuvo un problema y no se guardó nada. Puedes intentarlo otra vez.';
  }
}
