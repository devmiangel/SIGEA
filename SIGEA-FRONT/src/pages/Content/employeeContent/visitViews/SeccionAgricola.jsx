import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { BotonGuardar, CampoSelectDinamico } from './fields'
import {
    getInfoAgricola, saveInfoAgricola, getProductosUPs, getUnidades, crearProducto, crearUnidad,
} from '../../../../services/caracterizacionService'
import { AGRO_COLORS } from '../../../../utils/agroConstants'

export default function SeccionAgricola({ userId }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [productos, setProductos] = useState([])
    const [unidades, setUnidades] = useState([])

    useEffect(() => {
        if (!userId) return
        let activo = true
        Promise.all([getInfoAgricola(userId), getProductosUPs(), getUnidades()])
            .then(([data, prods, unds]) => {
                if (!activo) return
                const inicial = (data?.ProduccionAgricola || []).map((p) => ({
                    NombreProducto: p.NombreProducto, Cantidad: p.Cantidad,
                    Unidad: p.UnidadMedida || '',
                }))
                setItems(inicial)
                setProductos(prods.map((p) => p.Producto))
                setUnidades(unds.map((u) => u.Unidad))
            })
            .catch(() => { if (activo) setItems([]) })
            .finally(() => { if (activo) setLoading(false) })
        return () => { activo = false }
    }, [userId])

    const updateItem = (idx, campo, value) => {
        setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, [campo]: value } : it)))
    }

    const agregar = () => setItems((arr) => [...arr, { NombreProducto: '', Cantidad: '', Unidad: '' }])
    const eliminar = (idx) => setItems((arr) => arr.filter((_, i) => i !== idx))

    const guardar = async () => {
        setGuardando(true)
        try {
            await saveInfoAgricola(userId, { ProduccionAgricola: items.filter((i) => i.NombreProducto) })
            Swal.fire({
                icon: 'success',
                title: 'Producción agrícola guardada',
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

    if (loading) return <p className="text-sm text-gray-500">Cargando producción agrícola...</p>

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                {items.length === 0 && (
                    <p className="text-sm text-gray-500">No hay cultivos registrados. Agrega uno.</p>
                )}
                {items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
                        <CampoSelectDinamico label="Producto" name="NombreProducto" value={it.NombreProducto}
                            options={productos} onCrear={crearProducto} onChange={(n, v) => updateItem(idx, n, v)} />
                        <CampoSelectDinamico label="Unidad" name="Unidad" value={it.Unidad}
                            options={unidades} onCrear={crearUnidad} onChange={(n, v) => updateItem(idx, n, v)} />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Cantidad</label>
                            <input
                                type="number"
                                value={it.Cantidad ?? ''}
                                onChange={(e) => updateItem(idx, 'Cantidad', e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none text-sm bg-white"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => eliminar(idx)}
                            className="px-3 py-2 rounded-md bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors"
                        >
                            Quitar
                        </button>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={agregar}
                className="self-start px-4 py-2 rounded-lg border border-[#015d3b] text-[#015d3b] text-sm font-semibold hover:bg-[#015d3b]/5 transition-colors"
            >
                + Agregar cultivo
            </button>

            <BotonGuardar onClick={guardar} guardando={guardando} texto="Guardar producción agrícola" />
        </div>
    )
}