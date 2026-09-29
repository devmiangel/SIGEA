import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import EventIcon from '@mui/icons-material/Event'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PlaceIcon from '@mui/icons-material/Place'

const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha'
    const [anio, mes, dia] = fecha.split('-')
    return `${dia}/${mes}/${anio}`
}

export default function EventoPreviewCard({ evento, onEdit, onDelete, onOpen }) {
  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit?.(evento)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete?.(evento)
  }

  const handleOpen = () => {
    onOpen?.(evento)
  }

  return (
    <div
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen() }}
      className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 sm:px-5 py-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[#3e9a8a] transition-all duration-200 w-full m-1 cursor-pointer">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-[#015d3b] to-[#3e9a8a] text-white shrink-0 shadow-sm">
        <EventIcon sx={{ fontSize: 24, color: '#fff' }} />
      </div>

      <div className="flex-1 min-w-0 basis-40 sm:basis-0">
        <p className="text-sm font-semibold text-gray-900 truncate" title={evento?.Titulo}>
          {evento?.Titulo ?? 'Evento sin titulo'}
        </p>
        <p className="text-xs text-gray-500 line-clamp-2">
          {evento?.Descripcion || 'Sin descripcion'}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
        <button
          onClick={handleEdit}
          aria-label="Editar evento"
          title="Editar evento"
          className="p-2 rounded-lg text-gray-500 hover:text-[#015d3b] hover:bg-[#015d3b]/10 transition-colors"
        >
          <EditIcon fontSize="small" />
        </button>
        <button
          onClick={handleDelete}
          aria-label="Eliminar evento"
          title="Eliminar evento"
          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <DeleteIcon fontSize="small" />
        </button>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#015d3b]/10 text-[#015d3b]">
          <CalendarTodayIcon sx={{ fontSize: 14 }} />
          {formatearFecha(evento?.Fecha)}
        </span>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#3e9a8a]/10 text-[#3e9a8a]">
          <PlaceIcon sx={{ fontSize: 14 }} />
          {evento?.Lugar || 'Sin lugar'}
        </span>
      </div>
    </div>
  )
}
