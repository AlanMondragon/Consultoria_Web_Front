import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Button } from 'react-bootstrap'; 
import ModalActualizarServicio from './ModalActualizarServicio'; 

export default function ActualizarServicio() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

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
  }, [navigate]); // Buenas prácticas: agregar navigate como dependencia

  return (
    <div>
      <h2>Aquí se mostrará la página para actualizar un servicio para la página de administrador</h2>

      <Button variant="primary" onClick={() => setShowModal(true)}>
        Abrir Modal de Actualización
      </Button>

      <ModalActualizarServicio show={showModal} onHide={() => setShowModal(false)} />
    </div>
  );
}
