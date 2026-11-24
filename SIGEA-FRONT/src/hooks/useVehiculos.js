import { useCallback } from 'react'
import { getVehiculos, eliminarVehiculo } from '../services/inventarioService'
import { usePaginatedList } from './usePaginatedList'

export function useVehiculos(filtros = {}) {
    const {
        items: vehiculos,
        count,
        page,
        setPage,
        pageSize,
        loading,
        error,
        refresh,
    } = usePaginatedList(getVehiculos, filtros)

    const eliminar = useCallback(async (id) => {
        try {
            await eliminarVehiculo(id)
            await refresh()
            return { ok: true }
        } catch (e) {
            return { ok: false, error: e }
        }
    }, [refresh])

    return {
        vehiculos,
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
