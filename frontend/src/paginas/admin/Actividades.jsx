import { useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { usarAdmin } from '../../auth/SesionAdmin.jsx';
import { EstadoCarga, EstadoError } from '../../componentes/Estados.jsx';
import { AvisoError, AvisoOk, Campo, ConfirmarBorrado, usarEnvio } from '../../componentes/Formularios.jsx';
import { listarActividades } from '../../api/agenda.js';
import { usarApi } from '../../api/usarApi.js';
import { esFechaValida, fechaLarga, formatoHora, hoyLocal } from '../../fechas.js';
import { diferencias, paraCrear } from './formularios.js';

const TIPOS = [['misa', 'Misa'], ['bautizo', 'Bautizo'], ['boda', 'Boda'], ['difuntos', 'Misa por difuntos'], ['visita', 'Visita'], ['otro', 'Otra actividad']];
const NULABLES = ['hora_fin', 'nota_visitas'];
const valoresDe = (a, fecha) => ({
  tipo: a?.tipo ?? 'misa', titulo: a?.titulo ?? '', fecha: a?.fecha ?? fecha, hora_inicio: a?.hora_inicio ?? '', hora_fin: a?.hora_fin ?? '',
  descripcion: a?.descripcion ?? '', nota_visitas: a?.nota_visitas ?? '', es_ejemplo: a?.es_ejemplo ?? true,
});

function FormActividad({ inicial, fecha, iglesiaId, onListo, onCancelar }) {
  const { pedir } = usarAdmin();
  const [v, setV] = useState(valoresDe(inicial, fecha));
  const [local, setLocal] = useState({});
  const envio = usarEnvio();
  const sufijo = inicial?.id ?? 'nueva';
  const campo = (n) => ({ nombre: `${n}-${sufijo}`, valor: v[n], onCambio: (x) => setV({ ...v, [n]: x }), error: local[n] ?? envio.error?.fields?.[n] });

  const guardar = async (e) => {
    e.preventDefault();
    if (v.hora_fin && v.hora_inicio && v.hora_fin < v.hora_inicio) return setLocal({ hora_fin: 'La hora de fin no puede ser anterior a la de inicio.' });
    setLocal({});
    let r;
    if (inicial) {
      const cambios = diferencias(inicial, v, NULABLES);
      if (!Object.keys(cambios).length) return envio.mostrar('No hay cambios que guardar.');
      r = await envio.enviar(() => pedir(`/admin/actividades/${inicial.id}`, { method: 'PATCH', body: cambios }), 'Actividad actualizada.');
    } else {
      const { es_ejemplo, ...resto } = v; // el servidor fija es_ejemplo al crear
      r = await envio.enviar(() => pedir('/admin/actividades', { method: 'POST', body: paraCrear({ iglesia_id: iglesiaId, ...resto }, NULABLES) }), 'Actividad creada.');
    }
    if (r.ok) onListo(r.datos);
  };

  return (
    <form className="formulario formulario-en-fila" onSubmit={guardar} noValidate>
      <Campo {...campo('titulo')} etiqueta="Título" maxLength={160} required />
      <Campo {...campo('tipo')} etiqueta="Tipo" tipo="select" opciones={TIPOS} />
      <Campo {...campo('fecha')} etiqueta="Fecha" tipo="date" required />
      <Campo {...campo('hora_inicio')} etiqueta="Hora de inicio" tipo="time" required />
      <Campo {...campo('hora_fin')} etiqueta="Hora de fin (opcional)" tipo="time" />
      <Campo {...campo('descripcion')} etiqueta="Descripción" tipo="area" rows={3} required />
      <Campo {...campo('nota_visitas')} etiqueta="Nota para visitantes (opcional)" ayuda="Solo informativa; no indica que la iglesia esté abierta o cerrada." />
      {inicial && <Campo {...campo('es_ejemplo')} etiqueta="Es contenido de ejemplo" tipo="checkbox" />}
      <AvisoError error={envio.error} />
      <AvisoOk texto={envio.ok} />
      <div className="acciones">
        <button className="boton boton-principal" type="submit" disabled={envio.enviando}>{envio.enviando ? 'Guardando…' : inicial ? 'Guardar actividad' : 'Crear actividad'}</button>
        {onCancelar && <button type="button" className="boton" onClick={onCancelar}>Cancelar</button>}
      </div>
    </form>
  );
}

export default function Actividades() {
  const { iglesia } = useOutletContext();
  const { pedir } = usarAdmin();
  const [params, setParams] = useSearchParams();
  const fecha = esFechaValida(params.get('fecha')) ? params.get('fecha') : hoyLocal();
  const irA = (f) => setParams({ fecha: f }, { replace: true });
  const { cargando, datos, error, reintentar } = usarApi(() => listarActividades(iglesia.slug, fecha), [iglesia.slug, fecha]);
  const [nueva, setNueva] = useState(false);
  const [editando, setEditando] = useState(null);
  const [borrando, setBorrando] = useState(null);
  const borrado = usarEnvio();

  const eliminar = async (a) => {
    const r = await borrado.enviar(() => pedir(`/admin/actividades/${a.id}`, { method: 'DELETE' }));
    if (r.ok) { setBorrando(null); reintentar(); }
  };
  // Si la fecha cambió al guardar, se muestra el día nuevo para que la actividad no «desaparezca».
  const listo = (a) => { setNueva(false); setEditando(null); if (a?.fecha && a.fecha !== fecha) irA(a.fecha); else reintentar(); };

  return (
    <section>
      <h2>Actividades con fecha</h2>
      <p className="campo-ayuda">Celebraciones y eventos de un día concreto. Los horarios semanales están en «Horarios». Un día sin actividades no significa que no haya misas.</p>
      <div className="campo">
        <label htmlFor="f-dia">Día que quieres revisar</label>
        <input id="f-dia" type="date" value={fecha} onChange={(e) => esFechaValida(e.target.value) && irA(e.target.value)} />
      </div>
      <h3>{fechaLarga(fecha)}</h3>

      {nueva
        ? <FormActividad key={fecha} fecha={fecha} iglesiaId={iglesia.id} onListo={listo} onCancelar={() => setNueva(false)} />
        : <button className="boton boton-principal" onClick={() => setNueva(true)}>Nueva actividad en este día</button>}

      {cargando && <EstadoCarga texto="Buscando actividades…" />}
      {error && <EstadoError error={error} onReintentar={reintentar} />}
      {datos && (datos.length ? (
        <ul className="filas">
          {datos.map((a) => (
            <li key={a.id}>
              {editando === a.id ? (
                <FormActividad inicial={a} fecha={fecha} iglesiaId={iglesia.id} onListo={listo} onCancelar={() => setEditando(null)} />
              ) : (
                <>
                  <div>
                    <p className="fila-titulo">{a.titulo}</p>
                    <p className="fila-meta">{formatoHora(a.hora_inicio)}{a.hora_fin && ` a ${formatoHora(a.hora_fin)}`} · {TIPOS.find(([t]) => t === a.tipo)?.[1]}{a.es_ejemplo && ' · Ejemplo'}</p>
                    <p>{a.descripcion}</p>
                  </div>
                  {borrando === a.id ? (
                    <ConfirmarBorrado texto={`¿Eliminar «${a.titulo}»?`} enviando={borrado.enviando} error={borrado.error} onConfirmar={() => eliminar(a)} onCancelar={() => setBorrando(null)} />
                  ) : (
                    <div className="acciones">
                      <button className="boton" onClick={() => setEditando(a.id)}>Editar<span className="sr-solo"> {a.titulo}</span></button>
                      <button className="boton" onClick={() => setBorrando(a.id)}>Eliminar<span className="sr-solo"> {a.titulo}</span></button>
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      ) : <p className="agenda-vacio" role="status">No hay actividades registradas para este día. Esto no significa que no haya misas ni que la iglesia esté cerrada.</p>)}
    </section>
  );
}
