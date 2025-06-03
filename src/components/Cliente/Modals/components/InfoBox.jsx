import { InfoIcon } from 'lucide-react';
import React from 'react';

const InfoBox = ({ 
  backgroundColor, 
  borderColor, 
  color, 
  title, 
  items = [], 
  children 
}) => (
  <div style={{
    backgroundColor,
    border: `1px solid ${borderColor}`,
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px'
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: '8px'
    }}>
      <InfoIcon color={color} />
      <strong style={{ color }}>{title}</strong>
    </div>
    {items.length > 0 ? (
      <ul style={{ 
        margin: 0, 
        paddingLeft: '20px', 
        color,
        fontSize: '14px'
      }}>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    ) : children}
  </div>
);

export default InfoBox; // ✅ Exportación por defecto correcta