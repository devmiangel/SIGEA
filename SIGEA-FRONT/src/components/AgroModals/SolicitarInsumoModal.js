import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../../utils/agroConstants'

const escaparHTML = (valor) =>
    String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

const normalizar = (texto) =>
    String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase()

export async function abrirModalSolicitarInsumo(insumos) {
    const disponibles = (insumos || []).filter((i) => i.Estado !== false)
    const sinDisponibles = disponibles.length === 0

    const result = await Swal.fire({
        title: 'Solicitar insumo',
        width: 'min(92vw, 560px)',
        html: `
            <div style="text-align: left;">
                <label style="display:block; margin-bottom:6px; font-weight:600;">Insumo</label>
                <input id="swal-insumo" list="swal-insumo-lista" type="text" autocomplete="off"
                    ${sinDisponibles ? 'disabled' : ''}
                    placeholder="${sinDisponibles ? 'No hay insumos disponibles' : 'Escribe para buscar un insumo...'}"
                    style="width:100%; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box; background:#fff; color:#374151;" />
                <datalist id="swal-insumo-lista">
                    ${disponibles.map((i) => `<option value="${escaparHTML(i.Nombre)}"></option>`).join('')}
                </datalist>
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
            const textoInsumo = normalizar(document.getElementById('swal-insumo').value)
            const cantidadRaw = (document.getElementById('swal-cantidad').value || '').trim()
            const insumo = textoInsumo
                ? disponibles.find((i) => normalizar(i.Nombre) === textoInsumo)
                : null

            if (!insumo) {
                Swal.showValidationMessage('Escribe y selecciona un insumo de la lista')
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