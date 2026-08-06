import api from '../../../../../services/api'

export const enviarFormularioVisita = async (data) => {
    const response = await api.post('/visitas/formulario-visita/', data)
    return response.data
}

export const getInfoProductor = async (userId, solicitudId, upId) => {
    const params = {}
    if (solicitudId) params.solicitud_id = solicitudId
    if (upId) params.up_id = upId
    const response = await api.get(`/UPs/info_personal_caracterizacion/${userId}/`, { params })
    return response.data
}

export const getInfoUP = async (userId, solicitudId, upId) => {
    const params = {}
    if (solicitudId) params.solicitud_id = solicitudId
    if (upId) params.up_id = upId
    const response = await api.get(`/UPs/info_up_caracterizacion/${userId}/`, { params })
    return response.data
}

export const getInfoPredio = async (userId, solicitudId, upId) => {
    const params = {}
    if (solicitudId) params.solicitud_id = solicitudId
    if (upId) params.up_id = upId
    const response = await api.get(`/UPs/info_predio_caracterizacion/${userId}/`, { params })
    return response.data
}
