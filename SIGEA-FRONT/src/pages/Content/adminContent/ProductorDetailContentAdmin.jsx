import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonIcon from '@mui/icons-material/Person'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import { Header } from "../../../components/Tettles-Buttons/Title"
import UPPReviewCard from "../../../components/UPPReviewCard/UPPReviewCard"
import { getProductorDetalle } from "../../../services/usuariosService"
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage"
import { esRegistroActivo } from "../../../utils/insumoHelpers"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

const nombrePersona = (productor) => {
    const persona = productor?.persona ?? {}
    return [
        persona.primer_nombre,
        persona.segundo_nombre,
        persona.primer_apellido,
        persona.segundo_apellido,
    ].filter(Boolean).join(' ').trim() || productor?.email || 'Productor'
}

function Fila({ etiqueta, valor }) {
    if (valor === null || valor === undefined || valor === '') return null
    return (
        <div className="flex flex-col gap-0.5 border-b border-gray-100 py-2 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">
                {etiqueta}
            </span>
            <span className="min-w-0 break-words text-sm font-medium text-gray-800 sm:text-right">
                {String(valor)}
            </span>
        </div>
    )
}

function Bloque({ titulo, children }) {
    const items = children.filter(Boolean)
    if (!items.length) return null
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 border-b border-gray-200 bg-[#e8f3ef] px-3 py-2.5 sm:px-4">
                <h4 className="text-sm font-semibold text-[#015d3b]">{titulo}</h4>
            </div>
            <div className="px-3 py-1 sm:px-4">{items}</div>
        </div>
    )
}

export default function ProductorDetailContentAdmin() {
    const { productorId } = useParams()
    const navigate = useNavigate()
    const [productor, setProductor] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let activo = true
        const cargar = async () => {
            setLoading(true)
            try {
                const data = await getProductorDetalle(productorId)
                if (activo) setProductor(data)
            } catch (e) {
                if (!activo) return
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: getApiErrorMessage(e, 'No se pudo cargar la información del productor.'),
                    confirmButtonColor: AGRO_COLORS.primary,
                })
            } finally {
                if (activo) setLoading(false)
            }
        }
        cargar()
        return () => { activo = false }
    }, [productorId])

    const nombre = useMemo(() => nombrePersona(productor), [productor])
    const persona = productor?.persona ?? {}
    const activo = esRegistroActivo(productor)
    const contactos = productor?.contactos ?? []
    const ups = productor?.ups ?? []

    return (
        <div className="w-full max-w-full">
            <Header
                componentLogo={<PersonIcon sx={{ fontSize: 40, color: 'ActiveCaption' }} />}
                headerText={nombre}
                message={'Información básica del productor y sus unidades productivas'}
                colorLogo={AGRO_COLORS.primaryLight}
            />

            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4">
                <button
                    onClick={() => navigate('/administrador/productores')}
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 sm:w-auto sm:justify-start"
                >
                    <ArrowBackIcon fontSize="small" /> Volver a productores
                </button>

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando información del productor...</p>
                ) : !productor ? (
                    <p className="text-gray-500 text-sm">No se encontró el productor.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="rounded-xl border border-gray-200 bg-[#f4f9f7] p-4 sm:p-5">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#005C39] text-white shadow-sm">
                                    <PersonIcon sx={{ fontSize: 24, color: '#fff' }} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-base font-semibold text-gray-900">{nombre}</h3>
                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
                                            activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {productor.email || 'Sin correo'} · {ups.length} unidad(es) productiva(s)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Bloque titulo="Información personal">
                            <Fila etiqueta="Nombre completo" valor={nombre} />
                            <Fila etiqueta="Tipo de documento" valor={persona.TipoDocumento_info?.TipoDocumento} />
                            <Fila etiqueta="Número de documento" valor={persona.numero_documento} />
                            <Fila etiqueta="Fecha de nacimiento" valor={persona.fecha_nacimiento} />
                            <Fila etiqueta="Correo" valor={productor.email} />
                            <Fila
                                etiqueta="Contactos"
                                valor={contactos.map((c) => c.contacto).filter(Boolean).join(', ')}
                            />
                        </Bloque>

                        <div className="flex items-center gap-2">
                            <AgricultureIcon sx={{ fontSize: 20, color: AGRO_COLORS.primary }} />
                            <h4 className="text-sm font-semibold text-gray-900">
                                Unidades productivas ({ups.length})
                            </h4>
                        </div>

                        {ups.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-gray-300 bg-[#f4f9f7] py-8 text-center text-sm text-gray-500">
                                El productor no tiene unidades productivas registradas.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
                                {ups.map((up) => (
                                    <UPPReviewCard
                                        key={up.id}
                                        up={up}
                                        onClick={() => navigate(
                                            `/administrador/productores/${productorId}/up/${up.id}`
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
