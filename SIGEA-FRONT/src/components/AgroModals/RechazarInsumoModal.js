import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../../utils/agroConstants'
import { escapeHtml } from '../../utils/sanitize'

export async function abrirModalRechazarInsumo(solicitud) {
    const funcionario = escapeHtml(solicitud.funcionario_nombre) || '—'
    const email = escapeHtml(solicitud.funcionario_email) || '—'
    const insumo = escapeHtml(solicitud.insumo_nombre) || '—'
    const unidades = escapeHtml(solicitud.insumo_unidades) || '—'
    const solicitado = Number(solicitud.Cantidad ?? 0)

    const result = await Swal.fire({
        title: 'Rechazar solicitud',
        width: 'min(92vw, 560px)',
        html: `
            <div style="text-align: left; font-size: 14px; line-height: 1.8;">
                <p><strong>Funcionario:</strong> ${funcionario} <span style="color:#6b7280;">(${email})</span></p>
                <p><strong>Insumo:</strong> ${insumo} <span style="color:#6b7280;">(${unidades})</span></p>
                <p><strong>Cantidad solicitada:</strong> ${solicitado} ${unidades}</p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

                <label style="display:block; margin-bottom:6px; font-weight:600;">Motivo del rechazo</label>
                <textarea id="swal-observacion" placeholder="Explica el motivo del rechazo..."
                    style="width:100%; min-height:90px; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; resize:vertical; box-sizing:border-box; font-family:inherit;"></textarea>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Rechazar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: AGRO_COLORS.danger,
        preConfirm: () => {
            const observacion = (document.getElementById('swal-observacion').value || '').trim()
            if (!observacion) {
                Swal.showValidationMessage('Debes indicar el motivo del rechazo')
                return false
            }
            return { observacion }
        }
    })

    return result
}