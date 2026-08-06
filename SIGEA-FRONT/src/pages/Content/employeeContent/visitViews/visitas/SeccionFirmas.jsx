import { useEffect, useRef, useState } from 'react'

function LienzoFirma({ label, valor, onChange }) {
    const canvasRef = useRef(null)
    const dibujando = useRef(false)
    const [firmado, setFirmado] = useState(false)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width = canvas.clientWidth * 2
        canvas.height = canvas.clientHeight * 2
        const ctx = canvas.getContext('2d')
        ctx.scale(2, 2)
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = '#1f2937'
    }, [])

    const posicion = (e) => {
        const rect = canvasRef.current.getBoundingClientRect()
        const touch = e.touches?.[0]
        return {
            x: (touch ? touch.clientX : e.clientX) - rect.left,
            y: (touch ? touch.clientY : e.clientY) - rect.top,
        }
    }

    const iniciar = (e) => {
        e.preventDefault()
        dibujando.current = true
        const { x, y } = posicion(e)
        const ctx = canvasRef.current.getContext('2d')
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const mover = (e) => {
        if (!dibujando.current) return
        e.preventDefault()
        const { x, y } = posicion(e)
        const ctx = canvasRef.current.getContext('2d')
        ctx.lineTo(x, y)
        ctx.stroke()
    }

    const terminar = () => {
        if (!dibujando.current) return
        dibujando.current = false
        const datos = canvasRef.current.toDataURL('image/png')
        setFirmado(datos.length > 2200)
        onChange(datos)
    }

    const limpiar = () => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        setFirmado(false)
        onChange('')
    }

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
            <div className="relative rounded-md border border-[#015d3b] bg-white overflow-hidden">
                <canvas
                    ref={canvasRef}
                    className="w-full h-28 cursor-crosshair touch-none"
                    onMouseDown={iniciar}
                    onMouseMove={mover}
                    onMouseUp={terminar}
                    onMouseLeave={terminar}
                    onTouchStart={iniciar}
                    onTouchMove={mover}
                    onTouchEnd={terminar}
                />
                {valor && !firmado && (
                    <span className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none">
                        Firma capturada
                    </span>
                )}
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

export default function SeccionFirmas({ form, onChange }) {
    return (
        <div className="flex flex-col gap-4">
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