import { useState, useEffect, useCallback } from "react"
import { getTodasSolicitudes } from "../services/agroService"

export function useTodasSolicitudes() {
    const [solicitudes, setSolicitudes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getTodasSolicitudes()
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
