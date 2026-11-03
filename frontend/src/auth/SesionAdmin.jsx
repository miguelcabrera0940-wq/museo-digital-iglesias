import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { pedirAdmin } from '../api/admin.js';
import { USAR_MOCKS } from '../api/cliente.js';

// Sesión administrativa SOLO en memoria: el estado, el CSRF y la expiración viven aquí; la cookie es HttpOnly y no se toca.
const Contexto = createContext(null);
export const usarAdmin = () => useContext(Contexto);

const ANONIMA = (aviso = null) => ({ estado: 'anonima', expiraEn: null, rol: null, iglesiaSlug: null, error: null, aviso });

function Sesion() {
  const [s, setS] = useState({ ...ANONIMA(), estado: 'cargando' });
  const csrf = useRef(null);

  const limpiar = useCallback((aviso) => { csrf.current = null; setS(ANONIMA(aviso)); }, []);

  // Pide la sesión al servidor; devuelve el estado final. Nada privado se pinta antes de esto.
  const verificar = useCallback(async () => {
    setS((x) => ({ ...x, estado: 'cargando' }));
    try {
      const d = await pedirAdmin('/admin/sesion');
      csrf.current = d.csrf_token;
      // El ámbito lo decide el servidor: general (iglesia_slug null) o parroquial (una sola iglesia).
      setS({ estado: 'activa', expiraEn: d.expira_en, rol: d.rol, iglesiaSlug: d.iglesia_slug ?? null, error: null, aviso: null });
      return 'activa';
    } catch (error) {
      csrf.current = null;
      const estado = error.status === 401 ? 'anonima' : error.status === 403 ? 'sin_permiso' : 'error';
      setS({ ...ANONIMA(), estado, error: estado === 'error' ? error : null });
      return estado;
    }
  }, []);

  useEffect(() => { verificar(); }, [verificar]);

  // Un 401 en cualquier llamada de negocio cierra la vista privada y pide login; no se renueva la sesión.
  const pedir = useCallback(async (ruta, opciones) => {
    try {
      return await pedirAdmin(ruta, opciones, csrf.current);
    } catch (e) {
      if (e.status === 401) limpiar('Tu sesión terminó. Inicia sesión de nuevo.');
      throw e;
    }
  }, [limpiar]);

  const iniciar = useCallback(async (email, password) => {
    await pedirAdmin('/admin/login', { method: 'POST', body: { email, password } });
    return verificar();
  }, [verificar]);

  // Solo un 204 confirma el cierre; ante cualquier error se conserva el estado y se informa.
  const salir = useCallback(async () => {
    await pedirAdmin('/admin/logout', { method: 'POST' }, csrf.current);
    limpiar('Cerraste la sesión.');
  }, [limpiar]);

  useEffect(() => {
    if (s.estado !== 'activa') return undefined;
    const ms = Date.parse(s.expiraEn) - Date.now();
    if (!Number.isFinite(ms)) return undefined;
    const t = setTimeout(() => limpiar('Tu sesión terminó (dura ocho horas). Inicia sesión de nuevo.'), Math.max(ms, 0));
    return () => clearTimeout(t);
  }, [s.estado, s.expiraEn, limpiar]);

  const valor = useMemo(() => ({ ...s, pedir, iniciar, salir, verificar }), [s, pedir, iniciar, salir, verificar]);
  return <Contexto.Provider value={valor}><Outlet /></Contexto.Provider>;
}

// La administración escribe en el servidor real: no se mezcla con datos de demostración.
function BloqueoMocks() {
  return (
    <main className="pagina">
      <div className="estado estado-error" role="alert">
        <p>La administración no funciona con datos de demostración. Reinicia el servidor de desarrollo sin <code>VITE_USAR_MOCKS</code>.</p>
        <Link className="boton" to="/">Volver al mapa</Link>
      </div>
    </main>
  );
}

export default function SesionAdmin() {
  return USAR_MOCKS ? <BloqueoMocks /> : <Sesion />;
}
