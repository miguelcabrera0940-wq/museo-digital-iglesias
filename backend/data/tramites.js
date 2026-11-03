import iglesias from './iglesias.json' with { type: 'json' };

// Guías ficticias: no son requisitos oficiales ni información parroquial verificada.
const guias = [
  ['bautizos', 'Guía de bautizos', [
    'Ejemplo ficticio pendiente de confirmar: consultar si se solicita una constancia de nacimiento.',
    'Ejemplo ficticio pendiente de confirmar: consultar si hay una plática de preparación.',
  ]],
  ['bodas', 'Guía de bodas', [
    'Ejemplo ficticio pendiente de confirmar: consultar qué constancias se requieren para la celebración.',
    'Ejemplo ficticio pendiente de confirmar: preguntar por las pláticas de preparación.',
  ]],
  ['misas_difuntos', 'Guía de misas por difuntos', [
    'Ejemplo ficticio pendiente de confirmar: consultar cómo indicar la intención de la misa.',
    'Ejemplo ficticio pendiente de confirmar: preguntar por las fechas y horas disponibles.',
  ]],
  ['otros', 'Guía de otros trámites', [
    'Ejemplo ficticio pendiente de confirmar: consultar directamente cuál es el trámite necesario.',
    'Ejemplo ficticio pendiente de confirmar: preguntar por los documentos que correspondan al trámite.',
  ]],
];

export const tramites = iglesias.flatMap((iglesia, c) =>
  guias.map(([tipo, titulo, requisitos], k) => ({
    id: `50000000-0000-4000-8000-${String(c * 10 + k).padStart(12, '0')}`,
    iglesia_id: iglesia.id, tipo, titulo,
    requisitos: [...requisitos], fuente: null, estado_verificacion: 'ejemplo',
  })),
);
