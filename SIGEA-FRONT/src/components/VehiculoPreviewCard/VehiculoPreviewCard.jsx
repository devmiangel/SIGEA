import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import DriveEtaIcon from '@mui/icons-material/DriveEta'
import { esRegistroActivo } from '../../utils/insumoHelpers'
import { ACTIVO_STYLE } from '../../utils/agroConstants'

export default function VehiculoPreviewCard({ vehiculo, onEdit, onDelete }) {
  const activo = esRegistroActivo(vehiculo)
  const statusClass = activo ? ACTIVO_STYLE.activo : ACTIVO_STYLE.inactivo
  const estadoLabel = activo ? 'Activo' : 'Inactivo'
  const placa = vehiculo?.Placa ?? 'Sin placa'
  const modelo = vehiculo?.Modelo ?? 'Sin modelo'

  const handleEdit = (e) => {
    e.stopPropagation()
    onEdit?.(vehiculo)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete?.(vehiculo)
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 sm:px-5 py-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[#3e9a8a] transition-all duration-200 w-full m-1">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-[#015d3b] to-[#3e9a8a] text-white shrink-0 shadow-sm">
        <DriveEtaIcon sx={{ fontSize: 24, color: '#fff' }} />
      </div>

      <div className="flex-1 min-w-0 basis-40 sm:basis-0">
        <p className="text-sm font-semibold text-gray-900 truncate" title={placa}>
          {placa}
        </p>
        <p className="text-xs text-gray-500 line-clamp-2">
          {vehiculo?.Descripcion || modelo}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
        <button
          onClick={handleEdit}
          aria-label="Editar vehículo"
          title="Editar vehículo"
          className="p-2 rounded-lg text-gray-500 hover:text-[#015d3b] hover:bg-[#015d3b]/10 transition-colors"
        >
          <EditIcon fontSize="small" />
        </button>
        <button
          onClick={handleDelete}
          aria-label="Eliminar vehículo"
          title="Eliminar vehículo"
          className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <DeleteIcon fontSize="small" />
        </button>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#015d3b]/10 text-[#015d3b]">
          Modelo: {modelo}
        </span>

        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
          {estadoLabel}
        </span>
      </div>
    </div>
  )
}