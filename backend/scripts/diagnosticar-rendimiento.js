// Diagnóstico local público: no inicia/detiene servidores ni escribe en PostgreSQL.
import { performance } from 'node:perf_hooks';
import { createHash } from 'node:crypto';
import { readFile,writeFile } from 'node:fs/promises';
import { fileURLToPath,pathToFileURL } from 'node:url';
import { crearConsulta,opcionesConexion,comprobarRolSql,prepararLecturaSql } from '../src/db.js';
import { crearLecturas } from '../src/lecturas.js';
import { diagnosticar } from '../src/diagnostico-neon.js';

const redondear=n=>+n.toFixed(2);
const digest=s=>createHash('sha256').update(s).digest('hex');
export const esBloqueo=e=>['EPERM','EACCES'].includes(e?.cause?.code??e?.code);
export function faseSql(sql) {
  if(sql===prepararLecturaSql)return 'preparacion_segura';
  if(sql===comprobarRolSql)return 'comprobacion_rol';
  if(sql.startsWith('BEGIN'))return 'begin';
  if(sql.startsWith('SET LOCAL ROLE'))return 'set_local_role';
  if(sql==='COMMIT'||sql==='ROLLBACK')return sql.toLowerCase();
  return 'consulta';
}
export async function medirHttp(base,ruta,fetchImpl=fetch,{instrumentarMapa=false}={}) {
  const inicio=performance.now();
  const r=await fetchImpl(base+ruta,{headers:{Accept:'application/json',...(instrumentarMapa?{'X-Iglesias-Diagnostico':'mapa'}:{})},credentials:'omit',redirect:'error',signal:AbortSignal.timeout(15000)});
  const cabeceras=performance.now(),bytes=new Uint8Array(await r.arrayBuffer()),fin=performance.now();
  let data=null;try{data=JSON.parse(new TextDecoder().decode(bytes)).data??null;}catch{}
  const serverTiming=(r.headers.get('server-timing')??'').split(',').flatMap(v=>{
    const m=v.trim().match(/^([a-zA-Z0-9_-]+)\s*;\s*dur=([0-9]+(?:\.[0-9]+)?)/);return m?[{nombre:m[1],ms:Number(m[2])}]:[];
  });
  return {data,medicion:{ruta,estado:r.status,cabeceras_ms:redondear(cabeceras-inicio),cuerpo_ms:redondear(fin-cabeceras),
    total_ms:redondear(fin-inicio),bytes:bytes.byteLength,server_timing:serverTiming}};
}
export async function recorridoHttp(base,fetchImpl=fetch) {
  const resultados=[];let eleccion;
  // Dos observaciones, sin forzar arranque frío ni vaciar pools/cachés de los servidores.
  for(const vuelta of ['primera_observada','navegacion_posterior']) {
    const pasos=[];
    const paso=async(nombre,rutas)=>{
      const inicio=performance.now(),respuestas=await Promise.all(rutas.map(r=>medirHttp(base,r,fetchImpl)));
      pasos.push({nombre,total_ms:redondear(performance.now()-inicio),peticiones:respuestas.map(r=>r.medicion)});
      if(respuestas.some(r=>r.medicion.estado!==200))throw Object.assign(new Error(),{code:'HTTP_STATUS_INVALID'});
      return respuestas.map(r=>r.data);
    };
    try {
      await paso('mapa',['/api/iglesias?estado=yucatan']);
      await paso('iglesia',['/api/iglesias/catedral']);
      const museo=await paso('museo_y_biblioteca',['/api/iglesias/catedral','/api/iglesias/catedral/materiales']);
      const cuaderno=museo[1]?.find(m=>m.visibilidad==='publico' && m.tiene_documento && !m.es_ejemplo);
      if(!cuaderno)throw Object.assign(new Error(),{code:'PUBLIC_DOCUMENT_REQUIRED'});
      eleccion={material:cuaderno.id,imagenes:[museo[0]?.foto_interior??museo[0]?.foto_exterior,cuaderno.imagen_publica].filter(Boolean)};
      await paso('ficha_cuaderno',['/api/iglesias/catedral','/api/materiales/'+cuaderno.id]);
      const [documento]=await paso('lector',['/api/materiales/'+cuaderno.id+'/documento']);
      eleccion.imagenes.push(...(documento?.paginas??[]).map(p=>p.imagen_url).filter(Boolean));
      await paso('tramites',['/api/iglesias/catedral','/api/iglesias/catedral/tramites']);
      await paso('volver_al_museo',['/api/iglesias/catedral','/api/iglesias/catedral/materiales']);
      resultados.push({vuelta,pasos});
    } catch(error) {
      resultados.push({vuelta,pasos,error:diagnosticoSeguro(error)});
      return {resultados,eleccion,bloqueado:esBloqueo(error)};
    }
  }
  return {resultados,eleccion,bloqueado:false};
}
function diagnosticoSeguro(error) {
  if(['HTTP_STATUS_INVALID','PUBLIC_DOCUMENT_REQUIRED','BACKEND_INSTRUMENTATION_REQUIRED'].includes(error?.code))return {etapa:'http',codigo:error.code};
  return diagnosticar(error);
}
export async function perfilarNeon(databaseUrl,Pool,{soloMapa=false}={}) {
  const pool=new Pool({...opcionesConexion(databaseUrl),max:3});pool.on('error',()=>{});
  const conocidos=new WeakSet(),consultas=new Map(),operaciones=[];let activa,planes=false;
  const consultar=crearConsulta(async()=>({connect:async()=>{
    const inicio=performance.now(),cliente=await pool.connect(),nuevo=!conocidos.has(cliente);conocidos.add(cliente);
    activa.adquisiciones.push({ms:redondear(performance.now()-inicio),conexion_nueva:nuevo,esperando:pool.waitingCount});
    return {query:async(sql,p=[])=>{
      const inicio=performance.now();try{return await cliente.query(sql,p);}
      finally {
        const fase=faseSql(sql);activa.comandos.push({fase,huella_sql:digest(sql).slice(0,16),driver_ms:redondear(performance.now()-inicio)});
        if(!planes && fase==='consulta' && /^\s*SELECT\b/i.test(sql))consultas.set(digest(sql),{sql,p});
      }
    },release:descartar=>cliente.release(descartar)};
  }}));
  const lecturas=crearLecturas(consultar);
  const medir=async(nombre,fn)=>{
    activa={nombre,adquisiciones:[],comandos:[]};const inicio=performance.now();
    try {const datos=await fn();activa.total_ms=redondear(performance.now()-inicio);operaciones.push(activa);return datos;}
    catch(error){activa.error=diagnosticoSeguro(error);operaciones.push(activa);throw error;}
  };
  const explicaciones=[];
  try {
    for(const vuelta of ['primera_conexion_del_diagnostico','conexion_reutilizada']) {
      await medir(vuelta+'/catalogo',()=>lecturas.listarIglesias('yucatan'));
      if(soloMapa)continue;
      await medir(vuelta+'/iglesia',()=>lecturas.obtenerIglesia('catedral'));
      const materiales=await medir(vuelta+'/museo_biblioteca',()=>lecturas.listarMateriales('catedral'));
      const c=materiales.find(m=>m.visibilidad==='publico' && m.tiene_documento && !m.es_ejemplo);
      if(!c)throw Object.assign(new Error(),{code:'PUBLIC_DOCUMENT_REQUIRED'});
      await medir(vuelta+'/ficha',()=>lecturas.obtenerMaterial(c.id));
      await medir(vuelta+'/lector',()=>lecturas.obtenerDocumento(c.id));
      await medir(vuelta+'/tramites',()=>lecturas.listarTramites('catedral'));
    }
    // Se hace DESPUÉS de medir; EXPLAIN ANALYZE de SELECT públicos con el mismo guardia/RLS.
    planes=true;
    for(const [huella,{sql,p}]of consultas) {
      activa={nombre:'explain',adquisiciones:[],comandos:[]};
      const rows=await consultar('EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON, TIMING OFF) '+sql,p);
      const plan=rows[0]?.['QUERY PLAN']?.[0];
      explicaciones.push({huella_sql:huella.slice(0,16),planning_ms:plan?.['Planning Time']??null,execution_ms:plan?.['Execution Time']??null});
    }
    const repetidas={};
    for(const o of operaciones)for(const c of o.comandos) {
      const k=c.fase+':'+c.huella_sql;
      const r=repetidas[k]??={fase:c.fase,huella_sql:c.huella_sql,veces:0,driver_ms:0};r.veces++;r.driver_ms=redondear(r.driver_ms+c.driver_ms);
    }
    return {operaciones,planes:explicaciones,repeticiones:Object.values(repetidas)};
  } catch(error){return {operaciones,planes:explicaciones,error:diagnosticoSeguro(error)};}
  finally {await pool.end().catch(()=>{});}
}

export async function repetirMapa({fetchImpl=fetch,dormir=ms=>new Promise(r=>setTimeout(r,ms)),inmediatas=6,rondasInactivas=4}={}) {
  const muestras=[];
  const pedir=async(origen,fase,ronda)=>{
    const r=await medirHttp(origen==='api'?'http://127.0.0.1:3001':'http://localhost:5173','/api/iglesias?estado=yucatan',fetchImpl,{instrumentarMapa:true});
    muestras.push({origen,fase,ronda,...r.medicion});
    if(r.medicion.estado!==200)throw Object.assign(new Error(),{code:'HTTP_STATUS_INVALID'});
    if(!r.medicion.server_timing.some(m=>m.nombre==='db_guard'))throw Object.assign(new Error(),{code:'BACKEND_INSTRUMENTATION_REQUIRED'});
  };
  try {
    for(const origen of ['api','vite'])for(let ronda=1;ronda<=inmediatas;ronda++)await pedir(origen,'serie_inmediata',ronda);
    for(let ronda=1;ronda<=rondasInactivas;ronda++) {
      // Misma pausa de12s del informe base; permite comprobar la nueva retención pública de60s.
      await dormir(12000);
      const primero=ronda%2?'api':'vite',segundo=primero==='api'?'vite':'api';
      await pedir(primero,'primera_tras_pausa_del_diagnostico',ronda);
      await pedir(primero,'repeticion_inmediata',ronda);
      await pedir(segundo,'posterior_al_otro_origen',ronda);
    }
    const resumen=[];
    for(const origen of ['api','vite'])for(const fase of [...new Set(muestras.map(m=>m.fase))]) {
      const valores=muestras.filter(m=>m.origen===origen && m.fase===fase).map(m=>m.total_ms).sort((a,b)=>a-b);
      if(valores.length)resumen.push({origen,fase,n:valores.length,min_ms:valores[0],mediana_ms:valores.length%2?valores[(valores.length-1)/2]:redondear((valores[valores.length/2-1]+valores[valores.length/2])/2),max_ms:valores.at(-1)});
    }
    return {muestras,resumen,bloqueado:false};
  } catch(error){return {muestras,error:diagnosticoSeguro(error),bloqueado:esBloqueo(error)};}
}

export async function comprobarPublico(fetchImpl=fetch) {
  const resultados=[];
  const pedir=async(ruta,validar)=>{
    const r=await medirHttp('http://127.0.0.1:3001',ruta,fetchImpl);
    resultados.push({ruta,estado:r.medicion.estado,correcto:!!validar(r)});return r;
  };
  try {
    await pedir('/api/iglesias/iglesia-inexistente',r=>r.medicion.estado===404);
    await pedir('/api/materiales/ffffffff-ffff-4fff-8fff-ffffffffffff',r=>r.medicion.estado===404);
    await pedir('/api/materiales/20000000-0000-4000-8000-000000000006',r=>r.medicion.estado===404);
    await pedir('/api/materiales/20000000-0000-4000-8000-000000000000/documento',r=>r.medicion.estado===404);
    await pedir('/api/iglesias/santa-ana/actividades?fecha=0001-01-01',r=>r.medicion.estado===200 && Array.isArray(r.data) && !r.data.length);
    const catalogo=await pedir('/api/iglesias',r=>r.medicion.estado===200 && r.data?.length===8);
    let cuadernos=0,objetos=0,privados=0;
    for(const i of Array.isArray(catalogo.data)?catalogo.data:[]) {
      const lista=await pedir('/api/iglesias/'+i.slug+'/materiales',r=>r.medicion.estado===200 && Array.isArray(r.data));
      for(const m of Array.isArray(lista.data)?lista.data:[]) {
        if(m.visibilidad==='publico' && m.tipo==='documento' && !m.es_ejemplo && m.tiene_documento) {
          const r=await pedir('/api/materiales/'+m.id+'/documento',r=>r.medicion.estado===200 && r.data?.es_ejemplo===false && r.data.paginas?.length===4 && r.data.paginas.every((p,n)=>p.numero===n+1 && typeof p.texto==='string'));
          if(r.medicion.estado===200)cuadernos++;
        } else if(m.visibilidad==='publico' && m.tipo==='objeto' && !m.es_ejemplo) {
          const r=await pedir('/api/materiales/'+m.id,p=>p.medicion.estado===200 && p.data?.id===m.id && p.data.tipo==='objeto' &&
            p.data.visibilidad==='publico' && p.data.es_ejemplo===false && p.data.tiene_documento===false && p.data.bloqueado===false &&
            typeof p.data.fuente==='string' && /^\/imagenes\//.test(p.data.imagen_publica));
          if(r.medicion.estado===200)objetos++;
        } else if(m.bloqueado) {
          const r=await pedir('/api/materiales/'+m.id+'/documento',r=>r.medicion.estado===403 && r.data===null);
          if(r.medicion.estado===403)privados++;
        }
      }
    }
    await pedir('/api/admin/iglesias',r=>r.medicion.estado===401);
    return {resultados,cuadernos,objetos,privados_bloqueados:privados,correcto:resultados.every(r=>r.correcto) && cuadernos===8 && objetos===10 && privados>0,
      aislamiento_administrativo:'No verificado con identidad parroquial real; GET sin cookie solo comprueba401. No se hacen logins ni escrituras.'};
  } catch(error){return {resultados,error:diagnosticoSeguro(error),bloqueado:esBloqueo(error)};}
}

export async function ejecutar() {
  const args=process.argv.slice(2);if(args.length && !(args.length===1 && args[0]==='--mapa-inicial'))throw new Error('ARGUMENTOS_INVALIDOS');
  const informe={fecha:new Date().toISOString(),node:process.version,alcance:'GET públicos sin sesión, Catedral de Mérida como recorrido representativo',
    limites:['Primera observación no equivale a arranque frío; no se reinician servidores ni Neon.',
      'Recorrido de peticiones reproduce el código; no es medición de render React ni captura Network del navegador.',
      'Proxy se mide después de API directa: Neon/pools pueden estar calientes. No restar tiempos como prueba aislada del proxy.',
      'driver_ms incluye ida/vuelta y servidor; EXPLAIN separa ejecución SQL. Pool propio del diagnóstico, no el pool del servidor.']};
  const db=await readFile(new URL('../src/db.js',import.meta.url),'utf8'),lecturas=await readFile(new URL('../src/lecturas.js',import.meta.url),'utf8');
  informe.huella_backend=digest(db+'\n'+lecturas);
  if(args[0]==='--mapa-inicial') {
    informe.modo='mapa_inicial_repetido';
    informe.limites.push('Server-Timing solo numérico: pool_nueva/reutilizada y pool_queue solapan pool; no sumarlos. db_guard incluye red+BEGIN/guardia/SET ROLE, no es CPU SQL pura.',
      'Pausa de12s sin solicitudes de este diagnóstico, no prueba de inactividad total: navegador/otros clientes pueden usar Express. No fuerza suspensión de Neon.',
      'Solo reiniciar backend para cargar instrumentación: no se controla un arranque frío de Node/Neon ni se reinicia desde este comando.');
    informe.mapa=await repetirMapa();
    if(!informe.mapa.error) {
      informe.publico=await comprobarPublico();
      if(!informe.publico.bloqueado) {
        informe.conexiones_nuevas_diagnostico=[];
        try {
          const {Pool}=await import('pg');
          for(let ronda=1;ronda<=4;ronda++) {
            const r=await perfilarNeon(process.env.DATABASE_URL,Pool,{soloMapa:true});
            informe.conexiones_nuevas_diagnostico.push({ronda,...r});if(r.error)break;
          }
        } catch(error){informe.neon={error:diagnosticoSeguro(error)};}
      }
    }
    const archivo=fileURLToPath(new URL('../../docs/diagnostico-mapa-'+informe.fecha.replace(/[:.]/g,'-')+'.json',import.meta.url));
    await writeFile(archivo,JSON.stringify(informe,null,2)+'\n',{flag:'wx'});
    console.log(JSON.stringify({archivo,mapa_error:informe.mapa.error??null,comprobacion_publica:informe.publico?.correcto??'no_ejecutada'}));
    if(informe.mapa.error || !informe.publico?.correcto || informe.neon?.error || informe.conexiones_nuevas_diagnostico?.some(r=>r.error))process.exitCode=1;
    return;
  }
  informe.api_directa=await recorridoHttp('http://127.0.0.1:3001');
  if(!informe.api_directa.bloqueado) {
    informe.proxy_vite=await recorridoHttp('http://localhost:5173');
    if(!informe.proxy_vite.bloqueado) {
      const imagenes=[...new Set(informe.proxy_vite.eleccion?.imagenes??[])].filter(r=>/^\/imagenes\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(r));
      informe.imagenes=[];
      let bloqueoImagenes=false;
      medirImagenes: for(const ruta of imagenes) {
        for(const vuelta of ['primera_observada','posterior_sin_simular_cache_del_navegador']) {
          try{const r=await medirHttp('http://localhost:5173',ruta);informe.imagenes.push({vuelta,...r.medicion});}
          catch(e){informe.imagenes.push({ruta,error:diagnosticoSeguro(e)});if(esBloqueo(e)){bloqueoImagenes=true;break medirImagenes;}}
        }
      }
      if(!bloqueoImagenes) {
        try {const {Pool}=await import('pg');informe.neon=await perfilarNeon(process.env.DATABASE_URL,Pool);}
        catch(error){informe.neon={error:diagnosticoSeguro(error)};}
      }
    }
  }
  // No guardar respuestas, cookies, SQL/parametros, URLs técnicas o mensajes del driver.
  for(const k of ['api_directa','proxy_vite'])if(informe[k])delete informe[k].eleccion;
  const archivo=fileURLToPath(new URL('../../docs/diagnostico-rendimiento-'+informe.fecha.replace(/[:.]/g,'-')+'.json',import.meta.url));
  await writeFile(archivo,JSON.stringify(informe,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({archivo,api:informe.api_directa.resultados.map(r=>({vuelta:r.vuelta,error:r.error??null})),neon_error:informe.neon?.error??null}));
  if(informe.api_directa.resultados.some(r=>r.error)||informe.proxy_vite?.resultados.some(r=>r.error)||informe.neon?.error)process.exitCode=1;
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href)await ejecutar().catch(()=>{
  console.error('{"etapa":"diagnostico","codigo":"DIAGNOSTICO_NO_COMPLETADO"}');process.exitCode=1;
});
