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

export const registerUser = async (payload) => {
    const response = await fetch(`${API_BASE_URL}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
        throw new Error(result?.message || 'Error al registrar el usuario')
    }

    return result
}