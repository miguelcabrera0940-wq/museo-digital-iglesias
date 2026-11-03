// Fixtures de pruebas conservadas; producción usa lecturas.js y PostgreSQL.
import iglesias from '../data/iglesias.json' with { type: 'json' };
import { horarios, actividades } from '../data/agenda.js';
import { ErrorApi } from './errores.js';

function iglesiaDe(slug) {
  const iglesia = iglesias.find((i) => i.slug === slug);
  if (!iglesia) throw new ErrorApi(404, 'NOT_FOUND', 'El recurso solicitado no existe.');
  return iglesia;
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

export function listarHorarios(slug) {
  const iglesia = iglesiaDe(slug);
  return horarios.filter((h) => h.iglesia_id === iglesia.id)
    .sort((a, b) => a.dia_semana - b.dia_semana || a.hora.localeCompare(b.hora) || a.id.localeCompare(b.id));
}

export function listarActividades(slug, fecha) {
  const iglesia = iglesiaDe(slug);
  validarFecha(fecha);
  // Comparar el calendario local literalmente: sin Date, UTC ni zona del servidor.
  // [] no describe apertura/cierre ni modifica las misas recurrentes.
  return actividades.filter((a) => a.iglesia_id === iglesia.id && a.fecha === fecha)
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio) || a.id.localeCompare(b.id));
}
