import { useState, useEffect } from "react"
import { Header } from "../../../../components/Tettles-Buttons/Title"
import TabList from "../../../../components/TabList/TabList";
import AgricultureIcon from '@mui/icons-material/Agriculture';
import ButtonLink from '../../../../components/Tettles-Buttons/Buttons';
import { getSolicitudes } from "../../../../services/agroService";
import { useCurrentDataUser } from "../../../../hooks/currentUserHook";

export default function ProductorView(){
    const { user } = useCurrentDataUser()
    const [solicitudes, setSolicitudes] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getSolicitudes()
            .then(data => setSolicitudes(data.filter(s => s.Usuario === user?.id)))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [user])

    const contentTabs = [
        {
            id: 1,
            title: 'Mis UPs',
            content: 'hola'
        },
        {
            id: 2,
            title: 'Solicitudes',
            content: solicitudes
        }
    ]

    const [activeTab, setActiveTab] = useState(contentTabs[0].title)
    const currentContent = contentTabs.find(t => t.title === activeTab)?.content

    return(
            <>
                <Header 
                    componentLogo={<AgricultureIcon sx={{fontSize: 40}}/>} 
                    headerText={'Mis Unidades Productivas'} 
                    colorLogo={'#3e9a8a'}
                    message={'Gestiona tus unidades productivas registradas y en proceso de aprobación'}
                    firstButton={<ButtonLink buttonText={'Agregar Unidad'}/>}
                />
                <div className="bg-white min-h-screen md:w-screen rounded-xl m-3 p-4 min-w-19/20 overflow-y-hidden">
                    <TabList
                        categories={contentTabs.map(t => t.title)}
                        active={activeTab}
                        onChange={setActiveTab}
                    />
                    <div className="mt-6">
                        {activeTab === 'Mis UPs' ? (
                            currentContent
                        ) : (
                            loading ? (
                                <p className="text-gray-500 text-sm">Cargando solicitudes...</p>
                            ) : currentContent.length === 0 ? (
                                <p className="text-gray-500 text-sm">No tienes solicitudes registradas.</p>
                            ) : (
                                <div className="space-y-3">
                                    {currentContent.map((s) => (
                                        <div key={s.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm text-gray-900">{s.Observacion}</p>
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 shrink-0">
                                                    {s.Estado}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {s.FechaSolicitud}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </>
    )
}