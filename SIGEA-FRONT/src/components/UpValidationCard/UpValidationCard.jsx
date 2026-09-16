import AgricultureIcon from '@mui/icons-material/Agriculture'
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import ScheduleIcon from '@mui/icons-material/Schedule'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined'
import { AGRO_COLORS, ESTADO_VISITA_INFO, UP_ESTADO_RAW, normalizarEstadoUP } from '../../utils/agroConstants'
import { DetailCard, DetailField } from '../DetailCard/DetailCard'
import { formatFecha } from '../../utils/dateHelpers'
import QRButton from '../QRButton/QRButton'

export default function UpValidationCard({ visita, numero, estado, onClick }) {
    const solInfo = visita?.solicitud_info ?? {}
    const nombreUP = solInfo?.up ?? 'Unidad productiva'
    const predio = solInfo?.predio ?? solInfo?.up ?? '—'
    const funcionario = visita?.funcionario_info?.nombre ?? '—'
    const administrador = visita?.administrador_info?.nombre ?? '—'
    const fechaFormateada = formatFecha(visita?.FechaYHoraVisita)
    const upEstado = solInfo?.up_estado ?? 'En revision'
    const esAceptada = normalizarEstadoUP(upEstado) === normalizarEstadoUP(UP_ESTADO_RAW.ACEPTADA)

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
            {esAceptada && solInfo?.up_id && (
                <div className="flex items-center">
                    <QRButton up={{ id: solInfo.up_id, RUEA: solInfo.ruea, productor_nombre: nombreUP, nombre_predio: predio }} />
                </div>
            )}
        </DetailCard>
    )
}