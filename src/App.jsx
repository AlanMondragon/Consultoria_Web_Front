import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import Home from "./components/Home/Home";
import AdministradorHome from "./components/Administrador/AdministradorHome"
import AdministradorServicios from "./components/Administrador/AdministradorServicios";
import AdministradorCliente from "./components/Administrador/AdministradorClientes";
import AdministradorTramites from "./components/Administrador/AdministradorTramites";
import RegistrarServicio from "./components/Administrador/RegistraServicio";
import ActualizarServicio from "./components/Administrador/ActualizarServicio";
import RegistrarTramite from "./components/Administrador/RegistrarTramite";
import ClienteHome from "./components/Cliente/ClienteHome";
import ClienteServicios from "./components/Cliente/ClienteServicios";
import MisTramites from "./components/Cliente/MisTramites";
function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/HomeAdmin" element={<AdministradorHome/>} />
      <Route path="/ServiciosAdmin" element={<AdministradorServicios/>} />
      <Route path="/ClientesAdmin" element={<AdministradorCliente/>} />
      <Route path="/TramitesAdmin" element={<AdministradorTramites/>} />
      <Route path="/RegistrarServicio" element={<RegistrarServicio/>} />
      <Route path="/ActualizarServicio" element={<ActualizarServicio/>} />
      <Route path="/RegistrarTramite" element={<RegistrarTramite/>} />
      <Route path="/ClienteHome" element={<ClienteHome/>} />
      <Route path="/ClienteServicios" element={<ClienteServicios/>} />
      <Route path="/MisTramites" element={<MisTramites/>} />
    </Routes>
  </Router>
  )
}

export default App
