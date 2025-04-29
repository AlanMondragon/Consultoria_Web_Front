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
        const response = await axios.get(`${API_URL}/transaction`);
        return response.data;
    } catch (error) {
        console.error('Error fetching processes:', error);
        throw error;
    }
};
