import { useState, useEffect } from "react"
import FirstLogAgro from "./AgroExtensionViews/FirstLogAgro"
import ProductorView from "./AgroExtensionViews/ProductorView"
import { checkEsProductor } from "../../../services/agroService"

export default function AgroModuleContentUser(){
    const [esProductor, setEsProductor] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkEsProductor()
            .then(data => setEsProductor(data.es_productor))
            .catch(() => setEsProductor(false))
            .finally(() => setLoading(false))
    }, [])

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