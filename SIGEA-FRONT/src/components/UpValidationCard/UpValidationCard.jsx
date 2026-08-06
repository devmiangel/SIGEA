import SickleIcon from '@mui/icons-material/Agriculture'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import ScheduleIcon from '@mui/icons-material/Schedule'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

const formatFecha = (fecha) => {
    if (!fecha) return '—'
    return new Date(fecha).toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short'
    })
}

export default function UpValidationCard({ visita, numero, estado, onClick }) {
    const solInfo = visita?.solicitud_info ?? {}
    const nombreUP = solInfo?.up ?? 'Unidad productiva'
    const predio = solInfo?.predio ?? solInfo?.up ?? '—'
    const funcionario = visita?.funcionario_info?.nombre ?? '—'
    const administrador = visita?.administrador_info?.nombre ?? '—'

    const badge = {
        aceptada: 'bg-green-100 text-green-700',
        rechazada: 'bg-red-100 text-red-700',
        pendiente: 'bg-amber-100 text-amber-700'
    }[estado ?? 'pendiente']
    const badgeText = {
        aceptada: 'Validada',
        rechazada: 'Rechazada',
        pendiente: 'Pendiente'
    }[estado ?? 'pendiente']

    return (
        <div
            onClick={() => onClick?.(visita)}
            className="w-full max-w-full bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-[#3e9a8a] hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-[#015d3b] to-[#3e9a8a] text-white shrink-0 shadow-sm">
                    <SickleIcon sx={{ fontSize: 22, color: '#fff' }} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{nombreUP}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide shrink-0 ${badge}`}>
                            {badgeText}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Visita #{numero} · {formatFecha(visita?.FechaYHoraVisita)}
                    </p>
                </div>
                <ChevronRightIcon sx={{ color: '#9ca3af' }} className="shrink-0" />
            </div>

            <div className="flex gap-3 mt-4 flex-wrap sm:flex-nowrap">
                <div className="flex-1 min-w-[120px] bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 hover:border-[#3e9a8a] transition-colors">
                    <div className="flex items-center gap-1.5">
                        <ScheduleIcon sx={{ fontSize: 14, color: '#3e9a8a' }} />
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Fecha de visita</span>
                    </div>
                    <p className="text-xs font-medium text-gray-800 mt-1">{formatFecha(visita?.FechaYHoraVisita)}</p>
                </div>
                <div className="flex-1 min-w-[120px] bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 hover:border-[#3e9a8a] transition-colors">
                    <div className="flex items-center gap-1.5">
                        <HomeWorkOutlinedIcon sx={{ fontSize: 14, color: '#3e9a8a' }} />
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Nombre del predio</span>
                    </div>
                    <p className="text-xs font-medium text-gray-800 mt-1 truncate">{predio}</p>
                </div>
                <div className="flex-1 min-w-[120px] bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 hover:border-[#3e9a8a] transition-colors">
                    <div className="flex items-center gap-1.5">
                        <PersonOutlinedIcon sx={{ fontSize: 14, color: '#3e9a8a' }} />
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Realizó la visita</span>
                    </div>
                    <p className="text-xs font-medium text-gray-800 mt-1 truncate">{funcionario}</p>
                </div>
                <div className="flex-1 min-w-[120px] bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 hover:border-[#3e9a8a] transition-colors">
                    <div className="flex items-center gap-1.5">
                        <AssignmentIndOutlinedIcon sx={{ fontSize: 14, color: '#3e9a8a' }} />
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Asignó la visita</span>
                    </div>
                    <p className="text-xs font-medium text-gray-800 mt-1 truncate">{administrador}</p>
                </div>
            </div>
        </div>
    )
}