// Solo genera texto SQL en stdout; no abre conexiones ni ejecuta sentencias.
import { materiales } from '../data/materiales.js';
import { horarios, actividades } from '../data/agenda.js';
import { tramites } from '../data/tramites.js';

function valor(dato) {
  if (dato === null || dato === undefined) return 'NULL';
  if (typeof dato === 'boolean' || typeof dato === 'number') return String(dato);
  if (Array.isArray(dato)) return `ARRAY[${dato.map(valor).join(', ')}]::text[]`;
  return `'${dato.replaceAll("'", "''")}'`;
}

function insertar(tabla, columnas, filas) {
  return `INSERT INTO public.${tabla} (${columnas.join(', ')}) VALUES\n` +
    filas.map((fila) => `  (${columnas.map((c) => valor(fila[c])).join(', ')})`).join(',\n') + ';\n';
}

const documentos = materiales.flatMap((m) => m.documento ? [m.documento] : []);
const paginas = documentos.flatMap((d) => d.paginas.map((p) => ({ material_id: d.material_id, ...p })));
const fichas = materiales.map((m) => m.tipo === 'objeto' ? {
  ...m, descripcion_publica: 'Historia de demostración de este objeto ficticio. No representa una pieza ni información histórica real.',
} : m);

console.log([
  '-- REVISAR. Semillas ficticias; ejecutar una sola vez tras 001 y 002, como propietario de la base.',
  '-- Generado desde datos locales: node backend/sql/generar_semillas.js',
  '-- Iglesias ya incluidas en 001. Sin autenticación ni administrador. Sin archivos PDF.',
  'BEGIN;',
  'SET LOCAL standard_conforming_strings = on;',
  insertar('categorias', ['id', 'nombre'], [
    { id: 'libros-documentos', nombre: 'Libros y documentos' },
    { id: 'objetos', nombre: 'Objetos' },
  ]),
  insertar('materiales', ['id', 'iglesia_id', 'categoria_id', 'tipo', 'titulo', 'descripcion_publica',
    'descripcion_interna', 'imagen_publica', 'visibilidad', 'fuente', 'es_ejemplo'], fichas),
  insertar('documentos', ['material_id', 'titulo', 'es_ejemplo'], documentos),
  insertar('paginas', ['material_id', 'numero', 'texto', 'imagen_url'], paginas),
  insertar('horarios', ['id', 'iglesia_id', 'dia_semana', 'hora', 'nota', 'es_ejemplo'], horarios),
  insertar('actividades', ['id', 'iglesia_id', 'tipo', 'titulo', 'fecha', 'hora_inicio', 'hora_fin',
    'descripcion', 'nota_visitas', 'es_ejemplo'], actividades),
  insertar('tramites', ['id', 'iglesia_id', 'tipo', 'titulo', 'requisitos', 'fuente', 'estado_verificacion'], tramites),
  'COMMIT;',
].join('\n\n'));
