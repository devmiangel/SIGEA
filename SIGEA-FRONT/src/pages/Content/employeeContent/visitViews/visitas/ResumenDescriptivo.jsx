import PersonIcon from '@mui/icons-material/Person'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import AgricultureOutlinedIcon from '@mui/icons-material/AgricultureOutlined'
import TagOutlinedIcon from '@mui/icons-material/TagOutlined'
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { AGRO_COLORS } from '../../../../../utils/agroConstants'

function Tile({ icono, etiqueta, valor, full = false }) {
    const Icono = icono
    return (
        <div className={`${full ? 'md:col-span-2' : ''} bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 min-w-30`}>
            <div className="flex items-center gap-1.5">
                <Icono sx={{ fontSize: 14, color: AGRO_COLORS.primaryLight }} />
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{etiqueta}</span>
            </div>
            <p className="text-xs font-medium text-gray-800 mt-1">{valor ?? '—'}</p>
        </div>
    )
}

function Bloque({ titulo, subtitulo, icono, children }) {
    const Icono = icono
    return (
        <div className="w-full bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-linear-to-br from-[#015d3b] to-[#3e9a8a] text-white shrink-0 shadow-sm">
                    <Icono sx={{ fontSize: 22, color: '#fff' }} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">{titulo}</h3>
                    {subtitulo && (
                        <p className="text-xs text-gray-400 mt-0.5">{subtitulo}</p>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {children}
            </div>
        </div>
    )
}

export default function ResumenDescriptivo({ productor, up }) {
    const p = productor ?? {}
    const u = up ?? {}

    const nombre = [p.PrimerNombreProductor, p.SegundoNombreProductor, p.PrimerApellidoProductor, p.SegundoApellidoProductor]
        .filter(Boolean).join(' ').trim() || (p.nombres_apellidos || '—')

    const tipoDocumento = p.TipoDocumentoProductor ?? ''

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Bloque
                titulo="Productor"
                subtitulo={`Información del productor · UP ${u.Rudea ?? u.RUEA ?? p.Rudea ?? ''}`.trim()}
                icono={PersonIcon}
            >
                <Tile icono={PersonIcon} etiqueta="Nombres y apellidos" valor={nombre} full />
                <Tile icono={BadgeOutlinedIcon} etiqueta="Documento" valor={`${tipoDocumento} ${p.DocumentoProductor ?? ''}`.trim()} />
                <Tile icono={PhoneOutlinedIcon} etiqueta="Celular" valor={p.Celular} />
                <Tile icono={EmailOutlinedIcon} etiqueta="Correo" valor={p.Correo} />
                <Tile icono={CakeOutlinedIcon} etiqueta="Edad" valor={p.Edad ? `${p.Edad} años` : null} />
                <Tile icono={SchoolOutlinedIcon} etiqueta="Nivel educativo" valor={p.NivelEducativo} />
                <p className="md:col-span-2 text-[10px] text-gray-400">
                    Fecha de nacimiento: {p.FechaNacimiento ?? '—'} · Razón social: {p.RazonSocialProductor ?? '—'} ·
                    Sisbén: {p.Sisben ?? '—'}
                </p>
            </Bloque>

            <Bloque
                titulo="Unidad Productiva (UP)"
                subtitulo="Datos generales de la UP vinculada a la visita"
                icono={AgricultureOutlinedIcon}
            >
                <Tile icono={TagOutlinedIcon} etiqueta="Tipo de UP" valor={u.TipoUP_Nombre} />
                <Tile icono={Inventory2OutlinedIcon} etiqueta="RUEA" valor={u.RUEA || u.Rudev} />
                <Tile icono={MapOutlinedIcon} etiqueta="Actividad" valor={u.ActividadUP} />
                <Tile icono={PersonIcon} etiqueta="Empleados" valor={u.NumeroEmpleados} />
                <Tile icono={StraightenOutlinedIcon} etiqueta="Área cultivada" valor={u.AreaCultivada} />
                <Tile icono={StraightenOutlinedIcon} etiqueta="Área pastos" valor={u.AreaPastos} />
                <p className="md:col-span-2 text-[10px] text-gray-400">
                    Potreros: {u.NumeroPotreros ?? '—'} · Invernaderos: {u.NumeroInvernaderos ?? '—'} ·
                    Tanques: {u.NumeroTanques ?? '—'} · Reservorios: {u.NumeroReservorios ?? '—'} ·
                    Asociatividad: {u.Asociatividad ? 'Sí' : 'No'} ·
                    Fuentes de agua: {u.FuentesAgua ? 'Sí' : 'No'}
                </p>
            </Bloque>
        </div>
    )
}