import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/usuarios/login/';

export const login = async (credentials) => {
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