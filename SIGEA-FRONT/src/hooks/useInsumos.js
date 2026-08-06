import { useState, useEffect, useCallback } from "react"
import { getInsumos, eliminarInsumo } from "../services/agroService"

export function useInsumos() {
    const [insumos, setInsumos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getInsumos()
            setInsumos(data)
            setError(null)
        } catch (e) {
            setError(e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { cargar() }, [cargar])

    const eliminar = useCallback(async (id) => {
        try {
            await eliminarInsumo(id)
            await cargar()
            return { ok: true }
        } catch (e) {
            return { ok: false, error: e }
        }
    }, [cargar])

    return { insumos, loading, error, refresh: cargar, eliminar }
}
