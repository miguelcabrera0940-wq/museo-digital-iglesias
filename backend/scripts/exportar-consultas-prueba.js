// Captura consultas para PREPARE/EXECUTE local; no conecta ni lee DATABASE_URL.
import { crearLecturas } from '../src/lecturas.js';
import { comprobarRolSql } from '../src/db.js';

const id = '20000000-0000-4000-8000-000000000000';
const iglesiaId = '00000000-0000-4000-8000-000000000001';
const consultas = [{ sql: comprobarRolSql, parametros: [] }];
const lecturas = crearLecturas(async (sql, parametros = []) => {
  consultas.push({ sql, parametros });
  if(sql.includes('LEFT JOIN public.materiales')||sql.includes('LEFT JOIN public.tramites'))return [{iglesia_encontrada:iglesiaId,id:null}];
  if (sql.includes('WHERE slug=$1')) return [{ id: iglesiaId }];
  if (sql.includes('GROUP BY')) return [{ visibilidad: 'publico', material_id: id, paginas: [] }];
  if (sql.includes('WHERE m.id=$1')) return [{ id, visibilidad: 'publico' }];
  return [];
});
await lecturas.listarIglesias();
for (const estado of ['yucatan','campeche','puebla']) await lecturas.listarIglesias(estado);
await lecturas.obtenerIglesia('catedral');
await lecturas.listarMateriales('catedral');
await lecturas.listarMateriales('catedral', 'objetos');
await lecturas.obtenerMaterial(id);
await lecturas.obtenerDocumento(id);
await lecturas.listarHorarios('catedral');
await lecturas.listarActividades('catedral', '2026-10-24');
await lecturas.listarTramites('catedral');
process.stdout.write(JSON.stringify(consultas));
