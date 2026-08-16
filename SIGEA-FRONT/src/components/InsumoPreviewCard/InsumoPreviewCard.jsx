import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { esInsumoActivo } from '../../utils/insumoHelpers'

export default function InsumoPreviewCard({ insumo, onEdit, onDelete }) {
  const activo = esInsumoActivo(insumo)
  const cantidad = Number(insumo?.Cantidad ?? 0)

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit?.(insumo)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete?.(insumo)
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 sm:px-5 py-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[#3e9a8a] transition-all duration-200 w-full m-1">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-[#015d3b] to-[#3e9a8a] text-white shrink-0 shadow-sm">
        <Inventory2OutlinedIcon sx={{ fontSize: 24, color: '#fff' }} />
      </div>

      <div className="flex-1 min-w-0 basis-40 sm:basis-0">
        <p className="text-sm font-semibold text-gray-900 truncate" title={insumo?.Nombre}>
          {insumo?.Nombre ?? 'Insumo sin nombre'}
        </p>
        <p className="text-xs text-gray-500 line-clamp-2">
          {insumo?.Descripcion || 'Sin descripción'}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
        <button
          onClick={handleEdit}
          aria-label="Editar insumo"
          title="Editar insumo"
          className="p-2 rounded-lg text-gray-500 hover:text-[#015d3b] hover:bg-[#015d3b]/10 transition-colors"
        >
          <EditIcon fontSize="small" />
        </button>
        <button
          onClick={handleDelete}
          aria-label="Eliminar insumo"
          title="Eliminar insumo"
          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <DeleteIcon fontSize="small" />
        </button>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#015d3b]/10 text-[#015d3b]">
          Cantidad: {cantidad}
        </span>

        <span className={`px-3 py-1 rounded-full text-xs font-medium ${activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>
    </div>
  )
}