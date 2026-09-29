import { useState } from 'react'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../../utils/agroConstants'
import { generarQR } from '../../services/agroService'
import { API_BASE_URL } from '../../services/api'
import QRGeneratorModal from '../QRGeneratorModal/QRGeneratorModal'

export default function QRButton({ up }) {
    const [showModal, setShowModal] = useState(false)
    const [qrUrl, setQrUrl] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleClick = async (e) => {
        e.stopPropagation()
        setLoading(true)

        try {
            const data = await generarQR(up.id)
            const baseUrl = API_BASE_URL.replace('/api', '')
            const url = data.CodigoQR
                ? `${baseUrl}${data.CodigoQR}`
                : null

            if (url) {
                setQrUrl(url)
                setShowModal(true)
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo generar el código QR.',
                    confirmButtonColor: AGRO_COLORS.primary
                })
            }
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.detail || 'No se pudo generar el código QR.'
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: msg,
                confirmButtonColor: AGRO_COLORS.primary
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div
                role="button"
                tabIndex={0}
                onClick={handleClick}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(e) }}
                title="Generar código QR"
                className={`flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors ${loading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
            >
                {loading ? (
                    <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <QrCodeScannerIcon sx={{ fontSize: 18 }} />
                )}
            </div>

            {showModal && (
                <QRGeneratorModal
                    qrUrl={qrUrl}
                    up={up}
                    onClose={() => {
                        setShowModal(false)
                        setQrUrl(null)
                    }}
                />
            )}
        </>
    )
}
