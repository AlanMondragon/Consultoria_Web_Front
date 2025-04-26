import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function ClienteServicios() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== "USER") {
        navigate("/"); 
      }
    } catch (error) {
      navigate("/"); 
    }
  }, []);

  return (
     <div>En esta pantalla se mostraran los servicios disponibles para el cliente, aunque creo que no es necesario</div>
  );
}



 

  