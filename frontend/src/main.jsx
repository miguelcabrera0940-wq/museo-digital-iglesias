import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './estilos/fuentes.css';
import './estilos/tokens.css';
import './estilos/global.css';
import './estilos/museo.css';
import './estilos/horarios.css';
import './estilos/tramites.css';
import './estilos/inicio.css';
import './estilos/admin.css';
import './estilos/movimiento.css';
import App from './App.jsx';

createRoot(document.getElementById('raiz')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
