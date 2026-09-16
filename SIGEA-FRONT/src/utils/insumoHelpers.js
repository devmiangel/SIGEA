export function esRegistroActivo(item, campo = 'Estado') {
    const valor = item?.[campo]
    return valor !== false && valor !== 0 && valor != null
}

export function esInsumoActivo(insumo) {
    return esRegistroActivo(insumo, 'Estado')
}