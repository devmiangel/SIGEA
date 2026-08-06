import FirstLogAgro from "./AgroExtensionViews/FirstLogAgro"
import ProductorView from "./AgroExtensionViews/ProductorView"
import { useEsProductor } from "../../../hooks/useEsProductor"

export default function AgroModuleContentUser(){
    const { esProductor, loading, setEsProductor } = useEsProductor()

    if (loading) return <p className="text-center mt-10 text-gray-500">Cargando...</p>

    return (
        <>
            {esProductor
                ? <ProductorView/>
                : <FirstLogAgro onSolicitudCreada={() => setEsProductor(true)}/>
            }
        </>
    )
}