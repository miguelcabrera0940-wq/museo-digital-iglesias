// Captura para PREPARE/EXECUTE en PostgreSQL temporal, sin conectar ni leer secretos.
import { prepararCarga, ejecutarCarga } from '../src/carga-publica.js';
const id='20000000-0000-4000-8000-000000000000',iglesia='00000000-0000-4000-8000-000000000001';
const datos={version:1,iglesias:['catedral','tercera-orden','santa-lucia','santa-ana'].map(slug=>({slug,informacion:{},materiales:[],horarios:[],tramites:[]}))};
datos.iglesias[0].informacion={nombre:'Ejemplo de prueba',descripcion:'Ejemplo ficticio',historia:'Ejemplo ficticio',direccion:'Ejemplo ficticio',latitud:20.96715,longitud:-89.62254,telefono:null,foto_exterior:null,foto_interior:null,fuente:null,es_ejemplo:true};
datos.iglesias[0].materiales=[{id,cambios:{categoria_id:'libros-documentos',tipo:'libro',titulo:'Ejemplo ficticio',descripcion_publica:'Ejemplo ficticio',imagen_publica:null,fuente:null,es_ejemplo:true}}];
datos.iglesias[0].horarios=[{id,cambios:{dia_semana:0,hora:'12:00',nota:null,es_ejemplo:true}}];
datos.iglesias[0].tramites=[{tipo:'otros',cambios:{titulo:'Ejemplo ficticio',requisitos:['Ejemplo ficticio'],fuente:null,estado_verificacion:'ejemplo'}}];
const consultas=[];
const cliente={query:async(sql,parametros=[])=>{
  if(!/^(BEGIN|COMMIT|ROLLBACK)/.test(sql))consultas.push({sql,parametros});
  if(sql.startsWith('SELECT id,slug FROM'))return {rows:datos.iglesias.map((i,n)=>({slug:i.slug,id:`00000000-0000-4000-8000-00000000000${n+1}`}))};
  if(sql.startsWith('SELECT'))return {rows:[{id,iglesia_id:iglesia,visibilidad:'publico',categoria_id:'libros-documentos',tipo:'libro'}]};
  return {rows:[],rowCount:1};
}};
await ejecutarCarga(cliente,prepararCarga(datos));
await ejecutarCarga(cliente,prepararCarga(datos),{aplicar:true});
process.stdout.write(JSON.stringify(consultas));
