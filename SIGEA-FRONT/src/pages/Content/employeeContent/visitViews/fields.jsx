export function Campo({ label, name, type = 'text', value, onChange, placeholder = '', disabled = false, required = false }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
            <input
                type={type}
                name={name}
                value={value ?? ''}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                onChange={(e) => onChange(name, e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-500"
            />
        </div>
    )
}

export function CampoSelect({ label, name, value, onChange, options = [], placeholder = 'Seleccione...', disabled = false }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
            <select
                name={name}
                value={value ?? ''}
                disabled={disabled}
                onChange={(e) => onChange(name, e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-500"
            >
                <option value="">{placeholder}</option>
                {options.map((op) => (
                    <option key={op} value={op}>{op}</option>
                ))}
            </select>
        </div>
    )
}

export function CampoCheck({ label, name, checked, onChange }) {
    return (
        <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
                type="checkbox"
                name={name}
                checked={!!checked}
                onChange={(e) => onChange(name, e.target.checked)}
                className="w-4 h-4 accent-[#015d3b]"
            />
            <span className="text-sm text-gray-700">{label}</span>
        </label>
    )
}

export function BotonGuardar({ onClick, guardando = false, texto = 'Guardar sección' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={guardando}
            className="w-full py-2.5 px-5 bg-[#015d3b] border-none rounded-xl text-white font-bold cursor-pointer hover:bg-[#004d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {guardando ? 'Guardando...' : texto}
        </button>
    )
}
