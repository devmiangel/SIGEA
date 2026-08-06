import { useEffect, useState, forwardRef, useCallback, useImperativeHandle } from 'react'
import { Campo, CampoSelectDinamico } from './fields'
import {
    getInfoPersonal, saveInfoPersonal, getNivelesEducativos, getSisben,
} from '../../../../services/caracterizacionService'
import { useSeccion } from '../../../../hooks/useSeccion'

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

const SeccionProductor = forwardRef(({ userId }, ref) => {
    const [form, setForm] = useState(INICIAL)
    const [niveles, setNiveles] = useState([])
    const [sisbenes, setSisbenes] = useState([])
    const { loading, cargarSeccion, guardarSeccion } = useSeccion()

    useEffect(() => {
        if (!userId) return
        let activo = true
        cargarSeccion(async () => {
            const [data, niv, sis] = await Promise.all([getInfoPersonal(userId), getNivelesEducativos(), getSisben()])
            if (!activo) return
            setForm({ ...INICIAL, ...data })
            setNiveles(niv.map((n) => n.TipoNivelEducativo))
            setSisbenes(sis.map((s) => s.NivelSisben))
        })
        return () => { activo = false }
    }, [userId, cargarSeccion])

    const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

    const guardar = useCallback(async () => {
        const faltantes = CAMPOS
            .filter((c) => c.requerido && !String(form[c.name] ?? '').trim())
            .map((c) => c.label)
        if (faltantes.length) {
            return { ok: false, motivo: `Campos obligatorios: ${faltantes.join(', ')}.` }
        }
        return guardarSeccion(() => saveInfoPersonal(userId, form))
    }, [form, userId, guardarSeccion])

    useImperativeHandle(ref, () => ({ guardar }))

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
        </div>
    )
})

export default SeccionProductor