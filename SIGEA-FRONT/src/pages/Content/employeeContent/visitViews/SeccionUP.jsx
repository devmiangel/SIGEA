import { useEffect, useState, forwardRef, useCallback, useImperativeHandle } from 'react'
import { Campo, CampoSelect, CampoSelectDinamico, CampoCheck } from './fields'
import {
    getInfoUP, saveInfoUP, getTiposUP, getActividadesUP, crearActividadUP,
} from '../../../../services/caracterizacionService'
import { useSeccion } from '../../../../hooks/useSeccion'

const INICIAL = {
    TipoUP_Nombre: '', ActividadUP: '', RUEA: '', NumeroEmpleados: '', Asociatividad: false,
    AreaCultivada: '', AreaPastos: '', NumeroPotreros: '', NumeroInvernaderos: '',
    NumeroTanques: '', NumeroReservorios: '', FuentesAgua: false,
}

const REQUERIDOS = [
    { nombre: 'TipoUP_Nombre', label: 'Tipo de UP' },
    { nombre: 'ActividadUP', label: 'Actividad de la UP' },
    { nombre: 'NumeroEmpleados', label: 'Número de empleados' },
    { nombre: 'RUEA', label: 'RUEA' },
]

const SeccionUP = forwardRef(({ userId, solicitudId }, ref) => {
    const [form, setForm] = useState(INICIAL)
    const [tipos, setTipos] = useState([])
    const [actividades, setActividades] = useState([])
    const { loading, cargarSeccion, guardarSeccion } = useSeccion()

    useEffect(() => {
        if (!userId) return
        let activo = true
        cargarSeccion(async () => {
            const [data, t, a] = await Promise.all([getInfoUP(userId, solicitudId), getTiposUP(), getActividadesUP()])
            if (!activo) return
            setForm({ ...INICIAL, ...data })
            setTipos(t.map((x) => x.TipoUP))
            setActividades(a.map((x) => ({ id: x.id, texto: x.Actividad })))
        })
        return () => { activo = false }
    }, [userId, solicitudId, cargarSeccion])

    const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

    const handleCrearActividad = async (valor) => {
        const r = await crearActividadUP(valor)
        setActividades((prev) => [...prev, { id: r.id, texto: r.Actividad }])
    }

    const guardar = useCallback(async () => {
        const faltantes = REQUERIDOS
            .filter((r) => !String(form[r.nombre] ?? '').trim())
            .map((r) => r.label)
        if (faltantes.length) {
            return { ok: false, motivo: `Campos obligatorios: ${faltantes.join(', ')}.` }
        }
        return guardarSeccion(() => saveInfoUP(userId, solicitudId, form))
    }, [form, userId, solicitudId, guardarSeccion])

    useImperativeHandle(ref, () => ({ guardar }))

    if (loading) return <p className="text-sm text-gray-500">Cargando información de la UP...</p>

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <CampoSelect name="TipoUP_Nombre" label="Tipo de UP" value={form.TipoUP_Nombre} options={tipos} onChange={onChange} />
                <CampoSelectDinamico name="ActividadUP" label="Actividad de la UP" value={form.ActividadUP} options={actividades.map((a) => a.texto)} onCrear={handleCrearActividad} onChange={onChange} />
                <Campo name="RUEA" label="RUEA" value={form.RUEA} onChange={onChange} />
                <Campo name="NumeroEmpleados" label="Número de empleados" type="number" value={form.NumeroEmpleados} onChange={onChange} />
                <Campo name="AreaCultivada" label="Área cultivada (ha)" type="number" value={form.AreaCultivada} onChange={onChange} />
                <Campo name="AreaPastos" label="Área en pastos (ha)" type="number" value={form.AreaPastos} onChange={onChange} />
                <Campo name="NumeroPotreros" label="Número de potreros" type="number" value={form.NumeroPotreros} onChange={onChange} />
                <Campo name="NumeroInvernaderos" label="Número de invernaderos" type="number" value={form.NumeroInvernaderos} onChange={onChange} />
                <Campo name="NumeroTanques" label="Número de tanques" type="number" value={form.NumeroTanques} onChange={onChange} />
                <Campo name="NumeroReservorios" label="Número de reservorios" type="number" value={form.NumeroReservorios} onChange={onChange} />
            </div>

            <div className="flex gap-6">
                <CampoCheck name="Asociatividad" label="Asociatividad" checked={form.Asociatividad} onChange={onChange} />
                <CampoCheck name="FuentesAgua" label="Fuentes de agua" checked={form.FuentesAgua} onChange={onChange} />
            </div>
        </div>
    )
})

export default SeccionUP