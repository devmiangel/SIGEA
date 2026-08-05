import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { BotonGuardar } from './fields'
import { getInfoAdicional, saveInfoAdicional, subirArchivoUP } from '../../../../services/caracterizacionService'
import { AGRO_COLORS } from '../../../../utils/agroConstants'

const EXT_PERMITIDAS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.pdf']

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
                setArchivos((data?.Archivos || []).map((a) => ({
                    RutaArchivo: a.RutaArchivo || '', NombreArchivo: a.NombreArchivo || '', Descripcion: a.Descripcion || '',
                })))
                setFechaActualizacion(data?.FechaActualizacion || null)
            })
            .catch(() => { if (activo) setArchivos([]) })
            .finally(() => { if (activo) setLoading(false) })
        return () => { activo = false }
    }, [userId])

    const updateItem = (idx, campo, value) => {
        setArchivos((arr) => arr.map((it, i) => (i === idx ? { ...it, [campo]: value } : it)))
    }

    const agregar = () => setArchivos((arr) => [...arr, { RutaArchivo: '', NombreArchivo: '', Descripcion: '' }])
    const eliminar = (idx) => setArchivos((arr) => arr.filter((_, i) => i !== idx))

    const manejarArchivo = async (idx, file) => {
        if (!file) return
        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
        if (!EXT_PERMITIDAS.includes(ext)) {
            Swal.fire({
                icon: 'error',
                title: 'Tipo de archivo no permitido',
                text: 'Solo se aceptan imágenes (JPG, PNG, GIF, WEBP, BMP) o PDF.',
                confirmButtonColor: AGRO_COLORS.success,
            })
            return
        }
        setArchivos((arr) => arr.map((it, i) =>
            i === idx ? { ...it, nombreArchivoLocal: file.name, subiendo: true } : it))
        try {
            const resp = await subirArchivoUP(userId, file)
            setArchivos((arr) => arr.map((it, i) =>
                i === idx
                    ? { ...it, RutaArchivo: resp.RutaArchivo, NombreArchivo: resp.NombreArchivo, nombreArchivoLocal: null, subiendo: false }
                    : it))
        } catch {
            setArchivos((arr) => arr.map((it, i) =>
                i === idx ? { ...it, nombreArchivoLocal: null, subiendo: false } : it))
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo subir el archivo. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.success,
            })
        }
    }

    const guardar = async () => {
        if (archivos.some((a) => a.subiendo)) {
            Swal.fire({
                icon: 'warning',
                title: 'Espera',
                text: 'Hay archivos que aún se están subiendo. Espera a que terminen.',
                confirmButtonColor: AGRO_COLORS.success,
            })
            return
        }
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

            <p className="text-sm text-gray-500">
                Adjunta el formulario de caracterización (fotos o PDF). Se guardará en el servidor.
            </p>

            <div className="flex flex-col gap-2">
                {archivos.length === 0 && (
                    <p className="text-sm text-gray-500">No hay archivos adjuntos. Agrega uno.</p>
                )}
                {archivos.map((it, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 flex flex-col gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2 items-end">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre del archivo</label>
                                <input type="text" value={it.NombreArchivo}
                                    onChange={(e) => updateItem(idx, 'NombreArchivo', e.target.value)}
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
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Formulario (foto o PDF)</label>
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.pdf"
                                onChange={(e) => manejarArchivo(idx, e.target.files?.[0])}
                                disabled={it.subiendo}
                                className="w-full text-sm text-gray-600 file:mr-4 file:px-4 file:py-2 file:rounded-md file:border-0 file:bg-[#015d3b] file:text-white file:text-sm file:font-semibold hover:file:bg-[#004d2f] disabled:opacity-60"
                            />
                            {it.subiendo && <p className="text-xs text-gray-500">Subiendo archivo...</p>}
                            {!it.subiendo && it.RutaArchivo && (
                                <p className="text-xs text-green-700">Archivo listo: {it.nombreArchivoLocal || it.NombreArchivo || it.RutaArchivo}</p>
                            )}
                        </div>
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