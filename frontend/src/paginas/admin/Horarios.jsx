import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { usarAdmin } from '../../auth/SesionAdmin.jsx';
import { EstadoCarga, EstadoError } from '../../componentes/Estados.jsx';
import { AvisoError, AvisoOk, Campo, ConfirmarBorrado, usarEnvio } from '../../componentes/Formularios.jsx';
import { listarHorarios } from '../../api/agenda.js';
import { usarApi } from '../../api/usarApi.js';
import { formatoHora } from '../../fechas.js';
import { diferencias, paraCrear } from './formularios.js';

const DIAS = [[1, 'Lunes'], [2, 'Martes'], [3, 'Miércoles'], [4, 'Jueves'], [5, 'Viernes'], [6, 'Sábado'], [0, 'Domingo']];

function FormHorario({ inicial, iglesiaId, onListo, onCancelar }) {
  const { pedir } = usarAdmin();
  const [v, setV] = useState({ dia_semana: String(inicial?.dia_semana ?? 1), hora: inicial?.hora ?? '', nota: inicial?.nota ?? '' });
  const envio = usarEnvio();
  const campo = (n) => ({ nombre: `${n}-${inicial?.id ?? 'nuevo'}`, valor: v[n], onCambio: (x) => setV({ ...v, [n]: x }), error: envio.error?.fields?.[n] });

  const guardar = async (e) => {
    e.preventDefault();
    const actual = { dia_semana: Number(v.dia_semana), hora: v.hora, nota: v.nota };
    let r;
    if (inicial) {
      const cambios = diferencias(inicial, actual, ['nota']);
      if (!Object.keys(cambios).length) return envio.mostrar('No hay cambios que guardar.');
      r = await envio.enviar(() => pedir(`/admin/horarios/${inicial.id}`, { method: 'PATCH', body: cambios }), 'Horario actualizado.');
    } else {
      r = await envio.enviar(() => pedir('/admin/horarios', { method: 'POST', body: paraCrear({ iglesia_id: iglesiaId, ...actual }, ['nota']) }), 'Horario agregado.');
    }
    if (r.ok) onListo();
  };

  return (
    <form className="formulario formulario-en-fila" onSubmit={guardar} noValidate>
      <Campo {...campo('dia_semana')} etiqueta="Día de la semana" tipo="select" opciones={DIAS.map(([n, t]) => [String(n), t])} />
      <Campo {...campo('hora')} etiqueta="Hora" tipo="time" required />
      <Campo {...campo('nota')} etiqueta="Nota (opcional)" ayuda="Ejemplo: «Misa con coro»." />
      <AvisoError error={envio.error} />
      <AvisoOk texto={envio.ok} />
      <div className="acciones">
        <button className="boton boton-principal" type="submit" disabled={envio.enviando}>{envio.enviando ? 'Guardando…' : inicial ? 'Guardar horario' : 'Agregar horario'}</button>
        {onCancelar && <button type="button" className="boton" onClick={onCancelar}>Cancelar</button>}
      </div>
    </form>
  );
}

export default function Horarios() {
  const { iglesia } = useOutletContext();
  const { pedir } = usarAdmin();
  const { cargando, datos, error, reintentar } = usarApi(() => listarHorarios(iglesia.slug), [iglesia.slug]);
  const [editando, setEditando] = useState(null);
  const [borrando, setBorrando] = useState(null);
  const borrado = usarEnvio();

  if (cargando) return <EstadoCarga texto="Cargando los horarios…" />;
  if (error) return <EstadoError error={error} onReintentar={reintentar} />;

  const eliminar = async (h) => {
    const r = await borrado.enviar(() => pedir(`/admin/horarios/${h.id}`, { method: 'DELETE' }));
    if (r.ok) { setBorrando(null); reintentar(); }
  };

  return (
    <section>
      <h2>Horarios habituales de misa</h2>
      <p className="campo-ayuda">Son los horarios que se repiten cada semana. Las celebraciones con fecha se gestionan en «Actividades».</p>
      <div className="admin-grupo">
        <h3>Agregar un horario</h3>
        <FormHorario iglesiaId={iglesia.id} onListo={reintentar} />
      </div>
      {DIAS.map(([d, nombre]) => {
        const lista = datos.filter((h) => h.dia_semana === d);
        return (
          <div key={d} className="admin-grupo">
            <h3>{nombre}</h3>
            {lista.length ? (
              <ul className="filas">
                {lista.map((h) => (
                  <li key={h.id}>
                    {editando === h.id ? (
                      <FormHorario inicial={h} iglesiaId={iglesia.id} onListo={() => { setEditando(null); reintentar(); }} onCancelar={() => setEditando(null)} />
                    ) : (
                      <>
                        <div>
                          <p className="fila-titulo"><time dateTime={h.hora}>{formatoHora(h.hora)}</time></p>
                          {h.nota && <p className="fila-meta">{h.nota}</p>}
                        </div>
                        {borrando === h.id ? (
                          <ConfirmarBorrado texto={`¿Eliminar el horario de las ${formatoHora(h.hora)} del ${nombre.toLowerCase()}?`} enviando={borrado.enviando} error={borrado.error} onConfirmar={() => eliminar(h)} onCancelar={() => { setBorrando(null); }} />
                        ) : (
                          <div className="acciones">
                            <button className="boton" onClick={() => setEditando(h.id)}>Editar<span className="sr-solo"> las {formatoHora(h.hora)} del {nombre.toLowerCase()}</span></button>
                            <button className="boton" onClick={() => setBorrando(h.id)}>Eliminar<span className="sr-solo"> las {formatoHora(h.hora)} del {nombre.toLowerCase()}</span></button>
                          </div>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : <p className="campo-ayuda">Sin horario registrado para este día.</p>}
          </div>
        );
      })}
    </section>
  );
}
