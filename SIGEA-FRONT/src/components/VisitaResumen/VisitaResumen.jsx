const formatFecha = (fecha) => {
    if (!fecha) return '—'
    return new Date(fecha).toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short'
    })
}

function Fila({ etiqueta, valor }) {
    return (
        <div className="flex justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{etiqueta}</span>
            <span className="text-sm font-medium text-gray-800 text-right">{valor ?? '—'}</span>
        </div>
    )
}

function Bloque({ titulo, icono, children }) {
    return (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 bg-[#015d3b]/5 px-4 py-2.5 border-b border-gray-200">
                <span className="text-lg">{icono}</span>
                <h4 className="text-sm font-semibold text-gray-800">{titulo}</h4>
            </div>
            <div className="px-4 py-2">{children}</div>
        </div>
    )
}

export default function VisitaResumen({ visita }) {
    const solicitud = visita?.solicitud_info ?? {}
    const solicitante = solicitud.solicitante ?? {}
    const funcionario = visita?.funcionario_info ?? {}
    const administrador = visita?.administrador_info ?? {}

    const nombreSolicitante = [solicitante.primer_nombre, solicitante.primer_apellido]
        .filter(Boolean).join(' ').trim() || '—'

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Bloque titulo={`Solicitud del productor ${solicitud.id ? `#${solicitud.id}` : ''}`} icono="📋">
                <Fila etiqueta="Solicitante" valor={nombreSolicitante} />
                <Fila etiqueta="Correo" valor={solicitante.email} />
                <Fila etiqueta="Motivo" valor={solicitud.motivo} />
                <Fila etiqueta="Fecha de solicitud" valor={formatFecha(solicitud.fecha_solicitud)} />
                <Fila etiqueta="Estado" valor={solicitud.estado} />
                <Fila etiqueta="Predio / UP" valor={solicitud.up} />
                <Fila etiqueta="Observación" valor={solicitud.observacion} />
            </Bloque>

            <Bloque titulo={`Orden de visita ${visita?.id ? `#${visita.id}` : ''}`} icono="🗓️">
                <Fila etiqueta="Tipo de visita" valor={visita?.tipo_visita_label} />
                <Fila etiqueta="Fecha y hora" valor={formatFecha(visita?.FechaYHoraVisita)} />
                <Fila etiqueta="Ubicación" valor={visita?.Ubicacion} />
                <Fila etiqueta="Funcionario" valor={funcionario.nombre} />
                <Fila etiqueta="Correo funcionario" valor={funcionario.email} />
                <Fila etiqueta="Administrador" valor={administrador.nombre} />
                <Fila etiqueta="Correo administrador" valor={administrador.email} />
            </Bloque>
        </div>
    )
}