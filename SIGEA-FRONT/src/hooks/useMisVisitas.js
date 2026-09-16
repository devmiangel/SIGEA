import { useState, useEffect, useCallback } from "react"
import { getMisVisitas } from "../services/agroService"

export function useMisVisitas() {
    const [visitas, setVisitas] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getMisVisitas()
            setVisitas(data)
            setError(null)
        } catch (e) {
            setError(e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { cargar() }, [cargar])

    return { visitas, loading, error, refresh: cargar }
}
