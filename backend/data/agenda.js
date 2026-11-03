import iglesias from './iglesias.json' with { type: 'json' };

// Agenda ficticia de demostración. Días y horas civiles de America/Merida.
// Los eventos tienen fechas fijas; no se inventan eventos para la fecha consultada.
export const horarios = iglesias.flatMap((iglesia, c) => {
  const lista = [];
  const tarde = ['19:00', '18:30', '18:00', '17:30'][c];
  for (let dia = 0; dia <= 6; dia++) {
    if (c === 2 && dia === 1) continue; // Horario de lunes de Santa Lucía por confirmar.
    for (const hora of dia === 0 ? ['08:00', '10:00', tarde] : ['07:00', tarde]) {
      lista.push({
        id: `30000000-0000-4000-8000-${String(c * 100 + lista.length).padStart(12, '0')}`,
        iglesia_id: iglesia.id, dia_semana: dia, hora,
        nota: dia === 0 ? 'Horario dominical de demostración, no verificado.' : null,
        es_ejemplo: true,
      });
    }
  }
  return lista;
});

export const actividades = iglesias.flatMap((iglesia, c) => [
  {
    fecha: '2026-10-24', tipo: 'visita', titulo: 'Visita guiada de ejemplo',
    hora_inicio: '10:00', hora_fin: '12:00',
    descripcion: 'Recorrido ficticio de demostración; no es una convocatoria real.',
    nota_visitas: 'Nota de ejemplo: la disponibilidad de visita está por confirmar.',
  },
  {
    fecha: '2026-10-24', tipo: 'bautizo', titulo: 'Bautizos de demostración',
    hora_inicio: '12:30', hora_fin: null,
    descripcion: 'Celebración ficticia, sin inscripciones ni datos personales.', nota_visitas: null,
  },
  {
    fecha: '2026-10-25', tipo: 'difuntos', titulo: 'Misa por difuntos de ejemplo',
    hora_inicio: '17:00', hora_fin: '18:00',
    descripcion: 'Evento ficticio con fecha concreta, independiente del horario habitual.', nota_visitas: null,
  },
].map((actividad, k) => ({
  id: `40000000-0000-4000-8000-${String(c * 100 + k).padStart(12, '0')}`,
  iglesia_id: iglesia.id, ...actividad, es_ejemplo: true,
})));
