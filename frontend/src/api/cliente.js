export const BASE = import.meta.env?.VITE_API_BASE ?? '/api';
export const USAR_MOCKS = import.meta.env?.VITE_USAR_MOCKS === 'true';

// Error con la forma del contrato: { code, message, fields? } más el estado HTTP.
export class ErrorApi extends Error {
  constructor(status, { code, message, fields, retryAfter }) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.retryAfter = retryAfter; // segundos, solo en 429
  }
}

// Devuelve `data` del contrato; 204 devuelve null. Nunca sustituye un fallo por datos ficticios.
export async function pedir(ruta, { method = 'GET', body, headers } = {}) {
  let res;
  try {
    res = await fetch(BASE + ruta, {
      method,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...(body && { 'Content-Type': 'application/json' }), ...headers },
      body: body && JSON.stringify(body),
    });
  } catch {
    throw new ErrorApi(0, { code: 'NETWORK_ERROR', message: 'No se pudo conectar con el servidor.' });
  }
  if (res.status === 204) return null;

  const cuerpo = await res.json().catch(() => null);
  if (!res.ok) {
    const e = cuerpo?.error;
    throw new ErrorApi(res.status, {
      code: e?.code ?? 'INTERNAL_ERROR',
      message: e?.message ?? 'Ocurrió un error inesperado.',
      fields: e?.fields,
      retryAfter: Number(res.headers?.get?.('Retry-After')) || undefined,
    });
  }
  if (!cuerpo || !('data' in cuerpo)) {
    throw new ErrorApi(res.status, { code: 'INTERNAL_ERROR', message: 'La respuesta del servidor no es válida.' });
  }
  return cuerpo.data;
}
