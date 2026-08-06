import { Link } from 'react-router-dom'

const EXTERNAL_PROTOCOLS = ['http://', 'https://', 'mailto:', 'tel:']

export function NavLink({ children, href }) {
    const esExterno = typeof href === 'string'
        && EXTERNAL_PROTOCOLS.some(p => href.startsWith(p))

    const className = 'text-[10px] text-black no-underline ml-1 hover:text-[#015d3b] transition-colors'

    if (esExterno) {
        return <a href={href} className={className}>{children}</a>
    }

    return <Link to={href} className={className}>{children}</Link>
}