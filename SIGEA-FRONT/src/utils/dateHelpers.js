export function formatFecha(fecha) {
    if (!fecha) return '—'
    return new Date(fecha).toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short'
    })
}

export function toDatetimeLocal(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}