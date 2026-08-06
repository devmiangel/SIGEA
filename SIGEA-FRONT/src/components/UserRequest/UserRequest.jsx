import { ESTADO_SOLICITUD_INFO } from '../../utils/agroConstants'
import { formatFecha } from '../../utils/dateHelpers'

export default function UserRequest({ solicitud, numero, onClick }) {
  const { label, class: badgeClass } = ESTADO_SOLICITUD_INFO[solicitud?.Estado] ?? { label: 'Desconocido', class: 'bg-gray-100 text-gray-800' }

  const handleActivate = () => onClick?.(solicitud)

  return (
    <div
      onClick={handleActivate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleActivate() }}
      className="flex items-center gap-4 w-full max-w-full h-25 px-5 py-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-[#015d3b] hover:shadow-sm transition-all duration-200"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#015d3b] text-white font-bold text-sm shrink-0">
        #{numero}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {solicitud?.Observacion ?? 'Sin descripción'}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatFecha(solicitud?.FechaSolicitud)}
        </p>
      </div>

      <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${badgeClass}`}>
        {label}
      </span>
    </div>
  )
}