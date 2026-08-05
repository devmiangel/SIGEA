import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { Campo, CampoCheck, BotonGuardar } from './fields'
import { getInfoPersonal, saveInfoPersonal } from '../../../../services/caracterizacionService'
import { AGRO_COLORS } from '../../../../utils/agroConstants'

const CAMPOS = [
    { name: 'PrimerNombreProductor', label: 'Primer nombre' },
    { name: 'SegundoNombreProductor', label: 'Segundo nombre' },
    { name: 'PrimerApellidoProductor', label: 'Primer apellido' },
    { name: 'SegundoApellidoProductor', label: 'Segundo apellido' },
    { name: 'DocumentoProductor', label: 'Documento' },
    { name: 'RazonSocialProductor', label: 'Razón social' },
    { name: 'NitProductor', label: 'NIT' },
    { name: 'Celular', label: 'Celular' },
    { name: 'Correo', label: 'Correo' },
    { name: 'FechaNacimiento', label: 'Fecha de nacimiento', type: 'date' },
    { name: 'NivelEducativo', label: 'Nivel educativo' },
    { name: 'Sisben', label: 'Sisbén' },
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

    useEffect(() => {
        if (!userId) return
        let activo = true
        getInfoPersonal(userId)
            .then((data) => { if (activo) setForm({ ...INICIAL, ...data }) })
            .catch(() => { if (activo) setForm(INICIAL) })
            .finally(() => { if (activo) setLoading(false) })
        return () => { activo = false }
    }, [userId])

    const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

    const guardar = async () => {
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
                    />
                ))}
            </div>
            {form.Rudea && (
                <p className="text-sm text-gray-600"><strong>RUEA:</strong> {form.Rudea}</p>
            )}
            <BotonGuardar onClick={guardar} guardando={guardando} />
        </div>
    )
}
