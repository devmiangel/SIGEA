import { useEffect, useRef, useState } from 'react'

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

export function CampoSelectDinamico({ label, name, value, onChange, options = [], onCrear = null, placeholder = 'Escriba o seleccione...', disabled = false, compact = false, permitirNuevo = true }) {
    const [texto, setTexto] = useState(value ?? '')
    const [prevValue, setPrevValue] = useState(value ?? '')
    const [abierto, setAbierto] = useState(false)
    const [creando, setCreando] = useState(false)
    const contRef = useRef(null)

    const valorActual = value ?? ''
    if (valorActual !== prevValue) {
        setPrevValue(valorActual)
        setTexto(valorActual)
    }

    const inputClase = compact
        ? "w-full px-2 py-1.5 rounded-md border border-[#015d3b] outline-none text-sm bg-white disabled:bg-gray-100 disabled:text-gray-500"
        : "w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-500"
    const labelClase = compact ? "text-[10px] font-semibold uppercase tracking-wide text-gray-500" : "text-xs font-semibold uppercase tracking-wide text-gray-500"

    const q = texto.trim().toLowerCase()
    const filtradas = q ? options.filter((o) => o.toLowerCase().includes(q)) : options

    useEffect(() => {
        const cerrar = (e) => {
            if (contRef.current && !contRef.current.contains(e.target)) setAbierto(false)
        }
        document.addEventListener('mousedown', cerrar)
        return () => document.removeEventListener('mousedown', cerrar)
    }, [])

    const seleccionar = (valor) => {
        setTexto(valor)
        setPrevValue(valor)
        onChange(name, valor)
        setAbierto(false)
    }

    const crear = async () => {
        const valor = texto.trim()
        if (!valor) return
        if (!onCrear) {
            seleccionar(valor)
            return
        }
        setCreando(true)
        try {
            await onCrear(valor)
            seleccionar(valor)
        } catch {
            setAbierto(true)
        } finally {
            setCreando(false)
        }
    }

    const hayCrear = permitirNuevo && texto.trim() && !options.some((o) => o.toLowerCase() === texto.trim().toLowerCase())

    return (
        <div className="flex flex-col gap-1 relative" ref={contRef}>
            <label className={labelClase}>{label}</label>
            <input
                value={texto}
                disabled={disabled}
                placeholder={placeholder}
                onFocus={() => setAbierto(true)}
                onChange={(e) => { setTexto(e.target.value); setAbierto(true) }}
                onBlur={() => {
                    if (!permitirNuevo && texto.trim() && !options.some((o) => o.toLowerCase() === texto.trim().toLowerCase())) {
                        setTexto(prevValue)
                        onChange(name, prevValue)
                    }
                }}
                className={inputClase}
            />
            {abierto && !disabled && (
                <div className="absolute top-full left-0 right-0 mt-1 z-30 max-h-48 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                    {hayCrear && (
                        <button
                            type="button"
                            onClick={crear}
                            disabled={creando}
                            className="w-full text-left px-3 py-2 text-sm text-[#015d3b] font-semibold hover:bg-[#015d3b]/5 border-b border-gray-100 disabled:opacity-50"
                        >
                            {creando ? 'Creando...' : onCrear ? `+ Crear "${texto.trim()}"` : `Usar "${texto.trim()}"`}
                        </button>
                    )}
                    {filtradas.length === 0 && !hayCrear && (
                        <div className="px-3 py-2 text-sm text-gray-400">Sin resultados</div>
                    )}
                    {filtradas.map((op) => (
                        <button
                            key={op}
                            type="button"
                            onClick={() => seleccionar(op)}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#015d3b]/5"
                        >
                            {op}
                        </button>
                    ))}
                </div>
            )}
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
