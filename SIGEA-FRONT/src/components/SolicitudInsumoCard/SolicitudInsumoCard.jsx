import { formatFecha } from '../../utils/dateHelpers'
import { ESTADO_SOLICITUD_INSUMO, ESTADO_SOLICITUD_INSUMO_INFO } from '../../utils/agroConstants'

function getIniciales(solicitud) {
    const nombre = (solicitud?.funcionario_nombre ?? '').trim()
    const partes = nombre.split(/\s+/).filter(Boolean)
    const iniciales = `${(partes[0] ?? '').charAt(0)}${(partes[1] ?? '').charAt(0)}`.toUpperCase()
    return iniciales || (solicitud?.funcionario_email?.charAt(0)?.toUpperCase() ?? '?')
}

export default function SolicitudInsumoCard({ solicitud, numero, onCardClick, onAsignar, onRechazar }) {
  const cantidad = Number(solicitud?.Cantidad ?? 0)
  const unidades = solicitud?.insumo_unidades || '—'
  const estado = solicitud?.Estado ?? ESTADO_SOLICITUD_INSUMO.PENDIENTE
  const pendiente = estado === ESTADO_SOLICITUD_INSUMO.PENDIENTE
  const { label: estadoLabel, class: estadoClass } = ESTADO_SOLICITUD_INSUMO_INFO[estado] ?? { label: estado, class: 'bg-gray-100 text-gray-600' }

  const handleActivate = () => onCardClick?.(solicitud)

  const handleAsignar = (e) => {
    e.stopPropagation()
    onAsignar?.(solicitud)
  }

  const handleRechazar = (e) => {
    e.stopPropagation()
    onRechazar?.(solicitud)
  }

  return (
    <div
      onClick={handleActivate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleActivate() }}
      className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 sm:px-5 py-4 bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-[#3e9a8a] transition-all duration-200 w-full m-1"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-[#015d3b] to-[#3e9a8a] text-white font-semibold text-lg shrink-0 shadow-sm">
        {getIniciales(solicitud)}
      </div>

      <div className="flex-1 min-w-0 basis-40 sm:basis-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {solicitud?.funcionario_nombre || solicitud?.funcionario_email || 'Funcionario desconocido'}
        </p>
        <p className="text-xs text-gray-500 truncate">
          Solicita: {solicitud?.insumo_nombre || '—'}
        </p>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#015d3b]/10 text-[#015d3b]">
          {cantidad} {unidades}
        </span>

        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          {formatFecha(solicitud?.FechaSolicitud)}
        </span>

        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
          #{numero}
        </span>

        <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoClass}`}>
          {estadoLabel}
        </span>
      </div>

      {pendiente && (
        <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
          <button
            onClick={handleAsignar}
            title="Realizar asignación"
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#229e14] text-white hover:bg-[#1d8a11] transition-colors"
          >
            Realizar asignación
          </button>
          <button
            onClick={handleRechazar}
            title="Rechazar solicitud"
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#d9534f] text-white hover:bg-[#c9302c] transition-colors"
          >
            Rechazar
          </button>
        </div>
      )}
    </div>
  )
}