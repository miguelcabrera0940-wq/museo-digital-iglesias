import { useEffect, useRef, useState } from 'react';
import { ESTADOS, nombreEstado } from '../api/estados.js';

// Botón «Cambiar de estado» que despliega las opciones en línea (empuja el contenido, no tapa el mapa).
export default function SelectorEstado({ activo, onCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef(null);
  const boton = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => { if (!caja.current.contains(e.target)) setAbierto(false); };
    document.addEventListener('pointerdown', fuera);
    return () => document.removeEventListener('pointerdown', fuera);
  }, [abierto]);

  const cerrarConEscape = (e) => {
    if (e.key === 'Escape' && abierto) { setAbierto(false); boton.current.focus(); }
  };
  const elegir = (clave) => { setAbierto(false); boton.current.focus(); if (clave !== activo) onCambiar(clave); };

  return (
    <div className="selector-estado" ref={caja} onKeyDown={cerrarConEscape}>
      <button ref={boton} className="boton" aria-expanded={abierto} aria-controls="opciones-estado" onClick={() => setAbierto(!abierto)}>
        Cambiar de estado
        <span className="estado-activo">{nombreEstado(activo)}</span>
      </button>
      {abierto && (
        <ul id="opciones-estado" className="selector-estado-lista escalona">
          {ESTADOS.map((e) => (
            <li key={e.clave}>
              <button className="boton" aria-pressed={e.clave === activo} autoFocus={e.clave === activo} onClick={() => elegir(e.clave)}>
                {e.nombre}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
