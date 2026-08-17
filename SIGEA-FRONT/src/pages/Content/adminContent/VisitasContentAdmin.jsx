import { useMemo, useState } from "react"
import { Header } from "../../../components/Tettles-Buttons/Title"
import VisibilityIcon from '@mui/icons-material/Visibility'
import SearchIcon from '@mui/icons-material/Search'
import VisitaInfoCard from "../../../components/VisitaInfoCard/VisitaInfoCard"
import { useVisitas } from "../../../hooks/useVisitas"
import { mostrarInfoVisita } from "../../../components/AgroModals/InfoVisitaModal"

export default function VisitasContentAdmin() {
    const { visitas, loading } = useVisitas()
    const [busqueda, setBusqueda] = useState('')
    const [estadoFiltro, setEstadoFiltro] = useState('todas')

    const porEstado = useMemo(() => {
        if (estadoFiltro === 'realizadas') return visitas.filter(v => !!v.estado)
        if (estadoFiltro === 'no_realizadas') return visitas.filter(v => !v.estado)
        return visitas
    }, [visitas, estadoFiltro])

    const numeradas = useMemo(
        () => porEstado.map((v, i) => ({ visita: v, numero: i + 1 })),
        [porEstado]
    )

    const resultados = useMemo(() => {
        const q = busqueda.trim().toLowerCase()
        if (!q) return numeradas
        return numeradas.filter(({ visita, numero }) => {
            const predio = (visita.solicitud_info?.predio ?? visita.solicitud_info?.up ?? '').toLowerCase()
            const funcionario = (visita.funcionario_info?.nombre ?? '').toLowerCase()
            return String(numero).includes(q) || predio.includes(q) || funcionario.includes(q)
        })
    }, [numeradas, busqueda])

    const handleClick = (visita, numero) => {
        mostrarInfoVisita(visita, numero)
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
            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full overflow-y-hidden">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <SearchIcon
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            sx={{ fontSize: 18 }}
                        />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por número de visita, predio o funcionario..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm"
                        />
                    </div>
                    <select
                        value={estadoFiltro}
                        onChange={(e) => setEstadoFiltro(e.target.value)}
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
                    ) : resultados.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            No se encontraron visitas con los criterios de búsqueda.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {resultados.map(({ visita, numero }) => (
                                <VisitaInfoCard
                                    key={visita.id}
                                    visita={visita}
                                    numero={numero}
                                    onClick={() => handleClick(visita, numero)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}