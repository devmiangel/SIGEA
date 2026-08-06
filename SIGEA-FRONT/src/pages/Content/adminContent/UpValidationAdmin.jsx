import { useState, useMemo } from "react"
import { Header } from "../../../components/Tettles-Buttons/Title"
import FactCheckIcon from '@mui/icons-material/FactCheck'
import TabList from "../../../components/TabList/TabList"
import UpValidationCard from "../../../components/UpValidationCard/UpValidationCard"
import UpValidationModal from "../../../components/UpValidationModal/UpValidationModal"
import { useVisitas } from "../../../hooks/useVisitas"

const mapEstado = (upEstado) => {
    if (upEstado === 'Aceptada') return 'aceptada'
    if (upEstado === 'Rechazada') return 'rechazada'
    return 'pendiente'
}

const esPendiente = (upEstado) => {
    return upEstado === 'En revision'
}

export default function UpValidationAdmin(){
    const { visitas, loading, refresh } = useVisitas()
    const [activeTab, setActiveTab] = useState('Pendientes')
    const [selectedId, setSelectedId] = useState(null)
    const [modalKey, setModalKey] = useState(0)

    const realizadas = useMemo(() => (visitas || []).filter(v => !!v.estado), [visitas])

    const pendientes = useMemo(
        () => realizadas.filter(v => esPendiente(v.solicitud_info?.up_estado)),
        [realizadas]
    )
    const validadas = useMemo(
        () => realizadas.filter(v => !esPendiente(v.solicitud_info?.up_estado)),
        [realizadas]
    )

    const currentContent = activeTab === 'Pendientes' ? pendientes : validadas

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
            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full overflow-y-hidden">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Validación de unidades productivas</h3>
                    <p className="text-xs text-gray-500">{realizadas.length} visita(s) realizada(s) · {validadas.length} validada(s)</p>
                </div>
                <TabList
                    categories={['Pendientes', 'Validadas']}
                    active={activeTab}
                    onChange={setActiveTab}
                />
                <div className="mt-6">
                    {loading ? (
                        <p className="text-gray-500 text-sm">Cargando visitas...</p>
                    ) : currentContent.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            No hay visitas {activeTab === 'Pendientes' ? 'pendientes por validar' : 'validadas'} registradas.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {currentContent.map((v, i) => (
                                <UpValidationCard
                                    key={v.id}
                                    visita={v}
                                    numero={i + 1}
                                    estado={mapEstado(v.solicitud_info?.up_estado)}
                                    onClick={() => handleOpen(v)}
                                />
                            ))}
                        </div>
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