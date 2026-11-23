import { useState, useMemo } from "react"
import { Header } from "../../../components/Tettles-Buttons/Title"
import FactCheckIcon from '@mui/icons-material/FactCheck'
import SearchIcon from '@mui/icons-material/Search'
import TabList from "../../../components/TabList/TabList"
import UpValidationCard from "../../../components/UpValidationCard/UpValidationCard"
import UpValidationModal from "../../../components/UpValidationModal/UpValidationModal"
import PaginationBar from "../../../components/PaginationBar/PaginationBar"
import { useVisitas } from "../../../hooks/useVisitas"
import { ESTADO_VISITA, UP_ESTADO_RAW, esUPValidada, normalizarEstadoUP } from "../../../utils/agroConstants"

const PAGE_SIZE = 15

const normalizarTexto = (texto) => String(texto ?? '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const coincideBusqueda = (visita, termino) => {
    const info = visita?.solicitud_info ?? {}
    const texto = [
        info.up, info.predio, info.ruea,
        visita?.funcionario_info?.nombre,
        visita?.administrador_info?.nombre,
    ].map(normalizarTexto).join(' ')
    return texto.includes(termino)
}

const mapEstado = (upEstado) => {
    if (esUPValidada(upEstado)) {
        return normalizarEstadoUP(upEstado) === normalizarEstadoUP(UP_ESTADO_RAW.ACEPTADA)
            ? ESTADO_VISITA.ACEPTADA
            : ESTADO_VISITA.RECHAZADA
    }
    return ESTADO_VISITA.PENDIENTE
}

const esPendiente = (upEstado) => !esUPValidada(upEstado)

const esCaracterizacion = (tipo) => {
    const normalizado = (tipo ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    return normalizado === 'caracterizacion'
}

export default function UpValidationAdmin(){
    const { visitas, loading, refresh } = useVisitas()
    const [activeTab, setActiveTab] = useState('Pendientes')
    const [selectedId, setSelectedId] = useState(null)
    const [modalKey, setModalKey] = useState(0)
    const [busqueda, setBusqueda] = useState('')
    const [page, setPage] = useState(1)

    const realizadas = useMemo(
        () => (visitas || []).filter(v => !!v.estado && esCaracterizacion(v.tipo_visita_label)),
        [visitas]
    )

    const unicasPorUP = useMemo(() => {
        const porUP = new Map()
        for (const v of realizadas) {
            const upId = v?.solicitud_info?.up_id
            if (upId == null) {
                porUP.set(`visita-${v.id}`, v)
                continue
            }
            const previa = porUP.get(upId)
            if (!previa) {
                porUP.set(upId, v)
                continue
            }
            const fechaActual = new Date(v.FechaYHoraVisita ?? 0).getTime()
            const fechaAnterior = new Date(previa.FechaYHoraVisita ?? 0).getTime()
            if (fechaActual > fechaAnterior) porUP.set(upId, v)
        }
        return Array.from(porUP.values())
    }, [realizadas])

    const pendientes = useMemo(
        () => unicasPorUP.filter(v => esPendiente(v.solicitud_info?.up_estado)),
        [unicasPorUP]
    )
    const validadas = useMemo(
        () => unicasPorUP.filter(v => !esPendiente(v.solicitud_info?.up_estado)),
        [unicasPorUP]
    )

    const terminoBusqueda = normalizarTexto(busqueda.trim())
    const currentContent = useMemo(() => {
        const base = activeTab === 'Pendientes' ? pendientes : validadas
        return terminoBusqueda ? base.filter(v => coincideBusqueda(v, terminoBusqueda)) : base
    }, [activeTab, pendientes, validadas, terminoBusqueda])

    const totalPaginas = Math.max(1, Math.ceil(currentContent.length / PAGE_SIZE))
    const paginaActual = Math.min(page, totalPaginas)
    const inicio = (paginaActual - 1) * PAGE_SIZE
    const paginaContent = currentContent.slice(inicio, inicio + PAGE_SIZE)

    const handleDecision = async () => {
        setSelectedId(null)
        await refresh()
    }

    const handleOpen = (visita) => {
        setSelectedId(visita.id)
        setModalKey(k => k + 1)
    }

    const selectedVisita = realizadas.find(v => v.id === selectedId) || null

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
                        <p className="text-xs text-gray-500">{unicasPorUP.length} unidad(es) productiva(s) · {validadas.length} validada(s)</p>
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
                            placeholder="Buscar por unidad productiva, predio, RUEA o funcionario..."
                            className="w-full pl-10 pr-3 py-2 rounded-lg border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white"
                        />
                    </div>
                </div>
                <TabList
                    categories={['Pendientes', 'Validadas']}
                    active={activeTab}
                    onChange={(tab) => { setActiveTab(tab); setPage(1) }}
                />
                <div className="mt-6">
                    {loading ? (
                        <p className="text-gray-500 text-sm">Cargando visitas...</p>
                    ) : currentContent.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            {terminoBusqueda
                                ? 'No hay resultados para la búsqueda.'
                                : `No hay visitas ${activeTab === 'Pendientes' ? 'pendientes por validar' : 'validadas'} registradas.`}
                        </p>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {paginaContent.map((v, i) => (
                                    <UpValidationCard
                                        key={v.id}
                                        visita={v}
                                        numero={inicio + i + 1}
                                        estado={mapEstado(v.solicitud_info?.up_estado)}
                                        onClick={() => handleOpen(v)}
                                    />
                                ))}
                            </div>
                            <PaginationBar
                                page={paginaActual}
                                count={currentContent.length}
                                pageSize={PAGE_SIZE}
                                onPageChange={setPage}
                            />
                        </>
                    )}
                </div>
            </div>

            {selectedVisita && (
                <UpValidationModal
                    key={modalKey}
                    visita={selectedVisita}
                    numero={currentContent.findIndex(s => s.id === selectedVisita.id) + 1}
                    onDecision={handleDecision}
                    onClose={() => setSelectedId(null)}
                />
            )}
        </>
    )
}