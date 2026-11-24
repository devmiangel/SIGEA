import { useState } from "react"
import { Header } from "../../../components/Tettles-Buttons/Title"
import VisibilityIcon from '@mui/icons-material/Visibility'
import SearchIcon from '@mui/icons-material/Search'
import VisitaInfoCard from "../../../components/VisitaInfoCard/VisitaInfoCard"
import PaginationBar from "../../../components/PaginationBar/PaginationBar"
import { usePaginatedList } from "../../../hooks/usePaginatedList"
import { getVisitas } from "../../../services/visitasService"
import { mostrarInfoVisita } from "../../../components/AgroModals/InfoVisitaModal"

export default function VisitasContentAdmin() {
    const [busqueda, setBusqueda] = useState('')
    const [estadoFiltro, setEstadoFiltro] = useState('realizadas')

    const {
        items: visitas,
        count,
        page,
        setPage,
        pageSize,
        loading,
        error,
    } = usePaginatedList(getVisitas, {
        search: busqueda.trim(),
        estado: estadoFiltro === 'todas' ? '' : estadoFiltro,
    })

    const handleClick = (visita) => {
        mostrarInfoVisita(visita)
    }

    return (
        <>
            <Header
                componentLogo={
                    <VisibilityIcon sx={{ fontSize: 40, color: "ActiveCaption" }} />
                }
                headerText={'Visitas'}
                message={'Consulta todas las visitas registradas y su estado'}
                colorLogo={'#55bd85'}
            />
            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4 overflow-y-hidden">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <SearchIcon
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            sx={{ fontSize: 18 }}
                        />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => { setBusqueda(e.target.value); setPage(1) }}
                            placeholder="Buscar por RUEA, predio, funcionario o tipo..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm"
                        />
                    </div>
                    <select
                        value={estadoFiltro}
                        onChange={(e) => { setEstadoFiltro(e.target.value); setPage(1) }}
                        className="px-3 py-2 rounded-lg border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white"
                    >
                        <option value="todas">Todas</option>
                        <option value="realizadas">Realizadas</option>
                        <option value="no_realizadas">No realizadas</option>
                    </select>
                </div>

                <div className="mt-2">
                    {loading ? (
                        <p className="text-gray-500 text-sm">Cargando visitas...</p>
                    ) : error ? (
                        <p className="text-red-600 text-sm">No se pudieron cargar las visitas.</p>
                    ) : count === 0 ? (
                        <p className="text-gray-500 text-sm">
                            No se encontraron visitas con los criterios de búsqueda.
                        </p>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {visitas.map((visita) => (
                                    <VisitaInfoCard
                                        key={visita.id}
                                        visita={visita}
                                        onClick={() => handleClick(visita)}
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
            </div>
        </>
    )
}
