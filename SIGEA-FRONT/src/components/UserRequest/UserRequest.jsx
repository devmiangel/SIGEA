const estadoStyle = {
  1: 'bg-yellow-100 text-yellow-800',
  2: 'bg-green-100 text-green-800',
  3: 'bg-red-100 text-red-800',
}

const estadoLabel = {
  1: 'En Proceso',
  2: 'Aprobado',
  3: 'Rechazado',
}

export default function UserRequest({ solicitud, numero, onClick }) {
  const badgeClass = estadoStyle[solicitud?.Estado] ?? 'bg-gray-100 text-gray-800'
  const label = estadoLabel[solicitud?.Estado] ?? 'Desconocido'

  return (
    <div
      onClick={() => onClick?.(solicitud)}
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
          {solicitud?.FechaSolicitud ?? '—'}
        </p>
      </div>

      <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${badgeClass}`}>
        {label}
      </span>
    </div>
  )
}
