const ACCIONES = [
    { value: 'seg_control', label: 'Seg. y Control' },
    { value: 'trat_medico', label: 'Trat. Médico' },
    { value: 'visita', label: 'Visita' },
    { value: 'insumos', label: 'Insumos' },
    { value: 'recomendacion', label: 'Recomendación' },
    { value: 'manejo', label: 'Manejo' },
    { value: 'cirugia', label: 'Cirugía' },
]

const CALIFICACIONES = [
    { value: 'malo', label: 'Malo' },
    { value: 'regular', label: 'Regular' },
    { value: 'bueno', label: 'Bueno' },
    { value: 'excelente', label: 'Excelente' },
]

const inputClase = "w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white"
const labelClase = "text-xs font-semibold uppercase tracking-wide text-gray-500"

const toggleAccion = (form, onChange, valor) => {
    const actual = form.acciones ?? []
    const existe = actual.includes(valor)
    onChange('acciones', existe ? actual.filter((a) => a !== valor) : [...actual, valor])
}

export default function SeccionAccion({ form, onChange }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className={labelClase}>Funcionario que atiende la visita</label>
                    <input
                        name="funcionario"
                        type="text"
                        value={form.funcionario ?? ''}
                        onChange={(e) => onChange('funcionario', e.target.value)}
                        className={inputClase}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className={labelClase}>C.C. del funcionario</label>
                    <input
                        name="cc_funcionario"
                        type="text"
                        value={form.cc_funcionario ?? ''}
                        onChange={(e) => onChange('cc_funcionario', e.target.value)}
                        className={inputClase}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className={labelClase}>Acciones realizadas</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {ACCIONES.map((a) => (
                        <label key={a.value} className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked={(form.acciones ?? []).includes(a.value)}
                                onChange={() => toggleAccion(form, onChange, a.value)}
                                className="w-4 h-4 accent-[#015d3b]"
                            />
                            {a.label}
                        </label>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                    <label className={labelClase}>Hora de inicio</label>
                    <input
                        name="hora_inicio"
                        type="time"
                        value={form.hora_inicio ?? ''}
                        onChange={(e) => onChange('hora_inicio', e.target.value)}
                        className={inputClase}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className={labelClase}>Hora de salida</label>
                    <input
                        name="hora_salida"
                        type="time"
                        value={form.hora_salida ?? ''}
                        onChange={(e) => onChange('hora_salida', e.target.value)}
                        className={inputClase}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label className={labelClase}>Acción tomada</label>
                <textarea
                    name="accion_tomada"
                    value={form.accion_tomada ?? ''}
                    onChange={(e) => onChange('accion_tomada', e.target.value)}
                    rows={5}
                    placeholder="Describa la acción tomada durante la visita"
                    className={inputClase}
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className={labelClase}>Observaciones o recomendaciones</label>
                <textarea
                    name="observaciones"
                    value={form.observaciones ?? ''}
                    onChange={(e) => onChange('observaciones', e.target.value)}
                    rows={3}
                    placeholder="Observaciones o recomendaciones de la visita"
                    className={inputClase}
                />
            </div>

            <div className="flex flex-col gap-1">
                <label className={labelClase}>Calificación de la visita</label>
                <div className="flex gap-4">
                    {CALIFICACIONES.map((c) => (
                        <label key={c.value} className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                            <input
                                type="radio"
                                name="calificacion"
                                value={c.value}
                                checked={form.calificacion === c.value}
                                onChange={(e) => onChange('calificacion', e.target.value)}
                                className="accent-[#015d3b]"
                            />
                            {c.label}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    )
}