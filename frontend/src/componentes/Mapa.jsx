import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { movimientoReducido } from '../movimiento.js';

const icono = (activo) =>
  L.divIcon({ className: `marcador${activo ? ' activo' : ''}`, html: '<span></span>', iconSize: [28, 28], iconAnchor: [14, 14] });

// Envoltura mínima de Leaflet: el mapa se crea una vez; marcadores y selección se sincronizan aparte.
export default function Mapa({ iglesias, seleccion, onSeleccion, etiqueta, children }) {
  const caja = useRef(null);
  const mapa = useRef(null);
  const marcadores = useRef(new Map());
  const alSeleccionar = useRef(onSeleccion);
  alSeleccionar.current = onSeleccion;

  useEffect(() => {
    const m = L.map(caja.current, { scrollWheelZoom: true });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">colaboradores de OpenStreetMap</a>',
    }).addTo(m);
    mapa.current = m;
    return () => { m.remove(); mapa.current = null; marcadores.current.clear(); };
  }, []);

  useEffect(() => {
    const m = mapa.current;
    const puntos = iglesias.map((i) => [i.latitud, i.longitud]);
    const nuevos = iglesias.map((i) =>
      L.marker([i.latitud, i.longitud], { icon: icono(false), title: i.nombre, alt: i.nombre })
        .on('click', () => alSeleccionar.current(i.slug))
        .addTo(m),
    );
    iglesias.forEach((i, n) => marcadores.current.set(i.slug, nuevos[n]));
    if (puntos.length) m.fitBounds(puntos, { padding: [40, 40], maxZoom: 17 });
    return () => { nuevos.forEach((x) => x.remove()); marcadores.current.clear(); };
  }, [iglesias]);

  useEffect(() => {
    marcadores.current.forEach((x, slug) => x.setIcon(icono(slug === seleccion)));
    const elegido = iglesias.find((i) => i.slug === seleccion);
    if (elegido) mapa.current.panTo([elegido.latitud, elegido.longitud], { animate: !movimientoReducido() });
  }, [seleccion, iglesias]);

  return (
    <div className="mapa-caja">
      {children}
      <div ref={caja} className="mapa" role="region" aria-label={etiqueta} />
    </div>
  );
}
