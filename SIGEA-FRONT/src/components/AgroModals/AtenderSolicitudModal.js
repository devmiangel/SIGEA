import Swal from 'sweetalert2'
import { getFuncionarios } from '../../services/usuariosService'
import { getTiposVisitas } from '../../services/visitasService'
import { AGRO_COLORS, ESTADO_LABEL, MOTIVO_LABEL } from '../../utils/agroConstants'
import { escapeHtml } from '../../utils/sanitize'
import {
    activarCampoFuncionario,
    htmlCampoFuncionario,
    leerFuncionarioId,
    opcionesFuncionarios as aOpciones,
} from './campoFuncionario'

const inputStyle = 'width:100%; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box; font-family:inherit; background:#fff; color:#374151;'
const labelStyle = 'display:block; margin-bottom:6px; font-weight:600; font-size:13px;'

export async function abrirModalAtenderSolicitud(solicitud, numero, datosPrevios = null) {
    const [funcionarios, tiposVisitas] = await Promise.all([
        getFuncionarios(),
        getTiposVisitas()
    ])

    const opcionesFuncionarios = aOpciones(funcionarios)
    let limpiarCampo = null

    const estado = ESTADO_LABEL[solicitud.Estado] ?? 'Desconocido'
    const motivo = MOTIVO_LABEL[solicitud.MotivoSolicitud] ?? '—'
    const upInfo = solicitud.UP ? `UP #${solicitud.UP}` : 'No asignada'
    const tipoUp = solicitud.UP ? (escapeHtml(solicitud.tipo_up) || '—') : null
    const solicitante = solicitud.solicitante ?? {}
    const nombre = escapeHtml(solicitante.primer_nombre ?? '—')
    const apellido = escapeHtml(solicitante.primer_apellido ?? '')
    const email = escapeHtml(solicitante.email ?? '—')
    const observacion = escapeHtml(solicitud.Observacion) || 'Sin descripción'
    const direccion = escapeHtml(solicitud.Direccion) || 'Sin dirección'

    const result = await Swal.fire({
        title: `Atención de Solicitud #${numero}`,
        width: 'min(94vw, 620px)',
        html: `
            <div style="text-align:left;">
                <div style="text-align:left; font-size:13px; line-height:1.7; background:#f9fafb; padding:10px 12px; border-radius:8px; margin-bottom:16px;">
                    <p style="margin:0;"><strong>Motivo:</strong> ${motivo} · <strong>Estado:</strong> ${estado}</p>
                    <p style="margin:0;"><strong>Solicitante:</strong> ${nombre} ${apellido} <span style="color:#6b7280;">(${email})</span></p>
                    <p style="margin:0;"><strong>Observación:</strong> ${observacion}</p>
                    <p style="margin:0;"><strong>Dirección:</strong> ${direccion}</p>
                    <p style="margin:0;"><strong>Unidad Productiva:</strong> ${upInfo}${tipoUp ? ` · <strong>Tipo de UP:</strong> ${tipoUp}` : ''}</p>
                </div>

                <label style="${labelStyle}">Fecha y hora de la visita</label>
                <input type="datetime-local" id="swal-fecha" style="${inputStyle}">

                <label style="${labelStyle} margin:16px 0 6px;">Ubicación de la visita</label>
                <input type="text" id="swal-ubicacion" placeholder="Ej: Finca El Recreo, Vereda Central" style="${inputStyle}">

                ${htmlCampoFuncionario({ label: 'Funcionario asignado', margenSuperior: true })}

                <label style="${labelStyle} margin:16px 0 6px;">Tipo de visita</label>
                <select id="swal-tipo-visita" style="${inputStyle}">
                    <option value="">Selecciona un tipo de visita</option>
                    ${tiposVisitas.map(t => `<option value="${t.id}">${escapeHtml(t.TipoVisita)}</option>`).join('')}
                </select>

                <label style="${labelStyle} margin:16px 0 6px;">Novedad</label>
                <textarea id="swal-novedad" placeholder="Describe la novedad de la solicitud..." maxlength="255"
                    style="width:100%; min-height:90px; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; resize:vertical; box-sizing:border-box; font-family:inherit;"></textarea>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Aceptar solicitud',
        cancelButtonText: 'Rechazar solicitud',
        confirmButtonColor: AGRO_COLORS.success,
        cancelButtonColor: AGRO_COLORS.danger,
        didOpen: () => {
            if (datosPrevios) {
                const fecha = document.getElementById('swal-fecha')
                const ubicacion = document.getElementById('swal-ubicacion')
                const tipoVisita = document.getElementById('swal-tipo-visita')
                const novedad = document.getElementById('swal-novedad')

                if (datosPrevios.fecha_visita) fecha.value = datosPrevios.fecha_visita
                if (datosPrevios.ubicacion) ubicacion.value = datosPrevios.ubicacion
                if (datosPrevios.tipo_visita_id) tipoVisita.value = String(datosPrevios.tipo_visita_id)
                if (datosPrevios.novedad) novedad.value = datosPrevios.novedad
            }

            limpiarCampo = activarCampoFuncionario(
                opcionesFuncionarios,
                datosPrevios?.funcionario_id
                    ? { id: datosPrevios.funcionario_id, nombre: datosPrevios.funcionario_nombre }
                    : null,
            )
        },
        didClose: () => limpiarCampo?.(),
        preConfirm: () => {
            const fecha = document.getElementById('swal-fecha').value
            const ubicacion = document.getElementById('swal-ubicacion').value.trim()
            const funcionarioId = leerFuncionarioId()
            const tipoVisitaId = document.getElementById('swal-tipo-visita').value
            const novedad = document.getElementById('swal-novedad').value.trim()

            if (!fecha) {
                Swal.showValidationMessage('Debes establecer la fecha y hora de la visita')
                return false
            }
            if (!ubicacion) {
                Swal.showValidationMessage('Debes indicar la ubicación de la visita')
                return false
            }
            if (!funcionarioId) {
                Swal.showValidationMessage('Debes seleccionar un funcionario de la lista')
                return false
            }
            if (!tipoVisitaId) {
                Swal.showValidationMessage('Debes seleccionar el tipo de visita')
                return false
            }

            return {
                fecha_visita: fecha,
                ubicacion,
                funcionario_id: Number(funcionarioId),
                tipo_visita_id: Number(tipoVisitaId),
                novedad
            }
        }
    })

    return result
}
