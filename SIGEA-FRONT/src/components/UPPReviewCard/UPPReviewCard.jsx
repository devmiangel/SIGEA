import AgricultureIcon from '@mui/icons-material/Agriculture'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import CategoryIcon from '@mui/icons-material/Category'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'

const estadoStyle = {
  'En revision': 'bg-amber-100 text-amber-700',
  'Rechazada': 'bg-red-100 text-red-700',
  'Aceptada': 'bg-green-100 text-green-700',
}

export default function UPPReviewCard({ up, onClick }) {
  const estadoLabel = up?.estado_label ?? 'Sin estado'
  const estadoClass = estadoStyle[estadoLabel] ?? 'bg-gray-100 text-gray-700'
  const tipo = up?.tipo_up_label ?? 'Sin tipo'
  const nombre = up?.productor_nombre ?? 'Unidad productiva'

  return (
    <div
      onClick={() => onClick?.(up)}
      className="w-full bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-[#3e9a8a] hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-[#015d3b] to-[#3e9a8a] text-white shrink-0 shadow-sm">
          <AgricultureIcon sx={{ fontSize: 22, color: '#fff' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{nombre}</h3>
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide shrink-0 ${estadoClass}`}>
              {estadoLabel}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {up?.RUEA ?? 'Sin RUEA'} · {up?.nombre_predio ?? 'Predio sin nombre'}
          </p>
        </div>
        <ChevronRightIcon sx={{ color: '#9ca3af' }} className="shrink-0" />
      </div>

      <div className="flex gap-3 mt-4 flex-wrap">
        <div className="flex-1 min-w-[120px] bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5">
            <BadgeOutlinedIcon sx={{ fontSize: 14, color: '#3e9a8a' }} />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">RUEA</span>
          </div>
          <p className="text-xs font-medium text-gray-800 mt-1">{up?.RUEA ?? '—'}</p>
        </div>
        <div className="flex-1 min-w-[120px] bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5">
            <CategoryIcon sx={{ fontSize: 14, color: '#3e9a8a' }} />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Tipo de UP</span>
          </div>
          <p className="text-xs font-medium text-gray-800 mt-1 truncate">{tipo}</p>
        </div>
        <div className="flex-1 min-w-[120px] bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
          <div className="flex items-center gap-1.5">
            <Inventory2OutlinedIcon sx={{ fontSize: 14, color: '#3e9a8a' }} />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Predio</span>
          </div>
          <p className="text-xs font-medium text-gray-800 mt-1 truncate">{up?.nombre_predio ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}