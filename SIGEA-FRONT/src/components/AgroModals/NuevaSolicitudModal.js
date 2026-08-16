import Swal from 'sweetalert2'
import { AGRO_COLORS, MOTIVO_SOLICITUD } from '../../utils/agroConstants'

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
                    ${ups.map(u => `<option value="${u.id}">${u.RUEA}</option>`).join('')}
                </select>
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
        preConfirm: () => {
            const upId = document.getElementById('swal-up').value
            const direccion = document.getElementById('swal-direccion').value
            const observacion = document.getElementById('swal-observacion').value
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
                motivo_id: upId ? MOTIVO_SOLICITUD.CON_UP : MOTIVO_SOLICITUD.SIN_UP
            }
        }
    })

    return result
}
