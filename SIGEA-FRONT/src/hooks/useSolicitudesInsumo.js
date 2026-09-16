import { useState, useEffect, useCallback } from "react"
import { getSolicitudesInsumo } from "../services/agroService"

export function useSolicitudesInsumo() {
    const [solicitudes, setSolicitudes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getSolicitudesInsumo()
            setSolicitudes(data)
            setError(null)
        } catch (e) {
            setError(e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { cargar() }, [cargar])

    return { solicitudes, loading, error, refresh: cargar }
}