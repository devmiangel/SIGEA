import { useCallback } from 'react'
import { getInsumos, eliminarInsumo } from '../services/agroService'
import { usePaginatedList } from './usePaginatedList'

export function useInsumos(filtros = {}) {
    const {
        items: insumos,
        count,
        page,
        setPage,
        pageSize,
        loading,
        error,
        refresh,
    } = usePaginatedList(getInsumos, filtros)

    const eliminar = useCallback(async (id) => {
        try {
            await eliminarInsumo(id)
            await refresh()
            return { ok: true }
        } catch (e) {
            return { ok: false, error: e }
        }
    }, [refresh])

    return {
        insumos,
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
