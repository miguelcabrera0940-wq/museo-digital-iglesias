import { Link, Route, Routes } from 'react-router-dom';
import AvisoMocks from './componentes/AvisoMocks.jsx';
import { EstadoError } from './componentes/Estados.jsx';
import PaginaMapa from './paginas/publico/Mapa.jsx';
import Interior from './paginas/publico/Interior.jsx';
import Museo from './paginas/publico/Museo.jsx';
import Ficha from './paginas/publico/Ficha.jsx';
import Lector from './paginas/publico/Lector.jsx';
import Horarios from './paginas/publico/Horarios.jsx';
import Tramites from './paginas/publico/Tramites.jsx';
import SesionAdmin from './auth/SesionAdmin.jsx';
import RutaProtegida from './auth/RutaProtegida.jsx';
import Login from './paginas/admin/Login.jsx';
import AdminInicio from './paginas/admin/Inicio.jsx';
import Panel from './paginas/admin/Panel.jsx';
import DatosIglesia from './paginas/admin/DatosIglesia.jsx';
import AdminMateriales from './paginas/admin/Materiales.jsx';
import MaterialForm from './paginas/admin/MaterialForm.jsx';
import LeerPrivado from './paginas/admin/LeerPrivado.jsx';
import AdminHorarios from './paginas/admin/Horarios.jsx';
import AdminActividades from './paginas/admin/Actividades.jsx';
import AdminTramites from './paginas/admin/Tramites.jsx';

export default function App() {
  return (
    <>
      <AvisoMocks />
      <header className="cabecera sobre-oscuro">
        <Link to="/" className="marca">
          <svg width="26" height="30" viewBox="0 0 26 30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 28V12a10 10 0 0 1 20 0v16M1 28h24M13 9v10M9 13h8" /></svg>
          Museo Digital de Iglesias
        </Link>
      </header>
      <Routes>
        <Route path="/" element={<PaginaMapa />} />
        <Route path="/iglesias/:slug" element={<Interior />} />
        <Route path="/iglesias/:slug/museo" element={<Museo />} />
        <Route path="/iglesias/:slug/museo/:materialId" element={<Ficha />} />
        <Route path="/iglesias/:slug/museo/:materialId/leer" element={<Lector />} />
        <Route path="/iglesias/:slug/horarios" element={<Horarios />} />
        <Route path="/iglesias/:slug/tramites" element={<Tramites />} />
        <Route path="/admin" element={<SesionAdmin />}>
          <Route path="login" element={<Login />} />
          <Route element={<RutaProtegida />}>
            <Route index element={<AdminInicio />} />
            <Route path=":slug/materiales/:materialId/leer" element={<LeerPrivado />} />
            <Route path=":slug" element={<Panel />}>
              <Route index element={<DatosIglesia />} />
              <Route path="materiales" element={<AdminMateriales />} />
              <Route path="materiales/nuevo" element={<MaterialForm />} />
              <Route path="materiales/:materialId" element={<MaterialForm />} />
              <Route path="horarios" element={<AdminHorarios />} />
              <Route path="actividades" element={<AdminActividades />} />
              <Route path="tramites" element={<AdminTramites />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<main className="pagina"><EstadoError error={{ status: 404 }} /></main>} />
      </Routes>
    </>
  );
}
