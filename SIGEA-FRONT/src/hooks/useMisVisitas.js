import { getMisVisitas } from "../services/visitasService"
import { usePaginatedList } from "./usePaginatedList"

// Visitas asignadas al funcionario autenticado, paginadas en el servidor.
// `filtros`: { estado: 'pendientes' | 'realizadas' }.
export function useMisVisitas(filtros = {}, pageSize = 20) {
    const {
        items: visitas,
        count,
        page,
        setPage,
        loading,
        error,
        refresh,
    } = usePaginatedList(getMisVisitas, filtros, pageSize)

    return { visitas, count, page, setPage, pageSize, loading, error, refresh }
}
