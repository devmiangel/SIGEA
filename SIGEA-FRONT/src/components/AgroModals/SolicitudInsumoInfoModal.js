import Swal from 'sweetalert2'
import { AGRO_COLORS, ESTADO_SOLICITUD_INSUMO, ESTADO_SOLICITUD_INSUMO_INFO } from '../../utils/agroConstants'
import { escapeHtml } from '../../utils/sanitize'

export function mostrarInfoSolicitudInsumo(solicitud, numero) {
    if (!solicitud) return

    const fecha = escapeHtml(solicitud.FechaSolicitud) || '—'
    const cantidad = Number(solicitud.Cantidad ?? 0)
    const insumo = escapeHtml(solicitud.insumo_nombre) || '—'
    const unidades = escapeHtml(solicitud.insumo_unidades) || '—'
    const funcionario = escapeHtml(solicitud.funcionario_nombre) || '—'
    const email = escapeHtml(solicitud.funcionario_email) || '—'
    const estado = solicitud.Estado ?? ESTADO_SOLICITUD_INSUMO.PENDIENTE
    const nombreEstado = ESTADO_SOLICITUD_INSUMO_INFO[estado]?.label ?? estado
    const estadoStyle = estado === ESTADO_SOLICITUD_INSUMO.RESUELTA
        ? 'background:#dcfce7; color:#166534;'
        : 'background:#fef3c7; color:#92400e;'

    return Swal.fire({
        title: `Solicitud de insumo #${numero}`,
        html: `
            <div style="text-align: left; font-size: 14px; line-height: 1.8;">
                <p><strong>Fecha:</strong> ${fecha}</p>
                <p><strong>Estado:</strong> <span style="padding:2px 10px; border-radius:999px; font-size:12px; ${estadoStyle}">${nombreEstado}</span></p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

                <p><strong>Insumo solicitado:</strong></p>
                <p style="background: #f9fafb; padding: 10px; border-radius: 8px; color: #374151;">
                    ${insumo} <span style="color: #6b7280;">(${unidades})</span>
                </p>

                <p><strong>Cantidad:</strong></p>
                <p style="background: #f9fafb; padding: 10px; border-radius: 8px; color: #374151;">
                    ${cantidad} ${unidades}
                </p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

                <p><strong>Funcionario solicitante:</strong></p>
                <p style="margin-left: 8px;">${funcionario}</p>
                <p style="margin-left: 8px; color: #6b7280; font-size: 13px;">${email}</p>
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: AGRO_COLORS.primary
    })
}