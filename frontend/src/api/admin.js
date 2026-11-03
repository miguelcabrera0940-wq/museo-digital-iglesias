import { pedir, ErrorApi } from './cliente.js';

// Rutas admin: X-Iglesias-Admin siempre; X-CSRF-Token en toda mutación y en logout (CONTRATO_API, Autenticación).
// El login no lleva CSRF (aún no hay sesión). Origin lo pone el navegador; no se inventa aquí.
const SIN_CSRF = ['/admin/login'];

export function pedirAdmin(ruta, { method = 'GET', body } = {}, csrf = null) {
  const headers = { 'X-Iglesias-Admin': '1' };
  if (method !== 'GET' && !SIN_CSRF.includes(ruta)) {
    if (!csrf && ruta !== '/admin/logout') {
      return Promise.reject(new ErrorApi(0, { code: 'NO_CSRF', message: 'La sesión no está verificada. Vuelve a iniciar sesión.' }));
    }
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }
  return pedir(ruta, { method, body, headers });
}
