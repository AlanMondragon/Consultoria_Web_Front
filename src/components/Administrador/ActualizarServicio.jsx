import React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function ActualizarServicio() {
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
       <div>
      <h2>Aquí se mostrará la página para actualizar un servicio para la página de administrador</h2>

      <Button variant="primary" onClick={() => setShowModal(true)}>
        Abrir Modal de Actualización
      </Button>

      <ModalActualizarServicio show={showModal} onHide={() => setShowModal(false)} />
    </div>
    </div>
  );
}



