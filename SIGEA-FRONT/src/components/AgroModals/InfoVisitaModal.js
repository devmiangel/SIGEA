import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../../utils/agroConstants'
import { escapeHtml } from '../../utils/sanitize'
import { formatFecha } from '../../utils/dateHelpers'
import { generarInformeVisita } from '../../services/agroService'

const iconoUP = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
const iconoReloj = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
const iconoPredio = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 9h6"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>`
const iconoPersona = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
const iconoAdmin = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`
const iconoCategoria = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>`
const iconoNota = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`
const iconoUbicacion = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`

async function descargarInforme(visita) {
    try {
        const { blob, nombreArchivo } = await generarInformeVisita(visita.id)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = nombreArchivo
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 30000)
    } catch {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo generar el informe. Intenta de nuevo.',
            confirmButtonColor: AGRO_COLORS.primary
        })
    }
}

export function mostrarInfoVisita(visita, numero) {
    if (!visita) return

    const solInfo = visita.solicitud_info ?? {}
    const solicitante = solInfo.solicitante ?? {}
    const nombreUP = escapeHtml(solInfo.up ?? 'Unidad productiva')
    const predio = escapeHtml(solInfo.predio ?? solInfo.up ?? '—')
    const fecha = formatFecha(visita.FechaYHoraVisita)
    const tipoVisita = escapeHtml(visita.tipo_visita_label ?? '—')
    const funcionario = escapeHtml(visita.funcionario_info?.nombre ?? '—')
    const administrador = escapeHtml(visita.administrador_info?.nombre ?? '—')
    const correo = escapeHtml(solicitante.email ?? '—')
    const solicitanteNombre = escapeHtml(
        [solicitante.primer_nombre, solicitante.primer_apellido].filter(Boolean).join(' ').trim()
    ) || '—'
    const motivo = escapeHtml(solInfo.motivo ?? '—')
    const observacion = escapeHtml(solInfo.observacion) || 'Sin descripción'
    const direccion = escapeHtml(solInfo.direccion) || 'Sin dirección'
    const estado = visita.estado ? 'Realizada' : 'No realizada'

    return Swal.fire({
        title: '',
        width: 'min(94vw, 640px)',
        html: `
            <style>
                .iv-card { font-family: 'Roboto', sans-serif; text-align: left; }
                .iv-tile {
                    background: #f9fafb; border: 1px solid #eef1f4; border-radius: 10px;
                    padding: 12px 14px; transition: box-shadow .15s ease, border-color .15s ease;
                }
                .iv-tile:hover { box-shadow: 0 4px 12px rgba(1, 93, 59, 0.10); border-color: #3e9a8a; }
                .iv-label {
                    display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600;
                    color: #6b7280; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 4px;
                }
                .iv-value { margin: 0; font-size: 13.5px; font-weight: 500; color: #1f2937; }
            </style>
            <div class="iv-card">
                <div style="display:flex; align-items:center; gap:14px; padding-bottom:14px; border-bottom:2px solid #eef1f4;">
                    <div style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#015d3b,#3e9a8a);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 6px rgba(1,93,59,0.25);">${iconoUP}</div>
                    <div style="min-width:0;">
                        <p style="margin:0;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:#9ca3af;">Información de la visita</p>
                        <h2 style="margin:2px 0 0;font-size:17px;font-weight:600;color:#1f2937;line-height:1.3;">${nombreUP}</h2>
                        <p style="margin:4px 0 0;font-size:12.5px;color:#6b7280;">Visita #${numero} · ${tipoVisita} · <strong style="color:#1f2937;">${estado}</strong></p>
                    </div>
                </div>
                <div style="display:grid; gap:12px; padding:14px 0;">
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(230px, 1fr)); gap:12px;">
                        <div class="iv-tile">
                            <div class="iv-label">${iconoPredio} Nombre del predio</div>
                            <p class="iv-value">${predio}</p>
                        </div>
                        <div class="iv-tile">
                            <div class="iv-label">${iconoReloj} Fecha y hora de la visita</div>
                            <p class="iv-value">${fecha}</p>
                        </div>
                        <div class="iv-tile">
                            <div class="iv-label">${iconoCategoria} Tipo de visita</div>
                            <p class="iv-value">${tipoVisita}</p>
                        </div>
                        <div class="iv-tile">
                            <div class="iv-label">${iconoPersona} Solicitante</div>
                            <p class="iv-value">${solicitanteNombre}</p>
                            <p style="margin:2px 0 0;font-size:12px;color:#6b7280;">${correo}</p>
                        </div>
                        <div class="iv-tile">
                            <div class="iv-label">${iconoNota} Motivo</div>
                            <p class="iv-value">${motivo}</p>
                        </div>
                        <div class="iv-tile">
                            <div class="iv-label">${iconoPersona} Realizó la visita</div>
                            <p class="iv-value">${funcionario}</p>
                        </div>
                        <div class="iv-tile">
                            <div class="iv-label">${iconoAdmin} Asignó la visita</div>
                            <p class="iv-value">${administrador}</p>
                        </div>
                        <div class="iv-tile">
                            <div class="iv-label">${iconoUbicacion} Dirección</div>
                            <p class="iv-value">${direccion}</p>
                        </div>
                    </div>
                    <div class="iv-tile">
                        <div class="iv-label">${iconoNota} Observación de la solicitud</div>
                        <p class="iv-value">${observacion}</p>
                    </div>
                </div>
            </div>
        `,
        icon: 'info',
        showCloseButton: true,
        closeButtonText: 'Cerrar',
        showConfirmButton: true,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: AGRO_COLORS.primary,
        showCancelButton: true,
        cancelButtonText: 'Descargar informe',
        cancelButtonColor: AGRO_COLORS.primaryLight,
        allowOutsideClick: false,
        didOpen: () => {
            if (!visita.estado) {
                const btn = Swal.getCancelButton()
                if (btn) btn.disabled = true
            }
        }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.cancel) {
            descargarInforme(visita)
        }
    })
}