import { leer, crear, modificar } from './http'

// Solicitudes, visitas, órdenes y recibos de pago (/api/visitas/).

// --- Solicitudes ---
export const getSolicitudes = (params = {}) => leer('/visitas/solicitudes/', params)
export const crearSolicitud = (data) => crear('/visitas/solicitudes/crear/', data)
export const atenderSolicitud = (solicitudId, data) => crear(`/visitas/solicitudes/${solicitudId}/atender/`, data)
export const reagendarSolicitud = (solicitudId, data) => crear(`/visitas/solicitudes/${solicitudId}/reagendar/`, data)
export const rechazarSolicitud = (solicitudId, data = {}) => crear(`/visitas/solicitudes/${solicitudId}/rechazar/`, data)

// --- Visitas ---
export const getVisitas = (params = {}) => leer('/visitas/visitas/', params)
export const getMisVisitas = () => leer('/visitas/mis-visitas/')
export const marcarVisitaRealizada = (visitaId) => modificar(`/visitas/visitas/${visitaId}/`, { estado: true })

export const guardarFirmasVisita = (visitaId, firmaProductor, firmaFuncionario, autorizacion = null) => {
    const payload = {
        FirmaProductor: firmaProductor,
        FirmaFuncionario: firmaFuncionario,
    }
    if (autorizacion !== null) payload.Autorizacion = autorizacion
    return modificar(`/visitas/visitas/${visitaId}/`, payload)
}

// --- Órdenes de visita ---
export const crearOrdenVisita = (data) => crear('/visitas/ordenes/crear/', data)
export const getMisOrdenes = () => leer('/visitas/mis-ordenes/')

// --- Catálogos y recibo de pago ---
export const getTiposVisitas = () => leer('/visitas/tiposVisitas/')
export const getServiciosPagos = () => leer('/visitas/serviciosPagos/')
export const getAperos = () => leer('/visitas/aperos/')
export const getPajillas = () => leer('/visitas/pajillas/')
export const enviarFormularioRecibo = (data) => crear('/visitas/formulario-recibo/', data)
