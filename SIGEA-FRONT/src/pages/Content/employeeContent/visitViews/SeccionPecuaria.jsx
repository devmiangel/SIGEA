import { useEffect, useState, forwardRef, useCallback, useImperativeHandle, useId } from 'react'
import CreatableSelect from 'react-select/creatable'
import { CampoSelect, CampoSelectDinamico } from './fields'
import {
    getInfoAnimal, saveInfoAnimal, getGruposAnimales, getPropositos,
    getTiposAves, getRazas, getRazasPorGrupo, getProductosApicolas,
    crearProposito, crearTipoAve, crearProductoApicola, crearRaza,
} from '../../../../services/caracterizacionService'
import { useSeccion } from '../../../../hooks/useSeccion'

const GRUPOS_MULTI_RAZA = ['Porcinos', 'Equinos', 'Caprinos', 'Ovinos', 'Conejos', 'Curies', 'Peces', 'Abejas']
const PROPOSITOS_BOVINOS = ['Leche', 'Carne', 'Doble Propósito']

const selectStyles = {
    control: (base) => ({
        ...base,
        minHeight: '34px',
        borderColor: '#015d3b',
        borderRadius: '0.375rem',
        boxShadow: 'none',
        fontSize: '0.875rem',
        '&:hover': { borderColor: '#015d3b' },
    }),
    valueContainer: (base) => ({ ...base, padding: '2px 8px' }),
    input: (base) => ({ ...base, margin: 0, padding: 0 }),
    multiValue: (base) => ({ ...base, fontSize: '0.75rem' }),
    menu: (base) => ({ ...base, zIndex: 40 }),
}

function SelectOpc({ label, value, opciones, onChange, onCrear }) {
    return (
        <CampoSelectDinamico label={label} name={label} value={value ?? ''}
            options={opciones} onCrear={onCrear} compact
            onChange={(n, v) => onChange(v)} />
    )
}

function SelectGrupo({ value, opciones, onChange }) {
    return (
        <CampoSelect label="Grupo animal" name="GrupoAnimal" value={value ?? ''} options={opciones}
            onChange={(n, v) => onChange(v)} />
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

function RadioProposito({ value, onChange }) {
    const uid = useId()
    return (
        <div className="flex flex-wrap items-center gap-4">
            {PROPOSITOS_BOVINOS.map((op) => (
                <label key={op} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input type="radio" name={uid} value={op} checked={value === op}
                        onChange={() => onChange(op)} className="w-4 h-4 accent-[#015d3b]" />
                    {op}
                </label>
            ))}
        </div>
    )
}

function RazasDetalle({ it, propositos, productosApicolas, onCreateProposito, onCreateProductoApicola, onUpdateRaza, onUpdateDetalle }) {
    const g = it.GrupoAnimal
    return (
        <div className="flex flex-col gap-2">
            {(it.Razas || []).map((raza, j) => (
                <div key={j} className="border border-gray-100 rounded-md bg-gray-50 p-3 flex flex-col gap-2">
                    <div className="text-xs font-semibold text-[#015d3b] uppercase tracking-wide">
                        {g === 'Bovinos' ? 'Raza predominante' : 'Raza'}: {raza.Raza || '(seleccione o cree la raza)'}
                    </div>
                    {g === 'Bovinos' ? (
                        <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-2">
                                <NumOpc label="Número de machos" value={raza.Detalles?.Machos} onChange={(v) => onUpdateDetalle(j, 'Machos', v)} />
                                <NumOpc label="Número de hembras" value={raza.Detalles?.Hembras} onChange={(v) => onUpdateDetalle(j, 'Hembras', v)} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Propósito</label>
                                <RadioProposito value={raza.Detalles?.Proposito} onChange={(v) => onUpdateDetalle(j, 'Proposito', v)} />
                            </div>
                            <TextOpc label="RUV" value={raza.Detalles?.RUV} onChange={(v) => onUpdateDetalle(j, 'RUV', v)} />
                        </div>
                    ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <NumOpc label="Cantidad" value={raza.Cantidad} onChange={(v) => onUpdateRaza(j, 'Cantidad', v)} />
                        {['Porcinos', 'Equinos', 'Caprinos', 'Ovinos', 'Conejos', 'Curies'].includes(g) && <>
                            <SelectOpc label="Propósito" value={raza.Detalles?.Proposito} opciones={propositos}
                                onCrear={onCreateProposito} onChange={(v) => onUpdateDetalle(j, 'Proposito', v)} />
                            {g === 'Porcinos' && (
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input type="checkbox" checked={!!raza.Detalles?.Chapeta}
                                        onChange={(e) => onUpdateDetalle(j, 'Chapeta', e.target.checked)}
                                        className="w-4 h-4 accent-[#015d3b]" />
                                    Chapeta
                                </label>
                            )}
                        </>}
                        {g === 'Peces' && (
                            <NumOpc label="Estanques" value={raza.Detalles?.Estanques} onChange={(v) => onUpdateDetalle(j, 'Estanques', v)} />
                        )}
                        {g === 'Abejas' && (
                            <SelectOpc label="Productos apícolas" value={raza.Detalles?.ProductosApicolas} opciones={productosApicolas}
                                onCrear={onCreateProductoApicola} onChange={(v) => onUpdateDetalle(j, 'ProductosApicolas', v)} />
                        )}
                    </div>
                    )}
                </div>
            ))}
        </div>
    )
}

function DetalleAves({ det, update, tiposAves, onCreateTipoAve }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-end gap-2">
                <div className="flex-1">
                    <NumOpc label="Gallinas" value={det.Gallinas} onChange={(v) => update('Gallinas', v)} />
                </div>
                <div className="flex-1">
                    <SelectOpc label="Tipo" value={det.TipoGallina} opciones={tiposAves} onCrear={onCreateTipoAve}
                        onChange={(v) => update('TipoGallina', v)} />
                </div>
            </div>
            <NumOpc label="Pollos" value={det.Pollos} onChange={(v) => update('Pollos', v)} />
            <NumOpc label="Patos" value={det.Patos} onChange={(v) => update('Patos', v)} />
            <NumOpc label="Codornices" value={det.Codornices} onChange={(v) => update('Codornices', v)} />
            <div className="flex items-end gap-2">
                <div className="flex-1">
                    <NumOpc label="Otro tipo de aves" value={det.Otros} onChange={(v) => update('Otros', v)} />
                </div>
                <div className="flex-1">
                    <SelectOpc label="Tipo" value={det.TipoOtros} opciones={tiposAves} onCrear={onCreateTipoAve}
                        onChange={(v) => update('TipoOtros', v)} />
                </div>
            </div>
        </div>
    )
}

const AVES_CAMPOS = ['Gallinas', 'Pollos', 'Patos', 'Codornices', 'Otros']

function totalAves(d = {}) {
    return AVES_CAMPOS.reduce((s, k) => s + (Number(d[k]) || 0), 0)
}

const SeccionPecuaria = forwardRef(({ userId, solicitudId }, ref) => {
    const [items, setItems] = useState([])
    const [grupos, setGrupos] = useState([])
    const [propositos, setPropositos] = useState([])
    const [tiposAves, setTiposAves] = useState([])
    const [razasGlobales, setRazasGlobales] = useState([])
    const [razasPorGrupo, setRazasPorGrupo] = useState({})
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
            const inicial = (data?.Animales || []).map((a) => {
                if (a.Razas) {
                    return {
                        GrupoAnimal: a.GrupoAnimal,
                        Razas: (a.Razas || []).map((r) => ({ Raza: r.Raza, Cantidad: r.Cantidad ?? '', Detalles: r.Detalles || {} })),
                    }
                }
                return { GrupoAnimal: a.GrupoAnimal, CantidadTotal: a.CantidadTotal, Detalles: a.Detalles || {} }
            })
            setItems(inicial)
            setGrupos(g.map((x) => ({ id: x.id, name: x.GrupoAnimal })))
            setPropositos(prop.map((x) => x.Proposito))
            setTiposAves(aves.map((x) => x.TipoAve))
            setRazasGlobales(raz.map((x) => x.Raza))
            setProductosApicolas(api.map((x) => x.ProductoApicolas))

            const opcionesPorGrupo = {}
            await Promise.all(g.map(async (gr) => {
                const rp = await getRazasPorGrupo(gr.id)
                opcionesPorGrupo[gr.GrupoAnimal] = rp.map((r) => ({ value: r.Raza, label: r.Raza }))
            }))
            if (!activo) return
            setRazasPorGrupo(opcionesPorGrupo)
        })
        return () => { activo = false }
    }, [userId, solicitudId, cargarSeccion])

    const updateItem = (idx, campo, value) => {
        setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, [campo]: value } : it)))
    }

    const updateDetalleAve = (idx, campo, value) => {
        setItems((arr) => arr.map((it, i) =>
            i === idx ? { ...it, Detalles: { ...(it.Detalles || {}), [campo]: value } } : it))
    }

    const updateRaza = (idx, razaIdx, campo, value) => {
        setItems((arr) => arr.map((it, i) => i === idx
            ? { ...it, Razas: it.Razas.map((r, j) => (j === razaIdx ? { ...r, [campo]: value } : r)) }
            : it))
    }

    const updateDetalle = (idx, razaIdx, campo, value) => {
        setItems((arr) => arr.map((it, i) => i === idx
            ? { ...it, Razas: it.Razas.map((r, j) => (j === razaIdx ? { ...r, Detalles: { ...(r.Detalles || {}), [campo]: value } } : r)) }
            : it))
    }

    const seleccionarRazas = (idx, lista) => {
        const arr = Array.isArray(lista) ? lista : (lista ? [lista] : [])
        setItems((current) => current.map((it, i) => {
            if (i !== idx) return it
            const nuevos = arr.map((op) => {
                const prev = (it.Razas || []).find((r) => r.Raza === op.value)
                return prev ? { ...prev, Raza: op.value } : { Raza: op.value, Cantidad: '', Detalles: {} }
            })
            return { ...it, Razas: nuevos }
        }))
    }

    const crearRazaYSeleccionar = async (idx, grupo, nombre) => {
        const gr = grupos.find((x) => x.name === grupo)
        let op
        try {
            const r = await crearRaza(nombre, gr?.id)
            op = { value: r.Raza || nombre, label: r.Raza || nombre }
        } catch {
            const existente = razasGlobales.find((rz) => rz.toLowerCase() === nombre.toLowerCase())
            op = { value: existente || nombre, label: existente || nombre }
        }
        setRazasPorGrupo((prev) => ({
            ...prev,
            [grupo]: [...(prev[grupo] || []).filter((o) => o.value !== op.value), op],
        }))
        setItems((arr) => arr.map((it, i) => {
            if (i !== idx) return it
            const actuales = it.Razas || []
            if (actuales.some((raza) => raza.Raza === op.value)) return it
            return { ...it, Razas: [...actuales, { Raza: op.value, Cantidad: '', Detalles: {} }] }
        }))
    }

    const cambiarGrupo = async (idx, valor) => {
        setItems((arr) => arr.map((it, i) => (i === idx ? {
            ...it, GrupoAnimal: valor, Razas: [], CantidadTotal: '', Detalles: {},
        } : it)))
        if (!razasPorGrupo[valor]) {
            const gr = grupos.find((x) => x.name === valor)
            if (gr) {
                const rp = await getRazasPorGrupo(gr.id)
                setRazasPorGrupo((prev) => ({
                    ...prev,
                    [valor]: rp.map((r) => ({ value: r.Raza, label: r.Raza })),
                }))
            }
        }
    }

    const agregar = () => setItems((arr) => [...arr, { GrupoAnimal: '', Razas: [], CantidadTotal: '', Detalles: {} }])
    const eliminar = (idx) => setItems((arr) => arr.filter((_, i) => i !== idx))

    const handleCrearProposito = async (valor) => {
        const r = await crearProposito(valor)
        setPropositos((prev) => [...prev, r.Proposito])
    }

    const handleCrearTipoAve = async (valor) => {
        const r = await crearTipoAve(valor)
        setTiposAves((prev) => [...prev, r.TipoAve])
    }

    const handleCrearProductoApicola = async (valor) => {
        const r = await crearProductoApicola(valor)
        setProductosApicolas((prev) => [...prev, r.ProductoApicolas])
    }

    const guardar = useCallback(async () => {
        return guardarSeccion(() => saveInfoAnimal(userId, solicitudId, {
            Animales: items
                .filter((i) => i.GrupoAnimal)
                .map((i) => {
                    if (i.GrupoAnimal === 'Aves') {
                        const d = i.Detalles || {}
                        return { GrupoAnimal: i.GrupoAnimal, CantidadTotal: totalAves(d), Detalles: d }
                    }
                    const razas = (i.Razas || [])
                        .map((r) => i.GrupoAnimal === 'Bovinos'
                            ? { ...r, Cantidad: (Number(r.Detalles?.Machos) || 0) + (Number(r.Detalles?.Hembras) || 0) }
                            : r)
                        .filter((r) => r.Raza)
                    return { GrupoAnimal: i.GrupoAnimal, Razas: razas }
                })
                .filter((i) => i.GrupoAnimal === 'Aves'
                    ? Boolean(i.CantidadTotal)
                    : (i.Razas && i.Razas.length > 0)),
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
                            <SelectGrupo value={it.GrupoAnimal} opciones={grupos.map((x) => x.name)}
                                onChange={(v) => cambiarGrupo(idx, v)} />
                            {it.GrupoAnimal === 'Aves' && (
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Total de aves</label>
                                    <div className="px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700">
                                        {totalAves(it.Detalles)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {it.GrupoAnimal !== 'Aves' && it.GrupoAnimal && (
                            <>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Razas</label>
                                    <CreatableSelect
                                        isMulti={GRUPOS_MULTI_RAZA.includes(it.GrupoAnimal)}
                                        options={razasPorGrupo[it.GrupoAnimal] || []}
                                        value={(it.Razas || []).map((r) => ({ value: r.Raza, label: r.Raza }))}
                                        onChange={(val) => seleccionarRazas(idx, val)}
                                        onCreateOption={(nombre) => crearRazaYSeleccionar(idx, it.GrupoAnimal, nombre)}
                                        placeholder={it.GrupoAnimal === 'Bovinos'
                                            ? 'Seleccione la raza predominante...'
                                            : 'Seleccione o cree las razas...'}
                                        styles={selectStyles}
                                        noOptionsMessage={() => 'Escriba para crear una raza'}
                                    />
                                </div>
                                <RazasDetalle it={it} propositos={propositos} productosApicolas={productosApicolas}
                                    onCreateProposito={handleCrearProposito} onCreateProductoApicola={handleCrearProductoApicola}
                                    onUpdateRaza={(j, c, v) => updateRaza(idx, j, c, v)}
                                    onUpdateDetalle={(j, c, v) => updateDetalle(idx, j, c, v)} />
                            </>
                        )}

                        {it.GrupoAnimal === 'Aves' && (
                            <DetalleAves det={it.Detalles || {}} update={(c, v) => updateDetalleAve(idx, c, v)}
                                tiposAves={tiposAves} onCreateTipoAve={handleCrearTipoAve} />
                        )}

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