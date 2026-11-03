import { useCallback, useEffect, useState } from 'react';

// Carga `cargar()` cuando cambian las dependencias. Devuelve { cargando, datos, error, reintentar }.
export function usarApi(cargar, dependencias) {
  const [estado, setEstado] = useState({ cargando: true, datos: null, error: null });
  const [intento, setIntento] = useState(0);
  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  useEffect(() => {
    let activo = true;
    setEstado({ cargando: true, datos: null, error: null });
    cargar().then(
      (datos) => activo && setEstado({ cargando: false, datos, error: null }),
      (error) => activo && setEstado({ cargando: false, datos: null, error }),
    );
    return () => { activo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, intento]);

  return { ...estado, reintentar };
}
