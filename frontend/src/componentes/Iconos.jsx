const base = { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const Candado = () => (
  <svg {...base} strokeWidth="2"><rect x="4" y="9" width="12" height="9" rx="2" /><path d="M7 9V6a3 3 0 0 1 6 0v3" /></svg>
);

export const Flecha = ({ dir = 'izq' }) => (
  <svg {...base}><path d={dir === 'izq' ? 'M12 4 6 10l6 6' : 'M8 4l6 6-6 6'} /></svg>
);
