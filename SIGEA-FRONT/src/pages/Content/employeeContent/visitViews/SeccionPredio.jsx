import { useEffect, useState, forwardRef, useCallback, useImperativeHandle } from 'react'
import { Campo, CampoSelect, CampoSelectDinamico, CampoCheck } from './fields'
import {
    getInfoPredio, saveInfoPredio,
    getTiposTenencias, getSeguros, getVeredas, getSectores, getTiposRegistrosICA,
    crearSeguro, crearVereda, crearSector, crearRegistroICA,
} from '../../../../services/caracterizacionService'
import { useSeccion } from '../../../../hooks/useSeccion'
import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../../../../utils/agroConstants'

const INICIAL = {
    NombrePredio: '', AreaPredio: '', RegistroICA: '', Seguro: '',
    AccesoCredito: false, UsoSuelo: false, Latitud: '', Longitud: '',
    Direccion: '', TipoTenencia: '', Vereda: '', Sector: '',
}

const REQUERIDOS = [
    { nombre: 'NombrePredio', label: 'Nombre del predio' },
    { nombre: 'TipoTenencia', label: 'Tipo de tenencia' },
    { nombre: 'Direccion', label: 'Dirección' },
]

const normalizarNumero = (valor, decimales) => {
    if (valor === null || valor === undefined) return null
    const texto = String(valor).trim().replace(',', '.')
    if (texto === '') return null
    const numero = Number(texto)
    if (!Number.isFinite(numero)) return { error: `"${valor}" no es un número válido.` }
    return Number(numero.toFixed(decimales))
}

const SeccionPredio = forwardRef(({ userId, solicitudId }, ref) => {
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
                getInfoPredio(userId, solicitudId),
                getTiposTenencias(),
                getSeguros(),
                getVeredas(),
                getSectores(),
                getTiposRegistrosICA(),
            ])
            if (!activo) return
            setForm({ ...INICIAL, ...data })
            setTenencias(ten.map((t) => t.TipoTenencia))
            setSeguros(seg.map((s) => ({ id: s.id, texto: s.NombreSeguro })))
            setVeredas(ver.map((v) => ({ id: v.id, texto: v.NombreVereda })))
            setSectores(sec.map((s) => ({ id: s.id, texto: s.NombreSector })))
            setIcas(ica.map((i) => i.CodigoICA))
        })
        return () => { activo = false }
    }, [userId, solicitudId, cargarSeccion])

    const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

    const handleCrearSeguro = async (valor) => {
        const r = await crearSeguro(valor)
        setSeguros((prev) => [...prev, { id: r.id, texto: r.NombreSeguro }])
    }

    const handleCrearVereda = async (valor) => {
        const r = await crearVereda(valor)
        setVeredas((prev) => [...prev, { id: r.id, texto: r.NombreVereda }])
    }

    const handleCrearSector = async (valor) => {
        const veredaId = veredas.find((v) => v.texto === form.Vereda)?.id
        if (!veredaId) {
            Swal.fire({
                icon: 'warning',
                title: 'Vereda requerida',
                text: 'Primero seleccione o cree la vereda y luego defina el sector.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
            return
        }
        const r = await crearSector(valor, veredaId)
        setSectores((prev) => [...prev, { id: r.id, texto: r.NombreSector }])
    }

    const handleCrearRegistroICA = async (valor) => {
        const r = await crearRegistroICA(valor)
        setIcas((prev) => (prev.includes(r.CodigoICA) ? prev : [...prev, r.CodigoICA]))
    }

    const guardar = useCallback(async () => {
        const faltantes = REQUERIDOS
            .filter((r) => !String(form[r.nombre] ?? '').trim())
            .map((r) => r.label)
        if (faltantes.length) {
            return { ok: false, motivo: `Campos obligatorios: ${faltantes.join(', ')}.` }
        }
        const latitud = normalizarNumero(form.Latitud, 8)
        if (latitud?.error) return { ok: false, motivo: `Latitud: ${latitud.error}` }
        if (latitud !== null && (latitud < -90 || latitud > 90)) {
            return { ok: false, motivo: 'Latitud: debe estar entre -90 y 90.' }
        }
        const longitud = normalizarNumero(form.Longitud, 8)
        if (longitud?.error) return { ok: false, motivo: `Longitud: ${longitud.error}` }
        if (longitud !== null && (longitud < -180 || longitud > 180)) {
            return { ok: false, motivo: 'Longitud: debe estar entre -180 y 180.' }
        }
        const area = normalizarNumero(form.AreaPredio, 3)
        if (area?.error) return { ok: false, motivo: `Área: ${area.error}` }
        if (area !== null && area < 0) {
            return { ok: false, motivo: 'Área: no puede ser negativa.' }
        }
        const payload = {
            ...form,
            Latitud: latitud,
            Longitud: longitud,
            AreaPredio: area,
        }
        return guardarSeccion(() => saveInfoPredio(userId, solicitudId, payload))
    }, [form, userId, solicitudId, guardarSeccion])

    useImperativeHandle(ref, () => ({ guardar }))

    if (loading) return <p className="text-sm text-gray-500">Cargando información del predio...</p>

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Campo name="NombrePredio" label="Nombre del predio" value={form.NombrePredio} onChange={onChange} />
                <Campo name="AreaPredio" label="Área (ha)" type="number" value={form.AreaPredio} onChange={onChange} />
                <CampoSelect name="TipoTenencia" label="Tipo de tenencia" value={form.TipoTenencia} options={tenencias} onChange={onChange} />
                <CampoSelectDinamico name="Seguro" label="Seguro" value={form.Seguro} options={seguros.map((s) => s.texto)} onCrear={handleCrearSeguro} onChange={onChange} />
                <CampoSelectDinamico name="Vereda" label="Vereda" value={form.Vereda} options={veredas.map((v) => v.texto)} onCrear={handleCrearVereda} onChange={onChange} />
                <CampoSelectDinamico name="Sector" label="Sector" value={form.Sector} options={sectores.map((s) => s.texto)} onCrear={handleCrearSector} onChange={onChange} />
                <CampoSelectDinamico name="RegistroICA" label="Registro ICA" value={form.RegistroICA} options={icas} onCrear={handleCrearRegistroICA} onChange={onChange} />
                <Campo name="Latitud" label="Latitud" type="number" value={form.Latitud} onChange={onChange} />
                <Campo name="Longitud" label="Longitud" type="number" value={form.Longitud} onChange={onChange} />
                <Campo name="Direccion" label="Dirección" value={form.Direccion} onChange={onChange} />
            </div>

            <div className="flex gap-6">
                <CampoCheck name="AccesoCredito" label="Acceso a crédito" checked={form.AccesoCredito} onChange={onChange} />
                <CampoCheck name="UsoSuelo" label="Uso de suelo" checked={form.UsoSuelo} onChange={onChange} />
            </div>
        </div>
    )
})

export default SeccionPredio