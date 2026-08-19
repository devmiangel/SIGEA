const inputClase = "w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white"
const labelClase = "text-xs font-semibold uppercase tracking-wide text-gray-500"

export default function SeccionDescripcion({ form, onChange }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
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
            </div>
        </div>
    )
}