import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AssignmentLateOutlinedIcon from '@mui/icons-material/AssignmentLateOutlined'
import SearchIcon from '@mui/icons-material/Search'
import Swal from 'sweetalert2'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import SolicitudInsumoCard from "../../../components/SolicitudInsumoCard/SolicitudInsumoCard"
import PaginationBar from "../../../components/PaginationBar/PaginationBar"
import { useSolicitudesInsumo } from "../../../hooks/useSolicitudesInsumo"
import { useValorDiferido } from "../../../hooks/useValorDiferido"
import { mostrarInfoSolicitudInsumo } from "../../../components/AgroModals/SolicitudInsumoInfoModal"
import { abrirModalAsignarInsumo } from "../../../components/AgroModals/AsignarInsumoModal"
import { abrirModalRechazarInsumo } from "../../../components/AgroModals/RechazarInsumoModal"
import {
    asignarSolicitudInsumo,
    rechazarSolicitudInsumo,
} from "../../../services/inventarioService"
import { AGRO_COLORS, ESTADO_SOLICITUD_INSUMO } from "../../../utils/agroConstants"

export default function SolicitudesInsumoContentAdmin() {
    const navigate = useNavigate()
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const busquedaDiferida = useValorDiferido(busqueda.trim())
    const {
        solicitudes, count, page, setPage, pageSize, loading, error, refresh,
    } = useSolicitudesInsumo({ search: busquedaDiferida, estado: filtroEstado })
    const hayFiltros = Boolean(busquedaDiferida) || Boolean(filtroEstado)

    const handleVolver = () => {
        navigate('/administrador/inventario/insumos')
    }

    const handleClick = (solicitud, numero) => {
        mostrarInfoSolicitudInsumo(solicitud, numero)
    }

    const handleAsignar = async (solicitud) => {
        try {
            const result = await abrirModalAsignarInsumo(solicitud)
            if (!result.isConfirmed) return

            await asignarSolicitudInsumo(solicitud.id, result.value)
            Swal.fire({
                icon: 'success',
                title: 'Asignación realizada',
                text: 'El insumo fue asignado correctamente al funcionario.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
            })
            refresh()
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err?.response?.data?.error || 'No se pudo realizar la asignación. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
        }
    }

    const handleRechazar = async (solicitud) => {
        try {
            const result = await abrirModalRechazarInsumo(solicitud)
            if (!result.isConfirmed) return

            await rechazarSolicitudInsumo(solicitud.id, result.value)
            Swal.fire({
                icon: 'success',
                title: 'Solicitud rechazada',
                text: 'La solicitud fue rechazada correctamente.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
            })
            refresh()
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err?.response?.data?.error || 'No se pudo rechazar la solicitud. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
        }
    }

    return (
        <>
            <Header
                componentLogo={
                    <AssignmentLateOutlinedIcon sx={{ fontSize: 40, color: 'ActiveCaption' }} />
                }
                headerText={'Solicitudes de insumo'}
                message={'Consulta las solicitudes de insumo realizadas por los funcionarios'}
                colorLogo={AGRO_COLORS.primaryLight}
                firstButton={
                    <ButtonLink
                        buttonText={'Volver'}
                        onClick={handleVolver}
                    />
                }
            />
            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4 overflow-y-hidden">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Solicitudes generadas</h3>
                    <p className="text-xs text-gray-500">
                        {count} solicitud(es) {hayFiltros ? 'encontrada(s)' : 'registrada(s)'}
                    </p>
                </div>

                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <SearchIcon
                            fontSize="small"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => { setBusqueda(e.target.value); setPage(1) }}
                            placeholder="Buscar por insumo, funcionario o correo..."
                            className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white"
                        />
                    </div>
                    <select
                        value={filtroEstado}
                        onChange={(e) => { setFiltroEstado(e.target.value); setPage(1) }}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white sm:w-52"
                    >
                        <option value="">Todos los estados</option>
                        <option value={ESTADO_SOLICITUD_INSUMO.PENDIENTE}>Pendiente</option>
                        <option value={ESTADO_SOLICITUD_INSUMO.RESUELTA}>Resuelta</option>
                        <option value={ESTADO_SOLICITUD_INSUMO.RECHAZADA}>Rechazada</option>
                    </select>
                </div>

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando solicitudes...</p>
                ) : error ? (
                    <p className="text-red-600 text-sm">No se pudieron cargar las solicitudes. Intenta de nuevo.</p>
                ) : count === 0 ? (
                    <p className="text-gray-500 text-sm">
                        {hayFiltros
                            ? 'No se encontraron solicitudes con los filtros aplicados.'
                            : 'No hay solicitudes de insumo registradas.'}
                    </p>
                ) : (
                    <>
                        <div className="space-y-3">
                            {solicitudes.map((s) => (
                                <SolicitudInsumoCard
                                    key={s.id}
                                    solicitud={s}
                                    numero={s.id}
                                    onCardClick={() => handleClick(s, s.id)}
                                    onAsignar={handleAsignar}
                                    onRechazar={handleRechazar}
                                />
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