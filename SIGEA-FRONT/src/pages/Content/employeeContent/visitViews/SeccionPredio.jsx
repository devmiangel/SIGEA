import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Campo, CampoSelect, CampoSelectDinamico, CampoCheck, BotonGuardar } from './fields'
import {
    getInfoPredio, saveInfoPredio,
    getTiposTenencias, getSeguros, getVeredas, getSectores, getTiposRegistrosICA,
    crearSeguro, crearVereda, crearSector,
} from '../../../../services/caracterizacionService'
import { AGRO_COLORS } from '../../../../utils/agroConstants'

const INICIAL = {
    NombrePredio: '', AreaPredio: '', RegistroICA: [], Seguro: '',
    AccesoCredito: false, UsoSuelo: false, Latitud: '', Longitud: '',
    Direccion: '', TipoTenencia: '', Vereda: '', Sector: '',
}

export default function SeccionPredio({ userId }) {
    const [form, setForm] = useState(INICIAL)
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [tenencias, setTenencias] = useState([])
    const [seguros, setSeguros] = useState([])
    const [veredas, setVeredas] = useState([])
    const [sectores, setSectores] = useState([])
    const [icas, setIcas] = useState([])

    useEffect(() => {
        if (!userId) return
        let activo = true
        Promise.all([
            getInfoPredio(userId),
            getTiposTenencias(),
            getSeguros(),
            getVeredas(),
            getSectores(),
            getTiposRegistrosICA(),
        ])
            .then(([data, ten, seg, ver, sec, ica]) => {
                if (!activo) return
                setForm({ ...INICIAL, ...data })
                setTenencias(ten.map((t) => t.TipoTenencia))
                setSeguros(seg.map((s) => s.NombreSeguro))
                setVeredas(ver.map((v) => v.NombreVereda))
                setSectores(sec.map((s) => s.NombreSector))
                setIcas(ica.map((i) => i.CodigoICA))
            })
            .catch(() => { if (activo) setForm(INICIAL) })
            .finally(() => { if (activo) setLoading(false) })
        return () => { activo = false }
    }, [userId])

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

    const REQUERIDOS = [
        { nombre: 'NombrePredio', label: 'Nombre del predio' },
        { nombre: 'TipoTenencia', label: 'Tipo de tenencia' },
        { nombre: 'Direccion', label: 'Dirección' },
    ]

    const validar = () => {
        const faltantes = REQUERIDOS
            .filter((r) => !String(form[r.nombre] ?? '').trim())
            .map((r) => r.label)
        if (faltantes.length) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos obligatorios',
                html: `Faltan: <strong>${faltantes.join(', ')}</strong>`,
                confirmButtonColor: AGRO_COLORS.success,
            })
            return false
        }
        return true
    }

    const guardar = async () => {
        if (!validar()) return
        setGuardando(true)
        try {
            await saveInfoPredio(userId, form)
            Swal.fire({
                icon: 'success',
                title: 'Predio guardado',
                text: 'La información del predio se guardó correctamente.',
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

            <BotonGuardar onClick={guardar} guardando={guardando} />
        </div>
    )
}
