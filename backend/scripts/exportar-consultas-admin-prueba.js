// Captura SQL real, sin conectar ni leer secretos/entorno.
import { crearGestion } from '../src/admin/gestion.js';
import { comprobarAdminSql } from '../src/admin/db.js';
import { consumirIntento } from '../src/admin/seguridad.js';
const id='20000000-0000-4000-8000-000000000003',iglesia='00000000-0000-4000-8000-000000000001';
const consultas=[{sql:comprobarAdminSql,parametros:[]}];
const transaccion=async(_rol,fn)=>fn(async(sql,parametros=[])=>{
  consultas.push({sql,parametros});
  if(sql.startsWith('SELECT m.id') && sql.includes('imagen_url IS NOT NULL'))return {rows:[]};
  if(sql.includes('AS ahora'))return {rows:[{ahora:new Date('2026-10-25T12:00:00Z')}]};
  if(sql.includes('SELECT fallos'))return {rows:[{fallos:0,ultimo_fallo:null,bloqueado_hasta:null}]};
  if(sql.startsWith('SELECT id FROM public.iglesias'))return {rows:[{id:iglesia}]};
  return {rows:[{id,visibilidad:'privado',material_id:id,paginas:[]}]};
},{rol:'general',iglesia_id:null});
const g=crearGestion(transaccion);
await g.listarIglesias('prueba');
await g.listarMateriales('prueba','catedral');
await g.obtenerMaterial('prueba',id);await g.obtenerDocumento('prueba',id);
await g.guardar('prueba','iglesias','catedral',{historia:'Ejemplo local',descripcion:'Ejemplo local',telefono:null});
const material={categoria_id:'libros-documentos',tipo:'libro',titulo:'Ejemplo local',descripcion_publica:'Ejemplo ficticio',visibilidad:'privado',descripcion_interna:'Ejemplo reservado',fuente:null};
const horario={dia_semana:1,hora:'12:00',nota:null};
const actividad={tipo:'otro',titulo:'Ejemplo local',fecha:'2026-10-25',hora_inicio:'12:00',hora_fin:null,descripcion:'Ejemplo ficticio',nota_visitas:null};
for(const [tabla,datos]of [['materiales',material],['horarios',horario],['actividades',actividad]]) {
  await g.guardar('prueba',tabla,null,{iglesia_id:iglesia,...datos},true);
  await g.guardar('prueba',tabla,id,datos);
}
await g.guardar('prueba','tramites',id,{titulo:'Ejemplo local',requisitos:['Ejemplo ficticio'],fuente:null,estado_verificacion:'ejemplo'});
await g.eliminar('prueba','horarios',id);await g.eliminar('prueba','actividades',id);
await consumirIntento(transaccion,{secreto:'x'.repeat(40)},'ejemplo@example.invalid',async()=>({ok:true}));
try {await consumirIntento(transaccion,{secreto:'x'.repeat(40)},'ejemplo@example.invalid',async()=>{throw {body:{code:'INVALID_EMAIL_OR_PASSWORD'}};});}catch{}
process.stdout.write(JSON.stringify(consultas));
