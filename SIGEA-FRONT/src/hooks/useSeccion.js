import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../utils/agroConstants'

const extraerMotivo = (e) => {
    const data = e?.response?.data
    if (data && typeof data === 'object') {
        const partes = Object.entries(data).map(([campo, mensajes]) => {
            const texto = Array.isArray(mensajes) ? mensajes.join(' ') : String(mensajes)
            return `${campo}: ${texto}`
        })
        if (partes.length) return partes.join(' | ')
    }
    if (typeof data === 'string' && data.trim()) return data
    return e?.response?.data?.error || e?.message || 'No se pudo guardar la sección.'
}

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
            return { ok: false, motivo: extraerMotivo(e), error: e }
        }
    }, [])

    return { loading, setLoading, cargarSeccion, guardarSeccion }
}