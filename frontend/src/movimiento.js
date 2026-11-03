// El movimiento se adapta solo: el CSS y este helper siguen la preferencia del sistema (prefers-reduced-motion).
export const movimientoReducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
