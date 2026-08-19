import Swal from 'sweetalert2'
import { AGRO_COLORS, ESTADO_SOLICITUD_INSUMO } from '../../utils/agroConstants'
import { getSolicitudesInsumo } from '../../services/agroService'
import { escapeHtml } from '../../utils/sanitize'

const estiloEstado = (estado) => {
    if (estado === ESTADO_SOLICITUD_INSUMO.RESUELTA) return 'background:#dcfce7; color:#166534;'
    if (estado === ESTADO_SOLICITUD_INSUMO.RECHAZADA) return 'background:#fee2e2; color:#b91c1c;'
    return 'background:#fef3c7; color:#92400e;'
}

export async function abrirModalMisSolicitudes() {
    const solicitudes = await getSolicitudesInsumo()

    if (!solicitudes || solicitudes.length === 0) {
        return Swal.fire({
            title: 'Mis solicitudes de insumo',
            text: 'Aún no has realizado solicitudes de insumo.',
            icon: 'info',
            confirmButtonText: 'Cerrar',
            confirmButtonColor: AGRO_COLORS.primary
        })
    }

    const filas = [...solicitudes]
        .sort((a, b) => b.id - a.id)
        .map((s) => {
            const estado = s.Estado ?? ESTADO_SOLICITUD_INSUMO.PENDIENTE
            const etiqueta = { Pendiente: 'Pendiente', Resuelta: 'Resuelta', Rechazada: 'Rechazada' }[estado] ?? estado
            const fecha = escapeHtml(s.FechaSolicitud) || '—'
            const insumo = escapeHtml(s.insumo_nombre) || '—'
            const unidades = escapeHtml(s.insumo_unidades) || '—'
            const cantidad = Number(s.Cantidad ?? 0)
            const observacion = escapeHtml(s.Observacion) || 'Sin observaciones'

            return `
                <div style="border:1px solid #e5e7eb; border-radius:10px; padding:12px; margin-bottom:10px; text-align:left;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
                        <strong style="font-size:14px; color:#111827;">${insumo}</strong>
                        <span style="padding:2px 10px; border-radius:999px; font-size:12px; ${estiloEstado(estado)}">${etiqueta}</span>
                    </div>
                    <p style="margin:6px 0 0; font-size:13px; color:#374151;">Cantidad: ${cantidad} ${unidades}</p>
                    <p style="margin:2px 0 0; font-size:12px; color:#6b7280;">Fecha: ${fecha}</p>
                    <p style="margin:6px 0 0; font-size:13px; color:#92400e;">Observación: ${observacion}</p>
                </div>
            `
        })
        .join('')

    return Swal.fire({
        title: 'Mis solicitudes de insumo',
        width: 'min(92vw, 640px)',
        html: `
            <div style="max-height: 60vh; overflow-y: auto; padding: 4px;">
                ${filas}
            </div>
        `,
        confirmButtonText: 'Cerrar',
        confirmButtonColor: AGRO_COLORS.primary
    })
}