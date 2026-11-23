import { useState, useCallback } from "react"
import { Header } from "../../../components/Tettles-Buttons/Title"
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import TabList from "../../../components/TabList/TabList"
import CalendarioVisitas from "../../../components/calendar/CalendarioVisitas"
import VisitaCard from "../../../components/VisitaCard/VisitaCard"
import VisitaInfo from "../../../components/VisitaInfo/VisitaInfo"
import PaginationBar from "../../../components/PaginationBar/PaginationBar"
import { useMisVisitas } from "../../../hooks/useMisVisitas"
import { useVisitasCalendario } from "../../../hooks/useVisitasCalendario"
import { getMisVisitas } from "../../../services/visitasService"

const PESTANAS = {
    'Visitas Pendientes': 'pendientes',
    'Visitas Realizadas': 'realizadas',
}

export default function AgendaContentEmployee(){
    const [activeTab, setActiveTab] = useState('Visitas Pendientes')
    const [selectedVisita, setSelectedVisita] = useState(null)

    // Calendario: solo las visitas del mes (rango) visible.
    const {
        visitas: visitasCalendario,
        loading: cargandoCalendario,
        error: errorCalendario,
        onRangeChange,
        recargar: recargarCalendario,
    } = useVisitasCalendario(getMisVisitas)

    // Pestañas: lista paginada en el servidor por estado.
    const {
        visitas, count, page, setPage, pageSize, loading, refresh,
    } = useMisVisitas({ estado: PESTANAS[activeTab] })

    const cambiarPestana = (tab) => {
        setActiveTab(tab)
        setPage(1)
    }

    const handleReagendada = useCallback(() => {
        refresh()
        recargarCalendario()
    }, [refresh, recargarCalendario])

    return (
        <>
            <Header
                componentLogo={
                    <CalendarMonthIcon
                        sx={{fontSize: 40, color:"ActiveCaption"}}
                    />
                }
                headerText={'Agenda de visitas'}
                message={'Consulta las visitas que te han sido asignadas para realizar atención a los productores'}
                colorLogo={'#55bd85'}
            />
            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4 overflow-y-hidden">
                <div className="mb-6">
                    <CalendarioVisitas visitas={visitasCalendario} onRangeChange={onRangeChange} />
                    {cargandoCalendario && (
                        <p className="mt-2 text-xs text-gray-500">Cargando visitas del mes...</p>
                    )}
                    {errorCalendario && (
                        <p className="mt-2 text-xs text-red-600">No se pudieron cargar las visitas del mes.</p>
                    )}
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
                            {activeTab === 'Visitas Pendientes'
                                ? 'No tienes visitas asignadas.'
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
            </div>

            {selectedVisita && (
                <VisitaInfo
                    visita={selectedVisita}
                    onClose={() => setSelectedVisita(null)}
                    onReagendada={handleReagendada}
                />
            )}
        </>
    )
}
