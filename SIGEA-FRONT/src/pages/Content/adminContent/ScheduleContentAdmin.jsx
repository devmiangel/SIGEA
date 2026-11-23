import { useState, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import VisitaInfoCard from "../../../components/VisitaInfoCard/VisitaInfoCard"
import CalendarioVisitas from "../../../components/calendar/CalendarioVisitas"
import { getVisitas } from "../../../services/visitasService"
import { mostrarInfoVisita } from "../../../components/AgroModals/InfoVisitaModal"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

export default function ScheduleContentAdmin(){
    const navigate = useNavigate()
    const [visitasCalendario, setVisitasCalendario] = useState([])
    const [loadingCalendario, setLoadingCalendario] = useState(true)
    const [errorCalendario, setErrorCalendario] = useState(false)
    const [diaSeleccionado, setDiaSeleccionado] = useState('')
    const [visitasDia, setVisitasDia] = useState([])
    const [cargandoDia, setCargandoDia] = useState(false)
    const cacheRangos = useRef(new Map())
    const peticionRango = useRef(0)
    const rangoEnCurso = useRef('')
    const cacheDias = useRef(new Map())
    const peticionDia = useRef(0)

    const handleRangoCalendario = useCallback(async (desde, hasta) => {
        const clave = `${desde}|${hasta}`
        if (cacheRangos.current.has(clave)) {
            setVisitasCalendario(cacheRangos.current.get(clave))
            setLoadingCalendario(false)
            setErrorCalendario(false)
            return
        }

        // FullCalendar puede disparar datesSet más de una vez para el mismo
        // rango; evita lanzar peticiones duplicadas mientras una está en curso.
        if (rangoEnCurso.current === clave) return
        rangoEnCurso.current = clave

        // Nuevo rango: cierra el panel del día anterior. Se usan actualizadores
        // funcionales para no crear estados nuevos cuando ya están vacíos.
        setDiaSeleccionado((prev) => (prev ? '' : prev))
        setVisitasDia((prev) => (prev.length ? [] : prev))
        setCargandoDia((prev) => (prev ? false : prev))

        const peticion = peticionRango.current + 1
        peticionRango.current = peticion
        setVisitasCalendario((prev) => (prev.length ? [] : prev))
        setLoadingCalendario(true)
        setErrorCalendario(false)
        try {
            const data = await getVisitas({ desde, hasta })
            if (peticion !== peticionRango.current) return
            const lista = Array.isArray(data) ? data : (data?.results ?? [])
            cacheRangos.current.set(clave, lista)
            setVisitasCalendario(lista)
        } catch {
            if (peticion === peticionRango.current) {
                setVisitasCalendario([])
                setErrorCalendario(true)
            }
        } finally {
            if (peticion === peticionRango.current) {
                rangoEnCurso.current = ''
                setLoadingCalendario(false)
            }
        }
    }, [])

    const formatearDia = (fecha) => {
        if (!fecha) return ''
        const [anio, mes, dia] = fecha.split('-')
        return `${dia}/${mes}/${anio}`
    }

    const handleDiaClick = async (fecha) => {
        setDiaSeleccionado(fecha)
        if (cacheDias.current.has(fecha)) {
            setVisitasDia(cacheDias.current.get(fecha))
            setCargandoDia(false)
            return
        }
        const peticion = peticionDia.current + 1
        peticionDia.current = peticion
        setVisitasDia([])
        setCargandoDia(true)
        try {
            const data = await getVisitas({ desde: fecha, hasta: fecha })
            if (peticion !== peticionDia.current) return
            const lista = Array.isArray(data) ? data : (data?.results ?? [])
            cacheDias.current.set(fecha, lista)
            setVisitasDia(lista)
        } catch {
            if (peticion === peticionDia.current) {
                setVisitasDia([])
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar las visitas de ese día.',
                    confirmButtonColor: AGRO_COLORS.primary,
                })
            }
        } finally {
            if (peticion === peticionDia.current) setCargandoDia(false)
        }
    }

    const cerrarDia = () => {
        setDiaSeleccionado('')
        setVisitasDia([])
        setCargandoDia(false)
    }

    return (
        <>
            <Header
                componentLogo={
                    <CalendarMonthIcon
                        sx={{fontSize: 40, color:"ActiveCaption"}}
                    />
                }
                headerText={'Gestion de horarios de visitas'}
                message={'Selecciona un día del calendario para consultar las visitas programadas'}
                colorLogo={'#55bd85'}
                firstButton={
                    <ButtonLink buttonText={'Validacion de UPs'}
                        onClick={() => navigate('/administrador/validacion-ups')}/>
                }
                secondButton={
                    <ButtonLink buttonText={'Visitas'}
                        onClick={() => navigate('/administrador/visitas')}/>
                }
            />
            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4 overflow-y-hidden">
                <div className="mb-6">
                    <CalendarioVisitas
                        visitas={visitasCalendario}
                        onDayClick={handleDiaClick}
                        onRangeChange={handleRangoCalendario}
                    />
                    {loadingCalendario && (
                        <p className="mt-2 text-xs text-gray-500">
                            Cargando visitas del mes...
                        </p>
                    )}
                    {errorCalendario && (
                        <p className="mt-2 text-xs text-red-600">
                            No se pudieron cargar las visitas del mes.
                        </p>
                    )}
                    {!loadingCalendario && !errorCalendario && !diaSeleccionado && (
                        <p className="mt-2 text-xs text-gray-500">
                            Haz clic en un día del calendario para ver sus visitas en la lista.
                        </p>
                    )}
                </div>

                {diaSeleccionado && (
                    <section className="mb-6 rounded-xl border border-gray-200 bg-[#f4f9f7] p-3 sm:p-4">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h3 className="text-sm font-semibold text-[#015d3b]">
                                    Visitas del día
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {formatearDia(diaSeleccionado)}
                                    {' · '}
                                    {cargandoDia ? 'cargando...' : `${visitasDia.length} visita(s)`}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={cerrarDia}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                            >
                                Cerrar
                            </button>
                        </div>

                        {cargandoDia ? (
                            <div className="space-y-2">
                                <div className="h-16 animate-pulse rounded-xl bg-white" />
                                <div className="h-16 animate-pulse rounded-xl bg-white" />
                            </div>
                        ) : visitasDia.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No hay visitas programadas para este día.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {visitasDia.map((visita, i) => (
                                    <VisitaInfoCard
                                        key={visita.id}
                                        visita={visita}
                                        numero={i + 1}
                                        onClick={() => mostrarInfoVisita(visita, i + 1)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </>
    )
}
