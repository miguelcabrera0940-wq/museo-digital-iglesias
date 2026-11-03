// Fixtures de pruebas conservadas; producción usa lecturas.js y PostgreSQL.
import iglesias from '../data/iglesias.json' with { type: 'json' };
import { tramites } from '../data/tramites.js';
import { ErrorApi } from './errores.js';

export function listarTramites(slug) {
  const iglesia = iglesias.find((i) => i.slug === slug);
  if (!iglesia) throw new ErrorApi(404, 'NOT_FOUND', 'El recurso solicitado no existe.');
  // Orden estable de las cuatro guías preincluidas. Teléfono pertenece a Iglesia.
  return tramites.filter((guia) => guia.iglesia_id === iglesia.id);
}
