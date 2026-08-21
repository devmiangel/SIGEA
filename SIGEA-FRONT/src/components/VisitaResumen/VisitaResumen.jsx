import PersonIcon from '@mui/icons-material/Person'
import ScheduleIcon from '@mui/icons-material/Schedule'
import CategoryIcon from '@mui/icons-material/Category'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import AgricultureOutlinedIcon from '@mui/icons-material/AgricultureOutlined'
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined'
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined'
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { AGRO_COLORS } from '../../utils/agroConstants'
import { formatFecha } from '../../utils/dateHelpers'

function Tile({ icono, etiqueta, valor, detalle, full = false, doble = false }) {
    const Icono = icono
    return (
        <div className={`${full ? 'md:col-span-2 lg:col-span-3' : ''} ${doble ? 'sm:col-span-2 lg:col-span-2' : ''} bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 min-w-30`}>
            <div className="flex items-center gap-1.5">
                <Icono sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{etiqueta}</span>
            </div>
            <p className="text-xs font-medium text-gray-800 mt-1">
                {valor ?? '—'}
                {detalle && <span className="text-gray-500 font-normal"> · {detalle}</span>}
            </p>
        </div>
    )
}

function Bloque({ titulo, subtitulo, icono, estado, children }) {
    const Icono = icono
    return (
        <div className="w-full bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-linear-to-br from-[#015d3b] to-[#3e9a8a] text-white shrink-0 shadow-sm">
                    <Icono sx={{ fontSize: 22, color: '#fff' }} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{titulo}</h3>
                    {subtitulo && (
                        <p className="text-xs text-gray-400 mt-0.5">{subtitulo}</p>
                    )}
                </div>
                {estado}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {children}
            </div>
        </div>
    )
}

export default function VisitaResumen({ visita }) {
    const solicitud = visita?.solicitud_info ?? {}
    const solicitante = solicitud.solicitante ?? {}
    const funcionario = visita?.funcionario_info ?? {}
    const administrador = visita?.administrador_info ?? {}

    const nombreSolicitante = [solicitante.primer_nombre, solicitante.primer_apellido]
        .filter(Boolean).join(' ').trim() || '—'

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Bloque
                titulo={`Solicitud del productor ${solicitud.id ? `#${solicitud.id}` : ''}`}
                subtitulo="Información de la solicitud asociada a la visita"
                icono={AssignmentOutlinedIcon}
            >
                <Tile icono={PersonIcon} etiqueta="Solicitante" valor={nombreSolicitante} detalle={solicitante.email} doble />
                <Tile icono={CategoryIcon} etiqueta="Motivo" valor={solicitud.motivo} />
                <Tile icono={AccessTimeFilledIcon} etiqueta="Fecha de solicitud" valor={formatFecha(solicitud.fecha_solicitud)} />
                <Tile icono={BadgeOutlinedIcon} etiqueta="Estado" valor={solicitud.estado} />
                <Tile icono={AgricultureOutlinedIcon} etiqueta="Predio / UP" valor={solicitud.up} />
                <Tile icono={NotesOutlinedIcon} etiqueta="Observación" valor={solicitud.observacion} full />
                <Tile icono={LocationOnIcon} etiqueta="Dirección" valor={solicitud.direccion} full />
            </Bloque>

            <Bloque
                titulo={`Orden de visita ${visita?.id ? `#${visita.id}` : ''}`}
                subtitulo="Detalle de la visita programada"
                icono={Inventory2OutlinedIcon}
            >
                <Tile icono={CategoryIcon} etiqueta="Tipo de visita" valor={visita?.tipo_visita_label} />
                <Tile icono={ScheduleIcon} etiqueta="Fecha y hora" valor={formatFecha(visita?.FechaYHoraVisita)} />
                <Tile icono={LocationOnIcon} etiqueta="Ubicación" valor={visita?.Ubicacion} />
                <Tile icono={PersonIcon} etiqueta="Funcionario" valor={funcionario.nombre} detalle={funcionario.email} doble />
                <Tile icono={VerifiedUserOutlinedIcon} etiqueta="Estado" valor={visita?.estado ? 'Realizada' : 'No realizada'} />
                <Tile icono={AdminPanelSettingsOutlinedIcon} etiqueta="Administrador" valor={administrador.nombre} detalle={administrador.email} doble />
            </Bloque>
        </div>
    )
}