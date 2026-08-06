import api from './api';

export const checkEsProductor = async () => {
    const response = await api.get('/usuarios/me/es_productor/');
    return response.data;
}

export const crearSolicitud = async (data) => {
    const response = await api.post('/visitas/solicitudes/crear/', data);
    return response.data;
}

export const getSolicitudes = async () => {
    const response = await api.get('/visitas/solicitudes/');
    return response.data;
}

export const getTodasSolicitudes = async () => {
    const response = await api.get('/visitas/solicitudes/');
    return response.data;
}

export const getMisUPs = async () => {
    const response = await api.get('/UPs/mis-ups/');
    return response.data;
}

export const validarUP = async (upId, aprobada) => {
    const response = await api.post(`/UPs/validar-ups/${upId}/`, { aprobada });
    return response.data;
}

export const getFuncionarios = async () => {
    const response = await api.get('/usuarios/funcionarios/');
    return response.data;
}

export const getUsuarios = async () => {
    const response = await api.get('/usuarios/usuarios/');
    return response.data;
}

export const actualizarUsuario = async (usuarioId, data) => {
    const response = await api.patch(`/usuarios/usuarios/${usuarioId}/`, data);
    return response.data;
}

export const eliminarUsuario = async (usuarioId) => {
    const response = await api.delete(`/usuarios/usuarios/${usuarioId}/`);
    return response.data;
}

export const getTiposVisitas = async () => {
    const response = await api.get('/visitas/tiposVisitas/');
    return response.data;
}

export const getVisitas = async () => {
    const response = await api.get('/visitas/visitas/');
    return response.data;
}

export const getMisVisitas = async () => {
    const response = await api.get('/visitas/mis-visitas/');
    return response.data;
}

export const marcarVisitaRealizada = async (visitaId) => {
    const response = await api.patch(`/visitas/visitas/${visitaId}/`, { estado: true });
    return response.data;
}

export const atenderSolicitud = async (solicitudId, data) => {
    const response = await api.post(`/visitas/solicitudes/${solicitudId}/atender/`, data);
    return response.data;
}

export const rechazarSolicitud = async (solicitudId) => {
    const response = await api.post(`/visitas/solicitudes/${solicitudId}/rechazar/`);
    return response.data;
}
