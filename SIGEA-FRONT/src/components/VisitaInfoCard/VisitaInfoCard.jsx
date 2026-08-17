import AgricultureIcon from '@mui/icons-material/Agriculture'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import ScheduleIcon from '@mui/icons-material/Schedule'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import CategoryIcon from '@mui/icons-material/Category'
import { AGRO_COLORS } from '../../utils/agroConstants'
import { DetailCard, DetailField } from '../DetailCard/DetailCard'
import { formatFecha } from '../../utils/dateHelpers'

const ESTADO_REALIZACION = {
    realizada: { class: 'bg-green-100 text-green-700', label: 'Realizada' },
    no_realizada: { class: 'bg-gray-100 text-gray-600', label: 'No realizada' }
}

export default function VisitaInfoCard({ visita, numero, onClick }) {
    const solInfo = visita?.solicitud_info ?? {}
    const nombreUP = solInfo?.up ?? 'Unidad productiva'
    const predio = solInfo?.predio ?? solInfo?.up ?? '—'
    const funcionario = visita?.funcionario_info?.nombre ?? '—'
    const administrador = visita?.administrador_info?.nombre ?? '—'
    const tipoVisita = visita?.tipo_visita_label ?? '—'
    const fechaFormateada = formatFecha(visita?.FechaYHoraVisita)

    const { class: badgeClass, label: badgeLabel } = visita?.estado
        ? ESTADO_REALIZACION.realizada
        : ESTADO_REALIZACION.no_realizada

    const handleActivate = () => onClick?.(visita)

    return (
        <DetailCard
            icon={<AgricultureIcon sx={{ fontSize: 22, color: '#fff' }} />}
            title={nombreUP}
            badgeClass={badgeClass}
            badgeLabel={badgeLabel}
            subtitle={`Visita #${numero} · ${tipoVisita} · ${fechaFormateada}`}
            onClick={handleActivate}
            detailClassName="flex gap-3 mt-4 flex-wrap sm:flex-nowrap"
        >
            <DetailField
                icon={<CategoryIcon sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />}
                label="Tipo de visita"
                value={tipoVisita}
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