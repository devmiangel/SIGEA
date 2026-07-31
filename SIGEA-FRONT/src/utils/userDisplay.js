export function getNombreCompleto(user) {
    if (user?.persona_info) {
        const { primer_nombre = '', primer_apellido = '' } = user.persona_info
        return `${primer_nombre} ${primer_apellido}`.trim() || (user?.email ?? 'Nombre no disponible')
    }
    return user?.email || 'Nombre no disponible'
}

export function getCorreo(user) {
    return user?.email || 'Correo no disponible'
}
