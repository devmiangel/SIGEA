import { useState, useEffect, useCallback } from "react"
import { getHerramientas, eliminarHerramienta } from "../services/agroService"

export function useHerramientas() {
    const [herramientas, setHerramientas] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getHerramientas()
            setHerramientas(data)
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
            await eliminarHerramienta(id)
            await cargar()
            return { ok: true }
        } catch (e) {
            return { ok: false, error: e }
        }
    }, [cargar])

    return { herramientas, loading, error, refresh: cargar, eliminar }
}