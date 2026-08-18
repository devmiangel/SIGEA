import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../../utils/agroConstants'
import { escapeHtml } from '../../utils/sanitize'

export async function abrirModalAsignarInsumo(solicitud) {
    const funcionario = escapeHtml(solicitud.funcionario_nombre) || '—'
    const email = escapeHtml(solicitud.funcionario_email) || '—'
    const insumo = escapeHtml(solicitud.insumo_nombre) || '—'
    const unidades = escapeHtml(solicitud.insumo_unidades) || '—'
    const solicitado = Number(solicitud.Cantidad ?? 0)

    const result = await Swal.fire({
        title: 'Realizar asignación',
        width: 'min(92vw, 560px)',
        html: `
            <div style="text-align: left; font-size: 14px; line-height: 1.8;">
                <p><strong>Funcionario:</strong> ${funcionario} <span style="color:#6b7280;">(${email})</span></p>
                <p><strong>Insumo:</strong> ${insumo} <span style="color:#6b7280;">(${unidades})</span></p>
                <p><strong>Cantidad solicitada:</strong> ${solicitado} ${unidades}</p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

                <label style="display:block; margin-bottom:6px; font-weight:600;">Cantidad a asignar</label>
                <input id="swal-cantidad" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="9"
                    placeholder="Ingresa la cantidad a asignar..."
                    oninput="this.value=this.value.replace(/[^0-9]/g,'')"
                    style="width:100%; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box;" />

                <label style="display:block; margin:16px 0 6px; font-weight:600;">Observaciones</label>
                <textarea id="swal-observacion" placeholder="Notas de la asignación (opcional)"
                    style="width:100%; min-height:90px; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; resize:vertical; box-sizing:border-box; font-family:inherit;"></textarea>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Asignar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: AGRO_COLORS.primary,
        preConfirm: () => {
            const cantidadRaw = (document.getElementById('swal-cantidad').value || '').trim()
            const observacion = (document.getElementById('swal-observacion').value || '').trim()

            if (!cantidadRaw) {
                Swal.showValidationMessage('Debes ingresar la cantidad a asignar')
                return false
            }

            const cantidad = Number(cantidadRaw)
            if (!Number.isInteger(cantidad) || cantidad <= 0) {
                Swal.showValidationMessage('La cantidad debe ser un número entero mayor a cero')
                return false
            }

            return {
                cantidad,
                observacion: observacion || null,
            }
        }
    })

    return result
}