import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CalendarioVisitas from "../../../components/calendar/CalendarioVisitas"
import VisitaCard from "../../../components/VisitaCard/VisitaCard"
import VisitaInfo from "../../../components/VisitaInfo/VisitaInfo"
import PaginationBar from "../../../components/PaginationBar/PaginationBar"
import { useMisVisitas } from "../../../hooks/useMisVisitas"
import { useVisitasCalendario } from "../../../hooks/useVisitasCalendario"
import { getMisVisitas } from "../../../services/visitasService"

const FILTRO_PENDIENTES = { estado: 'pendientes' }

export default function AgendaContentEmployee(){
    const navigate = useNavigate()
    const [selectedVisita, setSelectedVisita] = useState(null)

    // Calendario: solo las visitas del mes (rango) visible.
    const {
        visitas: visitasCalendario,
        loading: cargandoCalendario,
        error: errorCalendario,
        onRangeChange,
        recargar: recargarCalendario,
    } = useVisitasCalendario(getMisVisitas)

    // Visitas pendientes, paginadas en el servidor. Las realizadas están en
    // el historial de visitas (/funcionario/agenda/historial).
    const {
        visitas, count, page, setPage, pageSize, loading, refresh,
    } = useMisVisitas(FILTRO_PENDIENTES)

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
                firstButton={
                    <ButtonLink
                        buttonText={'Historial de visitas'}
                        onClick={() => navigate('/funcionario/agenda/historial')}
                    />
                }
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
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Visitas pendientes</h3>
                    <p className="text-xs text-gray-500">{count} visita(s) por realizar</p>
                </div>
                <div>
                    {loading ? (
                        <p className="text-gray-500 text-sm">Cargando visitas...</p>
                    ) : count === 0 ? (
                        <p className="text-gray-500 text-sm">No tienes visitas asignadas.</p>
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
