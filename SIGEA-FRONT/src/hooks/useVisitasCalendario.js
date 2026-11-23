import { useCallback, useRef, useState } from 'react'

// Carga las visitas del rango visible de CalendarioVisitas (onRangeChange) en
// lugar de descargar todas.
//
// - fetcher(params): función del servicio, p. ej. getVisitas o getMisVisitas;
//   recibe { desde, hasta } (YYYY-MM-DD, incluidos).
// - alCambiarRango(): opcional, se llama cuando el calendario pide un rango que
//   no está en caché (p. ej. para cerrar un panel de detalle del rango anterior).
//
// Guarda cada rango en caché, ignora respuestas viejas y evita peticiones
// duplicadas: FullCalendar puede disparar datesSet varias veces para el mismo rango.
export function useVisitasCalendario(fetcher, alCambiarRango) {
    const [visitas, setVisitas] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const cache = useRef(new Map())
    const ultimaPeticion = useRef(0)
    const rangoEnCurso = useRef('')
    const ultimoRango = useRef(null)

    const cargarRango = useCallback(async (desde, hasta) => {
        ultimoRango.current = { desde, hasta }
        const clave = `${desde}|${hasta}`
        if (cache.current.has(clave)) {
            setVisitas(cache.current.get(clave))
            setLoading(false)
            setError(false)
            return
        }
        if (rangoEnCurso.current === clave) return
        rangoEnCurso.current = clave

        alCambiarRango?.()

        const peticion = ultimaPeticion.current + 1
        ultimaPeticion.current = peticion
        // Actualizador funcional: no crea un estado nuevo si ya está vacío.
        setVisitas((prev) => (prev.length ? [] : prev))
        setLoading(true)
        setError(false)
        try {
            const data = await fetcher({ desde, hasta })
            if (peticion !== ultimaPeticion.current) return
            const lista = Array.isArray(data) ? data : (data?.results ?? [])
            cache.current.set(clave, lista)
            setVisitas(lista)
        } catch {
            if (peticion === ultimaPeticion.current) {
                setVisitas([])
                setError(true)
            }
        } finally {
            if (peticion === ultimaPeticion.current) {
                rangoEnCurso.current = ''
                setLoading(false)
            }
        }
    }, [fetcher, alCambiarRango])

    // Vacía la caché y vuelve a pedir el rango visible (p. ej. tras reagendar).
    const recargar = useCallback(() => {
        cache.current.clear()
        rangoEnCurso.current = ''
        const rango = ultimoRango.current
        if (rango) return cargarRango(rango.desde, rango.hasta)
        return undefined
    }, [cargarRango])

    return { visitas, loading, error, onRangeChange: cargarRango, recargar }
}
