// DATOS DE DEMOSTRACIÓN. Solo se cargan con VITE_USAR_MOCKS=true; el backend aún no tiene estos endpoints.
// Esquema exacto de CONTRATO_API v1. Se retiran en la integración.
import { ErrorApi } from '../api/cliente.js';
import { IGLESIAS } from './iglesias.js';

// [tipo, titulo, visibilidad, tiene_documento]
const BASE = [
  ['libro', 'Crónica ficticia de la parroquia', 'publico', true],
  ['libro', 'Registro de ejemplo de festividades', 'publico', true],
  ['documento', 'Carta ficticia de fundación', 'publico', true],
  ['libro', 'Libro reservado de ejemplo', 'privado', true],
  ['libro', 'Álbum de muestra aún sin digitalizar, con un título deliberadamente largo para probar el recorte', 'publico', false],
  ['documento', 'Documento reservado de ejemplo', 'privado', true],
  ['objeto', 'Cáliz de ejemplo', 'publico', false],
  ['objeto', 'Campana de muestra', 'publico', false],
  ['objeto', 'Pieza reservada de ejemplo', 'privado', false],
];

const MATERIALES = IGLESIAS.flatMap((iglesia, c) =>
  (c >= 4 ? [] : BASE).map(([tipo, titulo, visibilidad, doc], k) => {
    const privado = visibilidad === 'privado';
    return {
      id: `20000000-0000-4000-8000-${String(c * 100 + k).padStart(12, '0')}`,
      iglesia_id: iglesia.id,
      categoria_id: tipo === 'objeto' ? 'objetos' : 'libros-documentos',
      tipo,
      titulo,
      descripcion_publica: privado
        ? 'Descripción pública de demostración. El contenido completo es de acceso reservado.'
        : 'Descripción de demostración. Este material es ficticio y no corresponde a ningún archivo parroquial real.',
      imagen_publica: null,
      visibilidad,
      fuente: null,
      es_ejemplo: true,
      bloqueado: privado,
      tiene_documento: doc && !privado, // el contrato oculta este dato en privados
    };
  }),
);

const noEncontrado = () => new ErrorApi(404, { code: 'NOT_FOUND', message: 'No se encontró el material.' });

export function materialesDe(slug) {
  const iglesia = IGLESIAS.find((i) => i.slug === slug);
  if (!iglesia) throw new ErrorApi(404, { code: 'NOT_FOUND', message: 'No se encontró la iglesia.' });
  return MATERIALES.filter((m) => m.iglesia_id === iglesia.id);
}

export function material(id) {
  const m = MATERIALES.find((x) => x.id === id);
  if (!m) throw noEncontrado();
  return m;
}

export function documento(id) {
  const m = material(id);
  if (m.bloqueado) throw new ErrorApi(403, { code: 'FORBIDDEN', message: 'Este documento es de acceso reservado.' });
  if (!m.tiene_documento) throw noEncontrado();
  return {
    material_id: m.id,
    titulo: m.titulo,
    es_ejemplo: true,
    paginas: Array.from({ length: 7 }, (_, n) => ({
      numero: n + 1,
      texto: `Texto ficticio de la página ${n + 1} de «${m.titulo}».\n\nEste contenido es de demostración y no corresponde a ningún archivo parroquial real. Sirve para probar el lector: el avance de páginas, la lectura en dos páginas y el ajuste al móvil.`,
      imagen_url: null,
    })),
  };
}
