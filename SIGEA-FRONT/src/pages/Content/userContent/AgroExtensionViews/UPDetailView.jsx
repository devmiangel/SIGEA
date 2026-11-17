import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import { getMisUPs } from "../../../../services/agroService"
import { useCurrentDataUser } from "../../../../hooks/currentUserHook"
import { useCaracterizacion } from "../../../../hooks/useCaracterizacion"
import { AGRO_COLORS, UP_ESTADO_RAW, UP_ESTADO_STYLE, normalizarEstadoUP } from "../../../../utils/agroConstants"
import QRButton from "../../../../components/QRButton/QRButton"

const valor = (v) => (v === null || v === undefined || v === '' ? null : v)

function Fila({ etiqueta, valor: val }) {
    if (valor(val) === null) return null
    return (
        <div className="flex flex-col gap-0.5 border-b border-gray-100 py-2 last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:text-xs">{etiqueta}</span>
            <span className="min-w-0 break-words text-sm font-medium text-gray-800 sm:text-right">{String(val)}</span>
        </div>
    )
}

function Bloque({ titulo, children }) {
    const items = children.filter(Boolean)
    if (!items.length) return null
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 border-b border-gray-200 bg-[#e8f3ef] px-3 py-2.5 sm:px-4">
                <h4 className="text-sm font-semibold text-[#015d3b]">{titulo}</h4>
            </div>
            <div className="px-3 py-1 sm:px-4">{items}</div>
        </div>
    )
}

function ListaBloque({ titulo, items, render }) {
    const validos = (items ?? []).filter(Boolean)
    if (!validos.length) return null
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 border-b border-gray-200 bg-[#e8f3ef] px-3 py-2.5 sm:px-4">
                <h4 className="text-sm font-semibold text-[#015d3b]">{titulo}</h4>
            </div>
            <div className="space-y-2 px-3 py-2 sm:px-4">
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
    const { secciones, loading, refresh: cargarSecciones } = useCaracterizacion()
    const [up, setUp] = useState(location.state?.up ?? null)

    useEffect(() => {
        const userId = user?.id
        const cargar = async () => {
            let upData = location.state?.up ?? null
            if (!upData && userId) {
                try {
                    const ups = await getMisUPs()
                    upData = ups.find((u) => String(u.id) === String(upId)) ?? null
                } catch { /* sin datos */ }
            }
            if (upData) {
                setUp(upData)
                cargarSecciones(userId, upData.id)
            }
        }
        cargar()
    }, [user, upId, location.state, cargarSecciones])

    const estadoLabel = up?.estado_label ?? 'Sin estado'
    const estadoClass = UP_ESTADO_STYLE[estadoLabel] ?? 'bg-gray-100 text-gray-700'
    const nombre = up?.productor_nombre ?? 'Unidad productiva'
    const personal = secciones?.personal ?? {}
    const esAceptada = normalizarEstadoUP(estadoLabel) === normalizarEstadoUP(UP_ESTADO_RAW.ACEPTADA)

    return (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-4 sm:gap-5 sm:px-5 sm:py-6">
            <header className="rounded-2xl bg-linear-to-br from-[#005C39] to-[#0b7a52] p-5 text-white shadow-md sm:p-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#3e9a8a] ring-4 ring-white/15 sm:h-14 sm:w-14">
                        <AgricultureIcon sx={{ fontSize: 30 }} />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-lg font-bold leading-tight sm:text-2xl">Unidad Productiva</h1>
                        <p className="mt-1 text-sm leading-relaxed text-white/85 text-pretty">
                            Información completa de tu unidad productiva registrada.
                        </p>
                    </div>
                </div>
            </header>

            <section className="min-h-[60vh] rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-5">
                <button
                    onClick={() => navigate('/usuario/extension_agropecuaria')}
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 sm:w-auto sm:justify-start"
                >
                    <ArrowBackIcon fontSize="small" /> Volver a mis UPs
                </button>

                {loading ? (
                    <p className="py-8 text-center text-sm text-gray-500">Cargando información de la unidad productiva...</p>
                ) : (
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
                        <div className="w-full rounded-xl border border-gray-200 bg-[#f4f9f7] p-4 sm:p-5 lg:col-span-2">
                            <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#015d3b] to-[#3e9a8a] text-white shadow-sm">
                                    <AgricultureIcon sx={{ fontSize: 22, color: '#fff' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="min-w-0 break-words text-base font-semibold text-gray-900">{nombre}</h3>
                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide shrink-0 ${estadoClass}`}>
                                            {estadoLabel}
                                        </span>
                                        {esAceptada && (
                                            <QRButton up={up} />
                                        )}
                                    </div>
                                    <p className="mt-1 break-words text-xs text-gray-500">
                                        {up?.RUEA ?? 'Sin RUEA'} · {up?.tipo_up_label ?? 'Sin tipo'} · {up?.nombre_predio ?? 'Predio sin nombre'}
                                    </p>
                                    {up?.MotivoRechazo && (
                                        <p className="mt-2 break-words rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                                            <span className="font-semibold">Motivo del rechazo:</span> {up.MotivoRechazo}
                                        </p>
                                    )}
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
                            <Fila etiqueta="Registro ICA" valor={secciones?.predio?.RegistroICA || null} />
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
                                    <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-xs text-gray-600">
                                        <span>{i.NombreProducto}</span>
                                        <span>{i.Cantidad} {i.UnidadMedida ?? ''}</span>
                                    </div>
                                )}
                            />
                            <ListaBloque
                                titulo="Producción agroindustrial"
                                items={secciones?.agroindustrial?.ProduccionAgroindustrial}
                                render={(i) => (
                                    <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5 text-xs text-gray-600">
                                        <span>{i.NombreProducto}</span>
                                        <span>{i.Cantidad} {i.UnidadMedida ?? ''} {i.INVIMA ? '· INVIMA' : ''}</span>
                                    </div>
                                )}
                            />
                            <ListaBloque
                                titulo="Producción animal"
                                items={secciones?.animal?.Animales}
                                render={(i) => {
                                    const total = i.Razas
                                        ? i.Razas.reduce((acc, r) => acc + (Number(r.Cantidad) || 0), 0)
                                        : (i.CantidadTotal ?? 0)
                                    const razas = i.Razas ? i.Razas.map((r) => r.Raza).filter(Boolean).join(', ') : ''
                                    const d = i.Detalles || {}
                                    const avesDetalle = ['Gallinas', 'Pollos', 'Patos', 'Codornices', 'Otros']
                                        .filter((k) => Number(d[k]))
                                        .map((k) => `${k}: ${d[k]}`)
                                        .join(', ')
                                    return (
                                        <div className="flex flex-col gap-0.5 text-xs text-gray-600">
                                            <div className="flex flex-wrap justify-between gap-x-3">
                                                <span className="font-medium">{i.GrupoAnimal}</span>
                                                <span>Cantidad: {total}</span>
                                            </div>
                                            {razas && <span className="text-gray-500">Razas: {razas}</span>}
                                            {i.GrupoAnimal === 'Aves' && avesDetalle && (
                                                <span className="text-gray-500">{avesDetalle}</span>
                                            )}
                                        </div>
                                    )
                                }}
                            />
                            <Bloque titulo="Actualización">
                                <Fila etiqueta="Fecha de actualización" valor={secciones?.adicional?.FechaActualizacion ?? up?.FechaActualizacion} />
                                <Fila etiqueta="Fecha de caracterización" valor={up?.FechaCaracterizacion} />
                            </Bloque>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}