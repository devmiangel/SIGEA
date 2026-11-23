import { getSolicitudesInsumo } from "../services/inventarioService"
import { usePaginatedList } from "./usePaginatedList"

// Solicitudes de insumo paginadas en el servidor. `filtros`: { search, estado }.
export function useSolicitudesInsumo(filtros = {}, pageSize = 20) {
    const {
        items: solicitudes,
        count,
        page,
        setPage,
        loading,
        error,
        refresh,
    } = usePaginatedList(getSolicitudesInsumo, filtros, pageSize)

    return { solicitudes, count, page, setPage, pageSize, loading, error, refresh }
}
