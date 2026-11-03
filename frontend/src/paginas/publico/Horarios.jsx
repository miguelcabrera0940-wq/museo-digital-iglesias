import { useId, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { EstadoCarga, EstadoError } from '../../componentes/Estados.jsx';
import { Flecha } from '../../componentes/Iconos.jsx';
import { obtenerIglesia } from '../../api/iglesias.js';
import { listarActividades, listarHorarios } from '../../api/agenda.js';
import { usarApi } from '../../api/usarApi.js';
import { cap, diaSemana, esFechaValida, fechaLarga, fechaParts, formatoHora, hoyLocal, nombreDia, nombreDiaPlural, sumarDias } from '../../fechas.js';

const TIPOS = { misa: 'Misa', bautizo: 'Bautizo', boda: 'Boda', difuntos: 'Misa por difuntos', visita: 'Visita', otro: 'Otra actividad' };
const SEMANA = [1, 2, 3, 4, 5, 6, 0]; // la semana empieza en lunes

const horasDe = (h) => (
  <ul className="horas">
    {h.map((x) => (
      <li key={x.id}><time dateTime={x.hora}>{formatoHora(x.hora)}</time>{x.nota && <span>{x.nota}</span>}</li>
    ))}
  </ul>
);

const rangoHoras = (a) => (a.hora_fin ? `De ${formatoHora(a.hora_inicio)} a ${formatoHora(a.hora_fin)}` : formatoHora(a.hora_inicio));

export default function Horarios() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const hoy = hoyLocal();
  const pedida = params.get('fecha');
  const fecha = esFechaValida(pedida) ? pedida : hoy;
  const [panel, setPanel] = useState(fecha !== hoy);
  const idPanel = useId();
  const navegar = useNavigate();

  const base = usarApi(() => Promise.all([obtenerIglesia(slug), listarHorarios(slug)]), [slug]);
  const actividades = usarApi(() => listarActividades(slug, fecha), [slug, fecha]);

  if (base.cargando) return <main className="pagina"><EstadoCarga texto="Cargando los horarios…" /></main>;
  if (base.error) return <main className="pagina"><EstadoError error={base.error} onReintentar={base.reintentar} /></main>;

  const [iglesia, horarios] = base.datos;
  const ruta = `/iglesias/${slug}/horarios`;
  const aFecha = (f) => (f === hoy ? ruta : `${ruta}?fecha=${f}`);
  const { dia, mes, nombre } = fechaParts(fecha);
  const sem = diaSemana(fecha);
  const delDia = horarios.filter((h) => h.dia_semana === sem);
  const sieteDias = Array.from({ length: 7 }, (_, n) => sumarDias(hoy, n));
  const hayEjemplo = horarios.some((h) => h.es_ejemplo);

  return (
    <main className="pagina agenda">
      <Link className="boton" to={`/iglesias/${slug}`}><Flecha /> Regresar a la iglesia</Link>
      <h1>Misas y actividades</h1>
      <p className="introduccion">{iglesia.nombre}</p>

      <div className="agenda-accesos">
        <Link className="boton" to={ruta} aria-current={fecha === hoy ? 'date' : undefined}>Actividades de hoy</Link>
        <button className="boton" aria-expanded={panel} aria-controls={idPanel} onClick={() => setPanel(!panel)}>Elegir otro día</button>
      </div>

      {panel && (
        <section id={idPanel} className="agenda-panel" aria-label="Elegir otro día">
          <ul className="dias">
            {sieteDias.map((f, n) => {
              const p = fechaParts(f);
              return (
                <li key={f}>
                  <Link className="boton" to={aFecha(f)} aria-current={f === fecha ? 'date' : undefined}>
                    <span>{n === 0 ? 'Hoy' : n === 1 ? 'Mañana' : cap(p.nombre.slice(0, 3))}</span>
                    <strong>{p.dia}</strong>
                  </Link>
                </li>
              );
            })}
          </ul>
          <label className="campo-fecha">
            Otra fecha
            <input type="date" value={fecha} onChange={(e) => esFechaValida(e.target.value) && navegar(aFecha(e.target.value))} />
          </label>
        </section>
      )}

      <section className="fecha-banner" aria-label="Fecha elegida">
        <Link className="boton" to={aFecha(sumarDias(fecha, -1))}><Flecha /> Día anterior</Link>
        <div className="fecha-centro">
          <div className="hoja-fecha" aria-hidden="true"><span>{nombre.slice(0, 3)}</span><strong>{dia}</strong></div>
          <div>
            <h2>{fechaLarga(fecha)}</h2>
            {fecha === hoy && <p className="fecha-hoy">Hoy</p>}
          </div>
        </div>
        <Link className="boton" to={aFecha(sumarDias(fecha, 1))}>Día siguiente <Flecha dir="der" /></Link>
      </section>

      <section className="agenda-bloque" aria-labelledby="t-misas">
        <h2 id="t-misas">Misas habituales del {nombreDia(sem)}</h2>
        <p className="agenda-aclara">Estos horarios se repiten cada semana; no dependen de la fecha elegida.</p>
        {delDia.length
          ? horasDe(delDia)
          : <p className="agenda-vacio">Todavía no tenemos registrado un horario habitual para los {nombreDiaPlural(sem)}. Puede estar por confirmar.</p>}
        {hayEjemplo && <p className="etiqueta-ejemplo">Horarios de ejemplo, aún por confirmar.</p>}

        <details className="semana">
          <summary>Ver los horarios de toda la semana</summary>
          <dl>
            {SEMANA.map((d) => {
              const hs = horarios.filter((h) => h.dia_semana === d);
              return (
                <div key={d}>
                  <dt>{cap(nombreDia(d))}</dt>
                  <dd>{hs.length ? hs.map((h) => formatoHora(h.hora)).join(' · ') : 'Por confirmar'}</dd>
                </div>
              );
            })}
          </dl>
        </details>
      </section>

      <section className="agenda-bloque" aria-labelledby="t-acts">
        <h2 id="t-acts">Actividades del {dia} de {mes}</h2>
        <p className="agenda-aclara">Son celebraciones y eventos con fecha específica.</p>
        {actividades.cargando && <EstadoCarga texto="Buscando actividades…" />}
        {actividades.error && <EstadoError error={actividades.error} onReintentar={actividades.reintentar} />}
        {actividades.datos && (actividades.datos.length ? (
          <ul className="actividades">
            {actividades.datos.map((a) => (
              <li key={a.id}>
                <p className="act-hora"><time dateTime={a.hora_inicio}>{rangoHoras(a)}</time></p>
                <div>
                  <h3>{a.titulo}</h3>
                  <p className="act-tipo">{TIPOS[a.tipo] ?? 'Actividad'}{a.es_ejemplo && ' · Ejemplo'}</p>
                  <p>{a.descripcion}</p>
                  {a.nota_visitas && <p className="act-visitas"><strong>Para visitantes:</strong> {a.nota_visitas}</p>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="agenda-vacio" role="status">
            <p><strong>No hay actividades registradas para este día.</strong></p>
            <p>Esto no significa que no haya misas ni que la iglesia esté cerrada. Revisa las misas habituales de arriba.</p>
          </div>
        ))}
      </section>
    </main>
  );
}
