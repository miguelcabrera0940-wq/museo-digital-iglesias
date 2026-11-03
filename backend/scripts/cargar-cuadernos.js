// Único cargador de cuadernos. Por defecto solo vista previa local; nunca carga .env.
import { readFile,stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { prepararCuadernos,comprobarImagenes,vistaCuadernos,cargarCuadernos,huellaCarga,ErrorCarga } from '../src/carga-cuadernos.js';
import { privado } from './lib/prompt-privado.js';
import { opcionesConexion } from '../src/db.js';
import { diagnosticar } from '../src/diagnostico-neon.js';
import { prepararObjetos,revisarRecursosObjetos,vistaObjetos,cargarObjetos } from '../src/carga-objetos.js';
let cliente,etapa='archivo';
try {
  const {values}=parseArgs({options:{archivo:{type:'string',default:fileURLToPath(new URL('../data/cuadernos-informativos.json',import.meta.url))},
    'vista-previa':{type:'boolean'},comparar:{type:'boolean'},aplicar:{type:'string'}}});
  if([values['vista-previa'],values.comparar,values.aplicar!==undefined].filter(Boolean).length>1)throw new ErrorCarga('MODO_INVALIDO');
  if((await stat(values.archivo)).size>512*1024)throw new ErrorCarga('ARCHIVO_DEMASIADO_GRANDE');
  const bytes=await readFile(values.archivo),huella=huellaCarga(bytes);
  let datos;try{datos=JSON.parse(bytes.toString('utf8'));}catch{throw new ErrorCarga('JSON_INVALIDO');}
  const esObjeto=Object.hasOwn(datos,'objetos');
  const cuadernos=esObjeto?prepararObjetos(datos):prepararCuadernos(datos);
  const raiz=fileURLToPath(new URL('../../frontend/public',import.meta.url));
  const imagenes=esObjeto?await revisarRecursosObjetos(cuadernos,raiz):await comprobarImagenes(cuadernos,raiz);
  if(!values.comparar && values.aplicar===undefined)console.info(JSON.stringify((esObjeto?vistaObjetos:vistaCuadernos)(cuadernos,huella,imagenes),null,2));
  else {
    if(values.aplicar!==undefined && values.aplicar!==huella)throw new ErrorCarga('HUELLA_NO_COINCIDE');
    etapa='conexion';
    if(!process.stdin.isTTY)throw new ErrorCarga('TERMINAL_INTERACTIVA_REQUERIDA');
    const url=await privado('URL PostgreSQL completa del operador autorizado (oculta; no se guarda): ');
    const {Client}=await import('pg');cliente=new Client(opcionesConexion(url));await cliente.connect();
    etapa='carga';
    const resultado=await (esObjeto?cargarObjetos:cargarCuadernos)(cliente,cuadernos,{aplicar:values.aplicar!==undefined});
    console.info(JSON.stringify({huella_sha256:huella,...resultado},null,2));
  }
} catch(error) {
  console.error(JSON.stringify(error instanceof ErrorCarga?{etapa,codigo:error.codigo}:{etapa,...diagnosticar(error)}));process.exitCode=1;
} finally {if(cliente)await cliente.end().catch(()=>{});}
