export function formatRegisterData(data) {
    return {
        ...data,
        TipoDocumento: data.TipoDocumento?.value,
        fecha_nacimiento: Array.isArray(data.fecha_nacimiento)
            ? data.fecha_nacimiento[0].format('YYYY-MM-DD')
            : data.fecha_nacimiento?.format('YYYY-MM-DD')
    }
}