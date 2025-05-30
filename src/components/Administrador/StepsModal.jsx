import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styles from './../../styles/AdminServicios.module.css';

export default function StepsModal({ 
  show, 
  onHide, 
  steps = [], 
  serviceId,
  onClearSteps 
}) {
  const navigate = useNavigate();

  console.log('StepsModal - serviceId recibido:', serviceId); // Debug

  const handleClose = () => {
    onHide();
    if (onClearSteps) {
      onClearSteps(); // Clear steps when closing
    }
  };

  const handleAddSteps = () => {
    console.log('Navegando con serviceID:', serviceId); // Debug
    navigate("/RegistrarPasos", { state: { serviceID: serviceId } });
  };

  const handleUpdateSteps = () => {
    console.log('Actualizando con serviceID:', serviceId); // Debug
    navigate("/ActualizarPasos", { 
      state: { 
        serviceID: serviceId, 
        isEditMode: true 
      } 
    });
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      className={styles.modalSteps}
    >
      <Modal.Header closeButton className="modal-header">
        <Modal.Title className="modal-title">Pasos del trámite</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-body">
        {steps && steps.length > 0 ? (
          <ol className={styles.stepsList} style={{ paddingLeft: '0' }}>
            {steps.map((step, index) => (
              <li key={step.id || index} className={styles.stepItem}>
                {step.name}
              </li>
            ))}
          </ol>
        ) : (
          <div className={styles.noStepsContainer}>
            <p className={styles.loadingMessage}>
              No hay pasos disponibles para este trámite.
              ¿Desea agregar pasos al trámite?
            </p>
            <Button
              onClick={handleAddSteps}
              className={`${styles.btnAddSteps} btn-info`}
              disabled={!serviceId} // Disable if no serviceId
            >
              Agregar pasos
            </Button>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer className="modal-footer">
        <Button
          variant="secondary"
          onClick={handleClose}
          className={styles.btnSecondary}
        >
          Cerrar
        </Button>
        {steps && steps.length > 0 && serviceId && (
          <Button
            variant="primary"
            onClick={handleUpdateSteps}
            className={styles.btnPrimary}
          >
            Actualizar
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}