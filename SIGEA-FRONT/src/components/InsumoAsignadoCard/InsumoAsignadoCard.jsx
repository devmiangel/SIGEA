import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { formatFecha } from '../../utils/dateHelpers'

export default function InsumoAsignadoCard({ item, onCardClick }) {
  const cantidad = Number(item?.Cantidad ?? 0)
  const unidad = item?.unidad_nombre || '—'
  const observacion = item?.observacion || null

  const handleActivate = () => onCardClick?.(item)

  return (
    <div
      onClick={handleActivate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleActivate() }}
      className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 sm:px-5 py-4 bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-[#3e9a8a] transition-all duration-200 w-full m-1"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-[#015d3b] to-[#3e9a8a] text-white shrink-0 shadow-sm">
        <Inventory2OutlinedIcon sx={{ fontSize: 24, color: '#fff' }} />
      </div>

      <div className="flex-1 min-w-0 basis-40 sm:basis-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {item?.insumo?.Nombre ?? `Insumo ID ${item?.Insumo}`}
        </p>
        <p className="text-xs text-gray-500 line-clamp-2">
          {item?.insumo?.Descripcion || 'Sin descripción'}
        </p>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#015d3b]/10 text-[#015d3b]">
          {cantidad} {unidad}
        </span>

        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          {formatFecha(item?.fechaAsignacion)}
        </span>

        {observacion && (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            Con observación
          </span>
        )}
      </div>
    </div>
  )
}