import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Campo, CampoSelectDinamico, BotonGuardar } from './fields'
import {
    getInfoPersonal, saveInfoPersonal, getNivelesEducativos, getSisben,
} from '../../../../services/caracterizacionService'
import { AGRO_COLORS } from '../../../../utils/agroConstants'

const CAMPOS = [
    { name: 'PrimerNombreProductor', label: 'Primer nombre', requerido: true },
    { name: 'SegundoNombreProductor', label: 'Segundo nombre' },
    { name: 'PrimerApellidoProductor', label: 'Primer apellido', requerido: true },
    { name: 'SegundoApellidoProductor', label: 'Segundo apellido' },
    { name: 'DocumentoProductor', label: 'Documento', requerido: true },
    { name: 'RazonSocialProductor', label: 'Razón social' },
    { name: 'NitProductor', label: 'NIT' },
    { name: 'Celular', label: 'Celular', requerido: true },
    { name: 'Correo', label: 'Correo', requerido: true },
    { name: 'FechaNacimiento', label: 'Fecha de nacimiento', type: 'date', requerido: true },
]

const INICIAL = {
    PrimerNombreProductor: '', SegundoNombreProductor: '', PrimerApellidoProductor: '',
    SegundoApellidoProductor: '', DocumentoProductor: '', RazonSocialProductor: '',
    NitProductor: '', Celular: '', Correo: '', FechaNacimiento: '',
    NivelEducativo: '', Sisben: '', Edad: null, Rudea: null,
}

export default function SeccionProductor({ userId }) {
    const [form, setForm] = useState(INICIAL)
    const [loading, setLoading] = useState(true)
    const [guardando, setGuardando] = useState(false)
    const [niveles, setNiveles] = useState([])
    const [sisbenes, setSisbenes] = useState([])

    useEffect(() => {
        if (!userId) return
        let activo = true
        Promise.all([getInfoPersonal(userId), getNivelesEducativos(), getSisben()])
            .then(([data, niv, sis]) => {
                if (!activo) return
                setForm({ ...INICIAL, ...data })
                setNiveles(niv.map((n) => n.TipoNivelEducativo))
                setSisbenes(sis.map((s) => s.NivelSisben))
            })
            .catch(() => { if (activo) setForm(INICIAL) })
            .finally(() => { if (activo) setLoading(false) })
        return () => { activo = false }
    }, [userId])

    const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

    const validar = () => {
        const faltantes = CAMPOS
            .filter((c) => c.requerido && !String(form[c.name] ?? '').trim())
            .map((c) => c.label)
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
            await saveInfoPersonal(userId, form)
            Swal.fire({
                icon: 'success',
                title: 'Productor guardado',
                text: 'La información del productor se guardó correctamente.',
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

    if (loading) return <p className="text-sm text-gray-500">Cargando información del productor...</p>

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-500">
                Datos del productor que realizó la solicitud. Pre-cargados desde la base de datos.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CAMPOS.map((c) => (
                    <Campo
                        key={c.name}
                        name={c.name}
                        label={c.label}
                        type={c.type || 'text'}
                        value={form[c.name]}
                        onChange={onChange}
                        required={c.requerido}
                    />
                ))}
                <CampoSelectDinamico name="NivelEducativo" label="Nivel educativo" value={form.NivelEducativo}
                    options={niveles} permitirNuevo={false} placeholder="Seleccione..." onChange={onChange} />
                <CampoSelectDinamico name="Sisben" label="Sisbén" value={form.Sisben}
                    options={sisbenes} permitirNuevo={false} placeholder="Seleccione..." onChange={onChange} />
            </div>
            {form.Rudea && (
                <p className="text-sm text-gray-600"><strong>RUEA:</strong> {form.Rudea}</p>
            )}
            <BotonGuardar onClick={guardar} guardando={guardando} />
        </div>
    )
}