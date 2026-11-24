import { useState, useCallback } from "react"
import { checkEsProductor } from "../services/usuariosService"
import { useCargarAlMontar } from './useCargarAlMontar'

export function useEsProductor() {
    const [esProductor, setEsProductor] = useState(null)
    const [loading, setLoading] = useState(true)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const data = await checkEsProductor()
            setEsProductor(Boolean(data.es_productor))
        } catch {
            setEsProductor(false)
        } finally {
            setLoading(false)
        }
    }, [])

    useCargarAlMontar(cargar)

    return { esProductor, loading, setEsProductor, refresh: cargar }
}