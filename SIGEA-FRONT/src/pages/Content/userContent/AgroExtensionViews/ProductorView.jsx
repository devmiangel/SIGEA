import { useState, useMemo, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import TabList from "../../../../components/TabList/TabList"
import AgricultureIcon from '@mui/icons-material/Agriculture'
import UserRequest from "../../../../components/UserRequest/UserRequest"
import UPPReviewCard from "../../../../components/UPPReviewCard/UPPReviewCard"
import Swal from 'sweetalert2'
import { getMisUPs } from "../../../../services/agroService"
import { useCurrentDataUser } from "../../../../hooks/currentUserHook"
import { useSolicitudes } from "../../../../hooks/useSolicitudes"
import { abrirModalNuevaSolicitud } from "../../../../components/AgroModals/NuevaSolicitudModal"
import { mostrarInfoSolicitud } from "../../../../components/AgroModals/AlertRequestInfoModal"
import { AGRO_COLORS } from "../../../../utils/agroConstants"

export default function ProductorView(){
    const navigate = useNavigate()
    const { user } = useCurrentDataUser()
    const { solicitudes, loading, crear } = useSolicitudes(user)
    const [activeTab, setActiveTab] = useState('Mis UPs')
    const [ups, setUps] = useState([])
    const [loadingUps, setLoadingUps] = useState(true)

    const cargarUps = useCallback(async () => {
        setLoadingUps(true)
        try {
            const data = await getMisUPs()
            setUps(data)
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar tus unidades productivas.',
                confirmButtonColor: AGRO_COLORS.primary
            })
        } finally {
            setLoadingUps(false)
        }
    }, [])

    useEffect(() => { cargarUps() }, [cargarUps])

    const handleAgregarUnidad = async () => {
        try {
            const ups = await getMisUPs()
            const result = await abrirModalNuevaSolicitud(ups)

            if (result.isConfirmed) {
                const res = await crear(result.value)
                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Solicitud creada',
                        text: 'Tu solicitud ha sido enviada correctamente.',
                        confirmButtonColor: AGRO_COLORS.primary,
                        timer: 2000,
                        timerProgressBar: true
                    })
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo crear la solicitud. Intenta de nuevo.',
                        confirmButtonColor: AGRO_COLORS.primary
                    })
                }
            }
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear la solicitud. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary
            })
        }
    }

    const contentTabs = useMemo(() => [
        { id: 1, title: 'Mis UPs', content: ups },
        { id: 2, title: 'Solicitudes', content: solicitudes }
    ], [ups, solicitudes])

    const currentContent = contentTabs.find(t => t.title === activeTab)?.content

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-4 sm:gap-5 sm:px-5 sm:py-6">
            <header className="rounded-2xl bg-linear-to-br from-[#005C39] to-[#0b7a52] p-5 text-white shadow-md sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#3e9a8a] ring-4 ring-white/15 sm:h-14 sm:w-14">
                            <AgricultureIcon sx={{ fontSize: 30 }} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold leading-tight sm:text-2xl">Mis Unidades Productivas</h1>
                            <p className="mt-1 text-sm leading-relaxed text-white/85 text-pretty">
                                Gestiona tus unidades productivas registradas y en proceso de aprobación.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleAgregarUnidad}
                        className="w-full shrink-0 rounded-xl bg-[#229e14] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1d8a11] sm:w-auto"
                    >
                        Generar solicitud
                    </button>
                </div>
            </header>

            <section className="min-h-[60vh] rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
                <div className="-mx-1 overflow-x-auto px-1 pb-1">
                    <TabList
                        categories={contentTabs.map(t => t.title)}
                        active={activeTab}
                        onChange={setActiveTab}
                    />
                </div>
                <div className="mt-4 sm:mt-6">
                    {activeTab === 'Mis UPs' ? (
                        loadingUps ? (
                            <p className="py-8 text-center text-sm text-gray-500">Cargando unidades productivas...</p>
                        ) : currentContent.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-gray-300 bg-[#f4f9f7] py-8 text-center text-sm text-gray-500">
                                No tienes unidades productivas registradas.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {currentContent.map((up) => (
                                    <UPPReviewCard
                                        key={up.id}
                                        up={up}
                                        onClick={() => navigate(`/usuario/extension_agropecuaria/up/${up.id}`)}
                                    />
                                ))}
                            </div>
                        )
                    ) : (
                        loading ? (
                            <p className="py-8 text-center text-sm text-gray-500">Cargando solicitudes...</p>
                        ) : currentContent.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-gray-300 bg-[#f4f9f7] py-8 text-center text-sm text-gray-500">
                                No tienes solicitudes registradas.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {currentContent.map((s, i) => (
                                    <UserRequest
                                        key={s.id}
                                        numero={i + 1}
                                        solicitud={s}
                                        onClick={() => mostrarInfoSolicitud(s, i + 1, user)}
                                    />
                                ))}
                            </div>
                        )
                    )}
                </div>
            </section>
        </div>
    )
}
