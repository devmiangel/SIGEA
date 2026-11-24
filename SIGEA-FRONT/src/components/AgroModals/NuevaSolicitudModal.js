import Swal from 'sweetalert2'
import { escapeHtml } from '../../utils/sanitize'
import {
    AGRO_COLORS, MOTIVO_SOLICITUD, UP_ESTADO_RAW, esUPValidada, normalizarEstadoUP,
} from '../../utils/agroConstants'

// El productor solo puede solicitar sobre UPs validadas: Aceptada -> Visita,
// Rechazada -> Caracterización. Las UPs en revisión aparecen deshabilitadas.
// (El backend aplica la misma regla en crear_solicitud y decide el motivo.)
const esRechazada = (up) =>
    normalizarEstadoUP(up?.estado_label) === normalizarEstadoUP(UP_ESTADO_RAW.RECHAZADA)

const motivoDeUP = (up) => {
    if (!up || esRechazada(up)) return MOTIVO_SOLICITUD.SIN_UP
    return MOTIVO_SOLICITUD.CON_UP
}

const textoMotivo = (up) => {
    if (!up) return 'Sin UP seleccionada: la solicitud será de <b>caracterización</b>.'
    if (esRechazada(up)) return 'La UP fue rechazada: la solicitud será de <b>caracterización</b>.'
    return 'La UP fue aceptada: la solicitud será de <b>visita</b>.'
}

const opcionUP = (u) => esUPValidada(u.estado_label)
    ? `<option value="${escapeHtml(u.id)}">${escapeHtml(u.RUEA)} · ${escapeHtml(u.estado_label)}</option>`
    : `<option value="${escapeHtml(u.id)}" disabled>${escapeHtml(u.RUEA)} · En revisión (no disponible)</option>`

export async function abrirModalNuevaSolicitud(ups) {
    const tieneUPs = ups.length > 0

    const result = await Swal.fire({
        title: 'Nueva Solicitud',
        width: 'min(92vw, 560px)',
        html: `
            <div style="text-align: left;">
                <label style="display:block; margin-bottom:6px; font-weight:600;">Unidad Productiva</label>
                <select id="swal-up" ${tieneUPs ? '' : 'disabled'}
                    style="width:100%; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; background:#fff; color:${tieneUPs ? '#374151' : '#9ca3af'};">
                    <option value="">${tieneUPs ? 'Selecciona una UP' : 'No tienes UPs registradas'}</option>
                    ${ups.map(opcionUP).join('')}
                </select>
                <p id="swal-motivo" style="margin:8px 0 0; font-size:12px; color:#4b5563;">${textoMotivo(null)}</p>
                <label style="display:block; margin:16px 0 6px; font-weight:600;">Dirección</label>
                <input id="swal-direccion" type="text" maxlength="255" placeholder="Dirección de tu unidad productiva..."
                    style="width:100%; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box;" />
                <label style="display:block; margin:16px 0 6px; font-weight:600;">Observación</label>
                <textarea id="swal-observacion" placeholder="Describe tu solicitud..."
                    style="width:100%; min-height:110px; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; resize:vertical; box-sizing:border-box; font-family:inherit;"></textarea>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Enviar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: AGRO_COLORS.primary,
        didOpen: () => {
            const select = document.getElementById('swal-up')
            const direccionInput = document.getElementById('swal-direccion')
            const motivoTexto = document.getElementById('swal-motivo')
            select.addEventListener('change', () => {
                const up = ups.find((u) => String(u.id) === select.value)
                direccionInput.value = up?.direccion ?? ''
                motivoTexto.innerHTML = textoMotivo(up)
            })
        },
        preConfirm: () => {
            const upId = document.getElementById('swal-up').value
            const up = ups.find((u) => String(u.id) === upId)
            const direccion = document.getElementById('swal-direccion').value
            const observacion = document.getElementById('swal-observacion').value
            if (up && !esUPValidada(up.estado_label)) {
                Swal.showValidationMessage('Esta UP está en revisión; podrás solicitar cuando sea aceptada o rechazada')
                return false
            }
            if (!direccion.trim()) {
                Swal.showValidationMessage('La dirección es requerida')
                return false
            }
            if (!observacion.trim()) {
                Swal.showValidationMessage('La observación es requerida')
                return false
            }
            return {
                observacion: observacion.trim(),
                direccion: direccion.trim(),
                up_id: upId || null,
                motivo_id: motivoDeUP(up)
            }
        }
    })

    return result
}
