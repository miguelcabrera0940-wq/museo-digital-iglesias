// DATOS DE DEMOSTRACIÓN. Solo se cargan con VITE_USAR_MOCKS=true. Se retiran en la integración.
// Nombres y coordenadas son los aprobados; descripciones, fotos y teléfono son de ejemplo.
const base = {
  historia: 'Texto de demostración. La historia verificada, con su fuente, se cargará desde la administración.',
  estado: 'yucatan',
  ciudad: 'Mérida',
  direccion: 'Centro Histórico, Mérida, Yucatán, México',
  telefono: null,
  foto_exterior: null,
  foto_interior: null,
  fuente: null,
  es_ejemplo: true,
};

export const IGLESIAS = [
  { ...base, id: '00000000-0000-4000-8000-000000000001', slug: 'catedral', nombre: 'Catedral de San Ildefonso', descripcion: 'Descripción de demostración de la Catedral.', latitud: 20.96715, longitud: -89.62254 },
  { ...base, id: '00000000-0000-4000-8000-000000000002', slug: 'tercera-orden', nombre: 'Iglesia de Jesús o Tercera Orden', descripcion: 'Descripción de demostración de la Iglesia de Jesús.', latitud: 20.96878, longitud: -89.6224 },
  { ...base, id: '00000000-0000-4000-8000-000000000003', slug: 'santa-lucia', nombre: 'Iglesia de Santa Lucía', descripcion: 'Descripción de demostración de la Iglesia de Santa Lucía.', latitud: 20.97103, longitud: -89.62192 },
  { ...base, id: '00000000-0000-4000-8000-000000000004', slug: 'santa-ana', nombre: 'Iglesia de Santa Ana', telefono: '(999) 000-0000 (número de ejemplo)', descripcion: 'Descripción de demostración de la Iglesia de Santa Ana.', latitud: 20.9765, longitud: -89.62097 },
  // Campeche y Puebla: como en el catálogo real, sin descripción, historia, dirección ni teléfono.
  ...[
    ['5', 'catedral-campeche', 'campeche', 'San Francisco de Campeche', 'Catedral de Nuestra Señora de la Purísima Concepción', 19.84619, -90.53616],
    ['6', 'dulce-nombre-jesus', 'campeche', 'San Francisco de Campeche', 'Templo del Dulce Nombre de Jesús', 19.84499, -90.53574],
    ['7', 'catedral-puebla', 'puebla', 'Puebla de Zaragoza', 'Catedral de Puebla', 19.04285, -98.19839],
    ['8', 'la-compania', 'puebla', 'Puebla de Zaragoza', 'Templo del Espíritu Santo (La Compañía)', 19.04257, -98.1954],
  ].map(([n, slug, estado, ciudad, nombre, latitud, longitud]) => ({
    ...base, id: `00000000-0000-4000-8000-00000000000${n}`, slug, estado, ciudad, nombre, latitud, longitud,
    descripcion: '', historia: '', direccion: '',
  })),
];
