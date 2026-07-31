import { useState, useEffect, useCallback } from "react"
import { getSolicitudes, crearSolicitud } from "../services/agroService"

export function useSolicitudes(user) {
    const [solicitudes, setSolicitudes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [creando, setCreando] = useState(false)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getSolicitudes()
            setSolicitudes(data.filter(s => s.Usuario === user?.id))
            setError(null)
        } catch (e) {
            setError(e)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => { cargar() }, [cargar])

    const crear = useCallback(async (payload) => {
        setCreando(true)
        try {
            await crearSolicitud(payload)
            await cargar()
            return { ok: true }
        } catch (e) {
            return { ok: false, error: e }
        } finally {
            setCreando(false)
        }
    }, [cargar])

    return { solicitudes, loading, error, refresh: cargar, crear, creando }
}
