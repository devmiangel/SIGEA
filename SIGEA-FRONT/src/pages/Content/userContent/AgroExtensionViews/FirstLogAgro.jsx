import { useState } from "react"
import { SubmitButton } from "../../../../components/formElements/SubmitButton"
import { Header } from "../../../../components/Tettles-Buttons/Title"
import AgricultureIcon from '@mui/icons-material/Agriculture'
import PersonIcon from '@mui/icons-material/Person'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { useCurrentDataUser } from "../../../../hooks/currentUserHook"
import { useSolicitudes } from "../../../../hooks/useSolicitudes"
import { getNombreCompleto, getCorreo } from "../../../../utils/userDisplay"

const MAX_CARACTERES = 255

function DatoProductor({ etiqueta, valor }) {
    return (
        <div className="min-w-0 rounded-xl border border-[#e0ece7] bg-[#f4f9f7] px-3.5 py-2.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{etiqueta}</p>
            <p className="truncate text-sm font-semibold text-gray-800" title={valor}>{valor || '—'}</p>
        </div>
    )
}

export default function FirstLogAgro({ onSolicitudCreada }){
    const { user } = useCurrentDataUser()
    const { crear, creando } = useSolicitudes(user)
    const [observacion, setObservacion] = useState('')
    const [direccion, setDireccion] = useState('')
    const [error, setError] = useState('')

    const nombreCompleto = getNombreCompleto(user)
    const correo = getCorreo(user)
    const formularioCompleto = observacion.trim() && direccion.trim()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formularioCompleto || creando) return
        setError('')
        const result = await crear({ observacion: observacion.trim(), direccion: direccion.trim() })
        if (result.ok) {
            onSolicitudCreada()
        } else {
            setError('Error al enviar la solicitud. Intenta de nuevo.')
        }
    }

    return(
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-3 py-4 sm:gap-5 sm:px-5 sm:py-6">
            {/* Bienvenida */}
            <Header
                componentLogo={<AgricultureIcon sx={{ fontSize: 40, color: 'ActiveCaption' }} />}
                headerText={'¡Bienvenido al módulo de Extensión Agropecuaria!'}
                message={'Para brindarte el mejor servicio y apoyo técnico, necesitamos conocer tu unidad productiva. Solicita una visita de caracterización: nuestro equipo técnico visitará tu predio para evaluar tus necesidades y ofrecerte asistencia personalizada.'}
                colorLogo={'#3e9a8a'}
            />

            {/* Formulario */}
            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="mb-5 text-center text-base font-bold text-gray-800 sm:text-lg">
                    Solicitud de visita de caracterización
                </h2>

                <div className="mb-6">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-[#015d3b] mb-3 ">
                        <PersonIcon fontSize="small" />
                        Información del productor
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <DatoProductor etiqueta="Nombre" valor={nombreCompleto} />
                        <DatoProductor etiqueta="Correo electrónico" valor={correo} />
                    </div>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-[#015d3b] mb-3 ">
                        <QuestionAnswerIcon fontSize="small" />
                        Solicitud
                    </h3>

                    <div className="mb-4">
                        <label htmlFor="Solicitud_Direccion" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                            <LocationOnIcon fontSize="small" className="text-[#3e9a8a]" />
                            Dirección de la unidad productiva
                        </label>
                        <input
                            id="Solicitud_Direccion"
                            name="Solicitud_Direccion"
                            type="text"
                            autoComplete="street-address"
                            className="w-full rounded-xl border border-[#3e9a8a]/50 bg-white px-3.5 py-3 text-sm text-gray-800 placeholder:text-gray-400 shadow-sm transition focus:border-[#3e9a8a] focus:outline-none focus:ring-2 focus:ring-[#3e9a8a]/30"
                            placeholder="Ej.: Vereda El Rosal, finca La Esperanza"
                            maxLength={MAX_CARACTERES}
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="Solicitud_Primera_visita" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                            Descripción y referencias
                        </label>
                        <textarea
                            id="Solicitud_Primera_visita"
                            name="Solicitud_Primera_visita"
                            className="w-full rounded-xl border border-[#3e9a8a]/50 bg-white px-3.5 py-3 text-sm text-gray-800 placeholder:text-gray-400 shadow-sm transition focus:border-[#3e9a8a] focus:outline-none focus:ring-2 focus:ring-[#3e9a8a]/30 min-h-32 resize-y"
                            placeholder="Añade referencias para encontrarte (puntos cercanos, cómo llegar) y cuéntanos qué necesitas."
                            rows={5}
                            maxLength={MAX_CARACTERES}
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                        />
                        <p className="mt-1 text-right text-[11px] text-gray-400">{observacion.length}/{MAX_CARACTERES}</p>
                    </div>

                    {error && (
                        <p role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                            <ErrorOutlineIcon fontSize="small" />
                            {error}
                        </p>
                    )}

                    <SubmitButton
                        text={creando ? 'Enviando...' : 'Enviar solicitud'}
                        disabled={creando || !formularioCompleto}
                    />
                    {!formularioCompleto && (
                        <p className="mt-2 text-center text-xs text-gray-500">
                            Completa la dirección y la descripción para enviar la solicitud.
                        </p>
                    )}
                </form>
            </section>
        </div>
    )
}
