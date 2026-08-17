import Swal from 'sweetalert2'
import { getFuncionarios, getTiposVisitas } from '../../services/agroService'
import { AGRO_COLORS, ESTADO_LABEL, MOTIVO_LABEL, AUTOCOMPLETE_MAX_RESULTS } from '../../utils/agroConstants'
import { escapeHtml } from '../../utils/sanitize'

const inputStyle = 'width:100%; padding:10px 12px; border:1.5px solid #015d3b; border-radius:8px; font-size:14px; outline:none; box-sizing:border-box; font-family:inherit; background:#fff; color:#374151;'
const labelStyle = 'display:block; margin-bottom:6px; font-weight:600; font-size:13px;'

export async function abrirModalAtenderSolicitud(solicitud, numero) {
    const [funcionarios, tiposVisitas] = await Promise.all([
        getFuncionarios(),
        getTiposVisitas()
    ])

    const opcionesFuncionarios = funcionarios.map(f => ({
        id: f.id,
        nombre: [f.persona_info?.primer_nombre, f.persona_info?.primer_apellido].filter(Boolean).join(' ').trim() || f.email,
        email: f.email
    }))

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

                <div style="position:relative;">
                    <label style="${labelStyle} margin:16px 0 6px;">Funcionario asignado</label>
                    <input type="text" id="swal-funcionario-input" placeholder="Busca el nombre del funcionario..." autocomplete="off" style="${inputStyle}">
                    <input type="hidden" id="swal-funcionario-id" value="">
                    <div id="swal-funcionario-lista" style="display:none; position:fixed; z-index:2000; background:#fff; border:1px solid #e2e8f0; border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,0.12); max-height:200px; overflow-y:auto; text-align:left;"></div>
                </div>

                <label style="${labelStyle} margin:16px 0 6px;">Tipo de visita</label>
                <select id="swal-tipo-visita" style="${inputStyle}">
                    <option value="">Selecciona un tipo de visita</option>
                    ${tiposVisitas.map(t => `<option value="${t.id}">${escapeHtml(t.TipoVisita)}</option>`).join('')}
                </select>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Aceptar solicitud',
        cancelButtonText: 'Rechazar solicitud',
        confirmButtonColor: AGRO_COLORS.success,
        cancelButtonColor: AGRO_COLORS.danger,
        didOpen: () => {
            const input = document.getElementById('swal-funcionario-input')
            const lista = document.getElementById('swal-funcionario-lista')
            const hidden = document.getElementById('swal-funcionario-id')

            const mostrar = () => {
                const rect = input.getBoundingClientRect()
                lista.style.top = `${rect.bottom + 4}px`
                lista.style.left = `${rect.left}px`
                lista.style.width = `${rect.width}px`
                lista.style.display = 'block'
            }

            const pintar = (texto) => {
                const q = texto.trim().toLowerCase()
                const items = q
                    ? opcionesFuncionarios.filter(f => f.nombre.toLowerCase().includes(q) || f.email.toLowerCase().includes(q))
                    : opcionesFuncionarios

                if (!items.length) {
                    lista.innerHTML = '<div style="padding:10px 12px; color:#94a3b8; font-size:13px;">Sin resultados</div>'
                    mostrar()
                    return
                }

                lista.innerHTML = items.slice(0, AUTOCOMPLETE_MAX_RESULTS).map(f => `
                    <div data-id="${f.id}" style="padding:9px 12px; cursor:pointer; border-bottom:1px solid #f1f5f9;">
                        <div style="font-size:13px; font-weight:500; color:#1e293b;">${escapeHtml(f.nombre)}</div>
                        <div style="font-size:12px; color:#94a3b8;">${escapeHtml(f.email)}</div>
                    </div>
                `).join('')

                mostrar()
                lista.querySelectorAll('div[data-id]').forEach(el => {
                    el.addEventListener('mouseenter', () => { el.style.background = '#f0fdf4' })
                    el.addEventListener('mouseleave', () => { el.style.background = '#ffffff' })
                    el.addEventListener('click', () => {
                        hidden.value = el.dataset.id
                        input.value = el.querySelector('div').textContent.trim()
                        lista.style.display = 'none'
                    })
                })
            }

            input.addEventListener('focus', () => pintar(input.value))
            input.addEventListener('input', () => { pintar(input.value); hidden.value = '' })
            document.addEventListener('click', (e) => {
                if (!e.target.closest('#swal-funcionario-input') && !e.target.closest('#swal-funcionario-lista')) {
                    lista.style.display = 'none'
                }
            })
        },
        preConfirm: () => {
            const fecha = document.getElementById('swal-fecha').value
            const ubicacion = document.getElementById('swal-ubicacion').value.trim()
            const funcionarioId = document.getElementById('swal-funcionario-id').value
            const tipoVisitaId = document.getElementById('swal-tipo-visita').value

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
                tipo_visita_id: Number(tipoVisitaId)
            }
        }
    })

    return result
}
