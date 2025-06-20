import React from 'react'
import PayPalButton from './components/PayPal/BottonTest';
import PayPalScriptLoader from './components/PayPal/PayPalScriptLoader';
export default function PruebaPago() {
    return (
    <div>
      <h1>Compra un producto</h1>
      <PayPalScriptLoader/>
      <PayPalButton amount="10.00" />
    </div>
  );
}
