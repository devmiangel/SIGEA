import { useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../../utils/agroConstants'
import { validarUP } from '../../services/agroService'

const iconoUP = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
const iconoReloj = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3e9a8a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
const iconoPredio = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3e9a8a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 9h6"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>`
const iconoPersona = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3e9a8a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
const iconoAdmin = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3e9a8a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`

const formatFecha = (fecha) => {
    if (!fecha) return '—'
    return new Date(fecha).toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short'
    })
}

export default function UpValidationModal({ visita, numero, onDecision, onClose }) {
    const openedRef = useRef(false)

    useEffect(() => {
        if (!visita) return
        if (openedRef.current) return
        openedRef.current = true

        const solInfo = visita.solicitud_info ?? {}
        const nombreUP = solInfo.up ?? 'Unidad productiva'
        const predio = solInfo.predio ?? solInfo.up ?? '—'
        const upId = solInfo.up_id
        const upEstado = solInfo.up_estado ?? 'En revision'
        const validada = upEstado !== 'En revision'
        const fecha = formatFecha(visita.FechaYHoraVisita)
        const funcionario = visita.funcionario_info?.nombre ?? '—'
        const administrador = visita.administrador_info?.nombre ?? '—'

        const badgeEstado = validada
            ? (upEstado === 'Aceptada'
                ? '<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;background:#d1fae5;color:#047857;"><span style="width:6px;height:6px;border-radius:50%;background:#059669;"></span>Validada</span>'
                : '<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;background:#fee2e2;color:#b91c1c;"><span style="width:6px;height:6px;border-radius:50%;background:#dc2626;"></span>Rechazada</span>')
            : '<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;background:#fef3c7;color:#92400e;"><span style="width:6px;height:6px;border-radius:50%;background:#d97706;"></span>En proceso</span>'

        Swal.fire({
            title: '',
            width: 'min(94vw, 640px)',
            html: `
                <style>
                    .vv-card { font-family: 'Roboto', sans-serif; text-align: left; }
                    .vv-tile {
                        background: #f9fafb; border: 1px solid #eef1f4; border-radius: 10px;
                        padding: 12px 14px; transition: box-shadow .15s ease, border-color .15s ease;
                    }
                    .vv-tile:hover { box-shadow: 0 4px 12px rgba(1, 93, 59, 0.10); border-color: #3e9a8a; }
                    .vv-label {
                        display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600;
                        color: #6b7280; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 4px;
                    }
                    .vv-value { margin: 0; font-size: 13.5px; font-weight: 500; color: #1f2937; }
                </style>
                <div class="vv-card">
                    <div style="display:flex; align-items:center; gap:14px; padding-bottom:14px; border-bottom:2px solid #eef1f4;">
                        <div style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#015d3b,#3e9a8a);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 6px rgba(1,93,59,0.25);">${iconoUP}</div>
                        <div style="min-width:0;">
                            <p style="margin:0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:#9ca3af;">Validación de Unidad Productiva</p>
                            <h2 style="margin:2px 0 0;font-size:17px;font-weight:600;color:#1f2937;line-height:1.3;">${nombreUP}</h2>
                            <p style="margin:4px 0 0;font-size:12.5px;color:#6b7280;">Visita #${numero} · ${badgeEstado}</p>
                        </div>
                    </div>
                    <div style="display:grid; gap:12px; padding:14px 0;">
                        <div class="vv-tile">
                            <div class="vv-label">${iconoPredio} Nombre del predio</div>
                            <p class="vv-value">${predio}</p>
                        </div>
                        <div class="vv-tile">
                            <div class="vv-label">${iconoReloj} Fecha de la visita</div>
                            <p class="vv-value">${fecha}</p>
                        </div>
                        <div class="vv-tile">
                            <div class="vv-label">${iconoPersona} Quien realizó la visita</div>
                            <p class="vv-value">${funcionario}</p>
                        </div>
                        <div class="vv-tile">
                            <div class="vv-label">${iconoAdmin} Quien asignó la visita</div>
                            <p class="vv-value">${administrador}</p>
                        </div>
                    </div>
                </div>
            `,
            showCloseButton: true,
            closeButtonText: 'Cerrar',
            showConfirmButton: !validada,
            confirmButtonText: 'Aceptar UP',
            confirmButtonColor: AGRO_COLORS.success,
            showDenyButton: !validada,
            denyButtonText: 'Rechazar UP',
            denyButtonColor: '#d9534f',
            showCancelButton: true,
            cancelButtonText: 'Descargar informe',
            cancelButtonColor: '#3e9a8a',
            focusConfirm: false,
            allowEnterKey: false,
            allowOutsideClick: () => false,
            didClose: () => onClose?.()
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (upId != null) await validarUP(upId, true)
                    Swal.fire({
                        icon: 'success',
                        title: 'UP aceptada',
                        text: 'La unidad productiva fue aceptada correctamente.',
                        confirmButtonColor: AGRO_COLORS.success,
                        timer: 1800,
                        timerProgressBar: true,
                        showConfirmButton: false
                    })
                    onDecision?.('aceptada')
                } catch {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo actualizar el estado de la UP.',
                        confirmButtonColor: AGRO_COLORS.success
                    })
                }
            } else if (result.isDenied) {
                try {
                    if (upId != null) await validarUP(upId, false)
                    Swal.fire({
                        icon: 'error',
                        title: 'UP rechazada',
                        text: 'La unidad productiva fue rechazada.',
                        confirmButtonColor: AGRO_COLORS.success,
                        timer: 1800,
                        timerProgressBar: true,
                        showConfirmButton: false
                    })
                    onDecision?.('rechazada')
                } catch {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo actualizar el estado de la UP.',
                        confirmButtonColor: AGRO_COLORS.success
                    })
                }
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                const ruta = visita?.RutaDocumento
                if (ruta && ruta !== 'Pendiente de generación del documento') {
                    window.open(ruta, '_blank', 'noopener,noreferrer')
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Informe no disponible',
                        text: 'Aún no se ha generado el informe para esta visita.',
                        confirmButtonColor: AGRO_COLORS.success
                    })
                }
            }
        })
    }, [visita, numero, onDecision, onClose])

    return null
}