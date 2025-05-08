import React from 'react'
import { useLocation } from 'react-router-dom';

export default function AtualizarPasos() {

  const location = useLocation();
  const idTransact = location.state.serviceID;

  const viewID = () => {  
    console.log('ID recibido en RegistrarPasos:', idTransact); // Verificar el ID recibido
  }

  return (
    <button onClick={viewID}>AtualizarPasos</button>
  )
}
