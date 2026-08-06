import { useEffect, useState, forwardRef, useCallback, useImperativeHandle } from 'react'
import { CampoSelectDinamico } from './fields'
import {
    getInfoAgroindustrial, saveInfoAgroindustrial, getProductosUPs, getUnidades, crearProducto, crearUnidad,
} from '../../../../services/caracterizacionService'
import { useSeccion } from '../../../../hooks/useSeccion'
import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../../../../utils/agroConstants'

const SeccionAgroindustrial = forwardRef(({ userId, solicitudId }, ref) => {
    const [items, setItems] = useState([])
    const [productos, setProductos] = useState([])
    const [unidades, setUnidades] = useState([])
    const { loading, cargarSeccion, guardarSeccion } = useSeccion()

    useEffect(() => {
        if (!userId) return
        let activo = true
        cargarSeccion(async () => {
            const [data, prods, unds] = await Promise.all([getInfoAgroindustrial(userId, solicitudId), getProductosUPs(), getUnidades()])
            if (!activo) return
            const inicial = (data?.ProduccionAgroindustrial || []).map((p) => ({
                NombreProducto: p.NombreProducto, Cantidad: p.Cantidad, INVIMA: !!p.INVIMA,
                Unidad: p.UnidadMedida || '',
            }))
            setItems(inicial)
            setProductos(prods.map((p) => ({ id: p.id, texto: p.Producto })))
            setUnidades(unds.map((u) => ({ id: u.id, texto: u.Unidad })))
        })
        return () => { activo = false }
    }, [userId, solicitudId, cargarSeccion])

    const updateItem = (idx, campo, value) => {
        setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, [campo]: value } : it)))
    }

    const handleCrearUnidad = async (idx, valor) => {
        const r = await crearUnidad(valor)
        setUnidades((prev) => [...prev, { id: r.id, texto: r.Unidad }])
    }

    const handleCrearProducto = async (idx, valor) => {
        const unidadId = unidades.find((u) => u.texto === items[idx]?.Unidad)?.id
        if (!unidadId) {
            Swal.fire({
                icon: 'warning',
                title: 'Unidad requerida',
                text: 'Primero seleccione o cree la unidad de medida y luego el producto.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
            return
        }
        const r = await crearProducto(valor, unidadId)
        setProductos((prev) => [...prev, { id: r.id, texto: r.Producto }])
    }

    const agregar = () => setItems((arr) => [...arr, { NombreProducto: '', Cantidad: '', INVIMA: false, Unidad: '' }])
    const eliminar = (idx) => setItems((arr) => arr.filter((_, i) => i !== idx))

    const guardar = useCallback(async () => {
        return guardarSeccion(() => saveInfoAgroindustrial(userId, solicitudId, {
            ProduccionAgroindustrial: items.filter((i) => i.NombreProducto),
        }))
    }, [items, userId, solicitudId, guardarSeccion])

    useImperativeHandle(ref, () => ({ guardar }))

    if (loading) return <p className="text-sm text-gray-500">Cargando producción agroindustrial...</p>

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                {items.length === 0 && (
                    <p className="text-sm text-gray-500">No hay productos agroindustriales registrados.</p>
                )}
                {items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto_auto] gap-2 items-end">
                        <CampoSelectDinamico label="Producto" name="NombreProducto" value={it.NombreProducto}
                            options={productos.map((p) => p.texto)} onCrear={(valor) => handleCrearProducto(idx, valor)} onChange={(n, v) => updateItem(idx, n, v)} />
                        <CampoSelectDinamico label="Unidad" name="Unidad" value={it.Unidad}
                            options={unidades.map((u) => u.texto)} onCrear={(valor) => handleCrearUnidad(idx, valor)} onChange={(n, v) => updateItem(idx, n, v)} />
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
        </div>
    )
})

export default SeccionAgroindustrial