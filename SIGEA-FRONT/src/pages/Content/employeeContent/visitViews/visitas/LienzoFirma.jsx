import { useEffect, useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'

export default function LienzoFirma({ label, valor, onChange }) {
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
