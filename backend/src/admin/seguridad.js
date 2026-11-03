import { createHmac, timingSafeEqual } from 'node:crypto';
import { ErrorApi } from '../errores.js';

export const denegado = () => new ErrorApi(403, 'FORBIDDEN', 'No tienes permiso para esta operación.');
export const sinSesion = () => new ErrorApi(401, 'UNAUTHENTICATED', 'Inicia sesión para continuar.');
export function invalido(campo, mensaje = 'Valor inválido.') {
  throw new ErrorApi(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', { [campo]: mensaje });
}
export function configuracion(env = process.env) {
  let origen;
  try { origen = new URL(env.APP_ORIGIN); } catch { throw new Error('ADMIN_CONFIG_INVALID'); }
  const local = origen.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(origen.hostname);
  if (origen.origin !== env.APP_ORIGIN || (!local && origen.protocol !== 'https:') ||
      (env.NODE_ENV === 'production' && local) ||
      typeof env.BETTER_AUTH_SECRET !== 'string' || (Buffer.byteLength(env.BETTER_AUTH_SECRET) < 32 || env.BETTER_AUTH_SECRET.startsWith('REPLACE_'))) {
    throw new Error('ADMIN_CONFIG_INVALID');
  }
  return { origen: origen.origin, secreto: env.BETTER_AUTH_SECRET, seguro: !local, vercel: env.VERCEL === '1' };
}
export function hmac(secreto, dominio, valor) {
  return createHmac('sha256', secreto).update(`${dominio}\0${valor}`).digest('hex');
}
export function csrf(config, sesion) { return hmac(config.secreto, 'csrf-v1', sesion.id); }
export function validarCsrf(config, sesion, token) {
  const esperado = csrf(config, sesion);
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token) ||
      !timingSafeEqual(Buffer.from(esperado), Buffer.from(token))) throw denegado();
}
export function validarOrigen(req, config) {
  if (req.get('origin') !== config.origen || req.get('x-iglesias-admin') !== '1') throw denegado();
}
export function validarLogin(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.keys(body).some(k => !['email', 'password'].includes(k))) invalido('body');
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) invalido('email');
  if (typeof body.password !== 'string' || !body.password.length || body.password.length > 128) invalido('password');
  return { email, password: body.password };
}

export async function consumirIntento(transaccion, config, email, verificar) {
  const clave=hmac(config.secreto,'login-email-v1',email.trim().toLowerCase());
  const resultado=await transaccion('iglesias_auth',async q=>{
    const limpiar=()=>q(`DELETE FROM public.login_limite WHERE clave_hmac IN (
      SELECT clave_hmac FROM public.login_limite WHERE actualizado_en<clock_timestamp()-interval '15 minutes'
      ORDER BY actualizado_en,clave_hmac LIMIT 100 FOR UPDATE SKIP LOCKED)`);
    await q(`INSERT INTO public.login_limite(clave_hmac) VALUES ($1) ON CONFLICT DO NOTHING`,[clave]);
    // Bloqueo por correo durante la verificación; conexiones Auth separadas, sin agotar este pool.
    const {rows:[fila]}=await q(`SELECT fallos,ultimo_fallo,bloqueado_hasta FROM public.login_limite WHERE clave_hmac=$1 FOR UPDATE`,[clave]);
    const {rows:[reloj]}=await q('SELECT clock_timestamp() AS ahora');
    const ahora=new Date(reloj.ahora).getTime();
    if(!Number.isFinite(ahora)||!fila)throw new Error('LOGIN_STATE_INVALID');
    const expirada=fila.ultimo_fallo && ahora-new Date(fila.ultimo_fallo).getTime()>=900000;
    const fallos=expirada?0:fila.fallos;
    if(!expirada && fila.bloqueado_hasta && new Date(fila.bloqueado_hasta).getTime()>ahora) {
      await limpiar();
      return {espera:Math.max(1,Math.ceil((new Date(fila.bloqueado_hasta).getTime()-ahora)/1000))};
    }
    let respuesta,error;
    try {respuesta=await verificar();}
    catch(e) {if(e.body?.code!=='INVALID_EMAIL_OR_PASSWORD')throw e;error=e;}
    if(error) {
      const nuevos=Math.min(10,fallos+1),espera=nuevos>=10?120:nuevos>=5?15:0;
      await q(`UPDATE public.login_limite SET fallos=$2,ultimo_fallo=clock_timestamp(),
        bloqueado_hasta=CASE WHEN $3::int=0 THEN NULL ELSE clock_timestamp()+make_interval(secs=>$3::int) END,
        actualizado_en=clock_timestamp() WHERE clave_hmac=$1`,[clave,nuevos,espera]);
      await limpiar();
      return {error}; // Lanzar después de COMMIT: conservar el fallo contado.
    }
    await q(`UPDATE public.login_limite SET fallos=0,ultimo_fallo=NULL,bloqueado_hasta=NULL,
      actualizado_en=clock_timestamp() WHERE clave_hmac=$1`,[clave]);
    await limpiar();
    return {respuesta};
  });
  if(resultado.espera) {
    const error=new ErrorApi(429,'RATE_LIMITED','Demasiados intentos. Inténtalo más tarde.');
    error.retryAfter=resultado.espera;throw error;
  }
  if(resultado.error)throw resultado.error;
  return resultado.respuesta;
}
