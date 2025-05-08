import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../NavbarAdmin.jsx';
import '../../styles/ContenedorHome.css'
import clientes from '../../img/Clientes.png';
import servicios from '../../img/Servicios.png';
import tramites from '../../img/Tramites.png';

export default function AdministradorHome() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      console.log('El usuario es: ', decoded.idUser);
      if (decoded.role !== "ADMIN") {
        navigate("/");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      navigate("/");
    }
  }, []);


  return (
    <div style={{ marginTop: '100px' }}>
      <Navbar></Navbar>
      <div className="ContenedorG">
        <div className="tarjeta" onClick={() => navigate("/ServiciosAdmin")}>
          <img src={servicios} alt="Servicios" />
          <h3>Servicios</h3>
          <p>Gestión de servicios</p>
        </div>
        <div className="tarjeta" onClick={() => navigate("/ClientesAdmin")}>
          <img src={clientes} alt="Clientes" />
          <h3>Clientes</h3>
          <p>Gestión de clientes</p>
        </div>
        <div className="tarjeta " onClick={() => navigate("/TramitesAdmin")}>
          <img src={tramites} alt="Trámites" />
          <h3>Trámites</h3>
          <p>Trámites Activos</p>
        </div>
      </div>
    </div>

  );
}

