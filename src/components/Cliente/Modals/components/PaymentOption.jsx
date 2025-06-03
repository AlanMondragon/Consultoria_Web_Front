import React from 'react';

const PaymentOption = ({ option, isSelected, onSelect, optionKey }) => {
  if (!option.amount || option.amount <= 0) return null;

  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '10px',
        padding: '15px',
        border: isSelected ? '2px solid #007bff' : '1px solid #ddd',
        borderRadius: '8px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#f8f9fa' : 'white',
        transition: 'all 0.2s ease'
      }}
      onClick={() => onSelect(optionKey)}
    >
      <input 
        type="radio" 
        name="paymentType" 
        value={optionKey}
        checked={isSelected}
        onChange={() => onSelect(optionKey)}
        style={{ marginRight: '12px' }}
      />
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontWeight: 'bold', 
          color: '#333', 
          marginBottom: '4px',
          fontSize: '15px'
        }}>
          {option.description}
        </div>
        <div style={{ 
          fontSize: '16px', 
          color: '#007bff', 
          marginBottom: '6px',
          fontWeight: 'bold'
        }}>
          💰 ${option.amount.toFixed(2)} MXN
          {option.isDeposit && (
            <span style={{ 
              color: '#28a745', 
              fontWeight: 'normal',
              fontSize: '14px',
              marginLeft: '8px'
            }}>
              (Apartado)
            </span>
          )}
        </div>
        <div style={{ 
          fontSize: '13px', 
          color: '#666',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ marginRight: '4px' }}>
            {option.isDeposit ? '📋' : '⏱️'}
          </span>
          <span>{option.processingTime}</span>
        </div>
      </div>
    </div>
  );
};

const PaymentOptions = ({ 
  paymentOptions, 
  selectedPaymentType, 
  onPaymentTypeChange, 
  isVisaAmericana 
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h4 style={{ marginBottom: '15px', color: '#333', fontSize: '16px' }}>
        {isVisaAmericana 
          ? 'Selecciona el tiempo de procesamiento:' 
          : 'Selecciona tu opción de pago:'
        }
      </h4>
      
      {Object.entries(paymentOptions).map(([key, option]) => (
        <PaymentOption
          key={key}
          option={option}
          optionKey={key}
          isSelected={selectedPaymentType === key}
          onSelect={onPaymentTypeChange}
        />
      ))}
    </div>
  );
};

export default PaymentOptions; 