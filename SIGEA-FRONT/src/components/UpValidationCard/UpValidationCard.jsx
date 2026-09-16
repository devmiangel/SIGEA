import AgricultureIcon from '@mui/icons-material/Agriculture'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import ScheduleIcon from '@mui/icons-material/Schedule'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import { AGRO_COLORS, ESTADO_VISITA_INFO } from '../../utils/agroConstants'
import { DetailCard, DetailField } from '../DetailCard/DetailCard'
import { formatFecha } from '../../utils/dateHelpers'

export default function UpValidationCard({ visita, numero, estado, onClick }) {
    const solInfo = visita?.solicitud_info ?? {}
    const nombreUP = solInfo?.up ?? 'Unidad productiva'
    const predio = solInfo?.predio ?? solInfo?.up ?? '—'
    const funcionario = visita?.funcionario_info?.nombre ?? '—'
    const administrador = visita?.administrador_info?.nombre ?? '—'
    const fechaFormateada = formatFecha(visita?.FechaYHoraVisita)

    const { class: badgeClass, label: badgeLabel } = ESTADO_VISITA_INFO[estado ?? 'pendiente'] ?? ESTADO_VISITA_INFO.pendiente

    const handleActivate = () => onClick?.(visita)

    return (
        <DetailCard
            icon={<AgricultureIcon sx={{ fontSize: 22, color: '#fff' }} />}
            title={nombreUP}
            badgeClass={badgeClass}
            badgeLabel={badgeLabel}
            subtitle={`Visita #${numero} · ${fechaFormateada}`}
            onClick={handleActivate}
            detailClassName="flex gap-3 mt-4 flex-wrap sm:flex-nowrap"
        >
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