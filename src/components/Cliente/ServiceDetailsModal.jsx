import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import styles from './../../styles/ClienteServicios.module.css';

const ServiceDetailsModal = ({ 
  show, 
  onHide, 
  service, 
  onShowSteps, 
  isZoomed, 
  onToggleZoom 
}) => {
  if (!service) return null;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName={styles.wideModal}
    >
      <Modal.Header closeButton>
        <Modal.Title>{service.name}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className={styles.modalBody}>
        <div className={styles.modalBodyContent}>
          <img
            src={service.image}
            alt={service.name}
            className={styles.modalImage}
          />
          <div className={styles.modalInfo}>
            <p>{service.description}</p>
            <p className={styles.costInfoLabel}>Pago inicial:</p>
            <p className={styles.price} style={{ color: "blue" }}>
              MX$ {service.cashAdvance}.00
            </p>
            <p className={styles.costInfoLabel}>Información de costos:</p>
            <img
              src={service.imageDetail}
              alt="Detalle"
              onClick={onToggleZoom}
              style={{
                width: '100%',
                marginTop: '10px',
                cursor: 'pointer'
              }}
            />
          </div>

          {isZoomed && (
            <div
              onClick={onToggleZoom}
              className={styles.imageZoomOverlay}
            >
              <img
                src={service.imageDetail}
                alt="Ampliado"
                className={styles.zoomedImage}
              />
            </div>
          )}
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button 
          variant="info" 
          onClick={() => onShowSteps(service.idTransact)}
        >
          Ver pasos
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ServiceDetailsModal;