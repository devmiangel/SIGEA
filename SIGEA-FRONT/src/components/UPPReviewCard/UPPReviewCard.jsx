import AgricultureIcon from '@mui/icons-material/Agriculture'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import CategoryIcon from '@mui/icons-material/Category'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { AGRO_COLORS, UP_ESTADO_STYLE } from '../../utils/agroConstants'
import { DetailCard, DetailField } from '../DetailCard/DetailCard'

export default function UPPReviewCard({ up, onClick }) {
  const estadoLabel = up?.estado_label ?? 'Sin estado'
  const estadoClass = UP_ESTADO_STYLE[estadoLabel] ?? 'bg-gray-100 text-gray-700'
  const tipo = up?.tipo_up_label ?? 'Sin tipo'
  const nombre = up?.productor_nombre ?? 'Unidad productiva'

  const handleActivate = () => onClick?.(up)

  return (
    <DetailCard
      icon={<AgricultureIcon sx={{ fontSize: 22, color: '#fff' }} />}
      title={nombre}
      badgeClass={estadoClass}
      badgeLabel={estadoLabel}
      subtitle={`${up?.RUEA ?? 'Sin RUEA'} · ${up?.nombre_predio ?? 'Predio sin nombre'}`}
      onClick={handleActivate}
    >
      <DetailField
        icon={<BadgeOutlinedIcon sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />}
        label="RUEA"
        value={up?.RUEA ?? '—'}
      />
      <DetailField
        icon={<CategoryIcon sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />}
        label="Tipo de UP"
        value={tipo}
      />
      <DetailField
        icon={<Inventory2OutlinedIcon sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />}
        label="Predio"
        value={up?.nombre_predio ?? '—'}
      />
    </DetailCard>
  )
}