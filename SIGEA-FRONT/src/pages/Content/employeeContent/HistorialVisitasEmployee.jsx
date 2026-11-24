import { useState } from "react"
import { useNavigate } from "react-router-dom"
import HistoryIcon from '@mui/icons-material/History'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import InventoryFilterBar from "../../../components/InventoryFilterBar/InventoryFilterBar"
import VisitaCard from "../../../components/VisitaCard/VisitaCard"
import VisitaInfo from "../../../components/VisitaInfo/VisitaInfo"
import PaginationBar from "../../../components/PaginationBar/PaginationBar"
import { useMisVisitas } from "../../../hooks/useMisVisitas"

// Historial de visitas realizadas por el funcionario autenticado, con buscador
// (la búsqueda se hace en el servidor: /visitas/mis-visitas/?estado=realizadas&search=).
export default function HistorialVisitasEmployee() {
    const navigate = useNavigate()
    // InventoryFilterBar ya difiere la búsqueda 300 ms antes de llamar a onSearchChange.
    const [busqueda, setBusqueda] = useState('')
    const [selectedVisita, setSelectedVisita] = useState(null)

    const {
        visitas, count, page, setPage, pageSize, loading, error, refresh,
    } = useMisVisitas({ estado: 'realizadas', search: busqueda.trim() })

    const hayFiltros = Boolean(busqueda.trim())

    const limpiarFiltros = () => {
        setBusqueda('')
        setPage(1)
    }

    return (
        <>
            <Header
                componentLogo={
                    <HistoryIcon sx={{ fontSize: 40, color: "ActiveCaption" }} />
                }
                headerText={'Historial de visitas'}
                message={'Consulta las visitas que ya realizaste a los productores'}
                colorLogo={'#55bd85'}
                firstButton={
                    <ButtonLink
                        buttonText={'Volver'}
                        onClick={() => navigate('/funcionario/agenda')}
                    />
                }
            />
            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4 overflow-y-hidden">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Visitas realizadas</h3>
                    <p className="text-xs text-gray-500">
                        {count} visita(s) {hayFiltros ? 'encontrada(s)' : 'realizada(s)'}
                    </p>
                </div>

                <InventoryFilterBar
                    search={busqueda}
                    onSearchChange={(valor) => { setBusqueda(valor); setPage(1) }}
                    searchPlaceholder="Buscar por productor, documento, RUEA, predio o tipo de visita..."
                    total={count}
                    shown={visitas.length}
                    onClear={limpiarFiltros}
                />

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando visitas...</p>
                ) : error ? (
                    <p className="text-red-600 text-sm">No se pudieron cargar las visitas. Intenta de nuevo.</p>
                ) : count === 0 ? (
                    <p className="text-gray-500 text-sm">
                        {hayFiltros
                            ? 'No se encontraron visitas con los filtros aplicados.'
                            : 'Aún no has realizado visitas.'}
                    </p>
                ) : (
                    <>
                        <div className="space-y-3">
                            {visitas.map((v) => (
                                <VisitaCard
                                    key={v.id}
                                    visita={v}
                                    onClick={() => setSelectedVisita(v)}
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

            {selectedVisita && (
                <VisitaInfo
                    visita={selectedVisita}
                    onClose={() => setSelectedVisita(null)}
                    onReagendada={refresh}
                />
            )}
        </>
    )
}
