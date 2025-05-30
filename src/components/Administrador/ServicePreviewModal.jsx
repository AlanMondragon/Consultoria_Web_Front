import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import styles from './../../styles/AdminServicios.module.css';

export default function ServicePreviewModal({ 
  show, 
  onHide, 
  service, 
  onViewSteps 
}) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!service) return null;

  return (
    <>
      <Modal show={show} onHide={onHide} centered dialogClassName={styles.wideModal}>
        <Modal.Header closeButton>
          <Modal.Title>{service.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modalBody}>
          <div className={styles.modalBodyContent}>
            <img 
              src={service.image} 
              alt={service.description} 
              className={styles.modalImage} 
            />
            <div className={styles.modalInfo}>
              <p>{service.description}</p>
              <p className={styles.costInfoLabel}>Pago inicial:</p>
              <p className={styles.price} style={{ color: "blue" }}>
                MX$ {service.cashAdvance}.00
              </p>
              <p className={styles.costInfoLabel}>Informacion de costos:</p>
              <img
                src={service.imageDetail}
                alt="Detalle"
                onClick={() => setIsZoomed(!isZoomed)}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="info" onClick={() => onViewSteps(service.idTransact)}>
            Ver pasos
          </Button>
          <Button variant="secondary" onClick={onHide}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Zoom Overlay */}
      {isZoomed && (
        <div
          onClick={() => setIsZoomed(false)}
          className={styles.imageZoomOverlay}
        >
          <img
            src={service.imageDetail}
            alt="Ampliado"
            className={styles.zoomedImage}
          />
        </div>
      )}
    </>
  );
}