import { useState } from "react"
import { useNavigate } from "react-router-dom"
import EventIcon from '@mui/icons-material/Event'
import SearchIcon from '@mui/icons-material/Search'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import EventoPreviewCard from "../../../components/EventoPreviewCard/EventoPreviewCard"
import RegistrarUPEventoModal from "../../../components/EventoUPsModal/RegistrarUPEventoModal"
import PaginationBar from "../../../components/PaginationBar/PaginationBar"
import { useEventos } from "../../../hooks/useEventos"
import { useValorDiferido } from "../../../hooks/useValorDiferido"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

export default function EventosContentAdmin() {
    const navigate = useNavigate()
    const [busqueda, setBusqueda] = useState("")
    const busquedaDiferida = useValorDiferido(busqueda.trim())
    const {
        eventos, count, page, setPage, pageSize, loading, error, eliminar, refresh,
    } = useEventos({ search: busquedaDiferida })
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null)
    const hayBusqueda = Boolean(busquedaDiferida)

    const handleEditar = (evento) => {
        navigate(`/administrador/eventos/editar/${evento.id}`)
    }

    const handleEliminar = async (evento) => {
        const confirmacion = await Swal.fire({
            icon: 'warning',
            title: '¿Eliminar evento?',
            text: `Se eliminará el evento "${evento?.Titulo}". Esta acción no se puede deshacer.`,
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: AGRO_COLORS.danger
        })

        if (!confirmacion.isConfirmed) return

        const res = await eliminar(evento.id)
        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Evento eliminado',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el evento.',
                confirmButtonColor: AGRO_COLORS.primary
            })
        }
    }

    return (
        <>
            <Header
                componentLogo={
                    <EventIcon
                        sx={{ fontSize: 40, color: "ActiveCaption" }}
                    />
                }
                headerText={'Gestion de eventos'}
                message={'Lista y administra los eventos registrados en el sistema'}
                colorLogo={'#9ebd57'}
                firstButton={
                    <ButtonLink
                        buttonText={'Crear evento'}
                        onClick={() => navigate('/administrador/eventos/nuevo')}
                    />
                }
            />
            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4 overflow-y-hidden">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Eventos del sistema</h3>
                    <p className="text-xs text-gray-500">
                        {hayBusqueda
                            ? `${count} evento(s) encontrado(s)`
                            : `${count} evento(s) registrado(s)`}
                    </p>
                </div>

                <div className="relative mb-4">
                    <SearchIcon
                        fontSize="small"
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => { setBusqueda(e.target.value); setPage(1) }}
                        placeholder="Buscar por título, lugar o descripción..."
                        className="w-full px-3 py-2 pl-9 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white"
                    />
                </div>

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando eventos...</p>
                ) : error ? (
                    <p className="text-red-600 text-sm">No se pudieron cargar los eventos. Intenta de nuevo.</p>
                ) : count === 0 ? (
                    <p className="text-gray-500 text-sm">
                        {hayBusqueda
                            ? 'No se encontraron eventos con los filtros aplicados.'
                            : 'No hay eventos registrados en el sistema.'}
                    </p>
                ) : (
                    <>
                        <div className="space-y-2">
                            {eventos.map((evento) => (
                                <EventoPreviewCard
                                    key={evento.id}
                                    evento={evento}
                                    onEdit={handleEditar}
                                    onDelete={handleEliminar}
                                    onOpen={setEventoSeleccionado}
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

            {eventoSeleccionado && (
                <RegistrarUPEventoModal
                    evento={eventoSeleccionado}
                    onClose={() => setEventoSeleccionado(null)}
                    onRegistrado={refresh}
                />
            )}
        </>
    )
}
