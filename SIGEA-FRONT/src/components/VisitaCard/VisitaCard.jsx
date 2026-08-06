import PersonIcon from '@mui/icons-material/Person'
import ScheduleIcon from '@mui/icons-material/Schedule'
import CategoryIcon from '@mui/icons-material/Category'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import EstadoVisita from '../EstadoVisita/EstadoVisita'
import { AGRO_COLORS } from '../../utils/agroConstants'
import { getNombreCompleto } from '../../utils/userDisplay'
import { formatFecha } from '../../utils/dateHelpers'

export default function VisitaCard({ visita, numero, onClick }) {
    const solicitud = visita?.solicitud_info ?? {}
    const solicitante = solicitud?.solicitante ?? {}
    const nombreSolicitante = getNombreCompleto(solicitante) || 'Productor'
    const tipoVisita = visita?.tipo_visita_label ?? '—'

    const handleActivate = () => onClick?.(visita)

    return (
        <div
            onClick={handleActivate}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleActivate() }}
            className="w-full max-w-full bg-white rounded-xl border border-gray-200 p-5 cursor-pointer hover:border-[#3e9a8a] hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-[#015d3b] to-[#3e9a8a] text-white shrink-0 shadow-sm">
                    <PersonIcon sx={{ fontSize: 22, color: '#fff' }} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {nombreSolicitante}
                            <span className="text-[#3e9a8a]"> · </span>
                            {tipoVisita}
                        </h3>
                        <EstadoVisita estado={visita?.estado} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Visita #{numero} · Solicitud #{solicitud?.id ?? '—'}
                    </p>
                </div>
                <ChevronRightIcon sx={{ color: '#9ca3af' }} className="shrink-0" />
            </div>

            <div className="flex gap-3 mt-4 flex-wrap sm:flex-nowrap">
                <div className="flex-1 min-w-[120px] bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 hover:border-[#3e9a8a] transition-colors">
                    <div className="flex items-center gap-1.5">
                        <ScheduleIcon sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Hora</span>
                    </div>
                    <p className="text-xs font-medium text-gray-800 mt-1">{formatFecha(visita?.FechaYHoraVisita)}</p>
                </div>
                <div className="flex-1 min-w-[120px] bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 hover:border-[#3e9a8a] transition-colors">
                    <div className="flex items-center gap-1.5">
                        <CategoryIcon sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Tipo</span>
                    </div>
                    <p className="text-xs font-medium text-gray-800 mt-1">{tipoVisita}</p>
                </div>
                <div className="flex-1 min-w-[120px] bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 hover:border-[#3e9a8a] transition-colors">
                    <div className="flex items-center gap-1.5">
                        <LocationOnIcon sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Ubicación</span>
                    </div>
                    <p className="text-xs font-medium text-gray-800 mt-1 truncate">{visita?.Ubicacion ?? '—'}</p>
                </div>
            </div>

            {solicitud?.observacion && (
                <div className="mt-4 flex gap-2 bg-[#f8fafc] border border-gray-100 rounded-lg px-3 py-2.5">
                    <DescriptionOutlinedIcon sx={{ fontSize: 16, color: AGRO_COLORS.primaryLight }} className="shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 leading-relaxed">{solicitud.observacion}</p>
                </div>
            )}

            <p className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400 text-center">
                Funcionario: {visita?.funcionario_info?.nombre ?? '—'} · Administrador: {visita?.administrador_info?.nombre ?? '—'}
            </p>
        </div>
    )
}