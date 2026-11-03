import { ErrorApi } from '../errores.js';
import { validarFecha } from '../lecturas.js';
import { slugsIglesias } from '../catalogo.js';
import { validarAmbito, permitirIglesia, permitirCampos } from './permisos.js';
import { invalido } from './seguridad.js';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function validarUuid(id, campo = 'id') { if (typeof id !== 'string' || !uuid.test(id)) invalido(campo, 'Debe ser un UUID válido.'); }
const hora = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const enums = { categoria_id: ['libros-documentos','objetos'], tipo_material: ['libro','documento','objeto'],
  visibilidad: ['publico','privado'], tipo_actividad: ['misa','bautizo','boda','difuntos','visita','otro'],
  estado_verificacion: ['ejemplo','por_confirmar','verificado'] };
const iglesia = 'id,slug,estado,ciudad,nombre,descripcion,historia,direccion,latitud,longitud,telefono,foto_exterior,foto_interior,fuente,es_ejemplo';
const material = `id,iglesia_id,categoria_id,tipo,titulo,descripcion_publica,descripcion_interna,
  imagen_publica,visibilidad,fuente,es_ejemplo`;
const modelos = {
  iglesias: { campos: ['historia','descripcion','telefono'], devuelve: iglesia },
  materiales: { campos: ['categoria_id','tipo','titulo','descripcion_publica','visibilidad','descripcion_interna','fuente'],
    requeridos: ['iglesia_id','categoria_id','tipo','titulo','descripcion_publica','visibilidad'], devuelve: material },
  horarios: { campos: ['dia_semana','hora','nota'], requeridos: ['iglesia_id','dia_semana','hora'],
    devuelve: "id,iglesia_id,dia_semana,left(hora::text,5) AS hora,nota,es_ejemplo" },
  actividades: { campos: ['tipo','titulo','fecha','hora_inicio','hora_fin','descripcion','nota_visitas','es_ejemplo'],
    requeridos: ['iglesia_id','tipo','titulo','fecha','hora_inicio','descripcion'],
    devuelve: "id,iglesia_id,tipo,titulo,to_char(fecha,'YYYY-MM-DD') AS fecha,left(hora_inicio::text,5) AS hora_inicio,left(hora_fin::text,5) AS hora_fin,descripcion,nota_visitas,es_ejemplo" },
  tramites: { campos: ['titulo','requisitos','fuente','estado_verificacion'],
    devuelve: 'id,iglesia_id,tipo,titulo,requisitos,fuente,estado_verificacion' },
};
const longitudes = { historia:10000,descripcion:10000,descripcion_publica:10000,descripcion_interna:10000,
  titulo:160,telefono:40,nota:2000,nota_visitas:2000,fuente:1000 };
const anulables = ['telefono','nota','nota_visitas','fuente','descripcion_interna','hora_fin'];
export function validarCampos(tabla, body, crear = false) {
  const modelo = modelos[tabla];
  if (!modelo || !body || typeof body !== 'object' || Array.isArray(body) || !Object.keys(body).length) invalido('body');
  const permitidos = crear ? [...modelo.campos.filter(c => c !== 'es_ejemplo'), 'iglesia_id'] : modelo.campos;
  for (const campo of Object.keys(body)) if (!permitidos.includes(campo)) invalido(campo, 'Campo no permitido.');
  if (crear) for (const campo of modelo.requeridos) if (!(campo in body)) invalido(campo, 'Es obligatorio.');
  const limpio = {};
  for (const [campo, valor] of Object.entries(body)) {
    if (valor === null && anulables.includes(campo)) { limpio[campo] = null; continue; }
    if (campo in longitudes) {
      if (tabla==='iglesias' && ['historia','descripcion'].includes(campo) && valor==='') { limpio[campo]=''; continue; }
      if (typeof valor !== 'string' || valor.trim().length === 0 || [...valor.trim()].length > longitudes[campo]) invalido(campo);
      limpio[campo] = valor.trim();
    } else if (campo === 'iglesia_id') { validarUuid(valor,campo); limpio[campo] = valor; }
    else if (campo === 'dia_semana') {
      if (!Number.isInteger(valor) || valor < 0 || valor > 6) invalido(campo);
      limpio[campo] = valor;
    } else if (['hora','hora_inicio','hora_fin'].includes(campo)) {
      if (typeof valor !== 'string' || !hora.test(valor)) invalido(campo);
      limpio[campo] = valor;
    } else if (campo === 'fecha') limpio[campo] = validarFecha(valor);
    else if (campo === 'es_ejemplo') {
      if (typeof valor !== 'boolean') invalido(campo);
      limpio[campo] = valor;
    } else if (campo === 'requisitos') {
      if (!Array.isArray(valor) || valor.length > 30 || valor.some(v => typeof v !== 'string' || !v.trim() || [...v.trim()].length > 1000)) invalido(campo);
      limpio[campo] = valor.map(v => v.trim());
    } else {
      const opciones = enums[campo === 'tipo' ? (tabla === 'materiales' ? 'tipo_material' : 'tipo_actividad') : campo];
      if (!opciones?.includes(valor)) invalido(campo);
      limpio[campo] = valor;
    }
  }
  if (limpio.tipo && limpio.categoria_id && ((limpio.tipo === 'objeto') !== (limpio.categoria_id === 'objetos'))) invalido('categoria_id', 'No corresponde al tipo.');
  if (limpio.hora_fin && limpio.hora_inicio && limpio.hora_fin < limpio.hora_inicio) invalido('hora_fin');
  return limpio;
}
const ausente = () => { throw new ErrorApi(404,'NOT_FOUND','El recurso solicitado no existe.'); };
const ficha = m => ({ ...m, bloqueado: false, tiene_documento: Boolean(m.tiene_documento) });
// Los nombres SQL proceden exclusivamente de modelos/whitelists internos. Valores siempre separados.
export function crearGestion(transaccion) {
  function ejecutar(usuario, operacion) {
    return transaccion('iglesias_gestion', (q,ambito)=>operacion(q,validarAmbito(ambito)), usuario).catch(error => {
      if (error.code === '23503') invalido('iglesia_id', 'La referencia no existe.');
      if (error.code === '23514' || error.code === '23502' || error.code === '22007' || error.code === '22008') invalido('body','Los campos no son coherentes o válidos.');
      if (error.code === '23505') throw new ErrorApi(409,'CONFLICT','El registro ya existe.');
      throw error;
    });
  }
  async function materialPorId(q, id, ambito) {
    const { rows: [fila] } = await q(`SELECT ${material},EXISTS(SELECT 1 FROM public.documentos d WHERE d.material_id=materiales.id) AS tiene_documento
      FROM public.materiales WHERE id=$1 AND ($2::uuid IS NULL OR iglesia_id=$2)`, [id,ambito.iglesia_id]);
    return fila ? ficha(fila) : ausente();
  }
  return {
    listarIglesias(usuario) {
      return ejecutar(usuario,async(q,a)=>(await q(`SELECT ${iglesia} FROM public.iglesias
        WHERE ($1::uuid IS NULL OR id=$1) ORDER BY id`,[a.iglesia_id])).rows);
    },
    listarMateriales(usuario, slug) {
      if (!slugsIglesias.includes(slug)) return Promise.reject(new ErrorApi(404,'NOT_FOUND','El recurso solicitado no existe.'));
      return ejecutar(usuario, async (q,a) => {
        const { rows: [i] } = await q('SELECT id FROM public.iglesias WHERE slug=$1',[slug]);
        if (!i) ausente();
        permitirIglesia(a,i.id);
        const { rows } = await q(`SELECT ${material},EXISTS(SELECT 1 FROM public.documentos d WHERE d.material_id=materiales.id) AS tiene_documento FROM public.materiales WHERE iglesia_id=$1 ORDER BY id`,[i.id]);
        return rows.map(ficha);
      });
    },
    obtenerMaterial(usuario,id) { validarUuid(id); return ejecutar(usuario,(q,a) => materialPorId(q,id,a)); },
    obtenerDocumento(usuario,id) {
      validarUuid(id);
      return ejecutar(usuario,async (q,a) => {
        const { rows: [d] } = await q(`SELECT d.material_id,d.titulo,d.es_ejemplo,
          COALESCE(jsonb_agg(jsonb_build_object('numero',p.numero,'texto',p.texto,'imagen_url',p.imagen_url)
            ORDER BY p.numero) FILTER (WHERE p.numero IS NOT NULL),'[]'::jsonb) AS paginas
          FROM public.documentos d LEFT JOIN public.paginas p ON p.material_id=d.material_id
          WHERE d.material_id=$1 AND EXISTS(SELECT 1 FROM public.materiales m WHERE m.id=d.material_id AND ($2::uuid IS NULL OR m.iglesia_id=$2)) GROUP BY d.material_id,d.titulo,d.es_ejemplo`,[id,a.iglesia_id]);
        return d ?? ausente();
      });
    },
    guardar(usuario,tabla,id,body,crear = false) {
      const datos = validarCampos(tabla,body,crear);
      if (!crear && tabla !== 'iglesias') validarUuid(id);
      if (tabla === 'iglesias' && !slugsIglesias.includes(id)) ausente();
      return ejecutar(usuario,async (q,a) => {
        const campos = Object.keys(datos), valores = Object.values(datos);
        permitirCampos(a,tabla,campos);
        if(crear)permitirIglesia(a,datos.iglesia_id);
        if(tabla==='iglesias') {
          const {rows:[i]}=await q('SELECT id FROM public.iglesias WHERE slug=$1',[id]);
          if(!i)ausente();
          permitirIglesia(a,i.id);
        }
        if(tabla==='materiales' && !crear && datos.visibilidad==='privado') {
          const {rows}=await q(`SELECT m.id FROM public.materiales m WHERE m.id=$1
            AND ($2::uuid IS NULL OR m.iglesia_id=$2)
            AND EXISTS(SELECT 1 FROM public.paginas p WHERE p.material_id=m.id AND p.imagen_url IS NOT NULL)
            FOR UPDATE OF m`,[id,a.iglesia_id]);
          if(rows.length)throw new ErrorApi(409,'CONFLICT','Este material contiene imágenes públicas. Retíralas mediante el procedimiento operativo antes de hacerlo privado.');
        }
        let sql;
        if (crear) sql = `INSERT INTO public.${tabla} (${campos.join(',')}) VALUES (${campos.map((_,i)=>`$${i+1}`).join(',')})`;
        else {
          valores.push(id);
          sql = `UPDATE public.${tabla} SET ${campos.map((c,i)=>`${c}=$${i+1}`).join(',')} WHERE ${tabla==='iglesias'?'slug':'id'}=$${valores.length}`;
          valores.push(a.iglesia_id);
          sql+=` AND ($${valores.length}::uuid IS NULL OR ${tabla==='iglesias'?'id':'iglesia_id'}=$${valores.length})`;
        }
        const { rows: [fila] } = await q(`${sql} RETURNING ${modelos[tabla].devuelve}`,valores);
        if (!fila) ausente();
        return tabla === 'materiales' ? materialPorId(q,fila.id,a) : fila;
      });
    },
    eliminar(usuario,tabla,id) {
      if (!['horarios','actividades'].includes(tabla)) throw new Error('ADMIN_RESOURCE_INVALID');
      validarUuid(id);
      return ejecutar(usuario,async (q,a) => {
        const { rows } = await q(`DELETE FROM public.${tabla} WHERE id=$1 AND ($2::uuid IS NULL OR iglesia_id=$2) RETURNING id`,[id,a.iglesia_id]);
        if (!rows.length) ausente();
      });
    },
  };
}
