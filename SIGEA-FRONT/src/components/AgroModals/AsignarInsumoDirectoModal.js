import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../../utils/agroConstants'
import { escapeHtml } from '../../utils/sanitize'

function nombreFuncionario(funcionario) {
    const persona = funcionario?.persona_info ?? {}
    const nombre = [persona.primer_nombre, persona.primer_apellido].filter(Boolean).join(' ').trim()
    return nombre ? `${nombre} — ${escapeHtml(funcionario.email)}` : escapeHtml(funcionario.email)
}

export async function abrirModalAsignarInsumoDirecto(insumo, funcionarios) {
    const nombre = escapeHtml(insumo?.Nombre) || '—'
    const descripcion = escapeHtml(insumo?.Descripcion) || 'Sin descripción'
    const cantidadDisponible = Number(insumo?.Cantidad ?? 0)

    const opciones = (funcionarios || [])
        .map((f) => `<option value="${f.id}">${nombreFuncionario(f)}</option>`)
        .join('')

    const result = await Swal.fire({
        title: 'Asignar insumo',
        width: 'min(92vw, 560px)',
        html: `
            <div style="text-align: left; font-size: 14px; line-height: 1.8;">
                <p><strong>Insumo:</strong> ${nombre}</p>
                <p><strong>Disponible:</strong> ${cantidadDisponible}</p>
                <p><strong>Descripción:</strong> ${descripcion}</p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

                <label style="display:block; margin-bottom:6px; font-weight:600;">Funcionario</label>
                <select id="swal-funcionario"
                    style="width:100%; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; background:#fff; color:#374151;">
                    <option value="">Selecciona un funcionario</option>
                    ${opciones}
                </select>

                <label style="display:block; margin:16px 0 6px; font-weight:600;">Cantidad a asignar</label>
                <input id="swal-cantidad" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="9"
                    placeholder="Ingresa la cantidad a asignar..."
                    oninput="this.value=this.value.replace(/[^0-9]/g,'')"
                    style="width:100%; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box;" />
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Asignar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: AGRO_COLORS.primary,
        preConfirm: () => {
            const funcionarioId = document.getElementById('swal-funcionario').value
            const cantidadRaw = (document.getElementById('swal-cantidad').value || '').trim()

            if (!funcionarioId) {
                Swal.showValidationMessage('Debes seleccionar un funcionario')
                return false
            }

            if (!cantidadRaw) {
                Swal.showValidationMessage('Debes ingresar la cantidad a asignar')
                return false
            }

            const cantidad = Number(cantidadRaw)
            if (!Number.isInteger(cantidad) || cantidad <= 0) {
                Swal.showValidationMessage('La cantidad debe ser un número entero mayor a cero')
                return false
            }

            if (cantidad > cantidadDisponible) {
                Swal.showValidationMessage(`La cantidad no puede superar el stock disponible (${cantidadDisponible})`)
                return false
            }

            return {
                funcionario_id: Number(funcionarioId),
                cantidad,
            }
        }
    })

    return result
}
