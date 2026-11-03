// Fixtures de pruebas conservadas; producción usa lecturas.js y PostgreSQL.
import iglesias from '../data/iglesias.json' with { type: 'json' };
import { materiales } from '../data/materiales.js';
import { ErrorApi } from './errores.js';

function noEncontrado() {
  throw new ErrorApi(404, 'NOT_FOUND', 'El recurso solicitado no existe.');
}

export function fichaPublica(material) {
  const { id, iglesia_id, categoria_id, tipo, titulo, descripcion_publica,
    imagen_publica, visibilidad, fuente, es_ejemplo } = material;
  // Lista explícita: nunca propagar documento, notas internas o rutas privadas.
  return { id, iglesia_id, categoria_id, tipo, titulo, descripcion_publica,
    imagen_publica, visibilidad, fuente, es_ejemplo,
    bloqueado: visibilidad === 'privado',
    tiene_documento: visibilidad === 'publico' && Boolean(material.documento) };
}

export function listarMateriales(slug, categoria) {
  const iglesia = iglesias.find((i) => i.slug === slug);
  if (!iglesia) noEncontrado();
  if (categoria !== undefined && !['libros-documentos', 'objetos'].includes(categoria)) {
    throw new ErrorApi(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', {
      categoria: 'Selecciona libros-documentos u objetos.',
    });
  }
  return materiales.filter((m) => m.iglesia_id === iglesia.id &&
    (categoria === undefined || m.categoria_id === categoria)).map(fichaPublica);
}

function buscarMaterial(id) {
  if (typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new ErrorApi(400, 'VALIDATION_ERROR', 'Revisa los campos indicados.', {
      id: 'Debe ser un UUID válido.',
    });
  }
  return materiales.find((m) => m.id === id.toLowerCase()) ?? noEncontrado();
}

export function obtenerMaterial(id) {
  return fichaPublica(buscarMaterial(id));
}

export function obtenerDocumento(id) {
  const material = buscarMaterial(id);
  // Revisar visibilidad en cada lectura, incluso si el material no tiene documento.
  if (material.visibilidad !== 'publico') {
    throw new ErrorApi(403, 'FORBIDDEN', 'Este documento es de acceso reservado.');
  }
  if (!material.documento) noEncontrado();
  return material.documento;
}
