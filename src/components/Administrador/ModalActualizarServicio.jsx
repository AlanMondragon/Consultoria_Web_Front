import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function ModalActualizarServicio({ show, onHide }) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      aria-labelledby="modal-actualizar-servicio"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="modal-actualizar-servicio">
          Actualizar Servicio
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Aquí puedes colocar un formulario o los datos a actualizar del servicio.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={() => alert('Servicio actualizado')}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
