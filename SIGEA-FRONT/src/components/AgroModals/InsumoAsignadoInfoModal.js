import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../../utils/agroConstants'
import { escapeHtml } from '../../utils/sanitize'

export function mostrarInfoInsumoAsignado(item) {
    if (!item) return

    const nombre = escapeHtml(item.insumo?.Nombre) || `Insumo ID ${escapeHtml(item.Insumo)}`
    const descripcion = escapeHtml(item.insumo?.Descripcion) || 'Sin descripción'
    const cantidad = Number(item.Cantidad ?? 0)
    const unidad = escapeHtml(item.unidad_nombre) || '—'
    const fecha = escapeHtml(item.fechaAsignacion) || '—'
    const observacion = escapeHtml(item.observacion) || 'Sin observaciones registradas'

    return Swal.fire({
        title: nombre,
        html: `
            <div style="text-align: left; font-size: 14px; line-height: 1.8;">
                <p><strong>Descripción:</strong></p>
                <p style="background: #f9fafb; padding: 10px; border-radius: 8px; color: #374151;">
                    ${descripcion}
                </p>

                <p><strong>Cantidad asignada:</strong></p>
                <p style="background: #f9fafb; padding: 10px; border-radius: 8px; color: #374151;">
                    ${cantidad} ${unidad}
                </p>

                <p><strong>Fecha de asignación:</strong> ${fecha}</p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

                <p><strong>Observación realizada:</strong></p>
                <p style="background: #fef3c7; padding: 10px; border-radius: 8px; color: #92400e;">
                    ${observacion}
                </p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: AGRO_COLORS.primary
    })
}