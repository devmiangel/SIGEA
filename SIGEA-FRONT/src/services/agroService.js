import api from './api';

export const checkEsProductor = async () => {
    const response = await api.get('/usuarios/me/es_productor/');
    return response.data;
}

export const crearSolicitud = async (observacion) => {
    const response = await api.post('/visitas/solicitudes/crear/', { observacion });
    return response.data;
}

export const getSolicitudes = async () => {
    const response = await api.get('/visitas/solicitudes/');
    return response.data;
}
