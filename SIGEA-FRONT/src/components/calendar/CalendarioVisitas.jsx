import { useEffect, useRef, useState } from "react"
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

const ESTADOS_CALENDARIO = [
    { id: 'realizada', label: 'Realizada', color: '#229e14' },
    { id: 'pendiente', label: 'Pendiente', color: '#f59e0b' },
    { id: 'reagendada', label: 'Reagendada', color: '#7c3aed' },
    { id: 'rechazada', label: 'Rechazada', color: '#dc2626' },
]

const estadoDeVisita = (visita) => {
    const estadoSolicitud = visita?.solicitud_info?.estado_id
        ?? visita?.solicitud_info?.estado
    if (estadoSolicitud === 4 || estadoSolicitud === 'Reagendado') return 'reagendada'
    if (estadoSolicitud === 3 || estadoSolicitud === 'Rechazado') return 'rechazada'
    return visita?.estado ? 'realizada' : 'pendiente'
}

const colorDeVisita = (visita) => (
    ESTADOS_CALENDARIO.find((estado) => estado.id === estadoDeVisita(visita))?.color
    ?? '#229e14'
)

const buildEvents = (visitas) => (visitas || []).map(v => {
    const funcionario = v.funcionario_info?.nombre ?? 'Funcionario'
    const tipo = v.tipo_visita_label ?? 'Visita'
    const numero = v.solicitud_info?.id ?? v.Solicitud
    const color = colorDeVisita(v)
    return {
        id: String(v.id),
        title: `${funcionario}-${tipo}-${numero}`,
        start: v.FechaYHoraVisita,
        allDay: false,
        backgroundColor: color,
        borderColor: color,
        textColor: '#ffffff',
        color,
        classNames: [`sigea-evento-${estadoDeVisita(v)}`],
        extendedProps: {
            ubicacion: v.Ubicacion,
            color,
            estado: estadoDeVisita(v),
        }
    }
})

// Constante a nivel de módulo: si se recrea en cada render, FullCalendar
// vuelve a disparar datesSet y se produce un bucle de actualizaciones.
const VISTAS = {
    // Agenda: solo las actividades del día actual (sin navegar a otros días)
    listDay: {
        buttonText: 'Agenda',
        validRange: (ahora) => {
            const inicio = new Date(ahora)
            inicio.setHours(0, 0, 0, 0)
            const fin = new Date(inicio)
            fin.setDate(fin.getDate() + 1)
            return { start: inicio, end: fin }
        },
    },
}

export default function CalendarioVisitas({ visitas, onDayClick, onRangeChange }) {
    const calendarRef = useRef(null)
    const [height, setHeight] = useState(520)
    const onDayClickRef = useRef(onDayClick)
    const onRangeChangeRef = useRef(onRangeChange)
    const ultimoClic = useRef(0)
    const agendaEmitida = useRef('')

    useEffect(() => {
        onDayClickRef.current = onDayClick
    }, [onDayClick])

    useEffect(() => {
        onRangeChangeRef.current = onRangeChange
    }, [onRangeChange])

    const fechaLocal = (date) => [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-')

    const restarUnDia = (fechaISO) => {
        const [anio, mes, dia] = fechaISO.split('-').map(Number)
        const fecha = new Date(anio, mes - 1, dia)
        fecha.setDate(fecha.getDate() - 1)
        return fechaLocal(fecha)
    }

    const emitirDia = (fecha) => {
        const ahora = Date.now()
        if (ahora - ultimoClic.current < 250) return
        ultimoClic.current = ahora
        onDayClickRef.current?.(fecha)
    }

    const handleDatesSet = (arg) => {
        setHeight(arg.view.type.startsWith('list') ? 'auto' : 520)

        const enAgenda = arg.view.type === 'listDay'
        if (!enAgenda) agendaEmitida.current = ''

        if (!onRangeChangeRef.current) {
            emitirAgenda(arg, enAgenda)
            return
        }

        // FullCalendar entrega un rango con el final exclusivo: se resta un día
        // para que el backend reciba "hasta" como fecha inclusiva.
        const desde = arg.startStr.slice(0, 10)
        const hasta = restarUnDia(arg.endStr.slice(0, 10))
        onRangeChangeRef.current(desde, hasta)

        emitirAgenda(arg, enAgenda)
    }

    // Agenda: equivale a seleccionar el día actual, como al hacer clic en el mes.
    // Se emite una sola vez por día para no provocar re-renderizados en bucle.
    function emitirAgenda(arg, enAgenda) {
        if (!enAgenda) return
        const dia = arg.startStr.slice(0, 10)
        if (agendaEmitida.current === dia) return
        agendaEmitida.current = dia
        onDayClickRef.current?.(dia)
    }

    const conteos = ESTADOS_CALENDARIO.map((estado) => ({
        ...estado,
        total: (visitas ?? []).filter((visita) => estadoDeVisita(visita) === estado.id).length,
    }))

    return (
        <>
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                {conteos.map((estado) => (
                    <span key={estado.id} className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                        <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: estado.color }}
                        />
                        {estado.label} ({estado.total})
                    </span>
                ))}
            </div>

            <FullCalendar
                ref={calendarRef}
                plugins={[themePlugin, dayGridPlugin, timeGridPlugin, listPlugin]}
                initialView="dayGridMonth"
                locale="es"
                locales={[esLocale]}
                timeZone="America/Bogota"
                events={buildEvents(visitas)}
                height={height}
                datesSet={handleDatesSet}
                slotMinTime="06:00:00"
                slotMaxTime="18:00:00"
                slotDuration="01:00:00"
                dayMaxEventRows={5}
                dateClick={(arg) => emitirDia(arg.dateStr.slice(0, 10))}
                eventDidMount={(arg) => {
                    const color = arg.event.extendedProps?.color
                    if (!color) return
                    arg.el.style.setProperty('--fc-event-color', color)
                    arg.el.style.setProperty('--fc-event-bg-color', color)
                    arg.el.style.setProperty('--fc-event-border-color', color)
                    arg.el.style.backgroundColor = color
                    arg.el.style.borderColor = color
                }}
                dayCellDidMount={(arg) => {
                    arg.el.style.cursor = 'pointer'
                    arg.el.addEventListener('click', () => emitirDia(fechaLocal(arg.date)))
                }}
                views={VISTAS}
                dayHeaderDidMount={(arg) => {
                    // Semana: el encabezado de cada día también selecciona el día.
                    if (!arg.view.type.startsWith('timeGrid')) return
                    arg.el.style.cursor = 'pointer'
                    arg.el.addEventListener('click', () => emitirDia(fechaLocal(arg.date)))
                }}
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,listDay'
                }}
            />
        </>
    )
}
