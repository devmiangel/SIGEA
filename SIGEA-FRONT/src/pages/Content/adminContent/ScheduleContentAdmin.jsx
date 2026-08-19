import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import TabList from "../../../components/TabList/TabList"
import UserRequest from "../../../components/UserRequest/UserRequest"
import CalendarioVisitas from "../../../components/calendar/CalendarioVisitas"
import { useTodasSolicitudes } from "../../../hooks/useTodasSolicitudes"
import { useVisitas } from "../../../hooks/useVisitas"
import { useCurrentDataUser } from "../../../hooks/currentUserHook"
import { atenderSolicitud, rechazarSolicitud } from "../../../services/agroService"
import { abrirModalAtenderSolicitud } from "../../../components/AgroModals/AtenderSolicitudModal"
import { mostrarInfoSolicitud } from "../../../components/AgroModals/AlertRequestInfoModal"
import { AGRO_COLORS, ESTADO_SOLICITUD } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

export default function ScheduleContentAdmin(){
    const navigate = useNavigate()
    const { user } = useCurrentDataUser()
    const { solicitudes, loading, refresh } = useTodasSolicitudes()
    const { visitas, refresh: refreshVisitas } = useVisitas()
    const [activeTab, setActiveTab] = useState('Pendientes')

    const pendientes = useMemo(() => solicitudes.filter(s => s.Estado === ESTADO_SOLICITUD.EN_PROCESO), [solicitudes])
    const atendidas = useMemo(() => solicitudes.filter(s => s.Estado !== ESTADO_SOLICITUD.EN_PROCESO), [solicitudes])

    const currentContent = activeTab === 'Pendientes' ? pendientes : atendidas

    const handleVerSolicitud = (s, numero) => {
        mostrarInfoSolicitud(s, numero, user)
    }

    const handleAtenderSolicitud = async (s, numero) => {
        try {
            const result = await abrirModalAtenderSolicitud(s, numero)

            if (result.isConfirmed) {
                await atenderSolicitud(s.id, result.value)
                await Promise.all([refresh(), refreshVisitas()])
                Swal.fire({
                    icon: 'success',
                    title: 'Visita programada',
                    text: 'La solicitud fue aceptada y la visita fue creada.',
                    confirmButtonColor: AGRO_COLORS.success,
                    timer: 2000,
                    timerProgressBar: true
                })
                return
            }

            if (result.dismiss === Swal.DismissReason.cancel) {
                await handleRechazarSolicitud(s)
            }
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo procesar la solicitud. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary
            })
        }
    }

    const handleRechazarSolicitud = async (s) => {
        const confirmacion = await Swal.fire({
            icon: 'warning',
            title: '¿Rechazar solicitud?',
            text: 'La solicitud pasará a la lista de atendidas como rechazada. Indica el motivo del rechazo.',
            input: 'textarea',
            inputLabel: 'Motivo de rechazo',
            inputPlaceholder: 'Escribe el motivo del rechazo...',
            inputAttributes: { maxlength: 255 },
            showCancelButton: true,
            confirmButtonText: 'Sí, rechazar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: AGRO_COLORS.danger,
            inputValidator: (value) => {
                if (!value || !value.trim()) {
                    return 'Debes indicar el motivo del rechazo'
                }
            }
        })

        if (!confirmacion.isConfirmed) return

        try {
            await rechazarSolicitud(s.id, { novedad: confirmacion.value.trim() })
            await refresh()
            Swal.fire({
                icon: 'success',
                title: 'Solicitud rechazada',
                text: 'La solicitud fue rechazada correctamente.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true
            })
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo procesar la solicitud. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary
            })
        }
    }

    const handleClickSolicitud = (s) => {
        const numero = currentContent.findIndex(x => x.id === s.id) + 1
        if (activeTab === 'Pendientes') {
            handleAtenderSolicitud(s, numero)
        } else {
            handleVerSolicitud(s, numero)
        }
    }

    return (
        <>
            <Header
                componentLogo={
                    <CalendarMonthIcon
                        sx={{fontSize: 40, color:"ActiveCaption"}}
                    />
                }
                headerText={'Gestion de horarios de visitas'}
                message={'Gestiona la asignacion de las visitas a productores a los funcionarios correspondientes'}
                colorLogo={'#55bd85'}
                firstButton={
                    <ButtonLink buttonText={'Validacion de UPs'}
                        onClick={() => navigate('/administrador/validacion-ups')}/>
                }
                secondButton={
                    <ButtonLink buttonText={'Visitas'}
                        onClick={() => navigate('/administrador/visitas')}/>
                }
            />
            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full overflow-y-hidden">
                <div className="mb-6">
                    <CalendarioVisitas visitas={visitas} />
                </div>
                <TabList
                    categories={['Pendientes', 'Atendidas']}
                    active={activeTab}
                    onChange={setActiveTab}
                />
                <div className="mt-6">
                    {loading ? (
                        <p className="text-gray-500 text-sm">Cargando solicitudes...</p>
                    ) : currentContent.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            No hay solicitudes {activeTab === 'Pendientes' ? 'pendientes' : 'atendidas'} registradas.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {currentContent.map((s, i) => (
                                <UserRequest
                                    key={s.id}
                                    numero={i + 1}
                                    solicitud={s}
                                    onClick={() => handleClickSolicitud(s)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
