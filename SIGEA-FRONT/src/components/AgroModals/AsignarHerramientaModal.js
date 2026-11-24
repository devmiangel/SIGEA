import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../../utils/agroConstants'
import { escapeHtml } from '../../utils/sanitize'
import {
    activarCampoFuncionario,
    htmlCampoFuncionario,
    leerFuncionarioId,
    opcionesFuncionarios,
} from './campoFuncionario'

export async function abrirModalAsignarHerramienta(herramienta, funcionarios) {
    const nombre = escapeHtml(herramienta?.Herramienta) || '—'
    const descripcion = escapeHtml(herramienta?.Descripcion) || 'Sin descripción'

    const opciones = opcionesFuncionarios(funcionarios)
    let limpiarCampo = null

    const result = await Swal.fire({
        title: 'Asignar herramienta',
        width: 'min(92vw, 560px)',
        html: `
            <div style="text-align: left; font-size: 14px; line-height: 1.8;">
                <p><strong>Herramienta:</strong> ${nombre}</p>
                <p><strong>Descripción:</strong> ${descripcion}</p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

                ${htmlCampoFuncionario({ label: 'Funcionario' })}
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Asignar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: AGRO_COLORS.primary,
        didOpen: () => { limpiarCampo = activarCampoFuncionario(opciones) },
        didClose: () => limpiarCampo?.(),
        preConfirm: () => {
            const funcionarioId = leerFuncionarioId()
            if (!funcionarioId) {
                Swal.showValidationMessage('Debes seleccionar un funcionario de la lista')
                return false
            }
            return {
                funcionario_id: Number(funcionarioId),
            }
        }
    })

    return result
}
