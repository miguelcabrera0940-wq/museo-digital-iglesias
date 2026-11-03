// Solo métricas numéricas del catálogo público, opt-in desde loopback. Sin datos ni secretos.
import { AsyncLocalStorage } from 'node:async_hooks';
import { performance } from 'node:perf_hooks';
const contexto=new AsyncLocalStorage();
const conexiones=new WeakMap();
const permitidas=new Set(['db_init','pool','pool_queue','pool_nueva','pool_reutilizada','db_guard','sql_driver','commit','api']);
export const medicionActual=()=>contexto.getStore();
export const anotar=(nombre,valor)=>{
  const m=medicionActual();if(m && permitidas.has(nombre) && Number.isFinite(valor) && valor>=0)m[nombre]=(m[nombre]??0)+valor;
};
export const registrarConexion=cliente=>conexiones.set(cliente,performance.now());
export function describirAdquisicion(cliente,inicio,enCola,duracion) {
  const creada=conexiones.get(cliente);
  if(creada!==undefined)anotar(creada>=inicio?'pool_nueva':'pool_reutilizada',duracion);
  anotar('pool_queue',enCola?duracion:0);
}
export function medirEtapa(nombre,operacion) {
  if(!medicionActual())return operacion();
  const inicio=performance.now();
  return Promise.resolve().then(operacion).finally(()=>anotar(nombre,performance.now()-inicio));
}
export async function medirMapa(req,res,operacion) {
  const local=['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket?.remoteAddress);
  if(!local || req.get('x-iglesias-diagnostico')!=='mapa')return operacion();
  return contexto.run({},async()=>{
    const inicio=performance.now(),datos=await operacion();anotar('api',performance.now()-inicio);
    res.set('Server-Timing',Object.entries(medicionActual()).map(([k,v])=>`${k};dur=${v.toFixed(3)}`).join(', '));
    return datos;
  });
}
