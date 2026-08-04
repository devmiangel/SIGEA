import { useState, useMemo } from "react"
import { Header } from "../../../components/Tettles-Buttons/Title"
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import TabList from "../../../components/TabList/TabList"
import CalendarioVisitas from "../../../components/calendar/CalendarioVisitas"
import VisitaCard from "../../../components/VisitaCard/VisitaCard"
import VisitaInfo from "../../../components/VisitaInfo/VisitaInfo"
import { useMisVisitas } from "../../../hooks/useMisVisitas"

export default function AgendaContentEmployee(){
    const { visitas, loading } = useMisVisitas()
    const [activeTab, setActiveTab] = useState('Visitas Pendientes')
    const [selectedVisita, setSelectedVisita] = useState(null)

    const pendientes = useMemo(() => visitas, [visitas])
    const realizadas = useMemo(() => [], [])

    const currentContent = activeTab === 'Visitas Pendientes' ? pendientes : realizadas

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
            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full overflow-y-hidden">
                <div className="mb-6">
                    <CalendarioVisitas visitas={visitas} />
                </div>
                <TabList
                    categories={['Visitas Pendientes', 'Visitas Realizadas']}
                    active={activeTab}
                    onChange={setActiveTab}
                />
                <div className="mt-6">
                    {loading ? (
                        <p className="text-gray-500 text-sm">Cargando visitas...</p>
                    ) : currentContent.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            {activeTab === 'Visitas Pendientes'
                                ? 'No tienes visitas asignadas.'
                                : 'Aún no has realizado visitas.'}
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {currentContent.map((v, i) => (
                                <VisitaCard
                                    key={v.id}
                                    visita={v}
                                    numero={i + 1}
                                    onClick={() => setSelectedVisita(v)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedVisita && (
                <VisitaInfo
                    visita={selectedVisita}
                    numero={currentContent.findIndex(x => x.id === selectedVisita.id) + 1}
                    onClose={() => setSelectedVisita(null)}
                />
            )}
        </>
    )
}
