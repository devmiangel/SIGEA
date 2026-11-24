import { useState, useCallback } from "react"
import { Header } from "../../../components/Tettles-Buttons/Title"
import FactCheckIcon from '@mui/icons-material/FactCheck'
import SearchIcon from '@mui/icons-material/Search'
import TabList from "../../../components/TabList/TabList"
import UpValidationCard from "../../../components/UpValidationCard/UpValidationCard"
import UpValidationModal from "../../../components/UpValidationModal/UpValidationModal"
import PaginationBar from "../../../components/PaginationBar/PaginationBar"
import { usePaginatedList } from "../../../hooks/usePaginatedList"
import { useCargarAlMontar } from "../../../hooks/useCargarAlMontar"
import { useValorDiferido } from "../../../hooks/useValorDiferido"
import { getVisitas } from "../../../services/visitasService"
import { ESTADO_VISITA, UP_ESTADO_RAW, esUPValidada, normalizarEstadoUP } from "../../../utils/agroConstants"

const PAGE_SIZE = 15

// Pestaña → valor de ?validacion_up=. El servidor toma las caracterizaciones
// realizadas, deja la más reciente de cada UP y las separa por estado de la UP.
const PESTANAS = {
    Pendientes: 'pendientes',
    Validadas: 'validadas',
}

const mapEstado = (upEstado) => {
    if (esUPValidada(upEstado)) {
        return normalizarEstadoUP(upEstado) === normalizarEstadoUP(UP_ESTADO_RAW.ACEPTADA)
            ? ESTADO_VISITA.ACEPTADA
            : ESTADO_VISITA.RECHAZADA
    }
    return ESTADO_VISITA.PENDIENTE
}

// Total de cada pestaña para el encabezado: se pide una sola fila y se lee `count`.
const contar = async (validacion_up) => {
    const data = await getVisitas({ validacion_up, page: 1, page_size: 1 })
    return data?.count ?? 0
}

export default function UpValidationAdmin(){
    const [activeTab, setActiveTab] = useState('Pendientes')
    const [selectedVisita, setSelectedVisita] = useState(null)
    const [modalKey, setModalKey] = useState(0)
    const [busqueda, setBusqueda] = useState('')
    const [conteos, setConteos] = useState({ pendientes: 0, validadas: 0 })
    const busquedaDiferida = useValorDiferido(busqueda.trim())

    const {
        items: visitas, count, page, setPage, pageSize, loading, refresh,
    } = usePaginatedList(
        getVisitas,
        { validacion_up: PESTANAS[activeTab], search: busquedaDiferida },
        PAGE_SIZE,
    )

    const cargarConteos = useCallback(async () => {
        try {
            const [pendientes, validadas] = await Promise.all([contar('pendientes'), contar('validadas')])
            setConteos({ pendientes, validadas })
        } catch {
            // Solo afecta el texto del encabezado; la lista muestra su propio error.
        }
    }, [])
    useCargarAlMontar(cargarConteos)

    const handleDecision = async () => {
        setSelectedVisita(null)
        await Promise.all([refresh(), cargarConteos()])
    }

    const handleOpen = (visita) => {
        setSelectedVisita(visita)
        setModalKey(k => k + 1)
    }

    const cambiarPestana = (tab) => {
        setActiveTab(tab)
        setPage(1)
    }

    return (
        <>
            <Header
                componentLogo={
                    <FactCheckIcon
                        sx={{fontSize: 40, color:"ActiveCaption"}}
                    />
                }
                headerText={'Validacion de UPs'}
                message={'Valida las visitas realizadas a las unidades productivas y las clasifica según su estado'}
                colorLogo={'#55bd85'}
            />
            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4 overflow-y-hidden">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">Validación de unidades productivas</h3>
                        <p className="text-xs text-gray-500">
                            {conteos.pendientes + conteos.validadas} unidad(es) productiva(s) · {conteos.validadas} validada(s)
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
                            placeholder="Buscar por predio, RUEA, funcionario o administrador..."
                            className="w-full pl-10 pr-3 py-2 rounded-lg border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white"
                        />
                    </div>
                </div>
                <TabList
                    categories={Object.keys(PESTANAS)}
                    active={activeTab}
                    onChange={cambiarPestana}
                />
                <div className="mt-6">
                    {loading ? (
                        <p className="text-gray-500 text-sm">Cargando visitas...</p>
                    ) : count === 0 ? (
                        <p className="text-gray-500 text-sm">
                            {busquedaDiferida
                                ? 'No hay resultados para la búsqueda.'
                                : `No hay visitas ${activeTab === 'Pendientes' ? 'pendientes por validar' : 'validadas'} registradas.`}
                        </p>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {visitas.map((v) => (
                                    <UpValidationCard
                                        key={v.id}
                                        visita={v}
                                        estado={mapEstado(v.solicitud_info?.up_estado)}
                                        onClick={() => handleOpen(v)}
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

            {selectedVisita && (
                <UpValidationModal
                    key={modalKey}
                    visita={selectedVisita}
                    onDecision={handleDecision}
                    onClose={() => setSelectedVisita(null)}
                />
            )}
        </>
    )
}
