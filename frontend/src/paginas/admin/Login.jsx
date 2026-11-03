import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { usarAdmin } from '../../auth/SesionAdmin.jsx';
import { AvisoError, Campo } from '../../componentes/Formularios.jsx';
import { esperaTexto } from './errores.js';

export default function Login() {
  const a = usarAdmin();
  const { state } = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ver, setVer] = useState(false);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [espera, setEspera] = useState(0); // segundos restantes de un 429

  useEffect(() => {
    if (espera <= 0) return undefined;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  // Credenciales válidas sin permiso: la pantalla protegida lo explica y ofrece cerrar sesión.
  if (a.estado === 'sin_permiso') return <Navigate to="/admin" replace />;
  if (a.estado === 'activa') {
    const destino = typeof state?.desde === 'string' && state.desde.startsWith('/admin') ? state.desde : '/admin';
    return <Navigate to={destino} replace />;
  }

  const entrar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const estado = await a.iniciar(email, password);
      if (estado !== 'activa' && estado !== 'sin_permiso') setError({ status: 500 });
    } catch (err) {
      if (err.status === 429) { setError(null); setEspera(err.retryAfter || 60); } else setError(err);
    } finally {
      setPassword(''); // la contraseña no se conserva ni tras entrar ni tras fallar
      setEnviando(false);
    }
  };

  return (
    <main className="pagina login">
      <form className="login-caja" onSubmit={entrar} noValidate>
        <h1>Administración</h1>
        <p>Acceso para la administración general y las cuentas parroquiales.</p>
        {a.aviso && <p className="aviso-ok" role="status">{a.aviso}</p>}
        <Campo nombre="email" etiqueta="Correo electrónico" tipo="email" valor={email} onCambio={setEmail} autoComplete="username" required error={error?.fields?.email} />
        <Campo nombre="password" etiqueta="Contraseña" tipo={ver ? 'text' : 'password'} valor={password} onCambio={setPassword} autoComplete="current-password" required error={error?.fields?.password} />
        <Campo nombre="ver" etiqueta="Mostrar la contraseña" tipo="checkbox" valor={ver} onCambio={setVer} />
        <AvisoError error={error} />
        {espera > 0 && <p className="aviso-error" role="status">Demasiados intentos. Podrás intentarlo de nuevo en {esperaTexto(espera)}.</p>}
        <button className="boton boton-principal" type="submit" disabled={enviando || espera > 0}>{enviando ? 'Entrando…' : espera > 0 ? `Espera ${esperaTexto(espera)}` : 'Entrar'}</button>
        <Link to="/">Volver al sitio público</Link>
      </form>
    </main>
  );
}
