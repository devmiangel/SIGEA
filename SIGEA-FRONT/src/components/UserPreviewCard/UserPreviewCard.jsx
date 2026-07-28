import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

const statusStyles = {
  activo: 'bg-green-100 text-green-800',
  inactivo: 'bg-red-100 text-red-800',
  pendiente: 'bg-yellow-100 text-yellow-800',
}

export default function UserPreviewCard({ user, onCardClick, onEdit, onDelete }) {
  const statusClass = statusStyles[user?.estado?.toLowerCase()] ?? 'bg-gray-100 text-gray-800'

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit?.(user)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete?.(user)
  }

  return (
    <div
      onClick={() => onCardClick?.(user)}
      className="flex items-center gap-4  px-5 py-4 bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 w-screen m-1"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-semibold text-lg shrink-0">
        {user?.nombre?.charAt(0)?.toUpperCase() ?? '?'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {user?.nombre ?? 'Sin nombre'}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {user?.email ?? ''}
        </p>
      </div>

      <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${statusClass}`}>
        {user?.estado ?? 'Desconocido'}
      </span>

      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 shrink-0">
        {user?.rol ?? 'Sin rol'}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleEdit}
          className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Editar usuario"
        >
          <EditIcon fontSize="small" />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Eliminar usuario"
        >
          <DeleteIcon fontSize="small" />
        </button>
      </div>
    </div>
  )
}
