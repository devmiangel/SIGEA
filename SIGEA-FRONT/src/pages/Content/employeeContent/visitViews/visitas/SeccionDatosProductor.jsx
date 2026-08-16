import { Campo } from '../fields'

const CAMPOS = [
    { name: 'fecha_recepcion', label: 'Fecha de recepción', type: 'date', requerido: false },
    { name: 'nruea', label: 'Nº RUEA', requerido: false },
    { name: 'nombres_apellidos', label: 'Nombres y apellidos', requerido: true },
    { name: 'sisben', label: 'Sisbén', requerido: false },
    { name: 'documento_identidad', label: 'Documento de identidad', requerido: true },
    { name: 'vereda_sector', label: 'Vereda / Sector', requerido: false },
    { name: 'telefono', label: 'Teléfono', requerido: false },
]

export default function SeccionDatosProductor({ form, onChange }) {
    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-500">
                Datos del usuario o productor. Se cargan automáticamente desde la base de datos.
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
                        disabled
                    />
                ))}
            </div>
        </div>
    )
}
