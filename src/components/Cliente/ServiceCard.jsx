import React from 'react';
import cardStyles from '../../styles/servicios/client/ServiceCard.module.css';

export default function ServiceCard({ service, onShowDetails, onPay }) {
  return (
    <div className={cardStyles.serviceCard}>
      <img
        src={service.image}
        alt={service.name}
        className={cardStyles.serviceCardImage}
      />
      <h2 className={cardStyles.serviceCardTitle}>{service.name}</h2>      <p className={cardStyles.serviceCardDescription}>
        {service.description?.length > 150 ? `${service.description.slice(0, 150)}...` : service.description}
      </p>
      <p className={cardStyles.price}>MX${service.cashAdvance}</p>
      <button
        className={cardStyles.cardButton}
        onClick={() => onShowDetails(service)}
      >
        Mostrar Más
      </button>
      <button
        className={cardStyles.cardButtonPay}
        onClick={() => onPay(service)}
      >
        Pagar MX${service.cashAdvance}
      </button>
    </div>
  );
}
