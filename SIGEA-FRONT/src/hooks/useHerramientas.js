import { useCallback } from 'react'
import { getHerramientas, eliminarHerramienta } from '../services/agroService'
import { usePaginatedList } from './usePaginatedList'

export function useHerramientas(filtros = {}) {
    const {
        items: herramientas,
        count,
        page,
        setPage,
        pageSize,
        loading,
        error,
        refresh,
    } = usePaginatedList(getHerramientas, filtros)

    const eliminar = useCallback(async (id) => {
        try {
            await eliminarHerramienta(id)
            await refresh()
            return { ok: true }
        } catch (e) {
            return { ok: false, error: e }
        }
    }, [refresh])

    return {
        herramientas,
        count,
        page,
        setPage,
        pageSize,
        loading,
        error,
        refresh,
        eliminar,
    }
}
