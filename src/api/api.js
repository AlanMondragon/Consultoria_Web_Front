import axios from 'axios';
import dayjs from 'dayjs';


/**
 * Función para actualizar pasos existentes y crear nuevos si es necesario
 * @param {number} idTransact - ID del trámite
 * @param {Array} stepsArray - Arreglo de pasos a actualizar o crear
 * @returns {Array} - Resultados de las operaciones
 */

const API_URL = import.meta.env.VITE_API_URL;
const API_URL_MAIL = import.meta.env.VITE_API_URL_MAIL
const URL_DS160 = import.meta.env.VITE_URL_DS160;
console.log('API_URL:', API_URL);

export const Login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const FindByID = async (id, token) => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

export const forgetPassword = async (email, token) => {
  try {
    const response = await axios.post(`${API_URL}/forget-password`, { email }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error during password recovery:', error);
    throw error;
  }
};


//Procesos (los procesos disponibles para el cliente)
export const getAllProcess = async () => {
  try {
    console.log('getAllProcess: API_URL =', API_URL);
    console.log('getAllProcess: URL completa =', `${API_URL}/transaction/web`);
    const response = await axios.get(`${API_URL}/transaction/web`);
    console.log('getAllProcess: Respuesta recibida =', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching processes:', error);
    console.error('Error details:', error.response?.data);
    throw error;
  }
};
export const servicios = async () => {
  try {
    const response = await axios.get(`${API_URL}/transaction`);
    return response.data;
  } catch (error) {
    console.error('Error fetching processes:', error);
    throw error;
  }
};

export const createService = async (serviceData) => {
  try {
    const payload = {
      name: serviceData.name,
      description: serviceData.description,
      image: serviceData.image, // Base64 string
      imageDetail: serviceData.imageDetail, // Base64 string
      simulation: serviceData.simulation,
      cas: serviceData.cas,
      con: serviceData.con,
      cashAdvance: serviceData.cashAdvance,
      status: true,
      totalPayment: serviceData.totalPayment,
      cost: serviceData.cost ?? null,
      nameOption: serviceData.nameOption ?? null,
      optionCost: serviceData.optionCost ?? null,
      isDateService: serviceData.isDateService ?? null
    };

    const response = await axios.post(`${API_URL}/transaction/web`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

export const getNameService = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/transaction/${id}`);
    const name = response.data.response.Transact.name;
    return name;
  } catch (error) {
    console.error('Error fetching service by ID:', error);
    throw error;
  }
}

export const getServiceById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/transaction/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching steps:', error);
    throw error;
  }
}


//Pasos para los procesos (los pasos disponibles para el cliente)
export const getSteps = async () => {
  try {
    const response = await axios.get(`${API_URL}/steps`);
    return response.data;
  } catch (error) {
    console.error('Error fetching steps:', error);
    throw error;
  }
};

export const getStepById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/steps/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching step by ID:', error);
    throw error;
  }
};

// Creacion de los pasos para los procesos

export const createSteps = async (stepsArray) => {
  if (!Array.isArray(stepsArray) || stepsArray.length === 0) {
    throw new Error('Debe proporcionar un arreglo de pasos para crear.');
  }

  const results = [];

  for (const stepData of stepsArray) {
    try {
      const payload = {
        name: stepData.name,
        description: stepData.description,
        numStep: stepData.numStep, // Cambiado de stepNumber a numStep
        id: stepData.id,
        needCalendar: 0
      };

      const response = await axios.post(`${API_URL}/steps`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      results.push(response.data);
    } catch (error) {
      console.error('Error creating step:', stepData, error);
      results.push({ error: error.message, stepData });
    }
  }

  return results;
};

export const updateSteps = async (idTransact, stepsArray) => {
  if (!Array.isArray(stepsArray) || stepsArray.length === 0) {
    throw new Error('Debe proporcionar un arreglo de pasos para actualizar.');
  }

  console.log("Iniciando actualización/creación de pasos. Total:", stepsArray.length);
  console.table(stepsArray.map(s => ({
    id: s.id || 'NUEVO',
    name: s.name,
    numStep: s.numStep || s.stepNumber
  })));

  const results = [];

  for (const stepData of stepsArray) {
    try {
      // Comprobamos si es un paso nuevo o existente
      const isNewStep = !stepData.id;

      // Formato correcto según StepUpdateRequest o CreateRequest
      const payload = {
        name: stepData.name,
        description: stepData.description,
        numStep: stepData.numStep || stepData.stepNumber,
        needCalendar: stepData.needCalendar ? 1 : 0
      };

      const payloadCreate = {
        name: stepData.name,
        description: stepData.description,
        numStep: stepData.numStep || stepData.stepNumber,
        id: idTransact,
        needCalendar: stepData.needCalendar ? 1 : 0
      };

      // Para pasos nuevos, agregamos el idTransact en el payload
      if (isNewStep) {

        payloadCreate.id = idTransact;
      }

      let response;

      if (isNewStep) {
        // Creamos un nuevo paso
        console.log(`Creando nuevo paso #${stepData.numStep || stepData.stepNumber} para el trámite ${idTransact}:`, payload);

        response = await axios.post(`${API_URL}/steps`, payloadCreate, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        results.push({
          success: true,
          data: response.data,
          message: `Paso ${stepData.numStep || stepData.stepNumber} creado correctamente`
        });
      } else {
        // Actualizamos un paso existente
        console.log(`Actualizando paso ID=${stepData.id} (Paso #${stepData.numStep || stepData.stepNumber}) para el trámite ${idTransact}:`, payload);

        response = await axios.put(`${API_URL}/steps/${stepData.id}`, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        results.push({
          success: true,
          data: response.data,
          message: `Paso ${stepData.numStep || stepData.stepNumber} actualizado correctamente`
        });
      }

      console.log(`Respuesta para operación en paso #${stepData.numStep || stepData.stepNumber}:`, response.data);
    } catch (error) {
      console.error(`Error en operación de paso:`, error);

      results.push({
        error: true,
        message: error.response?.data?.message || error.message || 'Error desconocido',
        stepData
      });
    }
  }

  console.log("Resultados de las operaciones:", results);
  return results;
}



//CLIENTES ADMINISTRADOR
export const updateService = async (id, serviceData) => {
  const serviceId = Number.isInteger(id) ? id : parseInt(id, 10); // Ensure id is a valid integer
  if (isNaN(serviceId)) {
    throw new Error(`Invalid service ID: ${id}`);
  }

  try {
    const payload = {
      name: serviceData.name,
      description: serviceData.description,
      image: serviceData.image, // Base64 string
      imageDetail: serviceData.imageDetail, // Base64 string
      simulation: serviceData.simulation,
      cas: serviceData.cas,
      con: serviceData.con,
      cashAdvance: serviceData.cashAdvance
    };

    const response = await axios.put(`${API_URL}/transaction/${serviceId}`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
}

//OBTENER TODOS LOS CLIENTES
export const clientes = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  } catch (error) {
    console.error('Error durante la peticion', error);
    throw error;
  }
};

export const clientePorId = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error durante la peticion', error);
    throw error;
  }
};


export const tramitesPorId = async (id) => {
  try {
    console.log('ID de usuario enviado:', id);  // Para depuración
    const response = await axios.get(`${API_URL}/progress/progressByUserIdWeb/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener las transacciones', error);
    throw error;
  }
};

//Eliminar trnasacProgress
export const deleteTRansactProgress = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/progress/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export const obtenerLosPasos = async (id) => {
  try {
    console.log('ID de la  trasnsaccionm enviada:', id);
    const response = await axios.get(`${API_URL}/steps/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los pasos', error);
    throw error;
  }
};
export const cancelarCita = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/progress/cancelSimulation/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error al cancelar la cita', error);
    throw error;
  }
}
export const actualizarContra = async (id_user, data) => {
  try {
    const response = await axios.put(`${API_URL}/users/password/${id_user}`, { password: data });
    return response.data;
  } catch (error) {
    console.error('Error al actualizar contraseña', error);
    throw error;
  }
};

export const RegistrarCliente = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/users`, data);
    return response.data;
  } catch (error) {
    console.error('Error al hacer el post', error);
    throw error;
  }
};
export const actualizarStatusCliente = async (id_user, nuevoEstado) => {
  try {
    const response = await axios.put(`${API_URL}/users/${id_user}/status`, { status: nuevoEstado });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el estado del cliente", error);
    throw error;
  }
};

export const actualizar = async (idUser, datosActualizados) => {
  try {
    const response = await axios.put(`${API_URL}/users/${idUser}`, {
      idUser,
      name: datosActualizados.name,
      email: datosActualizados.email,
      phone: datosActualizados.phone,
      status: datosActualizados.status
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el cliente", error);
    throw error;
  }
};

//TRANSACCIONES ADMINISTRADOR
export const trasacciones = async () => {
  try {
    const response = await axios.get(`${API_URL}/progress/transactWithDataUser`)
    return response.data;
  } catch (error) {
    console.error("Error obtener las trasacciones", error);
    throw error;
  }
};
export const trasaccionesPorCliente = async () => {
  try {
    const response = await axios.get(`${API_URL}/progress/transactWithDataUser`)
    return response.data;
  } catch (error) {
    console.error("Error obtener las trasacciones", error);
    throw error;
  }
};
export const actualizarT = async (idTransactProgress, nuevoEstado) => {
  try {
    const response = await axios.patch(
      `${API_URL}/progress/${idTransactProgress}/status`,
      { status: nuevoEstado }
    );
    return response.data;
  } catch (error) {
    console.log('El nuevo estado es:', nuevoEstado);
    console.error("Error al actualizar el estadO DEL TRAMITE", error);
    throw error;
  }
};

export const actualizarTC = async (idTransactProgress, datosActualizados) => {
  try {
    const response = await axios.put(`${API_URL}/progress/${idTransactProgress}`,
      {
        idTransactProgress,
        advance: datosActualizados.advance ? 1 : 0,
        dateCas: datosActualizados.dateCas ? dayjs(datosActualizados.dateCas).format('YYYY-MM-DD HH:mm:ss') : null,
        dateCon: datosActualizados.dateCon ? dayjs(datosActualizados.dateCon).format('YYYY-MM-DD HH:mm:ss') : null,
        dateSimulation: datosActualizados.dateSimulation ? dayjs(datosActualizados.dateSimulation).format('YYYY-MM-DD HH:mm:ss') : null,
        dateStart: datosActualizados.dateStart ? dayjs(datosActualizados.dateStart).format('YYYY-MM-DD') : null,
        emailAcces: datosActualizados.emailAcces,
        passwordAcces: datosActualizados.passwordAcces,
        haveSimulation: datosActualizados.haveSimulation ? 1 : 0,
        paid: datosActualizados.paid,
        paidAll: datosActualizados.paidAll,
        status: datosActualizados.status,
        stepProgress: datosActualizados.stepProgress
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el trámite", error.response?.data || error.message);
    throw error;
  }
};
export const actualizarTCS = async (idTransactProgress, datosActualizados) => {
  try {
    const response = await axios.put(`${API_URL}/progress/simulation/${idTransactProgress}`,
      {
        idTransactProgress,
        advance: datosActualizados.advance ? 1 : 0,
        dateCas: datosActualizados.dateCas ? dayjs(datosActualizados.dateCas).format('YYYY-MM-DD HH:mm:ss') : null,
        dateCon: datosActualizados.dateCon ? dayjs(datosActualizados.dateCon).format('YYYY-MM-DD HH:mm:ss') : null,
        dateSimulation: datosActualizados.dateSimulation ? dayjs(datosActualizados.dateSimulation).format('YYYY-MM-DD HH:mm:ss') : null,
        dateStart: datosActualizados.dateStart ? dayjs(datosActualizados.dateStart).format('YYYY-MM-DD') : null,
        emailAcces: datosActualizados.emailAcces,
        passwordAcces: datosActualizados.passwordAcces,
        haveSimulation: datosActualizados.haveSimulation ? 1 : 0,
        paid: datosActualizados.paid,
        paidAll: datosActualizados.paidAll,
        status: datosActualizados.status,
        stepProgress: datosActualizados.stepProgress

      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el trámite", error.response?.data || error.message);
    throw error;
  }
};


export const actualizarPaso = async (idTransactProgress, datosActualizados) => {
  try {
    const response = await axios.put(
      `${API_URL}/progress/${idTransactProgress}/stepProgress`,
      {
        idTransactProgress,
        stepProgress: datosActualizados.stepProgress

      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el trámite", error.response?.data || error.message);
    throw error;
  }
};
//Este es para asignar un servico a un cliente , pera que emprize el proceso de que va a empezar a darle el seguimiento  a su servicio
export const RegistrarTransaccion = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/progress`, data);
    return response.data;
  } catch (error) {
    console.error('Error al crear el tramite', error);
    throw error;
  }
};
export const Obtenertrasacciones = async () => {
  try {
    const response = await axios.get(`${API_URL}/progress`)
    return response.data;
  } catch (error) {
    console.error("Error obtener las trasacciones", error);
    throw error;
  }
};

export const getAllServices = async () => {
  const response = await axios.get(`${API_URL}/services`);
  return response.data;
};

export const getAllPayments = async () => {
  try {
    const response = await axios.get(`${API_URL}/payment`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los pagos", error);
    throw error;
  }
};

//Pagos

export const statusPayments = async (idPayment, datosActualizados) => {
  try {
    const response = await axios.put(`${API_URL}/payment/${idPayment}`, {
      idPayment,
      status: datosActualizados.status,
      total: datosActualizados.total
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar el estado del pago", error.response?.data || error.message);
    throw error;
  }
};
export const createPaymentIntent = async (data) => {
  const response = await axios.post(`${API_URL}/stripe/payment-intent`, data);
  return response.data;
};

// Crear proceso con pago
export const createProcessWithPayment = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/progress/CreateProgressWithPay`, data);
    return response.data;
  } catch (error) {
    console.error("Error al crear proceso con pago:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    throw new Error(errorMessage);
  }
}

export const olvidarContra = async (email) => {
  try {
    if (!email || !email.trim() || !email.includes('@')) {
      Swal.fire('Advertencia', 'Ingresa un correo electrónico válido.', 'warning');
      return;
    }

    const body = {
      subject: "Recuperación de contraseña",
      message: "Hola, aquí tienes tu código de recuperación de parte del equipo de Consultoría JAS: ",
    };

    const response = await axios.post(
      `${API_URL_MAIL}/send/${email.trim()}`,
      body,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Respuesta del servidor:", response.data);
    return response.data;

  } catch (error) {
    console.error("Error al mandar el correo:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    throw new Error(errorMessage);
  }
};

export const olvidarContraSin = async (email) => {
  try {
    if (!email || !email.trim() || !email.includes('@')) {
      Swal.fire('Advertencia', 'Ingresa un correo electrónico válido.', 'warning');
      return;
    }

    const body = {
      subject: "Verificación de contraseña",
      message: "Hola, aquí tienes tu código de verificacion de parte del equipo de Consultoría JAS: ",
    };

    const response = await axios.post(
      `${API_URL_MAIL}/send/sin/${email.trim()}`,
      body,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Respuesta del servidor:", response.data);
    return response.data;

  } catch (error) {
    console.error("Error al mandar el correo:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    throw new Error(errorMessage);
  }
};
export const enviarCorreoConDatos = async (emailDestino, asunto, mensaje) => {
  try {
    if (!emailDestino || !emailDestino.includes('@')) {
      throw new Error('Correo destino inválido');
    }

    const body = {
      subject: asunto,
      message: mensaje,
    };

    const response = await axios.post(
      `${API_URL_MAIL}/send/prac/${emailDestino.trim()}`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error al mandar el correo:', error);
    throw error;
  }
};

export const payDS160 = async (email) => {
  try {

    const data = {
      subject: "📄 Solicitud de Información - Formulario DS-160",
      message: `¡Hola! 👋\n\nTe compartimos el enlace para recopilar la información necesaria para el llenado de tu formulario *DS-160*. \nEste es un paso importante en tu proceso, y estamos aquí para ayudarte en cada etapa.\n\n🔗 Enlace para completar tu información:\n${URL_DS160}\n\nGracias por confiar en *Consultoría JAS*.\nSi tienes alguna duda, no dudes en escribirnos.\n\nSaludos cordiales,\nEquipo de Consultoría JAS 💼✨`
    };

    const response = await axios.post(
      `${API_URL_MAIL}/send/web/${email.trim()}`,
      data,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Respuesta del servidor:", response.data);
    return response.data;

  } catch (error) {

    console.error("Error al enviar el correo de pago DS-160:", error);
    const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
    throw new Error(errorMessage);

  }
}




export const obtenerUsuarioPorCorreo = async (email) => {
  try {
    const response = await axios.get(`${API_URL}/users/email/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuario por correo', error);
    throw error;
  }
};
export const getAllDates = async () => {
  try {
    const response = await axios.get(`${API_URL}/progress/simulation`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las fechas", error);
    throw error;
  }
}