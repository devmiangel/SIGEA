import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import EventIcon from '@mui/icons-material/Event'
import { Header } from "../../../components/Tettles-Buttons/Title"
import { Campo } from "../employeeContent/visitViews/fields"
import { crearEvento, actualizarEvento, getEvento } from "../../../services/agroService"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

const INICIAL = {
    Titulo: '',
    Descripcion: '',
    Fecha: '',
    Lugar: '',
}

const REQUERIDOS = [
    { nombre: 'Titulo', label: 'Titulo del evento' },
    { nombre: 'Descripcion', label: 'Descripcion' },
    { nombre: 'Fecha', label: 'Fecha' },
    { nombre: 'Lugar', label: 'Lugar' },
]

export default function EventoFormContentAdmin() {
    const navigate = useNavigate()
    const { eventoId } = useParams()
    const esEdicion = Boolean(eventoId)
    const [form, setForm] = useState(INICIAL)
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        let activo = true
        const cargar = async () => {
            try {
                const evento = esEdicion ? await getEvento(eventoId) : null
                if (!activo) return
                if (evento) {
                    setForm({
                        Titulo: evento.Titulo ?? '',
                        Descripcion: evento.Descripcion ?? '',
                        Fecha: evento.Fecha ?? '',
                        Lugar: evento.Lugar ?? '',
                    })
                }
            } catch {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: esEdicion
                        ? 'No se pudieron cargar los datos del evento. Intenta de nuevo.'
                        : 'No se pudo cargar la informacion necesaria. Intenta de nuevo.',
                    confirmButtonColor: AGRO_COLORS.primary,
                })
            } finally {
                if (activo) setCargando(false)
            }
        }
        cargar()
        return () => { activo = false }
    }, [esEdicion, eventoId])

    const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

    const guardar = async () => {
        const faltantes = REQUERIDOS
            .filter((r) => !String(form[r.nombre] ?? '').trim())
            .map((r) => r.label)
        if (faltantes.length) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos obligatorios',
                text: `Complete los campos: ${faltantes.join(', ')}.`,
                confirmButtonColor: AGRO_COLORS.primary,
            })
            return
        }

        setGuardando(true)
        try {
            if (esEdicion) {
                await actualizarEvento(eventoId, form)
            } else {
                await crearEvento(form)
            }
            Swal.fire({
                icon: 'success',
                title: esEdicion ? 'Evento actualizado' : 'Evento creado',
                text: esEdicion
                    ? 'El evento fue actualizado correctamente.'
                    : 'El evento fue registrado correctamente en el sistema.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
            }).then(() => navigate('/administrador/eventos'))
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: esEdicion
                    ? 'No se pudo actualizar el evento. Intenta de nuevo.'
                    : 'No se pudo crear el evento. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
        } finally {
            setGuardando(false)
        }
    }

    return (
        <div className="w-full max-w-full">
            <Header
                componentLogo={
                    <EventIcon sx={{ fontSize: 40, color: "ActiveCaption" }} />
                }
                headerText={esEdicion ? 'Actualizacion de evento' : 'Registro de evento'}
                message={esEdicion
                    ? 'Modifica la informacion del evento seleccionado'
                    : 'Ingresa un nuevo evento al sistema'}
                colorLogo={AGRO_COLORS.primaryLight}
            />

            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">{esEdicion ? 'Editar evento' : 'Nuevo evento'}</h3>
                    <p className="text-xs text-gray-500">
                        Diligencia la informacion del evento. Los campos marcados con * son obligatorios.
                    </p>
                </div>

                {cargando ? (
                    <p className="text-gray-500 text-sm">{esEdicion ? 'Cargando informacion del evento...' : 'Preparando formulario...'}</p>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Campo
                                name="Titulo"
                                label="Titulo del evento *"
                                value={form.Titulo}
                                onChange={onChange}
                                placeholder="Ej. Jornada de vacunacion"
                            />
                            <Campo
                                name="Fecha"
                                label="Fecha *"
                                type="date"
                                value={form.Fecha}
                                onChange={onChange}
                            />
                            <Campo
                                name="Lugar"
                                label="Lugar *"
                                value={form.Lugar}
                                onChange={onChange}
                                placeholder="Ej. Vereda El Rosal"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Descripcion *</label>
                            <textarea
                                name="Descripcion"
                                value={form.Descripcion}
                                onChange={(e) => onChange('Descripcion', e.target.value)}
                                placeholder="Detalles del evento"
                                rows={4}
                                className="w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white resize-none"
                            />
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                            <button
                                onClick={() => navigate('/administrador/eventos')}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={guardar}
                                disabled={guardando}
                                className="px-6 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {guardando ? 'Guardando...' : esEdicion ? 'Actualizar evento' : 'Crear evento'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
