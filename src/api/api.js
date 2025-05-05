import axios from 'axios';
import dayjs from 'dayjs';


const API_URL = import.meta.env.VITE_API_URL;

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
        const response = await axios.get(`${API_URL}/transaction/images`);
        return response.data;
    } catch (error) {
        console.error('Error fetching processes:', error);
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
            cashAdvance: serviceData.cashAdvance
        };

        const response = await axios.post(`${API_URL}/transaction`, payload, {
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
export const clientes = async ()=>{
    try{
        const response = await axios.get(`${API_URL}/users`);
        return response.data;
    }catch(error){
     console.error('Error durante la peticion', error);
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
  export const actualizarT = async (idTransactProgress, nuevoEstado) => {
    try {
      const response = await axios.patch(
        `${API_URL}/progress/${idTransactProgress}/stepProgress`,
        { stepProgress: nuevoEstado }
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
    const response = await axios.put(
      `${API_URL}/progress/${idTransactProgress}`,
      {
        idTransactProgress,
        advance: datosActualizados.advance ? 1 : 0,
        dateCas: datosActualizados.dateCas ? dayjs(datosActualizados.dateCas).format('YYYY-MM-DD HH:mm:ss') : null,
        dateCon: datosActualizados.dateCon ? dayjs(datosActualizados.dateCon).format('YYYY-MM-DD HH:mm:ss') : null,
        dateSimulation: datosActualizados.dateSimulation ? dayjs(datosActualizados.dateSimulation).format('YYYY-MM-DD HH:mm:ss') : null,
        dateStart: datosActualizados.dateStart ? dayjs(datosActualizados.dateStart).format('YYYY-MM-DD') : null,
        emailAcces: datosActualizados.emailAcces,
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
export const RegistrarTransaccion = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/progress`, data); 
    return response.data;
  } catch (error) {
    console.error('Error al crear el tramite', error);
    throw error;
  }
};




