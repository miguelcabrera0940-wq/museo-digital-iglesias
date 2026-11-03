import { Link, Navigate } from 'react-router-dom';
import { EstadoCarga, EstadoError, EstadoVacio } from '../../componentes/Estados.jsx';
import { usarAdmin } from '../../auth/SesionAdmin.jsx';
import { ESTADOS } from '../../api/estados.js';
import { usarApi } from '../../api/usarApi.js';

export default function Inicio() {
  const { pedir } = usarAdmin();
  // Solo las iglesias que el servidor autoriza para esta sesión: las ocho (general) o una (parroquial).
  const { cargando, datos, error, reintentar } = usarApi(() => pedir('/admin/iglesias'), []);
  if (cargando) return <main className="pagina"><EstadoCarga texto="Cargando las iglesias…" /></main>;
  if (error) return <main className="pagina"><EstadoError error={error} onReintentar={reintentar} /></main>;
  if (datos.length === 1) return <Navigate to={`/admin/${datos[0].slug}`} replace />;

  return (
    <main className="pagina">
      <h1>¿Qué iglesia quieres gestionar?</h1>
      <p className="introduccion">Una sola sesión te permite editar las ocho iglesias.</p>
      {datos.length ? ESTADOS.map((e) => {
        const delEstado = datos.filter((i) => i.estado === e.clave);
        return delEstado.length > 0 && (
          <section key={e.clave} aria-labelledby={`admin-${e.clave}`}>
            <h2 id={`admin-${e.clave}`}>{e.nombre}</h2>
            <ul className="admin-iglesias">
              {delEstado.map((i) => (
                <li key={i.slug}>
                  <Link className="boton" to={`/admin/${i.slug}`}>{i.nombre}</Link>
                </li>
              ))}
            </ul>
          </section>
        );
      }) : <EstadoVacio texto="Esta cuenta no tiene iglesias asignadas." />}
      <p><Link to="/">Ver el sitio público</Link></p>
    </main>
  );
}
