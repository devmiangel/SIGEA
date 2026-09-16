import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../../utils/agroConstants'
import { escapeHtml } from '../../utils/sanitize'

function nombreFuncionario(funcionario) {
    const persona = funcionario?.persona_info ?? {}
    const nombre = [persona.primer_nombre, persona.primer_apellido].filter(Boolean).join(' ').trim()
    return nombre ? `${nombre} — ${escapeHtml(funcionario.email)}` : escapeHtml(funcionario.email)
}

export async function abrirModalAsignarHerramienta(herramienta, funcionarios) {
    const nombre = escapeHtml(herramienta?.Herramienta) || '—'
    const descripcion = escapeHtml(herramienta?.Descripcion) || 'Sin descripción'

    const opciones = (funcionarios || [])
        .map((f) => `<option value="${f.id}">${nombreFuncionario(f)}</option>`)
        .join('')

    const result = await Swal.fire({
        title: 'Asignar herramienta',
        width: 'min(92vw, 560px)',
        html: `
            <div style="text-align: left; font-size: 14px; line-height: 1.8;">
                <p><strong>Herramienta:</strong> ${nombre}</p>
                <p><strong>Descripción:</strong> ${descripcion}</p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

                <label style="display:block; margin-bottom:6px; font-weight:600;">Funcionario</label>
                <select id="swal-funcionario"
                    style="width:100%; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; background:#fff; color:#374151;">
                    <option value="">Selecciona un funcionario</option>
                    ${opciones}
                </select>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Asignar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: AGRO_COLORS.primary,
        preConfirm: () => {
            const funcionarioId = document.getElementById('swal-funcionario').value
            if (!funcionarioId) {
                Swal.showValidationMessage('Debes seleccionar un funcionario')
                return false
            }
            return {
                funcionario_id: Number(funcionarioId),
            }
        }
    })

    return result
}
