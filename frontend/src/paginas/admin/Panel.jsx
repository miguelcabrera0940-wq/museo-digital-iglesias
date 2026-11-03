import { Link, Navigate, NavLink, Outlet, useParams } from 'react-router-dom';
import { usarAdmin } from '../../auth/SesionAdmin.jsx';
import { EstadoCarga, EstadoError } from '../../componentes/Estados.jsx';
import { Flecha } from '../../componentes/Iconos.jsx';
import { obtenerIglesia } from '../../api/iglesias.js';
import { usarApi } from '../../api/usarApi.js';

const SECCIONES = [['', 'Datos de la iglesia'], ['materiales', 'Materiales'], ['horarios', 'Horarios'], ['actividades', 'Actividades'], ['tramites', 'Trámites']];

// Marco común de una iglesia: las secciones reciben la iglesia por contexto de ruta.
export default function Panel() {
  const { slug } = useParams();
  const { rol, iglesiaSlug } = usarAdmin();
  const parroquial = rol === 'parroquial';
  const { cargando, datos: iglesia, error, reintentar } = usarApi(() => obtenerIglesia(slug), [slug]);
  // Comodidad de navegación: el servidor es quien rechaza (403/404) cualquier otra iglesia.
  if (parroquial && slug !== iglesiaSlug) return <Navigate to={`/admin/${iglesiaSlug}`} replace />;
  if (cargando) return <main className="pagina"><EstadoCarga /></main>;
  if (error) return <main className="pagina"><EstadoError error={error} onReintentar={reintentar} /></main>;

  return (
    <main className="pagina admin-panel">
      {!parroquial && <Link className="boton" to="/admin"><Flecha /> Cambiar de iglesia</Link>}
      <h1>{iglesia.nombre}</h1>
      <nav className="pestanas" aria-label="Secciones de administración">
        {SECCIONES.map(([ruta, texto]) => (
          <NavLink key={ruta} className="boton" end={ruta === ''} to={`/admin/${slug}${ruta && `/${ruta}`}`}>{texto}</NavLink>
        ))}
      </nav>
      <Outlet context={{ iglesia }} />
    </main>
  );
}
