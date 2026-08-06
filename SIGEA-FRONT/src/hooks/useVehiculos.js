import { useState, useEffect, useCallback } from "react"
import { getVehiculos, eliminarVehiculo } from "../services/agroService"

export function useVehiculos() {
    const [vehiculos, setVehiculos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getVehiculos()
            setVehiculos(data)
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
            await eliminarVehiculo(id)
            await cargar()
            return { ok: true }
        } catch (e) {
            return { ok: false, error: e }
        }
    }, [cargar])

    return { vehiculos, loading, error, refresh: cargar, eliminar }
}