import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import { Header } from "../../../../components/Tettles-Buttons/Title"
import {
    getInfoPersonal, getInfoPredio, getInfoUP,
    getInfoAgricola, getInfoAnimal, getInfoAgroindustrial, getInfoAdicional,
} from "../../../../services/caracterizacionService"
import { getMisUPs } from "../../../../services/agroService"
import { useCurrentDataUser } from "../../../../hooks/currentUserHook"

const estadoStyle = {
    'En revision': 'bg-amber-100 text-amber-700',
    'Rechazada': 'bg-red-100 text-red-700',
    'Aceptada': 'bg-green-100 text-green-700',
}

const valor = (v) => (v === null || v === undefined || v === '' ? null : v)

function Fila({ etiqueta, valor: val }) {
    if (valor(val) === null) return null
    return (
        <div className="flex justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{etiqueta}</span>
            <span className="text-sm font-medium text-gray-800 text-right">{String(val)}</span>
        </div>
    )
}

function Bloque({ titulo, children }) {
    const items = children.filter(Boolean)
    if (!items.length) return null
    return (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 bg-[#015d3b]/5 px-4 py-2.5 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800">{titulo}</h4>
            </div>
            <div className="px-4 py-2">{items}</div>
        </div>
    )
}

function ListaBloque({ titulo, items, render }) {
    const validos = (items ?? []).filter(Boolean)
    if (!validos.length) return null
    return (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-2 bg-[#015d3b]/5 px-4 py-2.5 border-b border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800">{titulo}</h4>
            </div>
            <div className="px-4 py-2 space-y-2">
                {validos.map((item, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                        {render(item)}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function UPDetailView() {
    const { upId } = useParams()
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useCurrentDataUser()
    const [up, setUp] = useState(location.state?.up ?? null)
    const [secciones, setSecciones] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let activo = true
        const userId = user?.id
        const cargar = async () => {
            let upData = location.state?.up ?? null
            if (!upData && userId) {
                try {
                    const ups = await getMisUPs()
                    upData = ups.find((u) => String(u.id) === String(upId)) ?? null
                } catch { /* sin datos */ }
            }
            if (upData) setUp(upData)

            if (userId) {
                try {
                    const [personal, predio, infoUp, agricola, animal, agroindustrial, adicional] =
                        await Promise.all([
                            getInfoPersonal(userId), getInfoPredio(userId), getInfoUP(userId),
                            getInfoAgricola(userId), getInfoAnimal(userId),
                            getInfoAgroindustrial(userId), getInfoAdicional(userId),
                        ])
                    if (!activo) return
                    setSecciones({ personal, predio, infoUp, agricola, animal, agroindustrial, adicional })
                } catch { if (activo) setSecciones(null) }
            }
            if (activo) setLoading(false)
        }
        cargar()
        return () => { activo = false }
    }, [user, upId, location.state])

    const estadoLabel = up?.estado_label ?? 'Sin estado'
    const estadoClass = estadoStyle[estadoLabel] ?? 'bg-gray-100 text-gray-700'
    const nombre = up?.productor_nombre ?? 'Unidad productiva'
    const personal = secciones?.personal ?? {}

    return (
        <div className="w-full max-w-full">
            <Header
                componentLogo={<AgricultureIcon sx={{ fontSize: 40, color: 'ActiveCaption' }} />}
                headerText={'Unidad Productiva'}
                message={'Información completa de tu unidad productiva registrada.'}
                colorLogo={'#3e9a8a'}
            />
            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full overflow-y-hidden">
                <button
                    onClick={() => navigate('/usuario/extension_agropecuaria')}
                    className="mb-4 flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                    <ArrowBackIcon fontSize="small" /> Volver a mis UPs
                </button>

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando información de la unidad productiva...</p>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="w-full bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-[#015d3b] to-[#3e9a8a] text-white shrink-0 shadow-sm">
                                    <AgricultureIcon sx={{ fontSize: 22, color: '#fff' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-base font-semibold text-gray-900 truncate">{nombre}</h3>
                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide shrink-0 ${estadoClass}`}>
                                            {estadoLabel}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {up?.RUEA ?? 'Sin RUEA'} · {up?.tipo_up_label ?? 'Sin tipo'} · {up?.nombre_predio ?? 'Predio sin nombre'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Bloque titulo="Productor">
                            <Fila etiqueta="Nombre" valor={`${personal.PrimerNombreProductor ?? ''} ${personal.PrimerApellidoProductor ?? ''}`.trim() || null} />
                            <Fila etiqueta="Documento" valor={personal.DocumentoProductor} />
                            <Fila etiqueta="Tipo de documento" valor={personal.TipoDocumentoProductor} />
                            <Fila etiqueta="Celular" valor={personal.Celular} />
                            <Fila etiqueta="Correo" valor={personal.Correo} />
                            <Fila etiqueta="Fecha de nacimiento" valor={personal.FechaNacimiento} />
                            <Fila etiqueta="Edad" valor={personal.Edad} />
                            <Fila etiqueta="Nivel educativo" valor={personal.NivelEducativo} />
                            <Fila etiqueta="Sisbén" valor={personal.Sisben} />
                        </Bloque>

                        <Bloque titulo="Predio">
                            <Fila etiqueta="Nombre del predio" valor={secciones?.predio?.NombrePredio} />
                            <Fila etiqueta="Área" valor={secciones?.predio?.AreaPredio} />
                            <Fila etiqueta="Dirección" valor={secciones?.predio?.Direccion} />
                            <Fila etiqueta="Vereda" valor={secciones?.predio?.Vereda} />
                            <Fila etiqueta="Sector" valor={secciones?.predio?.Sector} />
                            <Fila etiqueta="Tipo de tenencia" valor={secciones?.predio?.TipoTenencia} />
                            <Fila etiqueta="Seguro" valor={secciones?.predio?.Seguro} />
                            <Fila etiqueta="Acceso a crédito" valor={secciones?.predio?.AccesoCredito ? 'Sí' : 'No'} />
                            <Fila etiqueta="Uso de suelo" valor={secciones?.predio?.UsoSuelo ? 'Sí' : 'No'} />
                            <Fila etiqueta="Registro ICA" valor={secciones?.predio?.RegistroICA?.join(', ') || null} />
                        </Bloque>

                        <Bloque titulo="Unidad Productiva">
                            <Fila etiqueta="RUEA" valor={secciones?.infoUp?.RUEA ?? up?.RUEA} />
                            <Fila etiqueta="Tipo de UP" valor={secciones?.infoUp?.TipoUP_Nombre ?? up?.tipo_up_label} />
                            <Fila etiqueta="Actividad" valor={secciones?.infoUp?.ActividadUP} />
                            <Fila etiqueta="Número de empleados" valor={secciones?.infoUp?.NumeroEmpleados} />
                            <Fila etiqueta="Asociatividad" valor={secciones?.infoUp?.Asociatividad ? 'Sí' : 'No'} />
                            <Fila etiqueta="Área cultivada" valor={secciones?.infoUp?.AreaCultivada} />
                            <Fila etiqueta="Área en pastos" valor={secciones?.infoUp?.AreaPastos} />
                            <Fila etiqueta="Número de potreros" valor={secciones?.infoUp?.NumeroPotreros} />
                            <Fila etiqueta="Número de invernaderos" valor={secciones?.infoUp?.NumeroInvernaderos} />
                            <Fila etiqueta="Número de tanques" valor={secciones?.infoUp?.NumeroTanques} />
                            <Fila etiqueta="Número de reservorios" valor={secciones?.infoUp?.NumeroReservorios} />
                            <Fila etiqueta="Fuentes de agua" valor={secciones?.infoUp?.FuentesAgua ? 'Sí' : 'No'} />
                        </Bloque>

                        <div className="flex flex-col gap-4">
                            <ListaBloque
                                titulo="Producción agrícola"
                                items={secciones?.agricola?.ProduccionAgricola}
                                render={(i) => (
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>{i.NombreProducto}</span>
                                        <span>{i.Cantidad} {i.UnidadMedida ?? ''}</span>
                                    </div>
                                )}
                            />
                            <ListaBloque
                                titulo="Producción agroindustrial"
                                items={secciones?.agroindustrial?.ProduccionAgroindustrial}
                                render={(i) => (
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>{i.NombreProducto}</span>
                                        <span>{i.Cantidad} {i.UnidadMedida ?? ''} {i.INVIMA ? '· INVIMA' : ''}</span>
                                    </div>
                                )}
                            />
                            <ListaBloque
                                titulo="Producción animal"
                                items={secciones?.animal?.Animales}
                                render={(i) => (
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span className="font-medium">{i.GrupoAnimal}</span>
                                        <span>Cantidad: {i.CantidadTotal ?? 0}</span>
                                    </div>
                                )}
                            />
                            <Bloque titulo="Actualización">
                                <Fila etiqueta="Fecha de actualización" valor={secciones?.adicional?.FechaActualizacion ?? up?.FechaActualizacion} />
                                <Fila etiqueta="Fecha de caracterización" valor={up?.FechaCaracterizacion} />
                            </Bloque>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}