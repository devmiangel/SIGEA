import { useState, useEffect, useCallback } from "react"
import { getUsuarios, actualizarUsuario, eliminarUsuario } from "../services/agroService"

export function useUsuarios() {
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getUsuarios()
            setUsuarios(data)
            setError(null)
        } catch (e) {
            setError(e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { cargar() }, [cargar])

    const actualizar = useCallback(async (id, data) => {
        try {
            await actualizarUsuario(id, data)
            await cargar()
            return { ok: true }
        } catch (e) {
            return { ok: false, error: e }
        }
    }, [cargar])

    const eliminar = useCallback(async (id) => {
        try {
            await eliminarUsuario(id)
            await cargar()
            return { ok: true }
        } catch (e) {
            return { ok: false, error: e }
        }
    }, [cargar])

    return { usuarios, loading, error, refresh: cargar, actualizar, eliminar }
}