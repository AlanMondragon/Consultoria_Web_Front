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
      <Modal show={show} onHide={onHide} centered size="lg" className={styles.previewModal}>
        <Modal.Header closeButton className={styles.modalHeader}>
          <Modal.Title className={styles.modalTitle}>{service.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.previewModalBody}>
          <div className={styles.previewContent}>
            {/* Imagen principal */}
            <div className={styles.imageSection}>
              <img 
                src={service.image} 
                alt={service.name} 
                className={styles.previewImage} 
              />
            </div>
            
            {/* Información del servicio */}
            <div className={styles.infoSection}>
              <div className={styles.descriptionContainer}>
                <h6 className={styles.sectionTitle}>Descripción</h6>
                <p className={styles.description}>{service.description}</p>
              </div>
              
              <div className={styles.priceContainer}>
                <span className={styles.priceLabel}>Pago inicial</span>
                <span className={styles.priceValue}>
                  MX${service.cashAdvance ? service.cashAdvance.toFixed(2) : '0.00'}
                </span>
              </div>
              
              {service.imageDetail && (
                <div className={styles.detailSection}>
                  <h6 className={styles.sectionTitle}>Información de costos</h6>
                  <img
                    src={service.imageDetail}
                    alt="Detalle de costos"
                    onClick={() => setIsZoomed(!isZoomed)}
                    className={styles.detailImage}
                  />
                  <small className={styles.clickHint}>Haz clic para ampliar</small>
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className={styles.previewModalFooter}>
          <Button 
            className={styles.stepsButton}
            onClick={() => onViewSteps(service.idTransact)}
          >
            <i className="fas fa-list me-2"></i>
            Ver pasos
          </Button>
          <Button 
            variant="outline-secondary" 
            onClick={onHide}
            className={styles.closeButton}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Zoom Overlay mejorado */}
      {isZoomed && (
        <div
          onClick={() => setIsZoomed(false)}
          className={styles.zoomOverlay}
        >
          <div className={styles.zoomContainer}>
            <img
              src={service.imageDetail}
              alt="Imagen ampliada"
              className={styles.zoomedImage}
            />
            <button 
              className={styles.closeZoom}
              onClick={() => setIsZoomed(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}