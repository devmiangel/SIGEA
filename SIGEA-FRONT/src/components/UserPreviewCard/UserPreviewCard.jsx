import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { getNombreCompleto, getCorreo } from '../../utils/userDisplay'

const statusStyles = {
  activo: 'bg-green-100 text-green-700',
  inactivo: 'bg-red-100 text-red-700',
}

function getIniciales(user) {
  const nombre = user?.persona_info?.primer_nombre?.trim() ?? ''
  const apellido = user?.persona_info?.primer_apellido?.trim() ?? ''
  const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
  return iniciales || (user?.email?.charAt(0)?.toUpperCase() ?? '?')
}

export default function UserPreviewCard({ user, onCardClick, onEdit, onDelete }) {
  const esActivo = user?.Estado !== false && user?.Estado !== 0 && user?.Estado != null
  const statusClass = esActivo ? statusStyles.activo : statusStyles.inactivo
  const estadoLabel = esActivo ? 'Activo' : 'Inactivo'

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
      className="flex items-center gap-4  px-5 py-4 bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-[#3e9a8a] transition-all duration-200 w-full m-1"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#015d3b] to-[#3e9a8a] text-white font-semibold text-lg shrink-0 shadow-sm">
        {getIniciales(user)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {getNombreCompleto(user)}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {getCorreo(user)}
        </p>
      </div>

      <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${statusClass}`}>
        {estadoLabel}
      </span>

      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#015d3b]/10 text-[#015d3b] shrink-0">
        {user?.rol ?? 'Sin rol'}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleEdit}
          className="p-2 rounded-lg text-gray-500 hover:text-[#015d3b] hover:bg-[#015d3b]/10 transition-colors"
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