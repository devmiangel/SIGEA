import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../../utils/agroConstants'

const escaparHTML = (valor) =>
    String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

export async function abrirModalSolicitarInsumo(insumos) {
    const disponibles = (insumos || []).filter((i) => i.Estado !== false)
    const sinDisponibles = disponibles.length === 0

    const result = await Swal.fire({
        title: 'Solicitar insumo',
        width: 'min(92vw, 560px)',
        html: `
            <div style="text-align: left;">
                <label style="display:block; margin-bottom:6px; font-weight:600;">Insumo</label>
                <select id="swal-insumo" ${sinDisponibles ? 'disabled' : ''}
                    style="width:100%; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; background:#fff; color:${sinDisponibles ? '#9ca3af' : '#374151'};">
                    <option value="">${sinDisponibles ? 'No hay insumos disponibles' : 'Selecciona un insumo'}</option>
                    ${disponibles.map((i) => `<option value="${i.id}">${escaparHTML(i.Nombre)}</option>`).join('')}
                </select>
                <label style="display:block; margin:16px 0 6px; font-weight:600;">Cantidad</label>
                <input id="swal-cantidad" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="9"
                    placeholder="Ingresa la cantidad que deseas..."
                    oninput="this.value=this.value.replace(/[^0-9]/g,'')"
                    style="width:100%; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box;" />
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Enviar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: AGRO_COLORS.primary,
        preConfirm: () => {
            const insumoId = document.getElementById('swal-insumo').value
            const cantidadRaw = (document.getElementById('swal-cantidad').value || '').trim()
            const insumo = disponibles.find((i) => String(i.id) === String(insumoId))

            if (!insumo) {
                Swal.showValidationMessage('Debes seleccionar un insumo')
                return false
            }
            if (!cantidadRaw) {
                Swal.showValidationMessage('Debes ingresar la cantidad')
                return false
            }

            const cantidad = Number(cantidadRaw)
            if (!Number.isInteger(cantidad) || cantidad <= 0) {
                Swal.showValidationMessage('La cantidad debe ser un número entero mayor a cero')
                return false
            }

            return {
                insumo_id: insumo.id,
                cantidad,
            }
        }
    })

    return result
}