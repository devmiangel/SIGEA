import PersonIcon from '@mui/icons-material/Person'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
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

const formatFecha = (fecha) => {
    if (!fecha) return '—'
    return new Date(fecha).toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short'
    })
}

function Tile({ icono, etiqueta, valor, full = false }) {
    const Icono = icono
    return (
        <div className={`${full ? 'md:col-span-2' : ''} bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 min-w-30`}>
            <div className="flex items-center gap-1.5">
                <Icono sx={{ fontSize: 14, color: '#3e9a8a' }} />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{etiqueta}</span>
            </div>
            <p className="text-xs font-medium text-gray-800 mt-1">{valor ?? '—'}</p>
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
                <Tile icono={PersonIcon} etiqueta="Solicitante" valor={nombreSolicitante} />
                <Tile icono={EmailOutlinedIcon} etiqueta="Correo" valor={solicitante.email} />
                <Tile icono={CategoryIcon} etiqueta="Motivo" valor={solicitud.motivo} />
                <Tile icono={AccessTimeFilledIcon} etiqueta="Fecha de solicitud" valor={formatFecha(solicitud.fecha_solicitud)} />
                <Tile icono={BadgeOutlinedIcon} etiqueta="Estado" valor={solicitud.estado} />
                <Tile icono={AgricultureOutlinedIcon} etiqueta="Predio / UP" valor={solicitud.up} />
                <Tile icono={NotesOutlinedIcon} etiqueta="Observación" valor={solicitud.observacion} full />
            </Bloque>

            <Bloque
                titulo={`Orden de visita ${visita?.id ? `#${visita.id}` : ''}`}
                subtitulo="Detalle de la visita programada"
                icono={Inventory2OutlinedIcon}
            >
                <Tile icono={CategoryIcon} etiqueta="Tipo de visita" valor={visita?.tipo_visita_label} />
                <Tile icono={ScheduleIcon} etiqueta="Fecha y hora" valor={formatFecha(visita?.FechaYHoraVisita)} />
                <Tile icono={LocationOnIcon} etiqueta="Ubicación" valor={visita?.Ubicacion} />
                <Tile icono={PersonIcon} etiqueta="Funcionario" valor={funcionario.nombre} />
                <Tile icono={EmailOutlinedIcon} etiqueta="Correo funcionario" valor={funcionario.email} />
                <Tile icono={AdminPanelSettingsOutlinedIcon} etiqueta="Administrador" valor={administrador.nombre} />
                <Tile icono={EmailOutlinedIcon} etiqueta="Correo administrador" valor={administrador.email} />
                <Tile icono={VerifiedUserOutlinedIcon} etiqueta="Estado" valor={visita?.estado ? 'Realizada' : 'No realizada'} />
            </Bloque>
        </div>
    )
}