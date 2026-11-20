export default function PaginationBar({
    page,
    count,
    pageSize = 50,
    onPageChange,
    loading = false,
}) {
    const totalPaginas = Math.max(1, Math.ceil(count / pageSize))
    if (!count) return null

    const boton = 'rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40'

    return (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 sm:text-sm">
            <span>
                {count} registro(s) · Página {page} de {totalPaginas}
            </span>
            <div className="flex gap-2">
                <button
                    type="button"
                    className={boton}
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1 || loading}
                >
                    Anterior
                </button>
                <button
                    type="button"
                    className={boton}
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPaginas || loading}
                >
                    Siguiente
                </button>
            </div>
        </div>
    )
}
