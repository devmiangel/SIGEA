import AgricultureIcon from '@mui/icons-material/Agriculture'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import ScheduleIcon from '@mui/icons-material/Schedule'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import CategoryIcon from '@mui/icons-material/Category'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { AGRO_COLORS, ESTADO_SOLICITUD_INFO } from '../../utils/agroConstants'
import { DetailCard, DetailField } from '../DetailCard/DetailCard'
import { formatFecha } from '../../utils/dateHelpers'

const ESTADO_VISITA_INFO = {
    realizada: { class: 'bg-green-100 text-green-700', label: 'Realizada' },
    pendiente: { class: 'bg-amber-100 text-amber-700', label: 'Pendiente' },
    reagendada: { class: 'bg-purple-100 text-purple-700', label: 'Reagendada' },
    rechazada: { class: 'bg-red-100 text-red-700', label: 'Rechazada' }
}

const estadoDeVisita = (visita) => {
    const estadoSolicitud = visita?.solicitud_info?.estado_id
        ?? visita?.solicitud_info?.estado
    if (estadoSolicitud === 4 || estadoSolicitud === 'Reagendado') return 'reagendada'
    if (estadoSolicitud === 3 || estadoSolicitud === 'Rechazado') return 'rechazada'
    return visita?.estado ? 'realizada' : 'pendiente'
}

export default function VisitaInfoCard({ visita, onClick }) {
    const solInfo = visita?.solicitud_info ?? {}
    const nombreUP = solInfo?.up ?? 'Unidad productiva'
    const predio = solInfo?.predio ?? solInfo?.up ?? '—'
    const funcionario = visita?.funcionario_info?.nombre ?? '—'
    const administrador = visita?.administrador_info?.nombre ?? '—'
    const tipoVisita = visita?.tipo_visita_label ?? '—'
    const fechaFormateada = formatFecha(visita?.FechaYHoraVisita)

    const estadoVisita = estadoDeVisita(visita)
    const { class: badgeClass, label: badgeLabel } = ESTADO_VISITA_INFO[estadoVisita]
    const estadoSolicitud = ESTADO_SOLICITUD_INFO[solInfo?.estado_id]
        ?? { label: solInfo?.estado ?? '—', class: 'bg-gray-100 text-gray-600' }

    const handleActivate = () => onClick?.(visita)

    return (
        <DetailCard
            icon={<AgricultureIcon sx={{ fontSize: 22, color: '#fff' }} />}
            title={nombreUP}
            badgeClass={badgeClass}
            badgeLabel={badgeLabel}
            subtitle={`Visita #${visita.id} · ${tipoVisita} · ${fechaFormateada}`}
            onClick={handleActivate}
            detailClassName="flex gap-3 mt-4 flex-wrap sm:flex-nowrap"
        >
            <DetailField
                icon={<CategoryIcon sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />}
                label="Tipo de visita"
                value={tipoVisita}
            />
            <DetailField
                icon={<InfoOutlinedIcon sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />}
                label="Estado de la solicitud"
                value={estadoSolicitud.label}
            />
            <DetailField
                icon={<ScheduleIcon sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />}
                label="Fecha de visita"
                value={fechaFormateada}
            />
            <DetailField
                icon={<HomeWorkOutlinedIcon sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />}
                label="Nombre del predio"
                value={predio}
            />
            <DetailField
                icon={<PersonOutlinedIcon sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />}
                label="Realizó la visita"
                value={funcionario}
            />
            <DetailField
                icon={<AssignmentIndOutlinedIcon sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />}
                label="Asignó la visita"
                value={administrador}
            />
        </DetailCard>
    )
}