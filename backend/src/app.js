import express from 'express';
import { ErrorApi } from './errores.js';
import { crearLecturas } from './lecturas.js';
import { consultar } from './db.js';
import { crearRouterAdmin } from './admin/rutas.js';
import { medirMapa } from './medicion-mapa.js';

export function crearApp(lecturas = crearLecturas(consultar), admin = {}) {
  const app = express();
  app.disable('x-powered-by');

  function noEncontrado(res) {
    return res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'El recurso solicitado no existe.' },
    });
  }

  // La ruta pública conserva su conexión y proyección incluso con cookie de admin.
  app.get('/api/iglesias', async (req, res) => {
    res.json({ data: await medirMapa(req,res,()=>lecturas.listarIglesias(req.query.estado)) });
  });

  app.get('/api/iglesias/:slug', async (req, res) => {
    res.json({ data: await lecturas.obtenerIglesia(req.params.slug) });
  });

  app.get('/api/iglesias/:slug/materiales', async (req, res) => {
    res.json({ data: await lecturas.listarMateriales(req.params.slug, req.query.categoria) });
  });

  app.get('/api/materiales/:id', async (req, res) => {
    res.json({ data: await lecturas.obtenerMaterial(req.params.id) });
  });

  app.get('/api/materiales/:id/documento', async (req, res) => {
    // Evita conservar documentos que puedan reclasificarse como privados.
    res.set('Cache-Control', 'no-store');
    res.json({ data: await lecturas.obtenerDocumento(req.params.id) });
  });

  app.get('/api/iglesias/:slug/horarios', async (req, res) => {
    res.json({ data: await lecturas.listarHorarios(req.params.slug) });
  });

  app.get('/api/iglesias/:slug/actividades', async (req, res) => {
    res.json({ data: await lecturas.listarActividades(req.params.slug, req.query.fecha) });
  });

  app.get('/api/iglesias/:slug/tramites', async (req, res) => {
    res.json({ data: await lecturas.listarTramites(req.params.slug) });
  });

  app.use('/api/admin', crearRouterAdmin(admin));
  app.use((_req, res) => noEncontrado(res));
  app.use(manejarError);
  return app;
}

export function manejarError(error, _req, res, _next) {
  if (error instanceof ErrorApi) {
    if (error.retryAfter) res.set('Retry-After', String(error.retryAfter));
    return res.status(error.status).json({ error: {
      code: error.code, message: error.message,
      ...(error.fields ? { fields: error.fields } : {}),
    } });
  }
  if (['entity.too.large', 'entity.parse.failed', 'charset.unsupported',
    'encoding.unsupported', 'request.size.invalid'].includes(error.type)) {
    const grande = error.type === 'entity.too.large';
    return res.status(grande ? 413 : 400).json({ error: {
      code: grande ? 'PAYLOAD_TOO_LARGE' : 'VALIDATION_ERROR',
      message: grande ? 'El cuerpo supera el tamaño permitido.' : 'El cuerpo debe ser JSON válido.',
    } });
  }
  if (error instanceof URIError && error.status === 400) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'La ruta contiene caracteres inválidos.' },
    });
  }
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'No se pudo completar la solicitud.' },
  });
}

// Importable desde una función Vercel: escuchar un puerto solo en server.js.
export default crearApp();
