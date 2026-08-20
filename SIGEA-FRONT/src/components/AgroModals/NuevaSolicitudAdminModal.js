import Swal from 'sweetalert2'
import { AGRO_COLORS, MOTIVO_SOLICITUD } from '../../utils/agroConstants'
import { escapeHtml } from '../../utils/sanitize'
import { crearSolicitud } from '../../services/agroService'

function getIniciales(persona, email) {
    const nombre = persona?.primer_nombre?.trim() ?? ''
    const apellido = persona?.primer_apellido?.trim() ?? ''
    const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
    return escapeHtml(iniciales || (email?.charAt(0)?.toUpperCase() ?? '?'))
}

export async function abrirModalNuevaSolicitudAdmin(detail) {
    const usuario = detail?.usuario ?? {}
    const persona = usuario?.persona_info ?? {}
    const ups = detail?.ups ?? []
    const tieneUPs = ups.length > 0

    const nombreProductor = escapeHtml(
        [persona.primer_nombre, persona.primer_apellido]
            .filter(Boolean).join(' ').trim() || usuario.email || 'Productor'
    )
    const emailProductor = escapeHtml(usuario.email ?? '')

    const result = await Swal.fire({
        title: 'Nueva solicitud',
        width: 'min(92vw, 560px)',
        html: `
            <div style="text-align:left;font-family:'Roboto',sans-serif;">
                <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;margin-bottom:16px;background:#f0fdf9;border:1px solid #e4ece8;border-radius:10px;">
                    <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#015d3b,#3e9a8a);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;flex-shrink:0;">${getIniciales(persona, usuario.email)}</div>
                    <div style="min-width:0;text-align:left;">
                        <p style="margin:0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:#3e9a8a;">Solicitud para</p>
                        <p style="margin:2px 0 0;font-size:13.5px;font-weight:600;color:#1f2937;line-height:1.3;">${nombreProductor}</p>
                        <p style="margin:0;font-size:12px;color:#6b7280;">${emailProductor}</p>
                    </div>
                </div>

                <label style="display:block;margin-bottom:6px;font-weight:600;font-size:13.5px;color:#374151;">Unidad Productiva</label>
                <select id="swal-up" ${tieneUPs ? '' : 'disabled'}
                    style="width:100%;padding:10px 12px;border:1.5px solid #015d3b;border-radius:8px;font-size:14px;outline:none;background:#fff;color:${tieneUPs ? '#374151' : '#9ca3af'};">
                    <option value="">${tieneUPs ? 'Selecciona una UP' : 'El productor no tiene UPs registradas'}</option>
                    ${ups.map((u) => `<option value="${u.id}">${escapeHtml(u.RUEA ?? `UP ${u.id}`)}</option>`).join('')}
                </select>

                <label style="display:block;margin:16px 0 6px;font-weight:600;font-size:13.5px;color:#374151;">Dirección</label>
                <input id="swal-direccion" type="text" maxlength="255" placeholder="Dirección de la unidad productiva..."
                    style="width:100%;padding:10px 12px;border:1.5px solid #015d3b;border-radius:8px;font-size:14px;outline:none;box-sizing:border-box;" />

                <label style="display:block;margin:16px 0 6px;font-weight:600;font-size:13.5px;color:#374151;">Observación</label>
                <textarea id="swal-observacion" placeholder="Describe la solicitud..."
                    style="width:100%;min-height:110px;padding:10px 12px;border:1.5px solid #015d3b;border-radius:8px;font-size:14px;outline:none;resize:vertical;box-sizing:border-box;font-family:inherit;"></textarea>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Crear solicitud',
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
                motivo_id: upId ? MOTIVO_SOLICITUD.CON_UP : MOTIVO_SOLICITUD.SIN_UP,
            }
        }
    })

    if (!result.isConfirmed) return result

    try {
        await crearSolicitud({ ...result.value, usuario_id: usuario.id })
        await Swal.fire({
            icon: 'success',
            title: 'Solicitud creada',
            text: `La solicitud fue creada a nombre de ${nombreProductor}.`,
            confirmButtonColor: AGRO_COLORS.success,
            timer: 2200,
            timerProgressBar: true,
            showConfirmButton: false,
        })
        return { isConfirmed: true }
    } catch (err) {
        await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err?.response?.data?.error || 'No se pudo crear la solicitud. Intenta de nuevo.',
            confirmButtonColor: AGRO_COLORS.primary,
        })
        return { isConfirmed: false }
    }
}