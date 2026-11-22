import { ESTADO_SOLICITUD_INFO } from '../../utils/agroConstants'
import { formatFecha } from '../../utils/dateHelpers'

const formatearFechaSolicitud = (fecha) => {
  if (!fecha) return '—'
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const [anio, mes, dia] = fecha.split('-')
    return `${dia}/${mes}/${anio}`
  }
  return formatFecha(fecha)
}

export default function UserRequest({ solicitud, numero, onClick, mostrarSolicitante = false }) {
  const { label, class: badgeClass } = ESTADO_SOLICITUD_INFO[solicitud?.Estado] ?? { label: 'Desconocido', class: 'bg-gray-100 text-gray-800' }
  const solicitante = solicitud?.solicitante ?? {}
  const nombreSolicitante = [solicitante.primer_nombre, solicitante.primer_apellido]
    .filter(Boolean).join(' ').trim()

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
          {formatearFechaSolicitud(solicitud?.FechaSolicitud)}
        </p>
        {mostrarSolicitante && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {nombreSolicitante || 'Sin nombre'}
            {solicitante.email ? ` · ${solicitante.email}` : ''}
          </p>
        )}
        {solicitud?.novedad && (
          <p className="text-xs text-[#015d3b] mt-0.5 truncate">
            Novedad: {solicitud.novedad}
          </p>
        )}
      </div>

      <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${badgeClass}`}>
        {label}
      </span>
    </div>
  )
}