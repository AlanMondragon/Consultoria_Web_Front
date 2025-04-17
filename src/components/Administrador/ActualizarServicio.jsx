import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import ModalActualizarServicio from './ModalActualizarServicio'; // Asegúrate de que esta ruta sea correcta

export default function ActualizarServicio() {
  const [showModal, setShowModal] = useState(false);

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
