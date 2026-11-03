import iglesias from './iglesias.json' with { type: 'json' };

// Solo servidor. Todos los textos y documentos son ficticios, incluso los privados.
const muestras = [
  ['libro', 'Crónica ficticia de la parroquia', 'publico', true],
  ['libro', 'Registro de ejemplo de festividades', 'publico', true],
  ['documento', 'Carta ficticia de fundación', 'publico', true],
  ['libro', 'Libro reservado de ejemplo', 'privado', true],
  ['libro', 'Álbum de muestra aún sin digitalizar', 'publico', false],
  ['documento', 'Documento reservado de ejemplo', 'privado', true],
  ['objeto', 'Cáliz de ejemplo', 'publico', false],
  ['objeto', 'Campana de muestra', 'publico', false],
  ['objeto', 'Pieza reservada de ejemplo', 'privado', false],
];

export const materiales = iglesias.flatMap((iglesia, c) =>
  muestras.map(([tipo, titulo, visibilidad, conDocumento], k) => {
    const id = `20000000-0000-4000-8000-${String(c * 100 + k).padStart(12, '0')}`;
    return {
      id, iglesia_id: iglesia.id,
      categoria_id: tipo === 'objeto' ? 'objetos' : 'libros-documentos',
      tipo, titulo, visibilidad,
      descripcion_publica: 'Descripción pública de demostración. Material ficticio; no pertenece a un archivo parroquial real.',
      imagen_publica: null, fuente: null, es_ejemplo: true,
      descripcion_interna: 'Nota interna ficticia, exclusiva del servidor.',
      documento: conDocumento ? {
        material_id: id, titulo, es_ejemplo: true,
        paginas: Array.from({ length: 7 }, (_, n) => ({
          numero: n + 1,
          texto: `${visibilidad === 'privado' ? 'Contenido reservado ficticio' : 'Texto público ficticio'} de «${titulo}», página ${n + 1}.\n\nEjemplo de demostración sin datos parroquiales reales.`,
          imagen_url: null,
        })),
      } : null,
    };
  }),
);
