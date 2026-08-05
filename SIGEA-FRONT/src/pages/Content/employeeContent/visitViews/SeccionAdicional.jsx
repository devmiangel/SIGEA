import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { BotonGuardar } from './fields'
import { getInfoAdicional, saveInfoAdicional } from '../../../../services/caracterizacionService'
import { AGRO_COLORS } from '../../../../utils/agroConstants'

export default function SeccionAdicional({ userId }) {
    const [archivos, setArchivos] = useState([])
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [fechaActualizacion, setFechaActualizacion] = useState(null)

    useEffect(() => {
        if (!userId) return
        let activo = true
        getInfoAdicional(userId)
            .then((data) => {
                if (!activo) return
                setArchivos((data?.Archivos || []).map((a) => ({ RutaArchivo: a.RutaArchivo, Descripcion: a.Descripcion })))
                setFechaActualizacion(data?.FechaActualizacion || null)
            })
            .catch(() => { if (activo) setArchivos([]) })
            .finally(() => { if (activo) setLoading(false) })
        return () => { activo = false }
    }, [userId])

    const updateItem = (idx, campo, value) => {
        setArchivos((arr) => arr.map((it, i) => (i === idx ? { ...it, [campo]: value } : it)))
    }

    const agregar = () => setArchivos((arr) => [...arr, { RutaArchivo: '', Descripcion: '' }])
    const eliminar = (idx) => setArchivos((arr) => arr.filter((_, i) => i !== idx))

    const guardar = async () => {
        setGuardando(true)
        try {
            await saveInfoAdicional(userId, {
                Archivos: archivos.filter((a) => a.RutaArchivo),
            })
            Swal.fire({
                icon: 'success',
                title: 'Información adicional guardada',
                text: 'La información se guardó correctamente.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 1800,
                timerProgressBar: true
            })
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar la información. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.success
            })
        } finally {
            setGuardando(false)
        }
    }

    if (loading) return <p className="text-sm text-gray-500">Cargando información adicional...</p>

    return (
        <div className="flex flex-col gap-4">
            {fechaActualizacion && (
                <p className="text-sm text-gray-500">Última actualización: {fechaActualizacion}</p>
            )}

            <div className="flex flex-col gap-2">
                {archivos.length === 0 && (
                    <p className="text-sm text-gray-500">No hay archivos adjuntos. Agrega una ruta.</p>
                )}
                {archivos.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ruta del archivo</label>
                            <input type="text" value={it.RutaArchivo}
                                onChange={(e) => updateItem(idx, 'RutaArchivo', e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none text-sm bg-white" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Descripción</label>
                            <input type="text" value={it.Descripcion}
                                onChange={(e) => updateItem(idx, 'Descripcion', e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none text-sm bg-white" />
                        </div>
                        <button type="button" onClick={() => eliminar(idx)}
                            className="px-3 py-2 rounded-md bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors">
                            Quitar
                        </button>
                    </div>
                ))}
            </div>

            <button type="button" onClick={agregar}
                className="self-start px-4 py-2 rounded-lg border border-[#015d3b] text-[#015d3b] text-sm font-semibold hover:bg-[#015d3b]/5 transition-colors">
                + Agregar archivo
            </button>

            <BotonGuardar onClick={guardar} guardando={guardando} texto="Guardar información adicional" />
        </div>
    )
}