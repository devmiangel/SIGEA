import Swal from 'sweetalert2'
import { AGRO_COLORS, ESTADO_LABEL, MOTIVO_LABEL } from '../../utils/agroConstants'
import { escapeHtml } from '../../utils/sanitize'

export function mostrarInfoSolicitud(solicitud, numero, user) {
    if (!solicitud) return

    const estado = ESTADO_LABEL[solicitud.Estado] ?? 'Desconocido'
    const motivo = MOTIVO_LABEL[solicitud.MotivoSolicitud] ?? '—'
    const upInfo = solicitud.UP ? `UP #${solicitud.UP}` : 'No asignada'

    const solicitante = solicitud.solicitante ?? {}
    const nombre = escapeHtml(solicitante.primer_nombre ?? user?.persona_info?.primer_nombre ?? '—')
    const apellido = escapeHtml(solicitante.primer_apellido ?? user?.persona_info?.primer_apellido ?? '')
    const email = escapeHtml(solicitante.email ?? user?.email ?? '—')
    const observacion = escapeHtml(solicitud.Observacion) || 'Sin descripción'
    const direccion = escapeHtml(solicitud.Direccion) || 'Sin dirección'
    const fecha = escapeHtml(solicitud.FechaSolicitud) || '—'

    return Swal.fire({
        title: `Solicitud #${numero}`,
        html: `
            <div style="text-align: left; font-size: 14px; line-height: 1.8;">
                <p><strong>Fecha:</strong> ${fecha}</p>
                <p><strong>Motivo:</strong> ${motivo}</p>
                <p><strong>Estado:</strong> ${estado}</p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

                <p><strong>Observación:</strong></p>
                <p style="background: #f9fafb; padding: 10px; border-radius: 8px; color: #374151;">
                    ${observacion}
                </p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

                <p><strong>Dirección:</strong></p>
                <p style="background: #f9fafb; padding: 10px; border-radius: 8px; color: #374151;">
                    ${direccion}
                </p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

                <p><strong>Unidad Productiva:</strong> ${upInfo}</p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

                <p><strong>Solicitante:</strong></p>
                <p style="margin-left: 8px;">${nombre} ${apellido}</p>
                <p style="margin-left: 8px; color: #6b7280; font-size: 13px;">${email}</p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: AGRO_COLORS.primary
    })
}