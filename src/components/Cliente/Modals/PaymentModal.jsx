// Main PaymentModal.jsx (Refactorizado)
import React from 'react';
import { Modal } from 'react-bootstrap';
import { usePaymentOptions } from './../hooks/UsePaymentOption';
import DS160Section from './components/DS160Section';
import StripePaymentSection from './components/StripePaymentSection';
import styles from './../../../styles/ClienteServicios.module.css';
import { LockIcon } from 'lucide-react';

const PaymentModal = ({ 
  show, 
  onHide,
  service, 
  userEmail, 
  userId, 
  onSuccess, 
  onError 
}) => {
  const {
    serviceInfo,
    paymentOptions,
    selectedPaymentType,
    setSelectedPaymentType,
    validatedPaymentType,
    currentPaymentOption
  } = usePaymentOptions(service);

  if (!service) return null;

  const { isDs160, isVisaAmericana, haveOtherCost } = serviceInfo;

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className={styles.paymentModal}
      dialogClassName="my-custom-dialog"
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title className={styles.paymentModalTitle}>
          <div className={styles.serviceIcon}>
            <LockIcon />
          </div>
          <div>
            <div className={styles.serviceTitle}>{service.name}</div>
            <div className={styles.serviceSubtitle}>
              {isDs160 
                ? 'Formulario DS-160 - Enlace de pago por correo'
                : isVisaAmericana 
                  ? 'Visa Americana - Pago seguro con Stripe' 
                  : 'Pago seguro con Stripe'
              }
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        {isDs160 ? (
          <DS160Section
            userEmail={userEmail}
            onSuccess={onSuccess}
            onError={onError}
            onHide={onHide}
          />
        ) : (
          <StripePaymentSection
            service={service}
            paymentOptions={paymentOptions}
            selectedPaymentType={validatedPaymentType}
            onPaymentTypeChange={setSelectedPaymentType}
            currentPaymentOption={currentPaymentOption}
            isVisaAmericana={isVisaAmericana}
            haveOtherCost={haveOtherCost}
            userEmail={userEmail}
            userId={userId}
            onSuccess={onSuccess}
            onError={onError}
          />
        )}
      </Modal.Body>
    </Modal>
  );
};

export default PaymentModal;