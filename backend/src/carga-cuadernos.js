// Carga operativa del lote editorial. No se importa desde la API.
import { createHash } from 'node:crypto';
import { realpath,readFile,stat } from 'node:fs/promises';
import path from 'node:path';
import { slugsIglesias } from './catalogo.js';
import { ErrorCarga,huellaCarga } from './carga-publica.js';
export { ErrorCarga,huellaCarga };
const exigir=(v,c='CUADERNO_INVALIDO')=>{if(!v)throw new ErrorCarga(c);};
const claves=(v,k)=>exigir(v && typeof v==='object' && !Array.isArray(v) &&
  Object.keys(v).length===k.length && k.every(c=>Object.hasOwn(v,c)),'CAMPOS_INVALIDOS');
const texto=(v,n)=>exigir(typeof v==='string' && v.trim().length>0 && [...v].length<=n,'TEXTO_INVALIDO');
export function idCuaderno(slug) {
  return idContenido('iglesias/cuaderno-informativo/v1',slug);
}
export function idContenido(namespace,clave) {
  const bytes=createHash('sha256').update(namespace+'/'+clave).digest().subarray(0,16);
  bytes[6]=(bytes[6]&15)|128;bytes[8]=(bytes[8]&63)|128;
  const h=bytes.toString('hex');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;
}
export function prepararCuadernos(datos) {
  claves(datos,['version','descripcion','cuadernos']);exigir(datos.version===1);texto(datos.descripcion,2000);
  exigir(Array.isArray(datos.cuadernos) && datos.cuadernos.length===8,'OCHO_CUADERNOS_REQUERIDOS');
  const vistos=new Set();
  for(const c of datos.cuadernos) {
    claves(c,['slug_iglesia','tipo','categoria_id','titulo','descripcion_publica','imagen_publica','fuente','es_ejemplo','clase_contenido','paginas']);
    exigir(slugsIglesias.includes(c.slug_iglesia) && !vistos.has(c.slug_iglesia),'SLUG_INVALIDO_O_DUPLICADO');vistos.add(c.slug_iglesia);
    exigir(c.tipo==='documento' && c.categoria_id==='libros-documentos' && c.es_ejemplo===false && c.clase_contenido==='cuaderno_informativo');
    texto(c.titulo,160);texto(c.descripcion_publica,10000);texto(c.fuente,1000);
    exigir(c.descripcion_publica.includes('Cuaderno informativo'),'IDENTIFICACION_REQUERIDA');
    exigir(Array.isArray(c.paginas) && c.paginas.length===4,'CUATRO_PAGINAS_REQUERIDAS');
    c.paginas.forEach((p,n)=>{claves(p,['numero','texto','imagen_url']);exigir(p.numero===n+1,'PAGINACION_INVALIDA');texto(p.texto,10000);});
    exigir(c.paginas[0].texto.includes('Cuaderno informativo'),'IDENTIFICACION_REQUERIDA');
    for(const imagen of [c.imagen_publica,...c.paginas.map(p=>p.imagen_url)])exigir(imagen===null ||
      typeof imagen==='string' && /^\/imagenes\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(imagen),'IMAGEN_INVALIDA');
  }
  // No recortar ni reescribir texto/fuentes/créditos del lote.
  return datos.cuadernos.map(c=>({...structuredClone(c),id:idCuaderno(c.slug_iglesia)}));
}
export async function comprobarImagenes(cuadernos,raiz) {
  const directorio=await realpath(raiz),rutas=[...new Set(cuadernos.flatMap(c=>[c.imagen_publica,...c.paginas.map(p=>p.imagen_url)]).filter(Boolean))];
  for(const ruta of rutas) {
    let archivo;
    try{archivo=await realpath(path.join(directorio,ruta));}catch{throw new ErrorCarga('IMAGEN_NO_EXISTE');}
    exigir(archivo.startsWith(directorio+path.sep),'IMAGEN_FUERA_DE_PUBLIC');
    const info=await stat(archivo);exigir(info.isFile() && info.size>0,'IMAGEN_VACIA');
    const bytes=await readFile(archivo),ext=path.extname(ruta).toLowerCase();
    exigir(ext==='.jpg'||ext==='.jpeg'?bytes[0]===255 && bytes[1]===216 && bytes[2]===255:
      ext==='.png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):
      bytes.subarray(0,4).toString()==='RIFF' && bytes.subarray(8,12).toString()==='WEBP','FIRMA_IMAGEN_INVALIDA');
  }
  return rutas;
}
const titulos=['Crónica ficticia de la parroquia','Registro de ejemplo de festividades','Carta ficticia de fundación',null,'Álbum de muestra aún sin digitalizar'];
export function semillasSustituibles() {
  return slugsIglesias.slice(0,4).flatMap((slug,n)=>[0,1,2,4].map(k=>({slug,
    id:`20000000-0000-4000-8000-${String(n*100+k).padStart(12,'0')}`,titulo:titulos[k],tipo:k===2?'documento':'libro'})));
}
export function vistaCuadernos(cuadernos,huella,imagenes) {
  return {modo:'vista_previa_sin_conexion',huella_sha256:huella,materiales:8,documentos:8,paginas:32,
    imagenes,cuadernos,semillas_candidatas:semillasSustituibles(),
    retirada:'Solo filas de semillas conocidas aún públicas, ficticias y sin cambios; conserva visibilidad y contenido.'};
}
const iguales=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export async function cargarCuadernos(cliente,cuadernos,{aplicar=false}={}) {
  // Revalidar incluso cuando lo llama otra herramienta local.
  prepararCuadernos({version:1,descripcion:'Validación operativa',cuadernos:cuadernos.map(({id,...c})=>c)});
  exigir(cuadernos.every(c=>c.id===idCuaderno(c.slug_iglesia)),'ID_NO_COINCIDE');
  await cliente.query(aplicar?'BEGIN ISOLATION LEVEL SERIALIZABLE':'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  try {
    const {rows:iglesias}=await cliente.query('SELECT id,slug FROM public.iglesias ORDER BY slug'+(aplicar?' FOR UPDATE':''));
    exigir(iglesias.length===8 && cuadernos.every(c=>iglesias.some(i=>i.slug===c.slug_iglesia)),'IGLESIAS_NO_COINCIDEN');
    const cambios=[],omitidas=[];
    for(const c of cuadernos) {
      const iglesia=iglesias.find(i=>i.slug===c.slug_iglesia);
      const {rows:[actual]}=await cliente.query(`SELECT id,iglesia_id,categoria_id,tipo,titulo,descripcion_publica,
        imagen_publica,fuente,visibilidad,es_ejemplo,retirado_publico FROM public.materiales WHERE id=$1${aplicar?' FOR UPDATE':''}`,[c.id]);
      if(actual)exigir(actual.iglesia_id===iglesia.id && actual.tipo==='documento' && actual.categoria_id==='libros-documentos' &&
        actual.visibilidad==='publico' && actual.es_ejemplo===false && !actual.retirado_publico &&
        typeof actual.descripcion_publica==='string' && actual.descripcion_publica.includes('Cuaderno informativo'),'CONFLICTO_MATERIAL_ESTABLE');
      const deseado={id:c.id,iglesia_id:iglesia.id,categoria_id:c.categoria_id,tipo:c.tipo,titulo:c.titulo,
        descripcion_publica:c.descripcion_publica,imagen_publica:c.imagen_publica,fuente:c.fuente,visibilidad:'publico',es_ejemplo:false,retirado_publico:false};
      const {rows:[doc]}=await cliente.query('SELECT titulo,es_ejemplo FROM public.documentos WHERE material_id=$1',[c.id]);
      const {rows:paginas}=await cliente.query('SELECT numero,texto,imagen_url FROM public.paginas WHERE material_id=$1 ORDER BY numero',[c.id]);
      if(doc)exigir(actual && doc.es_ejemplo===false,'CONFLICTO_DOCUMENTO');
      exigir(!paginas.some(p=>p.numero>4),'PAGINAS_ADICIONALES_CONFLICTO');
      const cambio=!actual || Object.keys(deseado).some(k=>!iguales(actual[k],deseado[k])) ||
        !doc || doc.titulo!==c.titulo || !iguales(paginas,c.paginas);
      cambios.push({slug:c.slug_iglesia,id:c.id,accion:!actual?'crear':cambio?'actualizar':'sin_cambios',
        antes:actual?{material:actual,documento:doc,paginas}:null,despues:{material:deseado,documento:{titulo:c.titulo,es_ejemplo:false},paginas:c.paginas}});
      if(aplicar && cambio) {
        const campos=Object.keys(deseado);
        await cliente.query(`INSERT INTO public.materiales (${campos.join(',')}) VALUES (${campos.map((_,n)=>'$'+(n+1)).join(',')})
          ON CONFLICT (id) DO UPDATE SET ${campos.filter(k=>k!=='id').map(k=>`${k}=EXCLUDED.${k}`).join(',')}`,Object.values(deseado));
        await cliente.query(`INSERT INTO public.documentos (material_id,titulo,es_ejemplo) VALUES ($1,$2,false)
          ON CONFLICT(material_id) DO UPDATE SET titulo=EXCLUDED.titulo,es_ejemplo=false`,[c.id,c.titulo]);
        for(const p of c.paginas)await cliente.query(`INSERT INTO public.paginas (material_id,numero,texto,imagen_url) VALUES ($1,$2,$3,$4)
          ON CONFLICT(material_id,numero) DO UPDATE SET texto=EXCLUDED.texto,imagen_url=EXCLUDED.imagen_url`,[c.id,p.numero,p.texto,p.imagen_url]);
      }
    }
    const retiradas=[];
    for(const s of semillasSustituibles()) {
      const {rows:[m]}=await cliente.query(`SELECT id,iglesia_id,categoria_id,tipo,titulo,descripcion_publica,
        imagen_publica,fuente,visibilidad,es_ejemplo,retirado_publico FROM public.materiales WHERE id=$1${aplicar?' FOR UPDATE':''}`,[s.id]);
      if(!m)continue;
      const iglesia=iglesias.find(i=>i.slug===s.slug);
      const coincide=m.iglesia_id===iglesia.id && m.categoria_id==='libros-documentos' && m.tipo===s.tipo && m.titulo===s.titulo &&
        m.visibilidad==='publico' && m.es_ejemplo===true && m.imagen_publica===null && m.fuente===null &&
        m.descripcion_publica==='Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.';
      if(!coincide){omitidas.push({id:s.id,motivo:'SEMILLA_MODIFICADA_CONSERVADA'});continue;}
      if(m.retirado_publico)continue;
      retiradas.push({id:s.id,slug:s.slug,accion:'retirar_del_publico',visibilidad_conservada:'publico'});
      if(aplicar)await cliente.query('UPDATE public.materiales SET retirado_publico=true WHERE id=$1',[s.id]);
    }
    await cliente.query('COMMIT');
    return {modo:aplicar?'aplicado':'comparacion_solo_lectura',cambios,retiradas,omitidas};
  } catch(error) {await cliente.query('ROLLBACK').catch(()=>{});throw error;}
}
