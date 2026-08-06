import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../utils/agroConstants'

export function useSeccion({
    mensajeErrorCarga = 'No se pudieron cargar los datos de la sección. Intenta de nuevo.',
} = {}) {
    const [loading, setLoading] = useState(true)

    const cargarSeccion = useCallback(async (fn) => {
        setLoading(true)
        try {
            await fn()
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: mensajeErrorCarga,
                confirmButtonColor: AGRO_COLORS.primary,
            })
        } finally {
            setLoading(false)
        }
    }, [mensajeErrorCarga])

    const guardarSeccion = useCallback(async (fn) => {
        try {
            await fn()
            return { ok: true }
        } catch (e) {
            return { ok: false, error: e }
        }
    }, [])

    return { loading, setLoading, cargarSeccion, guardarSeccion }
}