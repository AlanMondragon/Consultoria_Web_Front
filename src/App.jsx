import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

import Home from "./components/Home/Home.jsx";
import AdministradorHome from "./components/Administrador/AdministradorHome";
import AdministradorServicios from "./components/Administrador/AdministradorServicios";
import AdministradorCliente from "./components/Administrador/AdministradorClientes";
import AdministradorTramites from "./components/Administrador/AdministradorTramites";
import RegistrarServicio from "./components/Administrador/RegistraServicio";
import ActualizarServicio from "./components/Administrador/ActualizarServicio";
import RegistrarTramite from "./components/Administrador/RegistrarTramite";
import RegistrarCliente from './components/Administrador/RegistrarCliente'


import ClienteHome from "./components/Cliente/ClienteHome";
import ClienteServicios from "./components/Cliente/ClienteServicios";
import MisTramites from "./components/Cliente/MisTramites";

import NoAutorizado from "./components/NoAutorizado";
import ProtectedRoute from "./components/ProtectedRoute";
import OlvidarContra from "./components/Home/OlvidarContra.jsx";
import RegistrarPasos from "./components/Administrador/RegistrarPasos.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        {/*Contraseña olvidada*/}
        <Route path="/olvidar-contra" element={<OlvidarContra />} />

        {/* Rutas públicas */}

        {/* Rutas solo para ADMIN */}
        <Route path="/HomeAdmin" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdministradorHome />
          </ProtectedRoute>
        } />
        <Route path="/ServiciosAdmin" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdministradorServicios />
          </ProtectedRoute>
        } />
        <Route path="/ClientesAdmin" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdministradorCliente />
          </ProtectedRoute>
        } />
        <Route path="/TramitesAdmin" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdministradorTramites />
          </ProtectedRoute>
        } />
        <Route path="/RegistrarServicio" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <RegistrarServicio />
          </ProtectedRoute>
        } />
        <Route path="/ActualizarServicio" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <ActualizarServicio />
          </ProtectedRoute>
        } />
        <Route path="/RegistrarTramite" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <RegistrarTramite />
          </ProtectedRoute>
        } />
        <Route path="/RegistrarCliente" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <RegistrarCliente />
          </ProtectedRoute>
        } />
        <Route path="/RegistrarPasos" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <RegistrarPasos />
          </ProtectedRoute>
        } />

        {/* Rutas solo para USER */}
        <Route path="/ClienteHome" element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <ClienteHome />
          </ProtectedRoute>
        } />
        <Route path="/ClienteServicios" element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <ClienteServicios />
          </ProtectedRoute>
        } />
        <Route path="/MisTramites" element={
          <ProtectedRoute allowedRoles={["USER"]}>
            <MisTramites />
          </ProtectedRoute>
        } />
        

        <Route path="/no-encontrado" element={<NoAutorizado />} />
      </Routes>
    </Router>
  );
}

export default App;
