import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Campo, CampoSelect, CampoCheck, BotonGuardar } from './fields'
import {
    getInfoUP, saveInfoUP, getTiposUP, getActividadesUP,
} from '../../../../services/caracterizacionService'
import { AGRO_COLORS } from '../../../../utils/agroConstants'

const INICIAL = {
    TipoUP_Nombre: '', ActividadUP: '', NumeroEmpleados: '', Asociatividad: false,
    AreaCultivada: '', AreaPastos: '', NumeroPotreros: '', NumeroInvernaderos: '',
    NumeroTanques: '', NumeroReservorios: '', FuentesAgua: false,
}

export default function SeccionUP({ userId }) {
    const [form, setForm] = useState(INICIAL)
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [tipos, setTipos] = useState([])
    const [actividades, setActividades] = useState([])

    useEffect(() => {
        if (!userId) return
        let activo = true
        Promise.all([getInfoUP(userId), getTiposUP(), getActividadesUP()])
            .then(([data, t, a]) => {
                if (!activo) return
                setForm({ ...INICIAL, ...data })
                setTipos(t.map((x) => x.TipoUP))
                setActividades(a.map((x) => x.Actividad))
            })
            .catch(() => { if (activo) setForm(INICIAL) })
            .finally(() => { if (activo) setLoading(false) })
        return () => { activo = false }
    }, [userId])

    const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

    const guardar = async () => {
        setGuardando(true)
        try {
            await saveInfoUP(userId, form)
            Swal.fire({
                icon: 'success',
                title: 'UP guardada',
                text: 'La información de la unidad productiva se guardó correctamente.',
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

    if (loading) return <p className="text-sm text-gray-500">Cargando información de la UP...</p>

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <CampoSelect name="TipoUP_Nombre" label="Tipo de UP" value={form.TipoUP_Nombre} options={tipos} onChange={onChange} />
                <CampoSelect name="ActividadUP" label="Actividad de la UP" value={form.ActividadUP} options={actividades} onChange={onChange} />
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

            <BotonGuardar onClick={guardar} guardando={guardando} />
        </div>
    )
}
