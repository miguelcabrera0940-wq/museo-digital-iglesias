// Mismo modelo material y procedimiento operativo que los cuadernos; sin documentos nuevos.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { slugsIglesias } from './catalogo.js';
import { ErrorCarga,idContenido,comprobarImagenes } from './carga-cuadernos.js';
const exigir=(v,c='OBJETO_INVALIDO')=>{if(!v)throw new ErrorCarga(c);};
const claves=(v,campos)=>exigir(v && typeof v==='object' && !Array.isArray(v) &&
  Object.keys(v).length===campos.length && campos.every(k=>Object.hasOwn(v,k)),'CAMPOS_INVALIDOS');
const texto=(v,n)=>exigir(typeof v==='string' && v.trim().length && [...v].length<=n,'TEXTO_INVALIDO');
const url=(v,hosts)=>{let u;try{u=new URL(v);}catch{throw new ErrorCarga('FUENTE_INVALIDA');}
  exigir(u.protocol==='https:' && !u.username && !u.password && hosts.includes(u.hostname),'FUENTE_INVALIDA');return u;};
export const idObjeto=clave=>idContenido('iglesias/objeto-museo/v1',clave);
export function prepararObjetos(datos) {
  claves(datos,['version','descripcion','objetos']);exigir(datos.version===1);texto(datos.descripcion,2000);
  exigir(Array.isArray(datos.objetos) && datos.objetos.length===10,'DIEZ_OBJETOS_REQUERIDOS');
  const vistos=new Set();
  for(const o of datos.objetos) {
    claves(o,['clave','slug_iglesia','tipo','categoria_id','titulo','descripcion_publica','imagen_publica','fuente','es_ejemplo','clase_contenido','creditos_imagen']);
    exigir(typeof o.clave==='string' && o.clave.length<=120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(o.clave) && !vistos.has(o.clave),'CLAVE_INVALIDA_O_DUPLICADA');vistos.add(o.clave);
    exigir(slugsIglesias.includes(o.slug_iglesia) && o.clave.startsWith(o.slug_iglesia+'-'),'IGLESIA_INVALIDA');
    exigir(o.tipo==='objeto' && o.categoria_id==='objetos' && o.es_ejemplo===false && o.clase_contenido==='objeto_patrimonial');
    texto(o.titulo,160);texto(o.descripcion_publica,10000);texto(o.fuente,1000);
    exigir(typeof o.imagen_publica==='string' && /^\/imagenes\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(o.imagen_publica),'IMAGEN_INVALIDA');
    const c=o.creditos_imagen;
    claves(c,['autor','licencia','enlace_licencia','enlace_original','titulo_original']);
    for(const v of Object.values(c))texto(v,2000);
    const original=url(c.enlace_original,['commons.wikimedia.org']);exigir(original.pathname.startsWith('/wiki/File:'),'FUENTE_INVALIDA');
    url(c.enlace_licencia,['creativecommons.org','commons.wikimedia.org']);
    for(const k of ['autor','licencia','enlace_licencia','enlace_original','titulo_original'])exigir(o.fuente.includes(c[k]),'CREDITO_AUSENTE_EN_FUENTE');
  }
  return datos.objetos.map(o=>({...structuredClone(o),id:idObjeto(o.clave)}));
}
const normalizar=v=>v.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/\s+/g,' ');
export async function revisarRecursosObjetos(objetos,raiz) {
  const imagenes=await comprobarImagenes(objetos.map(o=>({...o,paginas:[]})),raiz);
  const md=await readFile(path.join(raiz,'imagenes/ATRIBUCIONES.md'),'utf8');
  const html=await readFile(path.join(raiz,'imagenes/creditos.html'),'utf8');
  const elementos=html.match(/<li\b[^>]*>[\s\S]*?<\/li>/g)??[];
  for(const o of objetos) {
    const linea=md.split('\n').find(l=>l.includes('`'+path.basename(o.imagen_publica)+'`'));
    const elemento=elementos.find(l=>l.includes('src="'+o.imagen_publica+'"'));
    exigir(linea && elemento,'CREDITO_LOCAL_AUSENTE');
    for(const textoCredito of [o.creditos_imagen.autor,o.creditos_imagen.licencia,o.creditos_imagen.enlace_original])
      exigir(normalizar(linea).includes(normalizar(textoCredito)) && normalizar(elemento).includes(normalizar(textoCredito)),'CREDITO_LOCAL_NO_COINCIDE');
  }
  return imagenes;
}
export function muestrasObjetos() {
  return slugsIglesias.slice(0,4).flatMap((slug,n)=>[6,7].map(k=>({slug,id:`20000000-0000-4000-8000-${String(n*100+k).padStart(12,'0')}`,
    titulo:k===6?'Cáliz de ejemplo':'Campana de muestra'})));
}
export function vistaObjetos(objetos,huella,imagenes) {
  return {modo:'vista_previa_sin_conexion',huella_sha256:huella,objetos,imagenes,muestras_candidatas:muestrasObjetos(),
    sin_objetos_publicos:['santa-lucia','santa-ana'],documentos_nuevos:0,paginas_nuevas:0};
}
export async function cargarObjetos(cliente,objetos,{aplicar=false}={}) {
  prepararObjetos({version:1,descripcion:'Validación operativa',objetos:objetos.map(({id,...o})=>o)});
  exigir(objetos.every(o=>o.id===idObjeto(o.clave)),'ID_NO_COINCIDE');
  await cliente.query(aplicar?'BEGIN ISOLATION LEVEL SERIALIZABLE':'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  try {
    const {rows:iglesias}=await cliente.query('SELECT id,slug FROM public.iglesias ORDER BY slug'+(aplicar?' FOR UPDATE':''));
    exigir(iglesias.length===8 && slugsIglesias.every(s=>iglesias.some(i=>i.slug===s)),'IGLESIAS_NO_COINCIDEN');
    const cambios=[],retiradas=[];
    for(const o of objetos) {
      const i=iglesias.find(i=>i.slug===o.slug_iglesia);
      const {rows:[actual]}=await cliente.query(`SELECT id,iglesia_id,categoria_id,tipo,titulo,descripcion_publica,imagen_publica,fuente,visibilidad,es_ejemplo,retirado_publico
        FROM public.materiales WHERE id=$1${aplicar?' FOR UPDATE':''}`,[o.id]);
      if(actual)exigir(actual.iglesia_id===i.id && actual.tipo==='objeto' && actual.categoria_id==='objetos' && actual.visibilidad==='publico' &&
        actual.es_ejemplo===false && actual.retirado_publico===false,'CONFLICTO_OBJETO_ESTABLE');
      const {rows:documentos}=await cliente.query('SELECT titulo,es_ejemplo FROM public.documentos WHERE material_id=$1',[o.id]);
      exigir(documentos.length===0,'OBJETO_CON_DOCUMENTO_CONFLICTO');
      const deseado={id:o.id,iglesia_id:i.id,categoria_id:'objetos',tipo:'objeto',titulo:o.titulo,descripcion_publica:o.descripcion_publica,
        imagen_publica:o.imagen_publica,fuente:o.fuente,visibilidad:'publico',es_ejemplo:false,retirado_publico:false};
      const cambio=!actual || Object.keys(deseado).some(k=>actual[k]!==deseado[k]);
      cambios.push({clave:o.clave,slug:o.slug_iglesia,id:o.id,accion:!actual?'crear':cambio?'actualizar':'sin_cambios',antes:actual??null,despues:deseado});
      if(aplicar && cambio) {
        const campos=Object.keys(deseado);
        await cliente.query(`INSERT INTO public.materiales (${campos.join(',')}) VALUES (${campos.map((_,n)=>'$'+(n+1)).join(',')})
          ON CONFLICT(id) DO UPDATE SET ${campos.filter(k=>k!=='id').map(k=>`${k}=EXCLUDED.${k}`).join(',')}`,Object.values(deseado));
      }
    }
    for(const s of muestrasObjetos()) {
      const {rows:[m]}=await cliente.query(`SELECT id,iglesia_id,categoria_id,tipo,titulo,descripcion_publica,imagen_publica,fuente,visibilidad,es_ejemplo,retirado_publico
        FROM public.materiales WHERE id=$1${aplicar?' FOR UPDATE':''}`,[s.id]);
      if(!m)continue;
      exigir(m.iglesia_id===iglesias.find(i=>i.slug===s.slug).id && m.tipo==='objeto' && m.categoria_id==='objetos' && m.titulo===s.titulo &&
        m.descripcion_publica==='Historia de demostración de este objeto ficticio. No representa una pieza ni información histórica real.' &&
        m.imagen_publica===null && m.fuente===null && m.visibilidad==='publico' && m.es_ejemplo===true,'MUESTRA_MODIFICADA_CONFLICTO');
      if(m.retirado_publico)continue;
      retiradas.push({id:s.id,slug:s.slug,visibilidad_conservada:'publico'});
      if(aplicar)await cliente.query('UPDATE public.materiales SET retirado_publico=true WHERE id=$1',[s.id]);
    }
    await cliente.query('COMMIT');return {modo:aplicar?'aplicado':'comparacion_solo_lectura',cambios,retiradas};
  } catch(error){await cliente.query('ROLLBACK').catch(()=>{});throw error;}
}
