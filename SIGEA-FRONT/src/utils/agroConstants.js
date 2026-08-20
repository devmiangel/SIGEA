export const AGRO_COLORS = {
    primary: '#015d3b',
    primaryLight: '#3e9a8a',
    success: '#229e14',
    successHover: '#1d8a11',
    danger: '#d9534f'
}

export const MOTIVO_SOLICITUD = {
    CON_UP: 1,
    SIN_UP: 2
}

export const ESTADO_SOLICITUD = {
    EN_PROCESO: 1,
    APROBADO: 2,
    RECHAZADO: 3,
    REAGENDADO: 4
}

export const ESTADO_SOLICITUD_INFO = {
    [ESTADO_SOLICITUD.EN_PROCESO]: { label: 'En Proceso', class: 'bg-yellow-100 text-yellow-800' },
    [ESTADO_SOLICITUD.APROBADO]: { label: 'Aprobado', class: 'bg-green-100 text-green-800' },
    [ESTADO_SOLICITUD.RECHAZADO]: { label: 'Rechazado', class: 'bg-red-100 text-red-800' },
    [ESTADO_SOLICITUD.REAGENDADO]: { label: 'Reagendado', class: 'bg-purple-100 text-purple-800' }
}

export const ESTADO_SOLICITUD_INSUMO = {
    PENDIENTE: 'Pendiente',
    RESUELTA: 'Resuelta',
    RECHAZADA: 'Rechazada'
}

export const ESTADO_SOLICITUD_INSUMO_INFO = {
    [ESTADO_SOLICITUD_INSUMO.PENDIENTE]: { label: 'Pendiente', class: 'bg-amber-100 text-amber-700' },
    [ESTADO_SOLICITUD_INSUMO.RESUELTA]: { label: 'Resuelta', class: 'bg-green-100 text-green-700' },
    [ESTADO_SOLICITUD_INSUMO.RECHAZADA]: { label: 'Rechazada', class: 'bg-red-100 text-red-700' }
}

export const ESTADO_LABEL = {
    [ESTADO_SOLICITUD.EN_PROCESO]: ESTADO_SOLICITUD_INFO[ESTADO_SOLICITUD.EN_PROCESO].label,
    [ESTADO_SOLICITUD.APROBADO]: ESTADO_SOLICITUD_INFO[ESTADO_SOLICITUD.APROBADO].label,
    [ESTADO_SOLICITUD.RECHAZADO]: ESTADO_SOLICITUD_INFO[ESTADO_SOLICITUD.RECHAZADO].label,
    [ESTADO_SOLICITUD.REAGENDADO]: ESTADO_SOLICITUD_INFO[ESTADO_SOLICITUD.REAGENDADO].label
}

export const MOTIVO_LABEL = {
    1: 'Visita',
    2: 'Caracterización'
}

export const AUTOCOMPLETE_MAX_RESULTS = 8

export const UP_ESTADO_RAW = {
    EN_REVISION: 'En revision',
    ACEPTADA: 'Aceptada',
    RECHAZADA: 'Rechazada'
}

export const normalizarEstadoUP = (estado) => {
    return String(estado ?? '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
}

export const esUPValidada = (estado) => {
    const normalizado = normalizarEstadoUP(estado)
    return normalizado === normalizarEstadoUP(UP_ESTADO_RAW.ACEPTADA)
        || normalizado === normalizarEstadoUP(UP_ESTADO_RAW.RECHAZADA)
}

export const UP_ESTADO_STYLE = {
    [UP_ESTADO_RAW.EN_REVISION]: 'bg-amber-100 text-amber-700',
    [UP_ESTADO_RAW.RECHAZADA]: 'bg-red-100 text-red-700',
    [UP_ESTADO_RAW.ACEPTADA]: 'bg-green-100 text-green-700'
}

export const ESTADO_VISITA_INFO = {
    aceptada: { class: 'bg-green-100 text-green-700', label: 'Validada' },
    rechazada: { class: 'bg-red-100 text-red-700', label: 'Rechazada' },
    pendiente: { class: 'bg-amber-100 text-amber-700', label: 'Pendiente' }
}

export const ESTADO_VISITA = {
    ACEPTADA: 'aceptada',
    RECHAZADA: 'rechazada',
    PENDIENTE: 'pendiente'
}

export const ACTIVO_STYLE = {
    activo: 'bg-green-100 text-green-700',
    inactivo: 'bg-red-100 text-red-700'
}
