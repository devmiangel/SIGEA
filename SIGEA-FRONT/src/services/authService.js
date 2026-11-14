import axios from 'axios';
import api, { API_BASE_URL } from './api';

const API_URL = `${API_BASE_URL}/usuarios/login/`;

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
    const response =  await api.get('/me/');
    return response.data;
}

export const logoutService = async () => {
    await api.post('/auth/logout/')
}

// Usa la instancia "api": si hay sesión (admin creando usuarios) envía el token,
// y el backend solo respeta el "rol" enviado cuando quien registra es administrador.
// En el registro público no hay token y el rol siempre queda como "Usuarios".
export const registerUser = async (payload) => {
    try {
        const response = await api.post('/register/', payload)
        return response.data
    } catch (error) {
        const result = error.response?.data
        throw new Error(result?.message || 'Error al registrar el usuario')
    }
}