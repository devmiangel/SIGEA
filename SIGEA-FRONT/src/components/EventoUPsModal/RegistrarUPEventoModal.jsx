import { useEffect, useMemo, useState } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import EventIcon from '@mui/icons-material/Event'
import Swal from 'sweetalert2'
import { getUPs, actualizarEvento } from '../../services/agroService'
import { AGRO_COLORS, AUTOCOMPLETE_MAX_RESULTS } from '../../utils/agroConstants'

const labelUP = (up) => {
    if (!up) return ''
    return [up.RUEA, up.productor_nombre, up.nombre_predio].filter(Boolean).join(' · ') || `UP #${up.id}`
}

export default function RegistrarUPEventoModal({ evento, onClose, onRegistrado }) {
    const [ups, setUps] = useState([])
    const [cargando, setCargando] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [registradas, setRegistradas] = useState(() => {
        if (evento?.UPs) return Array.isArray(evento.UPs) ? evento.UPs : []
        if (evento?.UP) return Array.isArray(evento.UP) ? evento.UP.map((id) => ({ id })) : []
        return []
    })
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        let activo = true
        const cargar = async () => {
            try {
                const data = await getUPs()
                if (activo) setUps(Array.isArray(data) ? data : [])
            } catch {
                if (activo) setUps([])
            } finally {
                if (activo) setCargando(false)
            }
        }
        cargar()
        return () => { activo = false }
    }, [])

    const resultados = useMemo(() => {
        const idsRegistrados = new Set(registradas.map((u) => u.id))
        const candidatos = ups.filter((u) => !idsRegistrados.has(u.id))
        const q = busqueda.trim().toLowerCase()
        if (!q) return candidatos
        return candidatos.filter((u) =>
            `${u.RUEA ?? ''} ${u.productor_nombre ?? ''} ${u.nombre_predio ?? ''} ${u.tipo_up_label ?? ''}`
                .toLowerCase()
                .includes(q)
        )
    }, [ups, busqueda, registradas])

    const agregar = (up) => {
        setRegistradas((prev) => (prev.some((u) => u.id === up.id) ? prev : [...prev, up]))
        setBusqueda('')
    }

    const quitar = (upId) => {
        setRegistradas((prev) => prev.filter((u) => u.id !== upId))
    }

    const escanearQR = () => {
        Swal.fire({
            icon: 'info',
            title: 'Escaneo QR',
            text: 'La funcionalidad de escaneo QR estará disponible próximamente.',
            confirmButtonColor: AGRO_COLORS.primary
        })
    }

    const guardar = async () => {
        setGuardando(true)
        try {
            await actualizarEvento(evento.id, { UP: registradas.map((u) => u.id) })
            Swal.fire({
                icon: 'success',
                title: 'Unidades registradas',
                text: 'Las unidades productivas fueron registradas en el evento correctamente.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            })
            onRegistrado?.()
            onClose()
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron registrar las unidades productivas. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary
            })
        } finally {
            setGuardando(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-center w-11 h-11 rounded-full bg-linear-to-br from-[#015d3b] to-[#3e9a8a] text-white shrink-0">
                        <EventIcon sx={{ fontSize: 22 }} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Registrar unidades productivas</p>
                        <h2 className="text-base font-semibold text-gray-900 truncate" title={evento?.Titulo}>
                            {evento?.Titulo ?? 'Evento'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <CloseIcon fontSize="small" />
                    </button>
                </div>

                <div className="px-5 py-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <SearchIcon
                                fontSize="small"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                placeholder="Buscar unidad productiva por RUEA, productor o predio..."
                                className="w-full px-3 py-2.5 pl-9 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white"
                            />
                        </div>
                        <button
                            onClick={escanearQR}
                            aria-label="Escanear QR"
                            title="Escanear código QR"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors shrink-0"
                        >
                            <QrCodeScannerIcon fontSize="small" />
                            Escanear QR
                        </button>
                    </div>

                    {cargando ? (
                        <p className="text-gray-500 text-sm mt-4">Cargando unidades productivas...</p>
                    ) : (
                        <div className="mt-3 max-h-44 overflow-y-auto rounded-md border border-gray-100">
                            {resultados.length === 0 ? (
                                <p className="px-3 py-3 text-gray-500 text-sm">
                                    {busqueda.trim()
                                        ? 'No se encontraron unidades productivas.'
                                        : 'No hay unidades productivas disponibles.'}
                                </p>
                            ) : (
                                resultados.slice(0, AUTOCOMPLETE_MAX_RESULTS).map((up) => (
                                    <button
                                        key={up.id}
                                        onClick={() => agregar(up)}
                                        className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-[#015d3b]/5 transition-colors border-b border-gray-50 last:border-b-0"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{labelUP(up)}</p>
                                            {up.tipo_up_label ? (
                                                <p className="text-xs text-gray-500">{up.tipo_up_label}</p>
                                            ) : null}
                                        </div>
                                        <span className="text-xs font-semibold text-[#015d3b] shrink-0">Registrar</span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="px-5 pb-4 flex-1 min-h-0 overflow-y-auto">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">Unidades registradas en el evento</h3>
                        <span className="text-xs text-gray-500">{registradas.length} unidad(es)</span>
                    </div>
                    {registradas.length === 0 ? (
                        <p className="text-gray-500 text-sm">Aún no hay unidades productivas registradas.</p>
                    ) : (
                        <ul className="space-y-2">
                            {registradas.map((up) => (
                                <li
                                    key={up.id}
                                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{labelUP(up)}</p>
                                        {up.tipo_up_label ? (
                                            <p className="text-xs text-gray-500">{up.tipo_up_label}</p>
                                        ) : null}
                                    </div>
                                    <button
                                        onClick={() => quitar(up.id)}
                                        aria-label="Quitar unidad productiva"
                                        title="Quitar unidad productiva"
                                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={guardar}
                        disabled={guardando}
                        className="px-6 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {guardando ? 'Guardando...' : 'Guardar registro'}
                    </button>
                </div>
            </div>
        </div>
    )
}
