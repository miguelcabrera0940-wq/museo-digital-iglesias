import { ErrorApi } from './errores.js';
import { estados } from './catalogo.js';

const camposIglesia = 'id, slug, estado, ciudad, nombre, descripcion, historia, direccion, latitud, longitud, telefono, foto_exterior, foto_interior, fuente, es_ejemplo';
const camposMaterial = `m.id, m.iglesia_id, m.categoria_id, m.tipo, m.titulo, m.descripcion_publica,
  m.imagen_publica, m.visibilidad, m.fuente, m.es_ejemplo,
  (m.visibilidad='publico' AND EXISTS(SELECT 1 FROM public.documentos d WHERE d.material_id=m.id)) AS tiene_documento`;

function noEncontrado() { throw new ErrorApi(404, 'NOT_FOUND', 'El recurso solicitado no existe.'); }
function validarId(id) {
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new ErrorApi(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', { id: 'Debe ser un UUID válido.' });
  }
}

export function validarFecha(fecha) {
  let valida = typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha);
  if (valida) {
    const [anio, mes, dia] = fecha.split('-').map(Number);
    const bisiesto = anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0);
    const dias = [31, bisiesto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    valida = anio >= 1 && mes >= 1 && mes <= 12 && dia >= 1 && dia <= dias[mes - 1];
  }
  if (!valida) throw new ErrorApi(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', {
    fecha: 'Debe ser una fecha real en formato YYYY-MM-DD.',
  });
  return fecha;
}

function fichaPublica(m) {
  const { id, iglesia_id, categoria_id, tipo, titulo, descripcion_publica,
    imagen_publica, visibilidad, fuente, es_ejemplo } = m;
  return { id, iglesia_id, categoria_id, tipo, titulo, descripcion_publica,
    imagen_publica, visibilidad, fuente, es_ejemplo, bloqueado: visibilidad === 'privado',
    tiene_documento: visibilidad === 'publico' && Boolean(m.tiene_documento) };
}

// Consultas fijas y valores separados. Nunca se importan datos de demostración aquí.
export function crearLecturas(consultar) {
  async function iglesia(slug) {
    const [fila] = await consultar(`SELECT ${camposIglesia} FROM public.iglesias WHERE slug=$1`, [slug]);
    return fila ?? noEncontrado();
  }
  return {
    listarIglesias(estado) {
      if (estado !== undefined && (typeof estado !== 'string' || !estados.includes(estado))) {
        throw new ErrorApi(400,'VALIDATION_ERROR','Revisa los campos indicados.',{estado:'Selecciona yucatan, campeche o puebla.'});
      }
      return consultar(`SELECT ${camposIglesia} FROM public.iglesias
        WHERE ($1::text IS NULL OR estado=$1)
        ORDER BY CASE estado WHEN 'yucatan' THEN 1 WHEN 'campeche' THEN 2 WHEN 'puebla' THEN 3 END,
          CASE slug WHEN 'catedral' THEN 1 WHEN 'tercera-orden' THEN 2 WHEN 'santa-lucia' THEN 3
            WHEN 'santa-ana' THEN 4 WHEN 'catedral-campeche' THEN 5 WHEN 'dulce-nombre-jesus' THEN 6
            WHEN 'catedral-puebla' THEN 7 WHEN 'la-compania' THEN 8 END, id`,[estado ?? null]);
    },
    obtenerIglesia: iglesia,
    async listarMateriales(slug, categoria) {
      if (categoria !== undefined && !['libros-documentos', 'objetos'].includes(categoria)) {
        // Conservar precedencia histórica: iglesia desconocida404 antes de categoría inválida400.
        await iglesia(slug);
        throw new ErrorApi(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', {
          categoria: 'Selecciona libros-documentos u objetos.',
        });
      }
      const filas = await consultar(`SELECT i.id AS iglesia_encontrada, ${camposMaterial}
        FROM public.iglesias i LEFT JOIN public.materiales m
          ON m.iglesia_id=i.id AND NOT m.retirado_publico AND ($2::text IS NULL OR m.categoria_id=$2)
        WHERE i.slug=$1 ORDER BY m.id`, [slug, categoria ?? null]);
      if(!filas.length)noEncontrado();
      return filas.filter(m=>m.id!==null).map(fichaPublica);
    },
    async obtenerMaterial(id) {
      validarId(id);
      const [fila] = await consultar(`SELECT ${camposMaterial} FROM public.materiales m WHERE m.id=$1 AND NOT m.retirado_publico`, [id]);
      if (!fila) noEncontrado();
      return fichaPublica(fila);
    },
    async obtenerDocumento(id) {
      validarId(id);
      // Una sola instantánea SQL: revalida visibilidad junto al documento y sus páginas.
      const [fila] = await consultar(`SELECT m.visibilidad, d.material_id, d.titulo, d.es_ejemplo,
        COALESCE(jsonb_agg(jsonb_build_object('numero',p.numero,'texto',p.texto,'imagen_url',p.imagen_url)
          ORDER BY p.numero) FILTER (WHERE p.numero IS NOT NULL),'[]'::jsonb) AS paginas
        FROM public.materiales m
        LEFT JOIN public.documentos d ON d.material_id=m.id AND m.visibilidad='publico'
        LEFT JOIN public.paginas p ON p.material_id=d.material_id
        WHERE m.id=$1 AND NOT m.retirado_publico GROUP BY m.id, m.visibilidad, d.material_id, d.titulo, d.es_ejemplo`, [id]);
      if (!fila) noEncontrado();
      if (fila.visibilidad !== 'publico') throw new ErrorApi(403, 'FORBIDDEN', 'Este documento es de acceso reservado.');
      if (!fila.material_id) noEncontrado();
      const { material_id, titulo, es_ejemplo, paginas } = fila;
      return { material_id, titulo, es_ejemplo, paginas };
    },
    async listarHorarios(slug) {
      const i = await iglesia(slug);
      return consultar(`SELECT id, iglesia_id, dia_semana, left(hora::text,5) AS hora, nota, es_ejemplo
        FROM public.horarios WHERE iglesia_id=$1 ORDER BY dia_semana, hora, id`, [i.id]);
    },
    async listarActividades(slug, fecha) {
      validarFecha(fecha);
      const i = await iglesia(slug);
      return consultar(`SELECT id, iglesia_id, tipo, titulo, to_char(fecha,'YYYY-MM-DD') AS fecha,
        left(hora_inicio::text,5) AS hora_inicio, left(hora_fin::text,5) AS hora_fin,
        descripcion, nota_visitas, es_ejemplo FROM public.actividades
        WHERE iglesia_id=$1 AND fecha=$2::date ORDER BY hora_inicio, id`, [i.id, fecha]);
    },
    async listarTramites(slug) {
      const filas=await consultar(`SELECT i.id AS iglesia_encontrada,t.id,t.iglesia_id,t.tipo,t.titulo,t.requisitos,t.fuente,t.estado_verificacion
        FROM public.iglesias i LEFT JOIN public.tramites t ON t.iglesia_id=i.id WHERE i.slug=$1
        ORDER BY CASE t.tipo WHEN 'bautizos' THEN 1 WHEN 'bodas' THEN 2 WHEN 'misas_difuntos' THEN 3
          WHEN 'otros' THEN 4 WHEN 'urnas_nichos' THEN 5 END,t.id`,[slug]);
      if(!filas.length)noEncontrado();
      return filas.filter(t=>t.id!==null).map(({iglesia_encontrada,...t})=>t);
    },
  };
}
