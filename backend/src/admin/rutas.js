import express from 'express';
import { ErrorApi } from '../errores.js';
import { obtenerAuth, cabecerasAuth, copiarCookies, cabecerasTrasLogin } from './auth.js';
import { transaccionAdmin, esAdministrador } from './db.js';
import { validarAmbito } from './permisos.js';
import { crearGestion } from './gestion.js';
import { configuracion, csrf, validarCsrf, validarOrigen, validarLogin, consumirIntento, denegado, sinSesion, invalido } from './seguridad.js';

// Inyectable para probar permisos sin sockets, secretos, biblioteca o Neon remotos.
export function crearControlAdmin({ auth = obtenerAuth, config = configuracion, permiso = esAdministrador,
  limitar = consumirIntento, transaccion = transaccionAdmin } = {}) {
  async function sesion(req) {
    // Sin cookie no hay identidad que verificar. No conectar a Neon para el 401 inicial.
    if (!req.get('cookie')) return null;
    const a = await auth();
    const resultado = await a.api.getSession({ headers: cabecerasAuth(req), query: { disableCookieCache: true, disableRefresh: true } });
    const expira = resultado ? new Date(resultado.session.expiresAt).getTime() : NaN;
    if (!resultado || !Number.isFinite(expira) || expira <= Date.now()) return null;
    return resultado;
  }
  async function autorizar(req) {
    const s = await sesion(req);
    if (!s) throw sinSesion();
    const ambito=validarAmbito(await permiso(s.user.id));
    return {...s,ambito};
  }
  return {
    async login(req,res) {
      const c = config(); validarOrigen(req,c);
      const body = validarLogin(req.body);
      let a,resultado;
      try { resultado = await limitar(transaccion,c,body.email,async()=>{
        a=await auth();
        return a.api.signInEmail({ body, headers: cabecerasAuth(req), returnHeaders: true });
      }); }
      catch (error) {
        if (error.body?.code === 'INVALID_EMAIL') invalido('email');
        if (error.body?.code === 'INVALID_EMAIL_OR_PASSWORD') throw new ErrorApi(401,'UNAUTHENTICATED','Correo o contraseña incorrectos.');
        throw error;
      }
      // No entregar cookies hasta comprobar permiso. Revocar la sesión creada si falla.
      try { validarAmbito(await permiso(resultado.response.user.id)); }
      catch (error) {
        await a.api.signOut({ headers: cabecerasTrasLogin(resultado.headers,cabecerasAuth(req)) });
        throw error;
      }
      copiarCookies(resultado.headers,res);
      res.json({data:{administrador:true}});
    },
    async consultarSesion(req,res) {
      if (req.get('x-iglesias-admin') !== '1') throw denegado();
      const s = await autorizar(req);
      res.json({data:{administrador:true,rol:s.ambito.rol,iglesia_id:s.ambito.iglesia_id,iglesia_slug:s.ambito.iglesia_slug??null,expira_en:new Date(s.session.expiresAt).toISOString(),csrf_token:csrf(config(),s.session)}});
    },
    async logout(req,res) {
      const c = config(); validarOrigen(req,c);
      if (req.headers?.['transfer-encoding'] || Number(req.headers?.['content-length']) > 0) {
        throw new ErrorApi(400,'VALIDATION_ERROR','Logout no admite cuerpo.');
      }
      const s = await sesion(req);
      // También permitir revocar una sesión cuyo permiso global acaba de retirarse.
      if (s) validarCsrf(c,s.session,req.get('x-csrf-token'));
      const a = await auth();
      const salida = await a.api.signOut({headers:cabecerasAuth(req),returnHeaders:true});
      // Confirmar en el almacén real antes de comunicar una revocación exitosa.
      if (s && await sesion(req)) throw new Error('SESSION_REVOKE_FAILED');
      copiarCookies(salida.headers,res);
      res.status(204).end();
    },
    async proteger(req,_res,next) {
      const s = await autorizar(req);
      if (req.get('x-iglesias-admin') !== '1') throw denegado();
      if (!['GET','HEAD'].includes(req.method)) {
        const c = config(); validarOrigen(req,c); validarCsrf(c,s.session,req.get('x-csrf-token'));
      }
      req.usuarioAdmin = s.user.id;
      next();
    },
  };
}
export function crearRouterAdmin(opciones = {}) {
  const router = express.Router(), control = crearControlAdmin(opciones);
  const gestion = opciones.gestion ?? crearGestion(opciones.transaccion ?? transaccionAdmin);
  router.use((_req,res,next) => { res.set('Cache-Control','no-store'); next(); });
  // Validar origen antes de leer cuerpos y exigir JSON en solicitudes con cuerpo.
  router.use((req,_res,next) => {
    if (!['GET','HEAD','OPTIONS'].includes(req.method)) {
      validarOrigen(req,(opciones.config ?? configuracion)());
      if ((req.headers['transfer-encoding'] || Number(req.headers['content-length'])>0) && !req.is('application/json')) {
        throw new ErrorApi(400,'VALIDATION_ERROR','El cuerpo debe ser JSON.');
      }
    }
    next();
  });
  router.post('/login',express.json({limit:'4kb'}),control.login);
  router.get('/sesion',control.consultarSesion);
  router.post('/logout',control.logout);
  router.use(control.proteger);
  router.use(express.json({limit:'256kb'}));
  router.get('/iglesias',async(req,res)=>res.json({data:await gestion.listarIglesias(req.usuarioAdmin)}));
  router.get('/iglesias/:slug/materiales',async (req,res) => res.json({data:await gestion.listarMateriales(req.usuarioAdmin,req.params.slug)}));
  router.get('/materiales/:id',async (req,res) => res.json({data:await gestion.obtenerMaterial(req.usuarioAdmin,req.params.id)}));
  router.get('/materiales/:id/documento',async (req,res) => res.json({data:await gestion.obtenerDocumento(req.usuarioAdmin,req.params.id)}));
  router.patch('/iglesias/:slug',async (req,res) => res.json({data:await gestion.guardar(req.usuarioAdmin,'iglesias',req.params.slug,req.body)}));
  for (const tabla of ['materiales','horarios','actividades','tramites']) {
    router.patch(`/${tabla}/:id`,async (req,res) => res.json({data:await gestion.guardar(req.usuarioAdmin,tabla,req.params.id,req.body)}));
    if (tabla !== 'tramites') router.post(`/${tabla}`,async (req,res) => res.status(201).json({data:await gestion.guardar(req.usuarioAdmin,tabla,null,req.body,true)}));
    if (['horarios','actividades'].includes(tabla)) router.delete(`/${tabla}/:id`,async (req,res) => {
      await gestion.eliminar(req.usuarioAdmin,tabla,req.params.id); res.status(204).end();
    });
  }
  return router;
}
