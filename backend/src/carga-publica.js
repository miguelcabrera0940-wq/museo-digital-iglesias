// Carga operativa de contenido público. Nunca se importa desde la API.
import { createHash } from 'node:crypto';
import { validarCampos, validarUuid } from './admin/gestion.js';

import { slugsIglesias as slugs } from './catalogo.js';
const tipos=['bautizos','bodas','misas_difuntos','otros','urnas_nichos'];
export const camposCarga={
  iglesias:['nombre','descripcion','historia','direccion','latitud','longitud','telefono','foto_exterior','foto_interior','fuente','es_ejemplo'],
  materiales:['categoria_id','tipo','titulo','descripcion_publica','imagen_publica','fuente','es_ejemplo'],
  horarios:['dia_semana','hora','nota','es_ejemplo'],
  tramites:['titulo','requisitos','fuente','estado_verificacion'],
};
export class ErrorCarga extends Error { constructor(codigo) { super(codigo);this.codigo=codigo; } }
function exigir(condicion,codigo='DATOS_INVALIDOS') { if(!condicion)throw new ErrorCarga(codigo); }
function objeto(v) { return v!==null && typeof v==='object' && !Array.isArray(v); }
function claves(v,permitidas) { exigir(objeto(v));exigir(Object.keys(v).every(k=>permitidas.includes(k)),'CAMPO_NO_ADMITIDO'); }
function texto(valor,max,nullable=false) {
  if(nullable && valor===null)return null;
  exigir(typeof valor==='string' && valor.trim().length>0 && [...valor.trim()].length<=max);
  return valor.trim();
}
function imagen(valor) {
  if(valor===null)return null;
  const v=texto(valor,2000);
  // Solo referencias aptas para publicación; nunca datos incrustados ni rutas de API/documentos.
  const url=new URL(v,'https://ejemplo.invalid');
  exigir((v.startsWith('/')&&!v.startsWith('//')||/^https?:\/\//.test(v)) &&
    ['http:','https:'].includes(url.protocol) && !url.username && !url.password &&
    !url.pathname.startsWith('/api/') && !/\.(pdf|html?)(?:$)/i.test(url.pathname),'IMAGEN_NO_ADMITIDA');
  return v;
}
function cambios(tabla,datos) {
  claves(datos,camposCarga[tabla]);
  const limpio={};
  for(const [k,v] of Object.entries(datos)) {
    if(k==='es_ejemplo') { exigir(v===true,'PROMOCION_NO_PERMITIDA');limpio[k]=true; }
    else if(k==='estado_verificacion') {
      exigir(['ejemplo','por_confirmar'].includes(v),'PROMOCION_NO_PERMITIDA');limpio[k]=v;
    } else if(['imagen_publica','foto_exterior','foto_interior'].includes(k))limpio[k]=imagen(v);
    else if(['latitud','longitud'].includes(k)) {
      const max=k==='latitud'?90:180;exigir(typeof v==='number'&&Number.isFinite(v)&&Math.abs(v)<=max);limpio[k]=v;
    } else if(k==='direccion'&&v==='')limpio[k]='';
    else if(['nombre','direccion','fuente'].includes(k))limpio[k]=texto(v,k==='nombre'?160:1000,k==='fuente');
    else Object.assign(limpio,validarCampos(tabla,{[k]:v}));
  }
  // Validar también la coherencia cuando ambos valores llegan en el mismo PATCH.
  if(tabla==='materiales' && limpio.tipo && limpio.categoria_id)validarCampos(tabla,{tipo:limpio.tipo,categoria_id:limpio.categoria_id});
  return limpio;
}
export function prepararCarga(datos) {
  try {
    claves(datos,['version','iglesias']);exigir(datos.version===1&&Array.isArray(datos.iglesias)&&datos.iglesias.length>=1&&datos.iglesias.length<=slugs.length);
    const vistas=new Set(),operaciones=[];
    for(const iglesia of datos.iglesias) {
      claves(iglesia,['slug','informacion','materiales','horarios','tramites']);
      exigir(slugs.includes(iglesia.slug)&&!vistas.has(iglesia.slug),'SLUG_INVALIDO_O_DUPLICADO');vistas.add(iglesia.slug);
      const info=cambios('iglesias',iglesia.informacion);
      if(Object.keys(info).length)operaciones.push({tabla:'iglesias',slug:iglesia.slug,cambios:info});
      for(const tabla of ['materiales','horarios','tramites']) {
        exigir(Array.isArray(iglesia[tabla])&&iglesia[tabla].length<=500);
        const ids=new Set();
        for(const item of iglesia[tabla]) {
          const clave=tabla==='tramites'?'tipo':'id';claves(item,[clave,'cambios']);
          if(clave==='id')validarUuid(item.id);else exigir(tipos.includes(item.tipo));
          const identificador=String(item[clave]).toLowerCase();
          exigir(!ids.has(identificador),'REGISTRO_DUPLICADO');ids.add(identificador);
          const patch=cambios(tabla,item.cambios);exigir(Object.keys(patch).length>0);
          operaciones.push({tabla,slug:iglesia.slug,[clave]:identificador,cambios:patch});
        }
      }
    }
    const global=new Set();
    for(const o of operaciones.filter(o=>o.id)) {
      const key=`${o.tabla}:${o.id}`;exigir(!global.has(key),'REGISTRO_DUPLICADO');global.add(key);
    }
    return operaciones;
  } catch(error) {
    if(error instanceof ErrorCarga)throw error;
    throw new ErrorCarga('DATOS_INVALIDOS');
  }
}
export function huellaCarga(bytes) { return createHash('sha256').update(bytes).digest('hex'); }
export function vistaPrevia(operaciones,huella) {
  return {modo:'vista_previa_sin_conexion',huella_sha256:huella,iglesias:[...new Set(operaciones.map(o=>o.slug))],
    registros_propuestos:operaciones.length,operaciones};
}
const iguales=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
// El cliente debe ser operativo, nunca una credencial propietaria guardada en la API.
// Solo UPDATE de cuatro tablas y columnas de listas cerradas. Cero INSERT/DELETE/DDL/Auth.
export async function ejecutarCarga(cliente,operaciones,{aplicar=false}={}) {
  let abierta=false,etapa='conexion';
  try {
    await cliente.query(aplicar?'BEGIN ISOLATION LEVEL SERIALIZABLE':'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');abierta=true;
    const cambiosReales=[];
    etapa='iglesias';
    const {rows:iglesias}=await cliente.query(`SELECT id,slug FROM public.iglesias ORDER BY slug${aplicar?' FOR UPDATE':''}`);
    exigir(iglesias.every(i=>slugs.includes(i.slug))&&operaciones.every(o=>iglesias.some(i=>i.slug===o.slug)),'IGLESIAS_NO_COINCIDEN');
    for(const o of operaciones) {
      exigir(Object.hasOwn(camposCarga,o.tabla)&&slugs.includes(o.slug),'DATOS_INVALIDOS');
      const campos=Object.keys(o.cambios);exigir(campos.length>0&&campos.every(k=>camposCarga[o.tabla].includes(k)));
      const i=iglesias.find(i=>i.slug===o.slug),identificador=o.tabla==='iglesias'?i.id:o.tabla==='tramites'?o.tipo:o.id;
      const where=o.tabla==='iglesias'?'id=$1':o.tabla==='tramites'?'tipo=$1 AND iglesia_id=$2':'id=$1 AND iglesia_id=$2';
      const params=o.tabla==='iglesias'?[identificador]:[identificador,i.id];
      const seleccion=[...new Set([...campos,...(o.tabla==='materiales'?['visibilidad','categoria_id','tipo']:[])])];
      const columnas=seleccion.map(k=>k==='hora'?"left(hora::text,5) AS hora":k).join(',');
      etapa='lectura_registro';
      const {rows:[actual]}=await cliente.query(`SELECT ${columnas} FROM public.${o.tabla} WHERE ${where}${aplicar?' FOR UPDATE':''}`,params);
      exigir(actual,'REGISTRO_NO_EXISTE_EN_IGLESIA');
      if(o.tabla==='materiales') {
        exigir(actual.visibilidad==='publico','MATERIAL_PRIVADO_PROTEGIDO');
        const tipo=o.cambios.tipo??actual.tipo,categoria_id=o.cambios.categoria_id??actual.categoria_id;
        exigir((tipo==='objeto')===(categoria_id==='objetos'),'CATEGORIA_INCOMPATIBLE');
      }
      const distintos=campos.filter(k=>!iguales(actual[k],o.cambios[k]));
      if(!distintos.length)continue;
      const antes=Object.fromEntries(distintos.map(k=>[k,actual[k]])),despues=Object.fromEntries(distintos.map(k=>[k,o.cambios[k]]));
      cambiosReales.push({tabla:o.tabla,slug:o.slug,...(o.id?{id:o.id}:o.tipo?{tipo:o.tipo}:{}),antes,despues});
      if(aplicar) {
        etapa='actualizacion';
        const valores=distintos.map(k=>o.cambios[k]);
        const filtro=o.tabla==='iglesias'?`id=$${valores.length+1}`:
          `${o.tabla==='tramites'?'tipo':'id'}=$${valores.length+1} AND iglesia_id=$${valores.length+2}`;
        const resultado=await cliente.query(`UPDATE public.${o.tabla} SET ${distintos.map((k,n)=>`${k}=$${n+1}`).join(',')} WHERE ${filtro}`, [...valores,...params]);
        exigir(resultado.rowCount===1,'CONFLICTO_ACTUALIZACION');
      }
    }
    etapa='confirmacion';
    await cliente.query(aplicar?'COMMIT':'ROLLBACK');abierta=false;
    return {modo:aplicar?'aplicado':'comparacion_solo_lectura',registros_modificados:aplicar?cambiosReales.length:0,cambios:cambiosReales};
  } catch(error) {
    if(abierta)await cliente.query('ROLLBACK').catch(()=>{});
    if(error instanceof ErrorCarga)throw error;
    const codigo=['40001','40P01','42501','23514','23503','ECONNREFUSED','EAI_AGAIN','EPERM'].includes(error.code)?error.code:'FALLO_CARGA';
    const seguro=new ErrorCarga(codigo);seguro.etapa=etapa;throw seguro;
  }
}
