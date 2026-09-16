export function getNombreCompleto(user) {
    const persona = user?.persona_info ?? user
    const { primer_nombre = '', primer_apellido = '' } = persona ?? {}
    const nombre = `${primer_nombre} ${primer_apellido}`.trim()
    if (nombre) return nombre
    return user?.email || 'Nombre no disponible'
}

export function getCorreo(user) {
    return user?.email || 'Correo no disponible'
}
