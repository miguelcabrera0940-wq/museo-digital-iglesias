import { useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { EstadoCarga, EstadoError } from '../componentes/Estados.jsx';
import { formatoHora } from '../fechas.js';
import { mensajeError } from '../paginas/admin/errores.js';
import { usarAdmin } from './SesionAdmin.jsx';

const horaLocal = (iso) => {
  const d = new Date(iso);
  return formatoHora(`${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`);
};

// Cerrar sesión debe seguir disponible aunque la cuenta no tenga permiso.
function BotonSalir({ a, clase = 'boton' }) {
  const [error, setError] = useState(null);
  const cerrar = async () => {
    setError(null);
    try { await a.salir(); } catch (e) { setError(e); }
  };
  return (
    <>
      <button className={clase} onClick={cerrar}>Cerrar sesión</button>
      {error && <p className="admin-barra-error" role="alert">No se pudo confirmar el cierre de sesión: {mensajeError(error)} La sesión sigue abierta.</p>}
    </>
  );
}

function Barra({ a }) {
  return (
    <div className="admin-barra sobre-oscuro">
      <p>{a.rol === 'parroquial' ? 'Administración parroquial' : 'Administración general'} · sesión activa hasta las {horaLocal(a.expiraEn)}</p>
      <BotonSalir a={a} />
    </div>
  );
}

// El servidor decide: hasta confirmar la sesión no se renderiza ninguna pantalla privada.
export default function RutaProtegida() {
  const a = usarAdmin();
  const { pathname, search } = useLocation();

  if (a.estado === 'cargando') return <main className="pagina"><EstadoCarga texto="Comprobando la sesión…" /></main>;
  if (a.estado === 'anonima') return <Navigate to="/admin/login" replace state={{ desde: pathname + search }} />;
  if (a.estado === 'sin_permiso') {
    return (
      <main className="pagina">
        <div className="estado estado-error" role="alert">
          <p>Esta cuenta no tiene permiso de administración.</p>
          <div className="acciones">
            <Link className="boton" to="/">Volver al sitio</Link>
            <BotonSalir a={a} />
          </div>
        </div>
      </main>
    );
  }
  if (a.estado === 'error') return <main className="pagina"><EstadoError error={a.error} onReintentar={a.verificar} /></main>;
  return (<><Barra a={a} /><Outlet /></>);
}
