// Generador LOCAL de SQL revisable. No conecta ni ejecuta SQL.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
export function generarCatalogo(iglesias) {
const literal=v=>typeof v==='number'?String(v):"'"+v.replaceAll("'","''")+"'";
let sql=`-- Generado desde data/iglesias-fase2.json. Revisar después de 009.
-- UNA VEZ, en transacción: un conflicto aborta, nunca sobrescribe datos existentes.
-- Información pendiente: texto vacío, teléfonos/fotos NULL, sin contenido histórico inventado.
BEGIN;
INSERT INTO public.iglesias (id,slug,estado,ciudad,nombre,latitud,longitud,fuente,descripcion,historia,direccion,telefono,foto_exterior,foto_interior,es_ejemplo) VALUES\n`;
sql+=iglesias.map(i=>'  ('+['id','slug','estado','ciudad','nombre','latitud','longitud','fuente'].map(k=>literal(i[k])).join(',')+",'','','',NULL,NULL,NULL,true)").join(',\n')+';\n';
sql+=`-- Cuatro guías vacías para poder editarlas con PATCH existente; no requisitos inventados.
INSERT INTO public.tramites (iglesia_id,tipo,titulo,requisitos,fuente,estado_verificacion)
SELECT i.id,t.tipo,t.titulo,'{}'::text[],NULL,'por_confirmar'
FROM public.iglesias i CROSS JOIN (VALUES
  ('bautizos','Bautizos'),('bodas','Bodas'),('misas_difuntos','Misas por difuntos'),('otros','Otros')) AS t(tipo,titulo)
WHERE i.slug IN (${iglesias.map(i=>literal(i.slug)).join(',')});
-- Materiales, documentos, páginas, horarios y actividades nuevos permanecen vacíos.
-- Sin UPDATE de Mérida, usuarios, cuenta global, sesiones, roles ni políticas.
COMMIT;
`;
return sql;
}
if (process.argv[1]===fileURLToPath(import.meta.url)) {
  const datos=JSON.parse(await readFile(new URL('../data/iglesias-fase2.json',import.meta.url),'utf8'));
  process.stdout.write(generarCatalogo(datos));
}
