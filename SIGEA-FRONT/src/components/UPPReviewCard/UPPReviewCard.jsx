import { card } from '../../styles/cardTokens'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import LocationOnIcon from '@mui/icons-material/LocationOn'

export default function UPPReviewCard({ up, onCardClick }) {
  const initial = up?.nombre?.charAt(0)?.toUpperCase() ?? up?.RUEA?.charAt(0) ?? '?'

  return (
    <div
      onClick={() => onCardClick?.(up)}
      className={`flex items-center gap-4 w-full px-5 py-4 ${card.wrapper}`}
    >
      <div className={card.avatar}>
        {initial}
      </div>

      <div className="flex-1 min-w-0">
        <p className={card.title}>
          {up?.nombre ?? up?.RUEA ?? 'Sin nombre'}
        </p>
        <p className={`${card.subtitle} flex items-center gap-1 mt-0.5`}>
          <LocationOnIcon style={{ fontSize: 14 }} />
          {up?.ubicacion ?? 'Ubicación no disponible'}
        </p>
      </div>

      <span className={`${card.badge} ${card.badgeBlue}`}>
        {up?.tipo ?? 'Sin tipo'}
      </span>

      <span className={`${card.badge} ${card.badgeGray} flex items-center gap-1`}>
        <CalendarTodayIcon style={{ fontSize: 12 }} />
        {up?.fechaRegistro ?? '—'}
      </span>
    </div>
  )
}
