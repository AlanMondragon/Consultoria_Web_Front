import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../NavbarAdmin.jsx';

export default function RegistrarServicio() {
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
      <Navbar title={"-Registro Servicio"}></Navbar>
      Aquí se mostrará la pagina para regsitrar un servicio para el administrador</div>
  );
}



