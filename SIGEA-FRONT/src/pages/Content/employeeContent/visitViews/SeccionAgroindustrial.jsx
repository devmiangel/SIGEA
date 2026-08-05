import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { BotonGuardar } from './fields'
import { getInfoAgroindustrial, saveInfoAgroindustrial, getProductosUPs } from '../../../../services/caracterizacionService'
import { AGRO_COLORS } from '../../../../utils/agroConstants'

export default function SeccionAgroindustrial({ userId }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [productos, setProductos] = useState([])

    useEffect(() => {
        if (!userId) return
        let activo = true
        Promise.all([getInfoAgroindustrial(userId), getProductosUPs()])
            .then(([data, prods]) => {
                if (!activo) return
                const inicial = (data?.ProduccionAgroindustrial || []).map((p) => ({
                    NombreProducto: p.NombreProducto, Cantidad: p.Cantidad, INVIMA: !!p.INVIMA,
                }))
                setItems(inicial)
                setProductos(prods.map((p) => p.Producto))
            })
            .catch(() => { if (activo) setItems([]) })
            .finally(() => { if (activo) setLoading(false) })
        return () => { activo = false }
    }, [userId])

    const updateItem = (idx, campo, value) => {
        setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, [campo]: value } : it)))
    }

    const agregar = () => setItems((arr) => [...arr, { NombreProducto: '', Cantidad: '', INVIMA: false }])
    const eliminar = (idx) => setItems((arr) => arr.filter((_, i) => i !== idx))

    const guardar = async () => {
        setGuardando(true)
        try {
            await saveInfoAgroindustrial(userId, {
                ProduccionAgroindustrial: items.filter((i) => i.NombreProducto),
            })
            Swal.fire({
                icon: 'success',
                title: 'Producción agroindustrial guardada',
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

    if (loading) return <p className="text-sm text-gray-500">Cargando producción agroindustrial...</p>

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                {items.length === 0 && (
                    <p className="text-sm text-gray-500">No hay productos agroindustriales registrados.</p>
                )}
                {items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-2 items-end">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Producto</label>
                            <select value={it.NombreProducto}
                                onChange={(e) => updateItem(idx, 'NombreProducto', e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none text-sm bg-white">
                                <option value="">Seleccione...</option>
                                {productos.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Cantidad</label>
                            <input type="number" value={it.Cantidad ?? ''}
                                onChange={(e) => updateItem(idx, 'Cantidad', e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none text-sm bg-white" />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" checked={!!it.INVIMA}
                                onChange={(e) => updateItem(idx, 'INVIMA', e.target.checked)}
                                className="w-4 h-4 accent-[#015d3b]" />
                            INVIMA
                        </label>
                        <button type="button" onClick={() => eliminar(idx)}
                            className="px-3 py-2 rounded-md bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors">
                            Quitar
                        </button>
                    </div>
                ))}
            </div>

            <button type="button" onClick={agregar}
                className="self-start px-4 py-2 rounded-lg border border-[#015d3b] text-[#015d3b] text-sm font-semibold hover:bg-[#015d3b]/5 transition-colors">
                + Agregar producto
            </button>

            <BotonGuardar onClick={guardar} guardando={guardando} texto="Guardar producción agroindustrial" />
        </div>
    )
}