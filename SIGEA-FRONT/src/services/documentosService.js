import { descargar } from './http'

// PDFs generados por el backend (/api/documentos/).
// Devuelven { blob, nombreArchivo }; guardarlos con utils/downloadBlob.js.

export const generarInformeVisita = (visitaId) =>
    descargar(`/documentos/visita/${visitaId}/generar/`, `visita_${visitaId}.pdf`)

export const descargarCaracterizacionUP = (upId) =>
    descargar(`/documentos/up/${upId}/caracterizacion/`, `caracterizacion_up_${upId}.pdf`)
