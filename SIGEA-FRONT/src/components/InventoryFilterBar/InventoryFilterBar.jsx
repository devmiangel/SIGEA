import SearchIcon from '@mui/icons-material/Search'
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff'

export default function InventoryFilterBar({
    search,
    onSearchChange,
    searchPlaceholder = 'Buscar...',
    filters = [],
    onClear,
    total = 0,
    shown = 0,
}) {
    const hayFiltros = Boolean(String(search ?? '').trim())
        || filters.some((filtro) => filtro.value !== '' && filtro.value != null)

    return (
        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-end">
                <div className="min-w-0 flex-1 basis-64">
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Buscar
                    </label>
                    <div className="relative">
                        <SearchIcon
                            fontSize="small"
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 outline-none focus:border-[#015d3b] focus:ring-2 focus:ring-[#015d3b]/20"
                        />
                    </div>
                </div>

                {filters.map((filtro) => (
                    <div key={filtro.key} className="min-w-[9.5rem] flex-1 sm:flex-none">
                        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                            {filtro.label}
                        </label>
                        <select
                            value={filtro.value}
                            onChange={(e) => filtro.onChange(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-700 outline-none focus:border-[#015d3b] focus:ring-2 focus:ring-[#015d3b]/20"
                        >
                            <option value="">Todos</option>
                            {filtro.options.map((opcion) => (
                                <option key={String(opcion.value)} value={opcion.value}>
                                    {opcion.label}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}

                <div className="flex items-center justify-between gap-2 xl:ml-auto">
                    <span className="whitespace-nowrap text-xs text-gray-500">
                        {shown} de {total}
                    </span>
                    <button
                        type="button"
                        onClick={onClear}
                        disabled={!hayFiltros}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <FilterAltOffIcon sx={{ fontSize: 16 }} />
                        Limpiar
                    </button>
                </div>
            </div>
        </div>
    )
}
