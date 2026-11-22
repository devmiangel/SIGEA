import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { esRegistroActivo } from '../../utils/insumoHelpers'
import { ACTIVO_STYLE } from '../../utils/agroConstants'

const nombreCompleto = (productor) => {
    const persona = productor?.persona_info ?? {}
    return [
        persona.primer_nombre,
        persona.segundo_nombre,
        persona.primer_apellido,
        persona.segundo_apellido,
    ].filter(Boolean).join(' ').trim() || productor?.email || 'Productor sin nombre'
}

const documento = (productor) => {
    const persona = productor?.persona_info ?? {}
    const tipo = persona.TipoDocumento_info?.TipoDocumento ?? ''
    const numero = persona.numero_documento ?? ''
    return `${tipo} ${numero}`.trim()
}

const iniciales = (productor) => {
    const persona = productor?.persona_info ?? {}
    const nombre = persona.primer_nombre?.trim() ?? ''
    const apellido = persona.primer_apellido?.trim() ?? ''
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
        || productor?.email?.charAt(0)?.toUpperCase()
        || '?'
}

export default function ProductorPreviewCard({ productor, onClick }) {
    const activo = esRegistroActivo(productor)
    const statusClass = activo ? ACTIVO_STYLE.activo : ACTIVO_STYLE.inactivo
    const estadoLabel = activo ? 'Activo' : 'Inactivo'
    const nombre = nombreCompleto(productor)
    const doc = documento(productor)

    const handleActivate = () => onClick?.(productor)

    return (
        <div
            onClick={handleActivate}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleActivate() }}
            className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 sm:px-5 py-4 bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-[#3e9a8a] transition-all duration-200 w-full m-1"
        >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#005C39] text-white font-semibold text-lg shrink-0 shadow-sm">
                {iniciales(productor)}
            </div>

            <div className="flex-1 min-w-0 basis-40 sm:basis-0">
                <p className="text-sm font-semibold text-gray-900 truncate" title={nombre}>
                    {nombre}
                </p>
                <p className="text-xs text-gray-500 truncate" title={productor?.email}>
                    {productor?.email || 'Sin correo'}
                </p>
                {doc && (
                    <p className="text-xs text-gray-400 truncate" title={doc}>
                        {doc}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#015d3b]/10 text-[#015d3b]">
                    {productor?.ups_count ?? 0} UP(s)
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                    {estadoLabel}
                </span>
            </div>

            <div className="hidden sm:flex shrink-0 items-center justify-center text-gray-400">
                <ChevronRightIcon fontSize="small" />
            </div>
        </div>
    )
}
