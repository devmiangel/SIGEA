import { useEffect } from 'react'
import Swal from 'sweetalert2'

const estadoLabel = {
  1: 'En Proceso',
  2: 'Aprobado',
  3: 'Rechazado',
}

const motivoLabel = {
  1: 'Visita',
  2: 'Caracterización',
}

export default function AlertRequestInfo({ solicitud, numero, user, onClose }) {

  useEffect(() => {

    if (!solicitud) return

    const estado = estadoLabel[solicitud.Estado] ?? 'Desconocido'
    const motivo = motivoLabel[solicitud.MotivoSolicitud] ?? '—'

    const upInfo = solicitud.UP
      ? `UP #${solicitud.UP}`
      : 'No asignada'

    const nombre = user?.persona_info?.primer_nombre ?? '—'
    const apellido = user?.persona_info?.primer_apellido ?? ''
    const email = user?.email ?? '—'

    Swal.fire({
      title: `Solicitud #${numero}`,
      html: `
        <div style="text-align: left; font-size: 14px; line-height: 1.8;">
          <p><strong>Fecha:</strong> ${solicitud.FechaSolicitud ?? '—'}</p>
          <p><strong>Motivo:</strong> ${motivo}</p>
          <p><strong>Estado:</strong> ${estado}</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

          <p><strong>Observación:</strong></p>

          <p style="background: #f9fafb; padding: 10px; border-radius: 8px; color: #374151;">
            ${solicitud.Observacion ?? 'Sin descripción'}
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

          <p><strong>Unidad Productiva:</strong> ${upInfo}</p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;" />

          <p><strong>Solicitante:</strong></p>

          <p style="margin-left: 8px;">
            ${nombre} ${apellido}
          </p>

          <p style="margin-left: 8px; color: #6b7280; font-size: 13px;">
            ${email}
          </p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#015d3b',
      didClose: () => onClose?.(),
    })

  }, [solicitud, user, onClose])

  return null
}
