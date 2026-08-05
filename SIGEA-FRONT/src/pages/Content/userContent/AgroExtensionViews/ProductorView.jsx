import { useState, useMemo, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "../../../../components/Tettles-Buttons/Title"
import TabList from "../../../../components/TabList/TabList"
import AgricultureIcon from '@mui/icons-material/Agriculture'
import UserRequest from "../../../../components/UserRequest/UserRequest"
import AlertRequestInfo from "../../../../components/AlertRequestInfo/AlertRequestInfo"
import UPPReviewCard from "../../../../components/UPPReviewCard/UPPReviewCard"
import Swal from 'sweetalert2'
import { getMisUPs } from "../../../../services/agroService"
import { useCurrentDataUser } from "../../../../hooks/currentUserHook"
import { useSolicitudes } from "../../../../hooks/useSolicitudes"
import { abrirModalNuevaSolicitud } from "../../../../components/AgroModals/NuevaSolicitudModal"
import { AGRO_COLORS } from "../../../../utils/agroConstants"

export default function ProductorView(){
    const navigate = useNavigate()
    const { user } = useCurrentDataUser()
    const { solicitudes, loading, crear } = useSolicitudes(user)
    const [selectedSolicitud, setSelectedSolicitud] = useState(null)
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
        <>
            <Header
                componentLogo={<AgricultureIcon sx={{fontSize: 40}}/>}
                headerText={'Mis Unidades Productivas'}
                colorLogo={'#3e9a8a'}
                message={'Gestiona tus unidades productivas registradas y en proceso de aprobación'}
                firstButton={
                    <button
                        onClick={handleAgregarUnidad}
                        className="bg-[#229e14] py-2 px-5 border-none text-white rounded-[5px] text-[10px] cursor-pointer hover:bg-[#1d8a11] transition-colors"
                    >
                        Agregar Unidad
                    </button>
                }
            />
            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full overflow-y-hidden">
                <TabList
                    categories={contentTabs.map(t => t.title)}
                    active={activeTab}
                    onChange={setActiveTab}
                />
                <div className="mt-6">
                    {activeTab === 'Mis UPs' ? (
                        loadingUps ? (
                            <p className="text-gray-500 text-sm">Cargando unidades productivas...</p>
                        ) : currentContent.length === 0 ? (
                            <p className="text-gray-500 text-sm">No tienes unidades productivas registradas.</p>
                        ) : (
                            <div className="space-y-3">
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
                            <p className="text-gray-500 text-sm">Cargando solicitudes...</p>
                        ) : currentContent.length === 0 ? (
                            <p className="text-gray-500 text-sm">No tienes solicitudes registradas.</p>
                        ) : (
                            <div className="space-y-3">
                                {currentContent.map((s, i) => (
                                    <UserRequest
                                        key={s.id}
                                        numero={i + 1}
                                        solicitud={s}
                                        onClick={() => setSelectedSolicitud(s)}
                                    />
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>

            {selectedSolicitud && (
                <AlertRequestInfo
                    solicitud={selectedSolicitud}
                    numero={solicitudes.findIndex(s => s.id === selectedSolicitud.id) + 1}
                    user={user}
                    onClose={() => setSelectedSolicitud(null)}
                />
            )}
        </>
    )
}
