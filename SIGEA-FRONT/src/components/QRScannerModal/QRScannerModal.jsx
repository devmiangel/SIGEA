import { useState, useCallback, useRef } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import { Scanner } from '@yudiel/react-qr-scanner'

const parsearRUEA = (textoQR) => {
    if (!textoQR) return null
    const rueaMatch = textoQR.match(/RUEA:\s*(.+)/i)
    if (rueaMatch) return rueaMatch[1].trim()
    if (textoQR.startsWith('RUDEA-') || textoQR.startsWith('RUDEA')) return textoQR.trim()
    return null
}

const MENSAJES_ERROR = {
    'permission-denied': 'Permiso de cámara denegado. Habilita el acceso a la cámara en la configuración de tu navegador.',
    'no-camera': 'No se encontró cámara disponible en este dispositivo.',
    'in-use': 'La cámara está en uso por otra aplicación. Cierra otras apps que la estén usando.',
    'insecure-context': 'Se requiere HTTPS para acceder a la cámara.',
    'unsupported': 'Tu navegador no soporta acceso a la cámara.',
}

export default function QRScannerModal({ onRUEADetectado, onClose }) {
    const [error, setError] = useState(null)
    const procesandoRef = useRef(false)

    const handleScan = useCallback((detectedCodes) => {
        if (procesandoRef.current || !detectedCodes?.length) return
        const rawValue = detectedCodes[0]?.rawValue
        if (!rawValue) return

        const ruea = parsearRUEA(rawValue)
        if (!ruea) return

        procesandoRef.current = true
        onRUEADetectado(ruea)
    }, [onRUEADetectado])

    const handleError = useCallback((err) => {
        const kind = err?.kind || 'unknown'
        setError(MENSAJES_ERROR[kind] || 'No se pudo iniciar la cámara. Intenta de nuevo.')
    }, [])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-center w-11 h-11 rounded-full bg-linear-to-br from-[#015d3b] to-[#3e9a8a] text-white shrink-0">
                        <QrCodeScannerIcon sx={{ fontSize: 22 }} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Escanear código QR</p>
                        <h2 className="text-base font-semibold text-gray-900">Apunta al QR de la UP</h2>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <CloseIcon fontSize="small" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center p-4">
                    {error ? (
                        <div className="text-center px-4">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                                <QrCodeScannerIcon sx={{ fontSize: 32, color: '#dc2626' }} />
                            </div>
                            <p className="text-sm text-gray-700 font-medium mb-2">Error de cámara</p>
                            <p className="text-sm text-gray-500 mb-4">{error}</p>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="w-full rounded-lg overflow-hidden border-2 border-[#015d3b]/20" style={{ height: 300 }}>
                                <Scanner
                                    onScan={handleScan}
                                    onError={handleError}
                                    constraints={{
                                        facingMode: 'environment',
                                    }}
                                    components={{
                                        finder: true,
                                        torch: false,
                                        zoom: false,
                                        onOff: false,
                                        audio: false,
                                    }}
                                    styles={{
                                        container: { width: '100%', height: '100%' },
                                    }}
                                    sound={false}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-3 text-center">
                                Coloca el código QR dentro del recuadro
                            </p>
                        </>
                    )}
                </div>

                <div className="px-5 py-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
}
