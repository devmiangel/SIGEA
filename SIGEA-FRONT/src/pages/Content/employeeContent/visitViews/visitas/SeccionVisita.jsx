import { useState } from 'react'
import Swal from 'sweetalert2'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { crearSolicitud } from '../../../../../services/agroService'
import { AGRO_COLORS, MOTIVO_SOLICITUD } from '../../../../../utils/agroConstants'

const inputClase = "w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-500"
const labelClase = "text-xs font-semibold uppercase tracking-wide text-gray-500"

export default function SeccionVisita({ form, onChange, visita, solicitud, userId, upId }) {
    const [enviando, setEnviando] = useState(false)

    const direccion = solicitud?.direccion || visita?.Ubicacion || ''

    const enviar = async () => {
        const observacion = String(form.especificacion_nueva_solicitud ?? '').trim()
        if (!observacion) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Escribe la especificación de la solicitud.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
            return
        }
        if (!direccion) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin dirección',
                text: 'La solicitud no tiene una dirección registrada. No se puede generar la solicitud.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
            return
        }

        setEnviando(true)
        try {
            await crearSolicitud({
                observacion,
                direccion,
                up_id: upId || solicitud?.up_id || null,
                motivo_id: MOTIVO_SOLICITUD.CON_UP,
                usuario_id: userId,
            })
            onChange('especificacion_nueva_solicitud', '')
            Swal.fire({
                icon: 'success',
                title: 'Solicitud generada',
                text: 'La nueva solicitud fue registrada a nombre del productor.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
            })
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo generar la solicitud. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
        } finally {
            setEnviando(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-500">
                Genere una nueva solicitud de visita para la misma unidad productiva, tal como lo haría el productor.
                La dirección se toma de la visita original.
            </p>

            <div className="flex flex-col gap-1">
                <label className={labelClase}>Dirección de la unidad productiva</label>
                <div className="flex items-center gap-2">
                    <LocationOnIcon sx={{ fontSize: 18, color: '#015d3b' }} />
                    <input
                        name="direccion_up"
                        type="text"
                        value={direccion}
                        className={inputClase}
                        disabled
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className={labelClase}>Especificación de la solicitud</label>
                <textarea
                    name="especificacion_nueva_solicitud"
                    value={form.especificacion_nueva_solicitud ?? ''}
                    onChange={(e) => onChange('especificacion_nueva_solicitud', e.target.value)}
                    rows={5}
                    maxLength={255}
                    placeholder="Describa la solicitud que desea generar a nombre del productor"
                    className={inputClase}
                />
            </div>

            <div className="flex justify-end">
                <button
                    onClick={enviar}
                    disabled={enviando}
                    className="px-4 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {enviando ? 'Generando...' : 'Generar solicitud'}
                </button>
            </div>
        </div>
    )
}