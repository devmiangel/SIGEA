import { useEffect, useState, forwardRef, useCallback, useImperativeHandle } from 'react'
import { CampoSelectDinamico } from './fields'
import {
    getInfoAnimal, saveInfoAnimal, getGruposAnimales, getPropositos,
    getTiposAves, getRazas, getProductosApicolas,
    crearProposito, crearTipoAve, crearProductoApicola,
} from '../../../../services/caracterizacionService'
import { useSeccion } from '../../../../hooks/useSeccion'

const GRUPOS_CON_RAZA = ['Bovinos', 'Aves', 'Porcinos', 'Equinos', 'Caprinos', 'Ovinos', 'Conejos', 'Curies', 'Peces', 'Abejas']

function SelectOpc({ label, value, opciones, onChange, onCrear }) {
    return (
        <CampoSelectDinamico label={label} name={label} value={value ?? ''}
            options={opciones} onCrear={onCrear} compact
            onChange={(n, v) => onChange(v)} />
    )
}

function DetalleBovino({ det, update, razas, propositos }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SelectOpc label="Raza" value={det.Raza} opciones={razas} onChange={(v) => update('Raza', v)} />
            <SelectOpc label="Propósito" value={det.Proposito} opciones={propositos} onCrear={crearProposito} onChange={(v) => update('Proposito', v)} />
            <NumOpc label="Machos" value={det.Machos} onChange={(v) => update('Machos', v)} />
            <NumOpc label="Hembras" value={det.Hembras} onChange={(v) => update('Hembras', v)} />
            <TextOpc label="RUV" value={det.RUV} onChange={(v) => update('RUV', v)} />
        </div>
    )
}

function DetalleAves({ det, update, razas, tiposAves }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <SelectOpc label="Raza" value={det.Raza} opciones={razas} onChange={(v) => update('Raza', v)} />
            <SelectOpc label="Tipo de ave" value={det.TipoAve} opciones={tiposAves} onCrear={crearTipoAve} onChange={(v) => update('TipoAve', v)} />
            <NumOpc label="Cantidad" value={det.Cantidad} onChange={(v) => update('Cantidad', v)} />
        </div>
    )
}

function DetalleSimple({ det, update, razas, propositos, conChapeta = false }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <SelectOpc label="Raza" value={det.Raza} opciones={razas} onChange={(v) => update('Raza', v)} />
            <SelectOpc label="Propósito" value={det.Proposito} opciones={propositos} onCrear={crearProposito} onChange={(v) => update('Proposito', v)} />
            {conChapeta && (
                <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={!!det.Chapeta} onChange={(e) => update('Chapeta', e.target.checked)} className="w-4 h-4 accent-[#015d3b]" />
                    Chapeta
                </label>
            )}
        </div>
    )
}

function DetallePeces({ det, update, razas }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
            <SelectOpc label="Raza" value={det.Raza} opciones={razas} onChange={(v) => update('Raza', v)} />
            <NumOpc label="Estanques" value={det.Estanques} onChange={(v) => update('Estanques', v)} />
        </div>
    )
}

function DetalleAbejas({ det, update, razas, productosApicolas }) {
    return (
        <div className="grid grid-cols-2 gap-2">
            <SelectOpc label="Raza" value={det.Raza} opciones={razas} onChange={(v) => update('Raza', v)} />
            <SelectOpc label="Productos apícolas" value={det.ProductosApicolas} opciones={productosApicolas} onCrear={crearProductoApicola} onChange={(v) => update('ProductosApicolas', v)} />
        </div>
    )
}

function NumOpc({ label, value, onChange }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</label>
            <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value)}
                className="w-full px-2 py-1.5 rounded-md border border-[#015d3b] outline-none text-sm bg-white" />
        </div>
    )
}

function TextOpc({ label, value, onChange }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</label>
            <input type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)}
                className="w-full px-2 py-1.5 rounded-md border border-[#015d3b] outline-none text-sm bg-white" />
        </div>
    )
}

const SeccionPecuaria = forwardRef(({ userId, solicitudId }, ref) => {
    const [items, setItems] = useState([])
    const [grupos, setGrupos] = useState([])
    const [propositos, setPropositos] = useState([])
    const [tiposAves, setTiposAves] = useState([])
    const [razas, setRazas] = useState([])
    const [productosApicolas, setProductosApicolas] = useState([])
    const { loading, cargarSeccion, guardarSeccion } = useSeccion()

    useEffect(() => {
        if (!userId) return
        let activo = true
        cargarSeccion(async () => {
            const [data, g, prop, aves, raz, api] = await Promise.all([
                getInfoAnimal(userId, solicitudId), getGruposAnimales(), getPropositos(),
                getTiposAves(), getRazas(), getProductosApicolas(),
            ])
            if (!activo) return
            setItems((data?.Animales || []).map((a) => ({
                GrupoAnimal: a.GrupoAnimal,
                CantidadTotal: a.CantidadTotal,
                Detalles: a.Detalles || {},
            })))
            setGrupos(g.map((x) => x.GrupoAnimal))
            setPropositos(prop.map((x) => x.Proposito))
            setTiposAves(aves.map((x) => x.TipoAve))
            setRazas(raz.map((x) => x.Raza))
            setProductosApicolas(api.map((x) => x.ProductoApicolas))
        })
        return () => { activo = false }
    }, [userId, solicitudId, cargarSeccion])

    const updateItem = (idx, campo, value) => {
        setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, [campo]: value } : it)))
    }

    const updateDetalle = (idx, campo, value) => {
        setItems((arr) => arr.map((it, i) =>
            i === idx ? { ...it, Detalles: { ...(it.Detalles || {}), [campo]: value } } : it))
    }

    const agregar = () => setItems((arr) => [...arr, { GrupoAnimal: '', CantidadTotal: '', Detalles: {} }])
    const eliminar = (idx) => setItems((arr) => arr.filter((_, i) => i !== idx))

    const renderDetalle = (it, idx) => {
        const g = it.GrupoAnimal
        if (!g) return null
        if (g === 'Bovinos') return <DetalleBovino det={it.Detalles} update={(c, v) => updateDetalle(idx, c, v)} razas={razas} propositos={propositos} />
        if (g === 'Aves') return <DetalleAves det={it.Detalles} update={(c, v) => updateDetalle(idx, c, v)} razas={razas} tiposAves={tiposAves} />
        if (g === 'Porcinos') return <DetalleSimple det={it.Detalles} update={(c, v) => updateDetalle(idx, c, v)} razas={razas} propositos={propositos} conChapeta />
        if (g === 'Equinos' || g === 'Caprinos' || g === 'Ovinos' || g === 'Conejos' || g === 'Curies')
            return <DetalleSimple det={it.Detalles} update={(c, v) => updateDetalle(idx, c, v)} razas={razas} propositos={propositos} />
        if (g === 'Peces') return <DetallePeces det={it.Detalles} update={(c, v) => updateDetalle(idx, c, v)} razas={razas} />
        if (g === 'Abejas') return <DetalleAbejas det={it.Detalles} update={(c, v) => updateDetalle(idx, c, v)} razas={razas} productosApicolas={productosApicolas} />
        return null
    }

    const guardar = useCallback(async () => {
        return guardarSeccion(() => saveInfoAnimal(userId, solicitudId, {
            Animales: items.filter((i) => i.GrupoAnimal && GRUPOS_CON_RAZA.includes(i.GrupoAnimal)),
        }))
    }, [items, userId, solicitudId, guardarSeccion])

    useImperativeHandle(ref, () => ({ guardar }))

    if (loading) return <p className="text-sm text-gray-500">Cargando producción pecuaria...</p>

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
                {items.length === 0 && (
                    <p className="text-sm text-gray-500">No hay animales registrados. Agrega un grupo.</p>
                )}
                {items.map((it, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 flex flex-col gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <SelectOpc label="Grupo animal" value={it.GrupoAnimal} opciones={grupos}
                                onChange={(v) => updateItem(idx, 'GrupoAnimal', v)} />
                            <NumOpc label="Cantidad total" value={it.CantidadTotal}
                                onChange={(v) => updateItem(idx, 'CantidadTotal', v)} />
                        </div>
                        {renderDetalle(it, idx)}
                        <button type="button" onClick={() => eliminar(idx)}
                            className="self-end px-3 py-1.5 rounded-md bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors">
                            Quitar
                        </button>
                    </div>
                ))}
            </div>

            <button type="button" onClick={agregar}
                className="self-start px-4 py-2 rounded-lg border border-[#015d3b] text-[#015d3b] text-sm font-semibold hover:bg-[#015d3b]/5 transition-colors">
                + Agregar grupo animal
            </button>
        </div>
    )
})

export default SeccionPecuaria