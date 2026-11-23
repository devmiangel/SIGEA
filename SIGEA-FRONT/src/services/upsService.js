import { leer, crear, modificar, borrar, descargar } from './http'

// Unidades productivas, eventos, QR y adjuntos (/api/UPs/).
// La caracterización por secciones y sus catálogos están en caracterizacionService.js.

// --- UPs ---
export const getMisUPs = () => leer('/UPs/mis-ups/')
export const getUPs = () => leer('/UPs/UPs/')
export const getUP = (upId) => leer(`/UPs/UPs/${upId}/`)
export const buscarUPPorRUEA = (ruea) => leer('/UPs/buscar-por-ruea/', { ruea })
export const validarUP = (upId, aprobada, motivo = '') => crear(`/UPs/validar-ups/${upId}/`, { aprobada, motivo })

// --- Eventos ---
export const getEventos = (params = {}) => leer('/UPs/eventosUP/', params)
export const getEvento = (eventoId) => leer(`/UPs/eventosUP/${eventoId}/`)
export const crearEvento = (data) => crear('/UPs/eventosUP/', data)
export const actualizarEvento = (eventoId, data) => modificar(`/UPs/eventosUP/${eventoId}/`, data)
export const eliminarEvento = (eventoId) => borrar(`/UPs/eventosUP/${eventoId}/`)

// --- QR ---
export const generarQR = (upId) => crear(`/UPs/${upId}/generar-qr/`)
export const descargarQR = (upId) => descargar(`/UPs/${upId}/descargar-qr/`, `qr_up_${upId}.png`)

// --- Adjuntos (archivos privados: el backend valida el dueño de la UP) ---
export const getArchivosUP = (upId) => leer('/UPs/archivosUP/', { UP: upId })
export const descargarArchivoUP = (archivoId) => descargar(`/UPs/archivosUP/${archivoId}/descargar/`, `archivo_${archivoId}`)
