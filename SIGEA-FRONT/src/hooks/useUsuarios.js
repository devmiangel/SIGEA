import { useCallback } from 'react'
import { getUsuarios, actualizarUsuario, eliminarUsuario } from '../services/usuariosService'
import { usePaginatedList } from './usePaginatedList'

export function useUsuarios(filtros = {}) {
    const {
        items: usuarios,
        count,
        page,
        setPage,
        pageSize,
        loading,
        error,
        refresh,
    } = usePaginatedList(getUsuarios, filtros)

    const actualizar = useCallback(async (id, data) => {
        try {
            await actualizarUsuario(id, data)
            await refresh()
            return { ok: true }
        } catch (e) {
            return { ok: false, error: e }
        }
    }, [refresh])

    const eliminar = useCallback(async (id) => {
        try {
            await eliminarUsuario(id)
            await refresh()
            return { ok: true }
        } catch (e) {
            return { ok: false, error: e }
        }
    }, [refresh])

    return {
        usuarios,
        count,
        page,
        setPage,
        pageSize,
        loading,
        error,
        refresh,
        actualizar,
        eliminar,
    }
}
