import React from 'react';
import cardStyles from '../../styles/servicios/admin/AdminServiceCard.module.css';

export default function AdminServiceCard({ 
  service, 
  onEdit, 
  onViewSteps, 
  onPreview,
  formatPrice,
  truncateDescription 
}) {
  return (
    <div className={cardStyles.serviceCard}>
      <img
        src={service.image}
        alt={service.name}
        className={cardStyles.serviceCardImage}
      />
      <h2 className={cardStyles.serviceCardTitle}>{service.name}</h2>
      <p className={cardStyles.serviceCardDescription}>
        {truncateDescription(service.description, 150)}
      </p>
      <p className={cardStyles.costInfoLabel}>Pago inicial:</p>
      <p className={cardStyles.price}>MX${formatPrice(service.cashAdvance)}</p>
      
      <div className={cardStyles.buttonContainer}>
        <button
          className={cardStyles.cardButton}
          onClick={() => onEdit(service)}
        >
          Editar
        </button>
        <button
          className={`${cardStyles.cardButton} ${cardStyles.btnSecondary}`}
          onClick={() => onViewSteps(service.idTransact)}
        >
          Ver pasos
        </button>
        <button
          className={`${cardStyles.cardButton} ${cardStyles.btnInfo}`}
          onClick={() => onPreview(service)}
        >
          Vista previa
        </button>
      </div>
    </div>
  );
}
