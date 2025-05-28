import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import styles from './../../styles/ClienteServicios.module.css';

const StepsModal = ({ 
  show, 
  onHide, 
  steps, 
  loading = false 
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName={styles.modalSteps}
    >
      <Modal.Header closeButton>
        <Modal.Title>Pasos del servicio</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <p className={styles.loadingMessage}>Cargando pasos...</p>
        ) : steps.length > 0 ? (
          <ul className={styles.stepsList}>
            {steps.map((step, index) => (
              <li key={index} className={styles.stepItem}>
                <strong>{step.name}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.loadingMessage}>
            No hay pasos disponibles para este servicio.
          </p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          className={styles.btnSecondary}
          onClick={onHide}
        >
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StepsModal;