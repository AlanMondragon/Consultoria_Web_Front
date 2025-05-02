import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../NavbarAdmin.jsx';

export default function AdministradorTramites() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "ADMIN") {
        navigate("/");
      }
    } catch (error) {
      navigate("/");
    }
  }, []);

  return (
    <div>
      <Navbar title={"-Tramites"}></Navbar>
      Aquí se mostrarán los todos los tramites que existen de todos los clientes para la vista del administrador</div>
  );
}











