const TIPOS = [
    { value: 'agricola', label: 'Agrícola' },
    { value: 'pecuaria', label: 'Pecuaria' },
    { value: 'proteccion_animal', label: 'Protección Animal' },
]

const inputClase = "w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white"
const labelClase = "text-xs font-semibold uppercase tracking-wide text-gray-500"

export default function SeccionDescripcion({ form, onChange }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <label className={labelClase}>Tipo de visita</label>
                <div className="flex gap-4">
                    {TIPOS.map((t) => (
                        <label key={t.value} className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                            <input
                                type="radio"
                                name="tipo_visita"
                                value={t.value}
                                checked={form.tipo_visita === t.value}
                                onChange={(e) => onChange('tipo_visita', e.target.value)}
                                className="accent-[#015d3b]"
                            />
                            {t.label}
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className={labelClase}>Descripción de la solicitud</label>
                <textarea
                    name="descripcion_solicitud"
                    value={form.descripcion_solicitud ?? ''}
                    onChange={(e) => onChange('descripcion_solicitud', e.target.value)}
                    rows={6}
                    placeholder="Describa la solicitud del productor"
                    className={inputClase}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className={labelClase}>Diagnóstico presuntivo</label>
                    <input
                        name="diagnostico_presuntivo"
                        type="text"
                        value={form.diagnostico_presuntivo ?? ''}
                        onChange={(e) => onChange('diagnostico_presuntivo', e.target.value)}
                        className={inputClase}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className={labelClase}>Fecha de visita</label>
                    <input
                        name="fecha_visita"
                        type="datetime-local"
                        required
                        value={form.fecha_visita ?? ''}
                        onChange={(e) => onChange('fecha_visita', e.target.value)}
                        className={inputClase}
                    />
                </div>
            </div>
        </div>
    )
}