import { useCallback } from "react"
import { getEventos, eliminarEvento } from "../services/upsService"
import { usePaginatedList } from "./usePaginatedList"

// Eventos paginados en el servidor. `filtros`: { search }.
export function useEventos(filtros = {}, pageSize = 20) {
    const {
        items: eventos,
        count,
        page,
        setPage,
        loading,
        error,
        refresh,
    } = usePaginatedList(getEventos, filtros, pageSize)

    const eliminar = useCallback(async (id) => {
        try {
            await eliminarEvento(id)
            await refresh()
            return { ok: true }
        } catch (e) {
            return { ok: false, error: e }
        }
    }, [refresh])

    return { eventos, count, page, setPage, pageSize, loading, error, refresh, eliminar }
}
