import { useState, useEffect, useMemo } from 'react'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

import { getInsumos, getInventarioFuncionario } from '../../../../../services/agroService'
import { getUnidades } from '../../../../../services/caracterizacionService'

const inputClase = "w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-500"
const labelClase = "text-xs font-semibold uppercase tracking-wide text-gray-500"

export default function SeccionInsumos({ form, onChange }) {
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [inventario, setInventario] = useState([])
    const [seleccion, setSeleccion] = useState('')

    const filas = useMemo(() => form.insumos ?? [], [form.insumos])

    useEffect(() => {
        let activo = true
        const cargar = async () => {
            setCargando(true)
            setError(null)
            try {
                const funcionarioId = Number(form.funcionario_id)
                if (!funcionarioId) {
                    setError('No se pudo identificar el funcionario asignado a la visita.')
                    setInventario([])
                    return
                }

                const [invData, insumosData, unidadesData] = await Promise.all([
                    getInventarioFuncionario(),
                    getInsumos(),
                    getUnidades(),
                ])
                if (!activo) return

                const insumosMap = (insumosData ?? []).reduce((acc, ins) => {
                    acc[ins.id] = ins
                    return acc
                }, {})
                const unidadesMap = (unidadesData ?? []).reduce((acc, u) => {
                    acc[u.id] = u.Unidad
                    return acc
                }, {})

                const propios = (invData ?? [])
                    .filter((item) => item.Funcionario === funcionarioId)
                    .map((item) => {
                        const ins = insumosMap[item.Insumo] ?? {}
                        return {
                            id: item.id,
                            inventario_funcionario_id: item.id,
                            insumo_id: item.Insumo,
                            nombre: ins.Nombre ?? `Insumo #${item.Insumo}`,
                            unidad: unidadesMap[ins.Unidades] ?? '',
                            stock: Number(item.Cantidad ?? 0),
                            activo: ins.Estado !== false && Number(item.Cantidad ?? 0) > 0,
                        }
                    })
                    .filter((item) => item.activo)

                setInventario(propios)
            } catch {
                setError('No se pudieron cargar los insumos del inventario. Intenta de nuevo.')
                setInventario([])
            } finally {
                if (activo) setCargando(false)
            }
        }
        cargar()
        return () => { activo = false }
    }, [form.funcionario_id])

    const usadoPorInsumo = useMemo(() => {
        const map = {}
        filas.forEach((f) => {
            const id = Number(f.inventario_funcionario_id)
            map[id] = (map[id] ?? 0) + Number(f.cantidad || 0)
        })
        return map
    }, [filas])

    const stockUsado = (itemId) => usadoPorInsumo[itemId] ?? 0
    const stockRestante = (item) => Math.max(0, item.stock - stockUsado(item.id))

    const agregar = () => {
        if (!seleccion) return
        const item = inventario.find((it) => String(it.id) === String(seleccion))
        if (!item) return
        const restante = stockRestante(item)
        if (restante <= 0) {
            setError(`El insumo "${item.nombre}" no tiene stock disponible.`)
            return
        }
        onChange('insumos', [...filas, { inventario_funcionario_id: item.id, cantidad: 1 }])
        setSeleccion('')
        setError(null)
    }

    const actualizarCantidad = (idx, valor) => {
        let cantidad = Math.floor(Number(valor))
        if (!Number.isFinite(cantidad) || cantidad < 1) cantidad = 1

        const f = filas[idx]
        const item = inventario.find((it) => it.id === f.inventario_funcionario_id)
        if (item) {
            const otros = filas.reduce((acc, ff, i) => (
                i !== idx && ff.inventario_funcionario_id === f.inventario_funcionario_id
                    ? acc + Number(ff.cantidad || 0)
                    : acc
            ), 0)
            const max = Math.max(0, item.stock - otros)
            if (cantidad > max) cantidad = max
        }

        onChange('insumos', filas.map((ff, i) => (i === idx ? { ...ff, cantidad } : ff)))
    }

    const eliminar = (idx) => {
        onChange('insumos', filas.filter((_, i) => i !== idx))
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <label className={labelClase}>Insumos del inventario del funcionario</label>
                <div className="flex flex-col sm:flex-row gap-2">
                    <select
                        value={seleccion}
                        onChange={(e) => { setSeleccion(e.target.value); setError(null) }}
                        className={inputClase}
                        disabled={cargando || inventario.length === 0}
                    >
                        <option value="">
                            {cargando
                                ? 'Cargando inventario...'
                                : inventario.length === 0
                                ? 'No hay insumos asignados'
                                : 'Selecciona un insumo'}
                        </option>
                        {inventario.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.nombre} — disponible: {stockRestante(item)} {item.unidad}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={agregar}
                        disabled={cargando || !seleccion}
                        className="px-4 py-2 rounded-md bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                        Agregar
                    </button>
                </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {filas.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Insumo</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Cantidad</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Disponible</th>
                                <th className="px-4 py-2" />
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filas.map((f, idx) => {
                                const item = inventario.find((it) => it.id === f.inventario_funcionario_id)
                                const otros = filas.reduce((acc, ff, i) => (
                                    i !== idx && ff.inventario_funcionario_id === f.inventario_funcionario_id
                                        ? acc + Number(ff.cantidad || 0)
                                        : acc
                                ), 0)
                                const restante = item ? Math.max(0, item.stock - otros) : 0
                                return (
                                    <tr key={`${f.inventario_funcionario_id}-${idx}`}>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {item?.nombre ?? 'Insumo eliminado de inventario'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                min={1}
                                                max={restante}
                                                value={f.cantidad}
                                                onChange={(e) => actualizarCantidad(idx, e.target.value)}
                                                disabled={!item || restante === 0}
                                                className="w-24 px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm"
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {restante} {item?.unidad ?? ''}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => eliminar(idx)}
                                                className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                                                aria-label="Quitar insumo"
                                            >
                                                <DeleteOutlineIcon sx={{ fontSize: 20 }} />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                !cargando && !error && (
                    <p className="text-sm text-gray-500">
                        Aún no se han registrado insumos para esta visita.
                    </p>
                )
            )}

            {cargando && !error && (
                <p className="text-sm text-gray-500">Cargando inventario del funcionario...</p>
            )}

            {!cargando && !error && inventario.length === 0 && (
                <p className="text-sm text-gray-500">
                    El funcionario asignado no tiene insumos en su inventario.
                </p>
            )}
        </div>
    )
}