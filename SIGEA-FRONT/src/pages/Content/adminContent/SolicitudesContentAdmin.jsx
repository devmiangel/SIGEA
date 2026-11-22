import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AssignmentIcon from '@mui/icons-material/Assignment'
import SearchIcon from '@mui/icons-material/Search'
import Swal from 'sweetalert2'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import UserRequest from "../../../components/UserRequest/UserRequest"
import PaginationBar from "../../../components/PaginationBar/PaginationBar"
import { usePaginatedList } from "../../../hooks/usePaginatedList"
import { abrirModalAtenderSolicitud } from "../../../components/AgroModals/AtenderSolicitudModal"
import { atenderSolicitud, rechazarSolicitud, getSolicitudes, getVisitas } from "../../../services/agroService"
import { AGRO_COLORS, ESTADO_SOLICITUD } from "../../../utils/agroConstants"
import { toDatetimeLocal } from "../../../utils/dateHelpers"

const PAGE_SIZE = 20

export default function SolicitudesContentAdmin() {
    const navigate = useNavigate()
    const [busqueda, setBusqueda] = useState('')
    const [procesandoId, setProcesandoId] = useState(null)

    const {
        items: solicitudes,
        count,
        page,
        setPage,
        pageSize,
        loading,
        error,
        refresh,
    } = usePaginatedList(
        getSolicitudes,
        { estado: 'pendientes', search: busqueda.trim() },
        PAGE_SIZE,
    )

    const obtenerDatosPrevios = async (solicitud) => {
        try {
            const data = await getVisitas({ solicitud_id: solicitud.id })
            const lista = Array.isArray(data) ? data : (data?.results ?? [])
            const visita = lista[0]
            if (!visita) return null
            return {
                fecha_visita: toDatetimeLocal(visita.FechaYHoraVisita),
                ubicacion: visita.Ubicacion,
                funcionario_id: visita.Funcionario,
                funcionario_nombre: visita.funcionario_info?.nombre,
                tipo_visita_id: visita.TipoVisita,
                novedad: solicitud.novedad,
            }
        } catch {
            return null
        }
    }

    const handleRechazar = async (solicitud) => {
        const confirmacion = await Swal.fire({
            icon: 'warning',
            title: '¿Rechazar solicitud?',
            text: 'La solicitud saldrá de la lista de pendientes. Indica el motivo del rechazo.',
            input: 'textarea',
            inputLabel: 'Motivo de rechazo',
            inputPlaceholder: 'Escribe el motivo del rechazo...',
            inputAttributes: { maxlength: 255 },
            showCancelButton: true,
            confirmButtonText: 'Sí, rechazar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: AGRO_COLORS.danger,
            inputValidator: (value) => {
                if (!value || !value.trim()) return 'Debes indicar el motivo del rechazo'
            },
        })

        if (!confirmacion.isConfirmed) return

        setProcesandoId(solicitud.id)
        try {
            await rechazarSolicitud(solicitud.id, { novedad: confirmacion.value.trim() })
            await refresh()
            Swal.fire({
                icon: 'success',
                title: 'Solicitud rechazada',
                text: 'La solicitud fue rechazada y salió de la lista.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
            })
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err?.response?.data?.error || 'No se pudo rechazar la solicitud. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
        } finally {
            setProcesandoId(null)
        }
    }

    const handleAtender = async (solicitud) => {
        if (procesandoId) return

        const datosPrevios = solicitud.Estado === ESTADO_SOLICITUD.REAGENDADO
            ? await obtenerDatosPrevios(solicitud)
            : null

        const result = await abrirModalAtenderSolicitud(solicitud, solicitud.id, datosPrevios)

        if (result.isConfirmed) {
            setProcesandoId(solicitud.id)
            try {
                await atenderSolicitud(solicitud.id, result.value)
                await refresh()
                Swal.fire({
                    icon: 'success',
                    title: 'Solicitud asignada',
                    text: 'La visita fue programada y la solicitud salió de la lista de pendientes.',
                    confirmButtonColor: AGRO_COLORS.success,
                    timer: 2200,
                    timerProgressBar: true,
                })
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err?.response?.data?.error || 'No se pudo asignar la solicitud. Intenta de nuevo.',
                    confirmButtonColor: AGRO_COLORS.primary,
                })
            } finally {
                setProcesandoId(null)
            }
            return
        }

        if (result.dismiss === Swal.DismissReason.cancel) {
            await handleRechazar(solicitud)
        }
    }

    return (
        <>
            <Header
                componentLogo={
                    <AssignmentIcon sx={{ fontSize: 40, color: 'ActiveCaption' }} />
                }
                headerText={'Solicitudes'}
                message={'Asigna a un funcionario las solicitudes pendientes de los productores'}
                colorLogo={'#55bd85'}
                firstButton={
                    <ButtonLink buttonText={'Horarios'}
                        onClick={() => navigate('/administrador/horarios')} />
                }
                secondButton={
                    <ButtonLink buttonText={'Visitas'}
                        onClick={() => navigate('/administrador/visitas')} />
                }
            />
            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4 overflow-y-hidden">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Solicitudes pendientes</h3>
                        <p className="text-xs text-gray-500">
                            {loading ? 'Cargando...' : `${count} solicitud(es) por asignar`}
                        </p>
                    </div>
                    <div className="relative w-full sm:max-w-md">
                        <SearchIcon
                            fontSize="small"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => { setBusqueda(e.target.value); setPage(1) }}
                            placeholder="Buscar por solicitante, documento, RUEA o predio..."
                            className="w-full pl-10 pr-3 py-2 rounded-lg border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white"
                        />
                    </div>
                </div>

                <p className="mb-4 rounded-lg bg-[#f4f9f7] px-3 py-2 text-xs text-[#015d3b]">
                    Haz clic en una solicitud para asignarle funcionario, fecha y tipo de visita.
                </p>

                {loading ? (
                    <div className="space-y-3">
                        <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
                        <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
                        <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
                    </div>
                ) : error ? (
                    <p className="text-red-600 text-sm">No se pudieron cargar las solicitudes. Intenta de nuevo.</p>
                ) : count === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-300 bg-[#f4f9f7] py-10 text-center text-sm text-gray-500">
                        No hay solicitudes pendientes por asignar.
                    </p>
                ) : (
                    <>
                        <div className="space-y-3">
                            {solicitudes.map((solicitud) => (
                                <div
                                    key={solicitud.id}
                                    className={procesandoId === solicitud.id ? 'pointer-events-none opacity-60' : ''}
                                >
                                    <UserRequest
                                        solicitud={solicitud}
                                        numero={solicitud.id}
                                        mostrarSolicitante
                                        onClick={() => handleAtender(solicitud)}
                                    />
                                </div>
                            ))}
                        </div>
                        <PaginationBar
                            page={page}
                            count={count}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            loading={loading}
                        />
                    </>
                )}
            </div>
        </>
    )
}
