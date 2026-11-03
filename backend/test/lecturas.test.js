import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearLecturas } from '../src/lecturas.js';
import { manejarError } from '../src/app.js';

const id = '20000000-0000-4000-8000-000000000000';
const iglesiaId = '00000000-0000-4000-8000-000000000001';
const base = { id, iglesia_id: iglesiaId, categoria_id: 'libros-documentos', tipo: 'libro',
  titulo: 'Ejemplo', descripcion_publica: 'Descripción pública', imagen_publica: null,
  visibilidad: 'privado', fuente: null, es_ejemplo: true, tiene_documento: true,
  descripcion_interna: 'NO PUBLICAR', paginas: ['NO PUBLICAR'] };

test('fichas DB usan proyección explícita y ocultan notas/páginas aunque el resultado tenga extras', async () => {
  const llamadas = [];
  const datos = crearLecturas(async (sql, valores) => {
    llamadas.push([sql, valores]);
    if (sql.includes('WHERE slug=$1')) return [{ id: iglesiaId }];
    return [base];
  });
  const lista = await datos.listarMateriales('catedral', 'libros-documentos');
  const ficha = await datos.obtenerMaterial(id);
  assert.deepEqual(ficha, lista[0]);
  assert.equal(ficha.bloqueado, true);
  assert.equal(ficha.tiene_documento, false);
  assert.equal(JSON.stringify(ficha).includes('NO PUBLICAR'), false);
  assert.equal('descripcion_interna' in ficha, false);
  assert.equal('paginas' in ficha, false);
  assert.equal('iglesia_encontrada' in ficha,false);
  assert.deepEqual(llamadas[0][1], ['catedral', 'libros-documentos']);
  assert.equal(llamadas.length,2);
  assert.ok(llamadas.every(([sql]) => !sql.includes('descripcion_interna') && !sql.includes('SELECT *')));
});

test('documento privado 403; ausente o sin documento 404; público conserva formato y orden', async () => {
  for (const visibilidad of ['privado', 'publico']) {
    const doc = { visibilidad, material_id: id, titulo: 'Ejemplo', es_ejemplo: true,
      paginas: [{ numero: 1, texto: 'Ejemplo', imagen_url: null }] };
    let consultas = 0;
    const datos = crearLecturas(async (sql, valores) => {
      consultas++;
      assert.deepEqual(valores, [id]);
      assert.match(sql, /m.visibilidad='publico'/);
      assert.match(sql, /ORDER BY p.numero/);
      return [doc];
    });
    if (visibilidad === 'privado') await assert.rejects(datos.obtenerDocumento(id), (e) => e.status === 403);
    else {
      const { visibilidad: _omitida, ...esperado } = doc;
      assert.deepEqual(await datos.obtenerDocumento(id), esperado);
    }
    assert.equal(consultas, 1);
  }
  for (const filas of [[], [{ visibilidad: 'publico', material_id: null }]]) {
    await assert.rejects(crearLecturas(async () => filas).obtenerDocumento(id), (e) => e.status === 404);
  }
});

test('consultas parametrizan slug, iglesia, categoría y fecha sin UTC', async () => {
  const llamadas = [];
  const datos = crearLecturas(async (sql, valores) => {
    llamadas.push([sql, valores]);
    if(sql.includes('LEFT JOIN public.tramites'))return [{iglesia_encontrada:iglesiaId,id:null}];
    return sql.includes('WHERE slug=$1') ? [{ id: iglesiaId }] : [];
  });
  const slug = "' OR 1=1 --";
  await datos.obtenerIglesia(slug);
  assert.deepEqual(llamadas[0][1], [slug]);
  assert.equal(llamadas[0][0].includes(slug), false);
  assert.deepEqual(await datos.listarActividades('catedral', '2026-10-26'), []);
  assert.deepEqual(llamadas.at(-1)[1], [iglesiaId, '2026-10-26']);
  assert.match(llamadas.at(-1)[0], /to_char\(fecha,'YYYY-MM-DD'\)/);
  assert.match(llamadas.at(-1)[0], /left\(hora_inicio::text,5\)/);
  await datos.listarHorarios('catedral');
  assert.match(llamadas.at(-1)[0], /ORDER BY dia_semana, hora, id/);
  await datos.listarTramites('catedral');
  assert.deepEqual(llamadas.at(-1)[1], ['catedral']);
});

test('entradas inválidas y recursos inexistentes conservan errores del contrato', async () => {
  const datos = crearLecturas(async () => []);
  await assert.rejects(datos.obtenerIglesia('desconocida'), (e) => e.status === 404);
  for (const metodo of ['obtenerMaterial', 'obtenerDocumento']) {
    await assert.rejects(datos[metodo]('invalido'), (e) => e.status === 400 && Boolean(e.fields.id));
  }
  for (const fecha of [undefined, '2026-02-30', '2026-02-29', ['2026-10-24'], '2026-10-24T00:00:00Z']) {
    await assert.rejects(datos.listarActividades('catedral', fecha), (e) => e.status === 400 && Boolean(e.fields.fecha));
  }
  const conIglesia = crearLecturas(async () => [{ id: iglesiaId }]);
  await assert.rejects(conIglesia.listarMateriales('catedral', ['objetos']), (e) => e.status === 400);
});

test('fallos DB se propagan y Express devuelve 500 sin detalles ni sustitución por fixtures', async () => {
  const fallo = new Error('postgresql://usuario:secreto@example.invalid/base');
  const datos = crearLecturas(async () => { throw fallo; });
  await assert.rejects(datos.listarIglesias(), (e) => e === fallo);
  const respuesta = { status(code) { this.code = code; return this; }, json(body) { this.body = body; } };
  manejarError(fallo, {}, respuesta, () => {});
  assert.equal(respuesta.code, 500);
  assert.deepEqual(respuesta.body, { error: { code: 'INTERNAL_ERROR', message: 'No se pudo completar la solicitud.' } });
});

test('listados con LEFT JOIN distinguen iglesia vacía de inexistente con una sola consulta',async()=>{
  for(const metodo of ['listarMateriales','listarTramites']) {
    const llamadas=[];
    const vacia=crearLecturas(async(sql,p)=>{llamadas.push({sql,p});return [{iglesia_encontrada:iglesiaId,id:null}];});
    assert.deepEqual(await vacia[metodo]('santa-ana'),[]);
    assert.equal(llamadas.length,1);assert.match(llamadas[0].sql,/LEFT JOIN/);assert.equal(llamadas[0].p[0],'santa-ana');
    await assert.rejects(crearLecturas(async()=>[])[metodo]('desconocida'),{status:404});
  }
  const desconocida=crearLecturas(async()=>[]);
  await assert.rejects(desconocida.listarMateriales('desconocida','incorrecta'),{status:404});
  await assert.rejects(crearLecturas(async()=>[{id:iglesiaId}]).listarMateriales('catedral','incorrecta'),{status:400});
});
test('trámites conserva campos públicos y excluye el marcador interno de iglesia',async()=>{
  const guia={id,iglesia_id:iglesiaId,tipo:'urnas_nichos',titulo:'Urnas y nichos',requisitos:[],fuente:null,estado_verificacion:'por_confirmar'};
  const datos=crearLecturas(async()=>[{iglesia_encontrada:iglesiaId,...guia}]);
  assert.deepEqual(await datos.listarTramites('catedral'),[guia]);
});
