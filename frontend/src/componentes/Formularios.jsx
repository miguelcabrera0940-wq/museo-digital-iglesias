import { useCallback, useState } from 'react';
import { mensajeError } from '../paginas/admin/errores.js';

// Campo con etiqueta, ayuda y error asociados. `error` suele venir de `fields` del contrato.
export function Campo({ nombre, etiqueta, ayuda, error, tipo = 'text', opciones, valor, onCambio, ...resto }) {
  const id = `f-${nombre}`;
  const describe = [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const comun = { id, name: nombre, 'aria-describedby': describe, 'aria-invalid': error ? true : undefined, ...resto };
  const cambio = (e) => onCambio(e.target.value);

  let control;
  if (tipo === 'area') control = <textarea rows={5} {...comun} value={valor ?? ''} onChange={cambio} />;
  else if (tipo === 'select') control = <select {...comun} value={valor ?? ''} onChange={cambio}>{opciones.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>;
  else if (tipo === 'checkbox') control = <input type="checkbox" {...comun} checked={!!valor} onChange={(e) => onCambio(e.target.checked)} />;
  else control = <input type={tipo} {...comun} value={valor ?? ''} onChange={cambio} />;

  return (
    <div className={`campo${tipo === 'checkbox' ? ' campo-casilla' : ''}`}>
      {tipo === 'checkbox' ? <label htmlFor={id}>{control} {etiqueta}</label> : <><label htmlFor={id}>{etiqueta}</label>{control}</>}
      {ayuda && <p id={`${id}-ayuda`} className="campo-ayuda">{ayuda}</p>}
      {error && <p id={`${id}-error`} className="campo-error" role="alert">{error}</p>}
    </div>
  );
}

export const AvisoError = ({ error }) => (error ? <p className="aviso-error" role="alert">{mensajeError(error)}</p> : null);
export const AvisoOk = ({ texto }) => (texto ? <p className="aviso-ok" role="status">{texto}</p> : null);

// Estado de envío compartido por los formularios; `enviar` devuelve { ok, datos } y nunca finge un guardado.
export function usarEnvio() {
  const [estado, setEstado] = useState({ enviando: false, error: null, ok: null });
  const enviar = useCallback(async (fn, mensajeOk) => {
    setEstado({ enviando: true, error: null, ok: null });
    try {
      const datos = await fn();
      setEstado({ enviando: false, error: null, ok: mensajeOk });
      return { ok: true, datos };
    } catch (error) {
      setEstado({ enviando: false, error, ok: null });
      return { ok: false };
    }
  }, []);
  const mostrar = useCallback((ok) => setEstado({ enviando: false, error: null, ok }), []);
  return { ...estado, enviar, mostrar };
}

// Confirmación en la propia página (sin ventana emergente): el DELETE solo se pide tras «Sí, eliminar».
export function ConfirmarBorrado({ texto, enviando, error, onConfirmar, onCancelar }) {
  return (
    <div className="confirmar" role="alertdialog" aria-label="Confirmar eliminación">
      <p><strong>{texto}</strong> Esta acción no se puede deshacer.</p>
      <AvisoError error={error} />
      <div className="acciones">
        <button className="boton boton-peligro" onClick={onConfirmar} disabled={enviando}>{enviando ? 'Eliminando…' : 'Sí, eliminar'}</button>
        <button className="boton" onClick={onCancelar} disabled={enviando}>Cancelar</button>
      </div>
    </div>
  );
}
