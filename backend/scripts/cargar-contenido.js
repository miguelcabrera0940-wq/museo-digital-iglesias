// Por defecto SOLO archivo local. No carga .env, no modifica secretos ni llama a la API.
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';
import { prepararCarga, huellaCarga, vistaPrevia, ejecutarCarga, ErrorCarga } from '../src/carga-publica.js';
import { opcionesConexion } from '../src/db.js';

async function conexionPrivada() {
  if(!process.stdin.isTTY)throw new ErrorCarga('TERMINAL_INTERACTIVA_REQUERIDA');
  process.stderr.write('Conexión del operador autorizado para la carga (oculta): ');
  const salida=new Writable({write(_datos,_encoding,done){done();}});
  const rl=createInterface({input:process.stdin,output:salida,terminal:true});
  try { return await new Promise(resolve=>rl.question('',resolve)); }
  finally {rl.close();process.stderr.write('\n');}
}
let cliente,etapa='archivo';
try {
  const {values}=parseArgs({options:{archivo:{type:'string',default:fileURLToPath(new URL('../data/carga-publica.json',import.meta.url))},
    'vista-previa':{type:'boolean'},comparar:{type:'boolean'},aplicar:{type:'string'}}});
  if([values['vista-previa'],values.comparar,values.aplicar!==undefined].filter(Boolean).length>1)throw new ErrorCarga('MODO_INVALIDO');
  if((await stat(values.archivo)).size>512*1024)throw new ErrorCarga('ARCHIVO_DEMASIADO_GRANDE');
  const bytes=await readFile(values.archivo),huella=huellaCarga(bytes);
  let datos;try{datos=JSON.parse(bytes.toString('utf8'));}catch{throw new ErrorCarga('JSON_INVALIDO');}
  const operaciones=prepararCarga(datos);
  if(!values.comparar && values.aplicar===undefined) {
    console.info(JSON.stringify(vistaPrevia(operaciones,huella),null,2));
  } else {
    if(values.aplicar!==undefined && (!/^[a-f0-9]{64}$/.test(values.aplicar)||values.aplicar!==huella))throw new ErrorCarga('HUELLA_NO_COINCIDE');
    if(!operaciones.length)throw new ErrorCarga('LOTE_VACIO');
    etapa='conexion';
    const url=await conexionPrivada();
    const {Client}=await import('pg');cliente=new Client(opcionesConexion(url));
    await cliente.connect();
    etapa='carga';
    const resultado=await ejecutarCarga(cliente,operaciones,{aplicar:values.aplicar!==undefined});
    console.info(JSON.stringify({huella_sha256:huella,...resultado},null,2));
  }
} catch(error) {
  // Nunca imprimir mensaje original, conexión, trazas o errores SQL/JSON con contenido de entrada.
  const codigo=error instanceof ErrorCarga?error.codigo:'FALLO_CARGA';
  console.error(JSON.stringify({etapa:error.etapa??etapa,codigo}));process.exitCode=1;
} finally {if(cliente)await cliente.end().catch(()=>{});}
