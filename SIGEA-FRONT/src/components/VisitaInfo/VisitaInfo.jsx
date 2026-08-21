import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../../utils/agroConstants'
import { escapeHtml } from '../../utils/sanitize'
import { formatFecha } from '../../utils/dateHelpers'
import { reagendarSolicitud } from '../../services/agroService'
import { abrirModalReagendar } from '../AgroModals/ReagendarVisitaModal'

const iconoUsuario = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
const iconoReloj = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
const iconoTipo = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`
const iconoPin = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`
const iconoDocumento = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`

const esCaracterizacion = (tipo) => {
    const normalizado = (tipo ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    return normalizado === 'caracterizacion'
}

const esServiciosPagos = (tipo) => {
    const normalizado = (tipo ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    return normalizado === 'servicios pagos'
}

export default function VisitaInfo({ visita, numero, onClose, onReagendada }) {
    const navigate = useNavigate()
    const openedRef = useRef(false)

    useEffect(() => {
        if (!visita) return
        if (openedRef.current) return
        openedRef.current = true

        const solicitud = visita.solicitud_info ?? {}
        const solicitante = solicitud.solicitante ?? {}
        const nombreSolicitante = escapeHtml(
            [solicitante.primer_nombre, solicitante.primer_apellido].filter(Boolean).join(' ').trim() || 'Productor'
        )
        const tipoVisita = escapeHtml(visita.tipo_visita_label ?? '—')
        const hora = escapeHtml(formatFecha(visita.FechaYHoraVisita))
        const ubicacion = escapeHtml(visita.Ubicacion ?? '—')
        const observacion = escapeHtml(solicitud.observacion) || 'Sin descripción'
        const funcionario = escapeHtml(visita.funcionario_info?.nombre ?? '—')
        const administrador = escapeHtml(visita.administrador_info?.nombre ?? '—')
        const realizada = !!visita.estado
        const badgeEstado = `<span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;background:${realizada ? '#d1fae5' : '#fef3c7'};color:${realizada ? '#047857' : '#92400e'};"><span style="width:6px;height:6px;border-radius:50%;background:${realizada ? '#059669' : '#d97706'};"></span>${realizada ? 'Realizada' : 'No realizada'}</span>`

        Swal.fire({
            title: '',
            width: 'min(94vw, 640px)',
            html: `
                <style>
                    .vt-card { font-family: 'Roboto', sans-serif; text-align: left; }
                    .vt-tile {
                        flex: 1; background: #f9fafb; border: 1px solid #eef1f4; border-radius: 10px;
                        padding: 10px 12px; transition: box-shadow .15s ease, transform .15s ease, border-color .15s ease;
                    }
                    .vt-tile:hover {
                        box-shadow: 0 4px 12px rgba(1, 93, 59, 0.10); transform: translateY(-1px); border-color: #3e9a8a;
                    }
                    .vt-label {
                        display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600;
                        color: #6b7280; text-transform: uppercase; letter-spacing: .4px;
                    }
                    .vt-value { margin: 6px 0 0; font-size: 13px; font-weight: 500; color: #1f2937; }
                </style>
                <div class="vt-card">
                    <div style="display:flex; justify-content:flex-start; margin-bottom:10px;">${badgeEstado}</div>
                    <div style="display:flex; align-items:center; gap:14px; padding-bottom:14px; border-bottom:2px solid #eef1f4;">
                        <div style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#015d3b,#3e9a8a);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 6px rgba(1,93,59,0.25);">${iconoUsuario}</div>
                        <div style="min-width:0;">
                            <h2 style="margin:0;font-size:17px;font-weight:600;color:#1f2937;line-height:1.3;">${nombreSolicitante} <span style="color:#3e9a8a;">·</span> ${tipoVisita}</h2>
                            <p style="margin:2px 0 0;font-size:12.5px;color:#6b7280;">Visita #${numero} · Solicitud #${solicitud.id ?? '—'}</p>
                        </div>
                    </div>

                    <div style="display:flex; gap:12px; padding:14px 0;">
                        <div class="vt-tile">
                            <div class="vt-label">${iconoReloj} Hora asignada</div>
                            <p class="vt-value">${hora}</p>
                        </div>
                        <div class="vt-tile">
                            <div class="vt-label">${iconoTipo} Tipo de visita</div>
                            <p class="vt-value">${tipoVisita}</p>
                        </div>
                        <div class="vt-tile">
                            <div class="vt-label">${iconoPin} Ubicación</div>
                            <p class="vt-value">${ubicacion}</p>
                        </div>
                    </div>

                    <div style="background:#f8fafc; border:1px solid #eef1f4; border-radius:10px; padding:12px 14px;">
                        <div class="vt-label" style="margin-bottom:6px;">${iconoDocumento} Observación del productor</div>
                        <p style="margin:0; font-size:13.5px; color:#374151; line-height:1.6;">${observacion}</p>
                    </div>

                    <p style="margin:12px 0 0; font-size:12px; color:#9ca3af; text-align:center;">
                        Funcionario: ${funcionario} · Administrador: ${administrador}
                    </p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: realizada ? 'Cerrar' : 'Iniciar Visita',
            cancelButtonText: realizada ? 'Volver' : 'Cerrar',
            showDenyButton: !realizada,
            denyButtonText: 'Reagendar',
            confirmButtonColor: AGRO_COLORS.success,
            cancelButtonColor: '#64748b',
            denyButtonColor: '#d97706',
            focusConfirm: false,
            didClose: () => onClose?.()
        }).then(async (result) => {
            if (result.isConfirmed && !realizada) {
                const destino = esCaracterizacion(visita.tipo_visita_label)
                    ? '/funcionario/visitas/caracterizacion'
                    : esServiciosPagos(visita.tipo_visita_label)
                        ? '/funcionario/visitas/recibo'
                        : '/funcionario/visitas/visita'
                navigate(destino, { state: { visita } })
                return
            }

            if (result.dismiss === Swal.DismissReason.deny && !realizada) {
                const solicitudId = visita.solicitud_info?.id
                if (!solicitudId) return

                const confirmacion = await abrirModalReagendar(visita)
                if (!confirmacion.isConfirmed) return

                try {
                    await reagendarSolicitud(solicitudId, confirmacion.value)
                    await Swal.fire({
                        icon: 'success',
                        title: 'Visita reagendada',
                        text: 'La solicitud volvió al panel de horarios del administrador.',
                        confirmButtonColor: AGRO_COLORS.success,
                        timer: 2000,
                        timerProgressBar: true
                    })
                    onReagendada?.()
                } catch {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo reagendar la visita. Intenta de nuevo.',
                        confirmButtonColor: AGRO_COLORS.primary
                    })
                }
            }
        })

    }, [visita, numero, onClose, onReagendada, navigate])

    return null
}