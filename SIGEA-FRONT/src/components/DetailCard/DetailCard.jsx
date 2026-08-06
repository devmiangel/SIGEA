import ChevronRightIcon from '@mui/icons-material/ChevronRight'

export function DetailField({ icon, label, value }) {
    return (
        <div className="flex-1 min-w-[120px] bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 hover:border-[#3e9a8a] transition-colors">
            <div className="flex items-center gap-1.5">
                {icon}
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>
            </div>
            <p className="text-xs font-medium text-gray-800 mt-1 truncate">{value}</p>
        </div>
    )
}

export function DetailCard({ icon, title, badgeClass, badgeLabel, subtitle, onClick, detailClassName = 'flex gap-3 mt-4 flex-wrap', children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full bg-white rounded-xl border border-gray-200 p-5 cursor-pointer text-left hover:border-[#3e9a8a] hover:shadow-md transition-all duration-200"
        >
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-[#015d3b] to-[#3e9a8a] text-white shrink-0 shadow-sm">
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
                        {badgeClass && badgeLabel && (
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide shrink-0 ${badgeClass}`}>
                                {badgeLabel}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                    )}
                </div>
                <ChevronRightIcon sx={{ color: '#9ca3af' }} className="shrink-0" />
            </div>
            {children && (
                <div className={detailClassName}>{children}</div>
            )}
        </button>
    )
}