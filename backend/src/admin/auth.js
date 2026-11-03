import { obtenerPoolAuth, verificarLogin } from './db.js';
import { configuracion } from './seguridad.js';

export function opcionesAuth(config, database, provision = false) {
  return {
    appName: 'Iglesias', baseURL: config.origen, basePath: '/api/admin/auth-interno',
    secret: config.secreto, database, trustedOrigins: [config.origen],
    logger: { disabled: true }, telemetry: { enabled: false },
    emailAndPassword: { enabled: true, disableSignUp: !provision, minPasswordLength: 12,
      maxPasswordLength: 128, requireEmailVerification: false, autoSignIn: false },
    user: { modelName: 'auth_user' }, account: { modelName: 'auth_account' },
    verification: { modelName: 'auth_verification' },
    session: { modelName: 'auth_session', expiresIn: 8*60*60, disableSessionRefresh: true,
      cookieCache: { enabled: false } },
    advanced: { useSecureCookies: config.seguro,
      ipAddress: { disableIpTracking: true },
      defaultCookieAttributes: { httpOnly: true, secure: config.seguro, sameSite: 'lax', path: '/' } },
  };
}
let instancia;
export async function obtenerAuth() {
  if (!instancia) {
    instancia = (async () => {
      const config = configuracion();
      const database = await obtenerPoolAuth();
      await verificarLogin((...args) => database.query(...args));
      const { betterAuth } = await import('better-auth');
      return betterAuth(opcionesAuth(config, database));
    })();
    instancia.catch(() => { instancia = undefined; });
  }
  return instancia;
}
// No se exporta ni monta el handler HTTP de Better Auth. Solo la fachada usa auth.api.
export function cabecerasAuth(req) {
  const headers = new Headers();
  for (const clave of ['cookie', 'origin', 'user-agent']) {
    const valor = req.get(clave);
    if (valor) headers.set(clave, valor);
  }
  return headers;
}
export function copiarCookies(headers, res) {
  for (const cookie of headers.getSetCookie()) res.append('Set-Cookie', cookie);
}
export function cabecerasTrasLogin(headers, originales) {
  const resultado = new Headers(originales);
  resultado.set('cookie', headers.getSetCookie().map(c => c.split(';', 1)[0]).join('; '));
  return resultado;
}
