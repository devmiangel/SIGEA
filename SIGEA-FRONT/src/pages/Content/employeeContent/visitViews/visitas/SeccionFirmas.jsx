import { useEffect, useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'

function LienzoFirma({ label, valor, onChange }) {
    const sigRef = useRef(null)
    const cargado = useRef(false)
    const [firmado, setFirmado] = useState(() => Boolean(valor))

    useEffect(() => {
        if (!sigRef.current || cargado.current) return
        cargado.current = true
        if (valor) {
            const src = String(valor).startsWith('data:')
                ? valor
                : `data:image/png;base64,${valor}`
            sigRef.current.fromDataURL(src)
        }
    }, [valor])

    const alTerminar = () => {
        if (!sigRef.current || sigRef.current.isEmpty()) {
            setFirmado(false)
            return
        }
        const url = sigRef.current.getTrimmedCanvas().toDataURL('image/png')
        setFirmado(true)
        onChange(url)
    }

    const limpiar = () => {
        sigRef.current?.clear()
        setFirmado(false)
        onChange('')
    }

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
            <div className="relative rounded-md border border-[#015d3b] bg-white overflow-hidden">
                <SignatureCanvas
                    ref={sigRef}
                    penColor="#1f2937"
                    minWidth={0.6}
                    maxWidth={2}
                    velocityFilterWeight={0.7}
                    canvasProps={{
                        className: "w-full h-28 cursor-crosshair touch-none",
                    }}
                    clearOnResize={false}
                    onEnd={alTerminar}
                />
            </div>
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">{firmado ? 'Firma capturada' : 'Firme sobre el recuadro'}</span>
                <button
                    type="button"
                    onClick={limpiar}
                    className="text-[11px] font-semibold text-[#015d3b] hover:text-[#004d2f]"
                >
                    Limpiar
                </button>
            </div>
        </div>
    )
}

const CALIFICACIONES = [
    { value: 'malo', label: 'Malo' },
    { value: 'regular', label: 'Regular' },
    { value: 'bueno', label: 'Bueno' },
    { value: 'excelente', label: 'Excelente' },
]

export default function SeccionFirmas({ form, onChange }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Calificación de la visita</label>
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

            <p className="text-sm text-gray-500">
                Firme sobre cada recuadro. La firma quedará plasmada en el formulario generado.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <LienzoFirma label="Firma del usuario" valor={form.firma_usuario} onChange={(v) => onChange('firma_usuario', v)} />
                <LienzoFirma label="Firma del funcionario" valor={form.firma_funcionario} onChange={(v) => onChange('firma_funcionario', v)} />
            </div>
        </div>
    )
}
