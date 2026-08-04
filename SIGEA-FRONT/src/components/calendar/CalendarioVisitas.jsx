import { useRef, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import themePlugin from "@fullcalendar/react/themes/monarch"
import dayGridPlugin from "@fullcalendar/react/daygrid"
import timeGridPlugin from "@fullcalendar/react/timegrid"
import listPlugin from "@fullcalendar/react/list"
import esLocale from "@fullcalendar/react/locales/es"

import "@fullcalendar/react/skeleton.css"
import "@fullcalendar/react/themes/monarch/theme.css"
import "@fullcalendar/react/themes/monarch/palettes/green.css"
import "./calendarioMonarch.css"

const buildEvents = (visitas) => (visitas || []).map(v => {
    const funcionario = v.funcionario_info?.nombre ?? 'Funcionario'
    const tipo = v.tipo_visita_label ?? 'Visita'
    const numero = v.solicitud_info?.id ?? v.Solicitud
    return {
        id: String(v.id),
        title: `${funcionario}-${tipo}-${numero}`,
        start: v.FechaVisita,
        allDay: false,
        extendedProps: { ubicacion: v.Ubicacion }
    }
})

export default function CalendarioVisitas({ visitas }) {
    const calendarRef = useRef(null)
    const [height, setHeight] = useState(520)

    const handleDatesSet = (arg) => {
        setHeight(arg.view.type.startsWith('list') ? 'auto' : 520)
    }

    return (
        <FullCalendar
            ref={calendarRef}
            plugins={[themePlugin, dayGridPlugin, timeGridPlugin, listPlugin]}
            initialView="dayGridMonth"
            locale="es"
            locales={[esLocale]}
            events={buildEvents(visitas)}
            height={height}
            datesSet={handleDatesSet}
            slotMinTime="06:00:00"
            slotMaxTime="18:00:00"
            slotDuration="01:00:00"
            dayMaxEvents={3}
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            }}
        />
    )
}
