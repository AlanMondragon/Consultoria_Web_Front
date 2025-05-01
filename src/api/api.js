import axios from 'axios';

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
  
  