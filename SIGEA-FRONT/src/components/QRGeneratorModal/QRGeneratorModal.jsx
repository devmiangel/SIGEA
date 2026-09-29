import { useEffect, useRef } from 'react'
import Swal from 'sweetalert2'
import { AGRO_COLORS } from '../../utils/agroConstants'
import { descargarQR } from '../../services/agroService'
import { API_BASE_URL } from '../../services/api'

const iconoQR = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/><rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="4" height="4" rx="0.5"/><line x1="22" y1="14" x2="22" y2="14.01"/><line x1="22" y1="18" x2="22" y2="22"/><line x1="18" y1="22" x2="18" y2="22.01"/></svg>`
const iconoRUEA = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
const iconoPersona = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
const iconoPredio = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${AGRO_COLORS.primaryLight}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 9h6"/><path d="M9 13h6"/><path d="M9 17h6"/></svg>`

const escapeHtml = (str) => {
    if (!str) return '—'
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

export default function QRGeneratorModal({ qrUrl, up, onClose }) {
    const openedRef = useRef(false)

    useEffect(() => {
        if (!qrUrl || openedRef.current) return
        openedRef.current = true

        const nombreUP = escapeHtml(up?.productor_nombre ?? 'Unidad productiva')
        const ruea = escapeHtml(up?.RUEA ?? '—')
        const predio = escapeHtml(up?.nombre_predio ?? '—')

        Swal.fire({
            title: '',
            width: 'min(94vw, 480px)',
            html: `
                <style>
                    .qr-card { font-family: 'Roboto', sans-serif; text-align: center; }
                    .qr-img-container {
                        display: flex; justify-content: center; padding: 16px 0;
                    }
                    .qr-img-container img {
                        max-width: 220px; width: 100%; border-radius: 12px;
                        border: 2px solid #e5e7eb; box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    }
                    .qr-info { text-align: left; padding: 0 4px; }
                    .qr-tile {
                        background: #f9fafb; border: 1px solid #eef1f4; border-radius: 10px;
                        padding: 10px 12px; margin-bottom: 8px;
                    }
                    .qr-label {
                        display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600;
                        color: #6b7280; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 2px;
                    }
                    .qr-value { margin: 0; font-size: 13px; font-weight: 500; color: #1f2937; }
                </style>
                <div class="qr-card">
                    <div style="display:flex; align-items:center; justify-content:center; gap:12px; padding-bottom:14px; border-bottom:2px solid #eef1f4; margin-bottom:12px;">
                        <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#015d3b,#3e9a8a);display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 6px rgba(1,93,59,0.25);">${iconoQR}</div>
                        <div style="text-align:left;">
                            <p style="margin:0;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;color:#9ca3af;">Código QR</p>
                            <h2 style="margin:2px 0 0;font-size:16px;font-weight:600;color:#1f2937;line-height:1.3;">${nombreUP}</h2>
                        </div>
                    </div>
                    <div class="qr-img-container">
                        <img src="${qrUrl}" alt="Código QR de la UP" />
                    </div>
                    <div class="qr-info">
                        <div class="qr-tile">
                            <div class="qr-label">${iconoRUEA} RUEA</div>
                            <p class="qr-value">${ruea}</p>
                        </div>
                        <div class="qr-tile">
                            <div class="qr-label">${iconoPredio} Predio</div>
                            <p class="qr-value">${predio}</p>
                        </div>
                    </div>
                </div>
            `,
            showCloseButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Descargar',
            confirmButtonColor: AGRO_COLORS.primary,
            focusConfirm: false,
            allowOutsideClick: () => false,
            didClose: () => onClose?.()
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { blob, nombreArchivo } = await descargarQR(up.id)
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = nombreArchivo
                    document.body.appendChild(a)
                    a.click()
                    a.remove()
                    setTimeout(() => URL.revokeObjectURL(url), 30000)
                } catch {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo descargar el código QR.',
                        confirmButtonColor: AGRO_COLORS.primary
                    })
                }
            }
        })
    }, [qrUrl, up, onClose])

    return null
}
