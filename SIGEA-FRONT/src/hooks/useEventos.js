import { useState, useEffect, useCallback } from "react"
import { getEventos, eliminarEvento } from "../services/agroService"

export function useEventos() {
    const [eventos, setEventos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getEventos()
            setEventos(data)
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
            await eliminarEvento(id)
            await cargar()
            return { ok: true }
        } catch (e) {
            return { ok: false, error: e }
        }
    }, [cargar])

    return { eventos, loading, error, refresh: cargar, eliminar }
}
