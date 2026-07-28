import axios from 'axios';
import api from './api';

const API_URL = 'http://127.0.0.1:8000/api/usuarios/login/';

export const loginService = async (credentials) => {

    try {
        const response = await axios.post(API_URL, credentials)
        const { token } = response.data
        localStorage.setItem('token', token)
        
        return response.data

    } catch (error) {
        if (error.response){
          throw new Error("Credenciales inválidas");
        } else {
            throw new Error("Error de conexión");
        }
    }
}

export const currentUserService = async () => {
    const response =  api.get('/me/');
    return response.data;
}

export const logoutService = async () => {
    await api.post('/auth/logout/')
}