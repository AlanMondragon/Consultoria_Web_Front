// components/Icons.jsx
import React from 'react';

export const InfoIcon = ({ color = "currentColor" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    fill={color} 
    viewBox="0 0 16 16"
    style={{ marginRight: '8px' }}
  >
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
  </svg>
);

export const MessageIcon = ({ color = "currentColor" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    fill={color} 
    viewBox="0 0 16 16"
    style={{ marginRight: '10px' }}
  >
    <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2A1 1 0 0 1 0 13V2a1 1 0 0 1 1-1h13zM2 2v8.793l1.146-1.147A.5.5 0 0 1 3.5 9.5H14V2H2z"/>
    <path d="M5 4a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 5 4zm0 2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5A.5.5 0 0 1 5 6zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 5 8z"/>
  </svg>
);

export const MailIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    fill="currentColor" 
    viewBox="0 0 16 16"
    style={{ marginRight: '8px' }}
  >
    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
  </svg>
);

export const LoadingSpinner = () => (
  <svg 
    style={{ 
      animation: 'spin 1s linear infinite', 
      marginRight: '8px' 
    }}
    width="16" 
    height="16" 
    viewBox="0 0 24 24"
  >
    <circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4" 
      fill="none" 
      strokeLinecap="round" 
      strokeDasharray="31.416" 
      strokeDashoffset="31.416"
    >
      <animate 
        attributeName="stroke-dasharray" 
        dur="2s" 
        values="0 31.416;15.708 15.708;0 31.416;0 31.416" 
        repeatCount="indefinite"
      />
      <animate 
        attributeName="stroke-dashoffset" 
        dur="2s" 
        values="0;-15.708;-31.416;-31.416" 
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);

export const CalendarIcon = ({ color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill={color} viewBox="0 0 24 24" style={{ marginLeft: '4px' }}>
    <path d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7zm12 18H5V8h14v12zm0-14v2H5V6h14z"/>
  </svg>
);