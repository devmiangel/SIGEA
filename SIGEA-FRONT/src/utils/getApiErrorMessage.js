export function getApiErrorMessage(error, fallback = 'Ocurrió un error. Intenta de nuevo.') {
    const data = error?.response?.data
    if (!data) return fallback
    if (typeof data === 'string') return data
    if (Array.isArray(data)) return data.join(' ')
    if (data.detail) return data.detail
    if (data.error) return data.error
    if (typeof data === 'object') {
        const mensajes = Object.values(data)
            .flat()
            .map((valor) => (typeof valor === 'string' ? valor : JSON.stringify(valor)))
            .filter(Boolean)
        if (mensajes.length) return mensajes.join(' ')
    }
    return fallback
}
