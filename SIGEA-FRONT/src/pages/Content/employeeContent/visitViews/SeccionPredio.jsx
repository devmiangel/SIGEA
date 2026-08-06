import { useEffect, useState, forwardRef, useCallback, useImperativeHandle } from 'react'
import { Campo, CampoSelect, CampoSelectDinamico, CampoCheck } from './fields'
import {
    getInfoPredio, saveInfoPredio,
    getTiposTenencias, getSeguros, getVeredas, getSectores, getTiposRegistrosICA,
    crearSeguro, crearVereda, crearSector,
} from '../../../../services/caracterizacionService'
import { useSeccion } from '../../../../hooks/useSeccion'

const INICIAL = {
    NombrePredio: '', AreaPredio: '', RegistroICA: [], Seguro: '',
    AccesoCredito: false, UsoSuelo: false, Latitud: '', Longitud: '',
    Direccion: '', TipoTenencia: '', Vereda: '', Sector: '',
}

const REQUERIDOS = [
    { nombre: 'NombrePredio', label: 'Nombre del predio' },
    { nombre: 'TipoTenencia', label: 'Tipo de tenencia' },
    { nombre: 'Direccion', label: 'Dirección' },
]

const SeccionPredio = forwardRef(({ userId }, ref) => {
    const [form, setForm] = useState(INICIAL)
    const [tenencias, setTenencias] = useState([])
    const [seguros, setSeguros] = useState([])
    const [veredas, setVeredas] = useState([])
    const [sectores, setSectores] = useState([])
    const [icas, setIcas] = useState([])
    const { loading, cargarSeccion, guardarSeccion } = useSeccion()

    useEffect(() => {
        if (!userId) return
        let activo = true
        cargarSeccion(async () => {
            const [data, ten, seg, ver, sec, ica] = await Promise.all([
                getInfoPredio(userId),
                getTiposTenencias(),
                getSeguros(),
                getVeredas(),
                getSectores(),
                getTiposRegistrosICA(),
            ])
            if (!activo) return
            setForm({ ...INICIAL, ...data })
            setTenencias(ten.map((t) => t.TipoTenencia))
            setSeguros(seg.map((s) => s.NombreSeguro))
            setVeredas(ver.map((v) => v.NombreVereda))
            setSectores(sec.map((s) => s.NombreSector))
            setIcas(ica.map((i) => i.CodigoICA))
        })
        return () => { activo = false }
    }, [userId, cargarSeccion])

    const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

    const toggleICA = (codigo) => {
        setForm((f) => {
            const actuales = f.RegistroICA || []
            const existe = actuales.includes(codigo)
            return {
                ...f,
                RegistroICA: existe ? actuales.filter((c) => c !== codigo) : [...actuales, codigo],
            }
        })
    }

    const guardar = useCallback(async () => {
        const faltantes = REQUERIDOS
            .filter((r) => !String(form[r.nombre] ?? '').trim())
            .map((r) => r.label)
        if (faltantes.length) {
            return { ok: false, motivo: `Campos obligatorios: ${faltantes.join(', ')}.` }
        }
        return guardarSeccion(() => saveInfoPredio(userId, form))
    }, [form, userId, guardarSeccion])

    useImperativeHandle(ref, () => ({ guardar }))

    if (loading) return <p className="text-sm text-gray-500">Cargando información del predio...</p>

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Campo name="NombrePredio" label="Nombre del predio" value={form.NombrePredio} onChange={onChange} />
                <Campo name="AreaPredio" label="Área (ha)" type="number" value={form.AreaPredio} onChange={onChange} />
                <CampoSelect name="TipoTenencia" label="Tipo de tenencia" value={form.TipoTenencia} options={tenencias} onChange={onChange} />
                <CampoSelectDinamico name="Seguro" label="Seguro" value={form.Seguro} options={seguros} onCrear={crearSeguro} onChange={onChange} />
                <CampoSelectDinamico name="Vereda" label="Vereda" value={form.Vereda} options={veredas} onCrear={crearVereda} onChange={onChange} />
                <CampoSelectDinamico name="Sector" label="Sector" value={form.Sector} options={sectores} onCrear={crearSector} onChange={onChange} />
                <Campo name="Latitud" label="Latitud" type="number" value={form.Latitud} onChange={onChange} />
                <Campo name="Longitud" label="Longitud" type="number" value={form.Longitud} onChange={onChange} />
                <Campo name="Direccion" label="Dirección" value={form.Direccion} onChange={onChange} />
            </div>

            <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Registros ICA</span>
                <div className="flex flex-wrap gap-3">
                    {icas.map((codigo) => (
                        <label key={codigo} className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={(form.RegistroICA || []).includes(codigo)}
                                onChange={() => toggleICA(codigo)}
                                className="w-4 h-4 accent-[#015d3b]"
                            />
                            <span className="text-sm text-gray-700">{codigo}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex gap-6">
                <CampoCheck name="AccesoCredito" label="Acceso a crédito" checked={form.AccesoCredito} onChange={onChange} />
                <CampoCheck name="UsoSuelo" label="Uso de suelo" checked={form.UsoSuelo} onChange={onChange} />
            </div>
        </div>
    )
})

export default SeccionPredio