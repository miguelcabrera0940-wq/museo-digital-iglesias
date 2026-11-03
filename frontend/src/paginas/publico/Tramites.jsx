import { Link, useParams, useSearchParams } from 'react-router-dom';
import { EstadoCarga, EstadoError, EstadoVacio } from '../../componentes/Estados.jsx';
import { Flecha } from '../../componentes/Iconos.jsx';
import { obtenerIglesia } from '../../api/iglesias.js';
import { GUIAS, ORIENTACION, listarTramites } from '../../api/tramites.js';
import { usarApi } from '../../api/usarApi.js';
import { enlaceTelefono } from '../../telefono.js';

export default function Tramites() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const pedido = params.get('tipo');
  const tipo = GUIAS.some((g) => g.tipo === pedido) ? pedido : GUIAS[0].tipo;
  const { cargando, datos, error, reintentar } = usarApi(() => Promise.all([obtenerIglesia(slug), listarTramites(slug)]), [slug]);

  if (cargando) return <main className="pagina"><EstadoCarga texto="Cargando las guías…" /></main>;
  if (error) return <main className="pagina"><EstadoError error={error} onReintentar={reintentar} /></main>;

  const [iglesia, tramites] = datos;
  const guia = tramites.find((t) => t.tipo === tipo);
  const enlace = enlaceTelefono(iglesia.telefono);
  const informados = guia && guia.estado_verificacion !== 'ejemplo' && guia.requisitos.length > 0;

  return (
    <main className="pagina tramites">
      <Link className="boton" to={`/iglesias/${slug}`}><Flecha /> Regresar a la iglesia</Link>
      <h1>Trámites y celebraciones</h1>
      <p className="introduccion">{iglesia.nombre}. Guías informativas para bautizos, bodas, misas por difuntos, urnas y nichos y otros trámites.</p>

      <div className="tramite-selector" role="group" aria-label="Tipo de trámite">
        {GUIAS.map((g) => (
          <button key={g.tipo} className="boton" aria-pressed={g.tipo === tipo} onClick={() => setParams({ tipo: g.tipo }, { replace: true })}>
            {g.nombre}
          </button>
        ))}
      </div>

      {!guia ? <EstadoVacio texto="Esta guía todavía no está disponible. Consulta directamente con la parroquia." /> : (
        <article key={guia.tipo} className="folleto" aria-labelledby="folleto-titulo">
          <header><h2 id="folleto-titulo">{guia.titulo}</h2></header>
          <p className="folleto-aviso" role="note"><strong>Orientación general, no requisitos oficiales de esta parroquia.</strong> Confírmala en la oficina parroquial. Aquí no se reservan fechas ni se piden datos personales o pagos.</p>

          <div className="folleto-cuerpo">
            <div>
              {informados && (
                <section aria-labelledby="t-requisitos" className="requisitos-informados">
                  <h3 id="t-requisitos">{guia.estado_verificacion === 'verificado' ? 'Requisitos' : 'Requisitos informados (por confirmar)'}</h3>
                  <ol className="requisitos">
                    {guia.requisitos.map((r, i) => <li key={i}>{r}</li>)}
                  </ol>
                </section>
              )}
              <section aria-labelledby="t-consultar">
                <h3 id="t-consultar">Qué consultar antes de acudir</h3>
                <ul className="consultar">
                  {ORIENTACION[guia.tipo].map((t) => <li key={t}>{t}</li>)}
                </ul>
              </section>
            </div>

            <aside aria-labelledby="t-antes">
              {iglesia.telefono ? (
                <div className="telefono">
                  <h3 id="t-antes">Teléfono de la parroquia</h3>
                  <p className="telefono-numero">{iglesia.telefono}</p>
                  {enlace && <a className="boton boton-principal" href={enlace}>Llamar</a>}
                </div>
              ) : (
                <div className="telefono">
                  <h3 id="t-antes">Consulta en la oficina parroquial</h3>
                  {iglesia.direccion && <p>{iglesia.direccion}</p>}
                  <a className="boton boton-principal" href={`https://www.google.com/maps/search/?api=1&query=${iglesia.latitud},${iglesia.longitud}`} target="_blank" rel="noopener noreferrer">
                    Ver en Google Maps <span className="sr-solo">(se abre en una pestaña nueva)</span>
                  </a>
                </div>
              )}
            </aside>
          </div>

          {guia.fuente && <footer>Fuente: {guia.fuente}</footer>}
        </article>
      )}
    </main>
  );
}
