import api from './api'

// Atajos sobre la instancia `api` (token + manejo de sesión expirada).
// Todos devuelven directamente `response.data`.

export const leer = async (url, params) => {
    const response = await api.get(url, params ? { params } : undefined)
    return response.data
}

export const crear = async (url, data) => {
    const response = await api.post(url, data)
    return response.data
}

export const modificar = async (url, data) => {
    const response = await api.patch(url, data)
    return response.data
}

export const borrar = async (url) => {
    const response = await api.delete(url)
    return response.data
}

// Descarga un archivo (PDF, imagen, adjunto) y toma el nombre de la cabecera
// Content-Disposition; si no viene, usa `nombrePorDefecto`.
// Devuelve { blob, nombreArchivo } para usarlo con utils/downloadBlob.js.
export const descargar = async (url, nombrePorDefecto) => {
    const response = await api.get(url, { responseType: 'blob' })
    const disposition = response.headers?.['content-disposition'] ?? ''
    const match = disposition.match(/filename="?([^";]+)"?/)
    return { blob: response.data, nombreArchivo: match ? match[1] : nombrePorDefecto }
}
