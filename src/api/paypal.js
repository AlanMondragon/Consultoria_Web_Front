const API_URL = import.meta.env.VITE_API_URL;

/**
 * Envía los datos de un pago de PayPal al backend
 * @param {Object} paymentData - Detalles del pago de PayPal
 * @param {string} userId - ID del usuario que realiza el pago
 * @param {Object} service - Objeto con la información del servicio pagado
 * @returns {Promise} - Respuesta de la API
 */
export const registerPayPalPayment = async (paymentData, userId, service) => {
  try {
    // Asegúrate de que se está usando el monto correcto, tal como viene en paymentData
    const paymentAmount = paymentData?.purchase_units?.[0]?.amount?.value || 
                         service.cost || 
                         service.price || 
                         0;
                         
    const response = await fetch(`${API_URL}/payments/paypal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        paymentDetails: paymentData,
        userId: userId,
        serviceId: service.id || service.idTransact,
        serviceName: service.name,
        amount: paymentAmount,
        paymentMethod: 'paypal',
        status: 'completed',
        paymentDate: new Date().toISOString()
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al registrar el pago de PayPal');
    }

    return {
      success: true,
      response: data
    };
  } catch (error) {
    console.error('Error al registrar pago de PayPal:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtiene el historial de pagos de PayPal de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise} - Respuesta de la API con la lista de pagos
 */
export const getPayPalPaymentHistory = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/payments/paypal/history/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener historial de pagos');
    }

    return {
      success: true,
      response: data
    };
  } catch (error) {
    console.error('Error al obtener historial de pagos:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

