import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { BotonGuardar } from './fields'
import {
    getInfoAnimal, saveInfoAnimal, getGruposAnimales, getPropositos,
    getTiposAves, getRazas, getProductosApicolas,
} from '../../../../services/caracterizacionService'
import { AGRO_COLORS } from '../../../../utils/agroConstants'

const GRUPOS_CON_RAZA = ['Bovinos', 'Aves', 'Porcinos', 'Equinos', 'Caprinos', 'Ovinos', 'Conejos', 'Curies', 'Peces', 'Abejas']

function DetalleBovino({ det, update, razas, propositos }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SelectOpc label="Raza" value={det.Raza} opciones={razas} onChange={(v) => update('Raza', v)} />
            <SelectOpc label="Propósito" value={det.Proposito} opciones={propositos} onChange={(v) => update('Proposito', v)} />
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
            <SelectOpc label="Tipo de ave" value={det.TipoAve} opciones={tiposAves} onChange={(v) => update('TipoAve', v)} />
            <NumOpc label="Cantidad" value={det.Cantidad} onChange={(v) => update('Cantidad', v)} />
        </div>
    )
}

function DetalleSimple({ det, update, razas, propositos, conChapeta = false }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <SelectOpc label="Raza" value={det.Raza} opciones={razas} onChange={(v) => update('Raza', v)} />
            <SelectOpc label="Propósito" value={det.Proposito} opciones={propositos} onChange={(v) => update('Proposito', v)} />
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
            <SelectOpc label="Productos apícolas" value={det.ProductosApicolas} opciones={productosApicolas} onChange={(v) => update('ProductosApicolas', v)} />
        </div>
    )
}

function SelectOpc({ label, value, opciones, onChange }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</label>
            <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}
                className="w-full px-2 py-1.5 rounded-md border border-[#015d3b] outline-none text-sm bg-white">
                <option value="">Seleccione...</option>
                {opciones.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
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

export default function SeccionPecuaria({ userId }) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [grupos, setGrupos] = useState([])
    const [propositos, setPropositos] = useState([])
    const [tiposAves, setTiposAves] = useState([])
    const [razas, setRazas] = useState([])
    const [productosApicolas, setProductosApicolas] = useState([])

    useEffect(() => {
        if (!userId) return
        let activo = true
        Promise.all([
            getInfoAnimal(userId), getGruposAnimales(), getPropositos(),
            getTiposAves(), getRazas(), getProductosApicolas(),
        ])
            .then(([data, g, prop, aves, raz, api]) => {
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
            .catch(() => { if (activo) setItems([]) })
            .finally(() => { if (activo) setLoading(false) })
        return () => { activo = false }
    }, [userId])

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

    const guardar = async () => {
        setGuardando(true)
        try {
            await saveInfoAnimal(userId, {
                Animales: items.filter((i) => i.GrupoAnimal && GRUPOS_CON_RAZA.includes(i.GrupoAnimal)),
            })
            Swal.fire({
                icon: 'success',
                title: 'Producción pecuaria guardada',
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

            <BotonGuardar onClick={guardar} guardando={guardando} texto="Guardar producción pecuaria" />
        </div>
    )
}