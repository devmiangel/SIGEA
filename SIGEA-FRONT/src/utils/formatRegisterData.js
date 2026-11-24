export function formatRegisterData(data) {
    return {
        ...data,
        TipoDocumento: data.TipoDocumento?.value,
        // OtherCalendar ya entrega 'YYYY-MM-DD' (o null si está vacío).
        fecha_nacimiento: data.fecha_nacimiento || undefined
    }
}