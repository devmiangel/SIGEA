import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../../utils/agroConstants'
import { escapeHtml } from '../../utils/sanitize'

const labelStyle = 'display:block; margin-bottom:6px; font-weight:600; font-size:13px;'
const textareaStyle = 'width:100%; min-height:90px; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; resize:vertical; box-sizing:border-box; font-family:inherit;'

export async function abrirModalReagendar(visita) {
    if (!visita) return

    const solInfo = visita.solicitud_info ?? {}
    const solicitante = solInfo.solicitante ?? {}
    const nombre = escapeHtml(
        [solicitante.primer_nombre, solicitante.primer_apellido].filter(Boolean).join(' ').trim()
    ) || 'Productor'
    const tipoVisita = escapeHtml(visita.tipo_visita_label ?? '—')

    const result = await Swal.fire({
        title: 'Reagendar visita',
        width: 'min(94vw, 520px)',
        html: `
            <div style="text-align:left;">
                <p style="margin:0 0 16px; font-size:13px; line-height:1.7; color:#374151;">
                    Se reagendará la visita de <strong>${nombre}</strong> (${tipoVisita}). La solicitud
                    volverá al panel de horarios del administrador para asignar una nueva fecha.
                </p>

                <label style="${labelStyle}">Motivo del reagendamiento</label>
                <textarea id="swal-motivo-reagendar" placeholder="Escribe el motivo del reagendamiento..." maxlength="255"
                    style="${textareaStyle}"></textarea>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Reagendar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: AGRO_COLORS.primary,
        cancelButtonColor: '#64748b',
        preConfirm: () => {
            const motivo = document.getElementById('swal-motivo-reagendar').value.trim()
            if (!motivo) {
                Swal.showValidationMessage('Debes indicar el motivo del reagendamiento')
                return false
            }
            return { motivo_reagendamiento: motivo }
        }
    })

    return result
}