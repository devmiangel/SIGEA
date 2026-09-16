export default function EstadoVisita({ estado }) {
    const realizada = !!estado
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${
            realizada
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
        }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${realizada ? 'bg-green-600' : 'bg-amber-600'}`} />
            {realizada ? 'Realizada' : 'No realizada'}
        </span>
    )
}