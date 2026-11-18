import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AgricultureIcon from '@mui/icons-material/Agriculture'
import DownloadIcon from '@mui/icons-material/Download'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import EventIcon from '@mui/icons-material/Event'
import { Header } from "../../../components/Tettles-Buttons/Title"
import VisitaInfoCard from "../../../components/VisitaInfoCard/VisitaInfoCard"
import QRButton from "../../../components/QRButton/QRButton"
import { mostrarInfoVisita } from "../../../components/AgroModals/InfoVisitaModal"
import { useCaracterizacion } from "../../../hooks/useCaracterizacion"
import {
    getUP,
    getProductorDetalle,
    getArchivosUP,
    descargarArchivoUP,
    descargarCaracterizacionUP,
    getVisitas,
} from "../../../services/agroService"
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage"
import { descargarBlob } from "../../../utils/downloadBlob"
import {
    AGRO_COLORS,
    UP_ESTADO_RAW,
    UP_ESTADO_STYLE,
    normalizarEstadoUP,
} from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

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

export default function UPAdminDetailContentAdmin() {
    const { productorId, upId } = useParams()
    const navigate = useNavigate()
    const [up, setUp] = useState(null)
    const [productor, setProductor] = useState(null)
    const [archivos, setArchivos] = useState([])
    const [visitas, setVisitas] = useState([])
    const [loading, setLoading] = useState(true)
    const [desde, setDesde] = useState('')
    const [hasta, setHasta] = useState('')
    const [descargandoCaracterizacion, setDescargandoCaracterizacion] = useState(false)

    const { secciones, loading: loadingCaracterizacion, refresh: cargarSecciones } = useCaracterizacion()

    useEffect(() => {
        let activo = true
        const cargar = async () => {
            setLoading(true)
            try {
                const [upData, productorData] = await Promise.all([
                    getUP(upId),
                    getProductorDetalle(productorId),
                ])
                if (!activo) return
                setUp(upData)
                setProductor(productorData)
            } catch (e) {
                if (!activo) return
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: getApiErrorMessage(e, 'No se pudo cargar la unidad productiva.'),
                    confirmButtonColor: AGRO_COLORS.primary,
                })
            } finally {
                if (activo) setLoading(false)
            }
        }
        cargar()
        return () => { activo = false }
    }, [productorId, upId])

    useEffect(() => {
        if (productor?.usuario && upId) {
            cargarSecciones(productor.usuario, upId)
        }
    }, [productor, upId, cargarSecciones])

    useEffect(() => {
        let activo = true
        getArchivosUP(upId)
            .then((data) => { if (activo) setArchivos(data ?? []) })
            .catch(() => { if (activo) setArchivos([]) })
        return () => { activo = false }
    }, [upId])

    useEffect(() => {
        let activo = true
        getVisitas({ up_id: upId })
            .then((data) => { if (activo) setVisitas(data ?? []) })
            .catch(() => { if (activo) setVisitas([]) })
        return () => { activo = false }
    }, [upId])

    const visitasFiltradas = useMemo(() => {
        const desdeFecha = desde ? new Date(`${desde}T00:00:00`) : null
        const hastaFecha = hasta ? new Date(`${hasta}T23:59:59.999`) : null
        return visitas.filter((visita) => {
            if (!visita.FechaYHoraVisita) return !desdeFecha && !hastaFecha
            const fecha = new Date(visita.FechaYHoraVisita)
            if (Number.isNaN(fecha.getTime())) return true
            if (desdeFecha && fecha < desdeFecha) return false
            if (hastaFecha && fecha > hastaFecha) return false
            return true
        })
    }, [visitas, desde, hasta])

    const handleDescargarCaracterizacion = async () => {
        setDescargandoCaracterizacion(true)
        try {
            const { blob, nombreArchivo } = await descargarCaracterizacionUP(upId)
            descargarBlob(blob, nombreArchivo)
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo descargar el documento de caracterización.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
        } finally {
            setDescargandoCaracterizacion(false)
        }
    }

    const handleDescargarArchivo = async (archivo) => {
        try {
            const { blob, nombreArchivo } = await descargarArchivoUP(archivo.id)
            descargarBlob(blob, nombreArchivo || archivo.NombreArchivo || `archivo_${archivo.id}`)
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo descargar el archivo.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
        }
    }

    const estadoLabel = up?.estado_label ?? 'Sin estado'
    const estadoClass = UP_ESTADO_STYLE[estadoLabel] ?? 'bg-gray-100 text-gray-700'
    const nombre = up?.productor_nombre ?? 'Unidad productiva'
    const personal = secciones?.personal ?? {}
    const esAceptada = normalizarEstadoUP(estadoLabel) === normalizarEstadoUP(UP_ESTADO_RAW.ACEPTADA)

    return (
        <div className="w-full max-w-full">
            <Header
                componentLogo={<AgricultureIcon sx={{ fontSize: 40, color: 'ActiveCaption' }} />}
                headerText={up?.RUEA ? `UP ${up.RUEA}` : 'Unidad productiva'}
                message={'Información completa, caracterización, documentos y visitas de la UP'}
                colorLogo={AGRO_COLORS.primaryLight}
            />

            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4">
                <button
                    onClick={() => navigate(`/administrador/productores/${productorId}`)}
                    className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 sm:w-auto sm:justify-start"
                >
                    <ArrowBackIcon fontSize="small" /> Volver al productor
                </button>

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando unidad productiva...</p>
                ) : !up ? (
                    <p className="text-gray-500 text-sm">No se encontró la unidad productiva.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="rounded-xl border border-gray-200 bg-[#f4f9f7] p-4 sm:p-5">
                            <div className="flex flex-wrap items-start gap-3 sm:items-center">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#005C39] text-white shadow-sm">
                                    <AgricultureIcon sx={{ fontSize: 24, color: '#fff' }} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-base font-semibold text-gray-900">{nombre}</h3>
                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${estadoClass}`}>
                                            {estadoLabel}
                                        </span>
                                        {esAceptada && <QRButton up={up} />}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {up.RUEA ?? 'Sin RUEA'} · {up.tipo_up_label ?? 'Sin tipo'} · {up.nombre_predio ?? 'Predio sin nombre'}
                                    </p>
                                    {up.MotivoRechazo && (
                                        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                                            <span className="font-semibold">Motivo del rechazo:</span> {up.MotivoRechazo}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {loadingCaracterizacion ? (
                            <p className="text-gray-500 text-sm">Cargando caracterización...</p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
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
                                    <Fila etiqueta="RUEA" valor={secciones?.infoUp?.RUEA ?? up.RUEA} />
                                    <Fila etiqueta="Tipo de UP" valor={secciones?.infoUp?.TipoUP_Nombre ?? up.tipo_up_label} />
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
                                            const razas = i.Razas
                                                ? i.Razas.map((r) => r.Raza).filter(Boolean).join(', ')
                                                : ''
                                            return (
                                                <div className="flex flex-col gap-0.5 text-xs text-gray-600">
                                                    <div className="flex flex-wrap justify-between gap-x-3">
                                                        <span className="font-medium">{i.GrupoAnimal}</span>
                                                        <span>Cantidad: {total}</span>
                                                    </div>
                                                    {razas && <span className="text-gray-500">Razas: {razas}</span>}
                                                </div>
                                            )
                                        }}
                                    />
                                    <Bloque titulo="Validación">
                                        <Fila etiqueta="Estado" valor={estadoLabel} />
                                        <Fila etiqueta="Validado por" valor={up.validado_por_nombre} />
                                        <Fila etiqueta="Fecha de validación" valor={up.FechaValidacion} />
                                        <Fila etiqueta="Fecha de caracterización" valor={up.FechaCaracterizacion} />
                                        <Fila etiqueta="Fecha de actualización" valor={secciones?.adicional?.FechaActualizacion ?? up.FechaActualizacion} />
                                    </Bloque>
                                </div>
                            </div>
                        )}

                        <div className="rounded-xl border border-gray-200">
                            <div className="flex items-center gap-2 border-b border-gray-200 bg-[#e8f3ef] px-3 py-2.5 sm:px-4">
                                <InsertDriveFileOutlinedIcon sx={{ fontSize: 18, color: '#015d3b' }} />
                                <h4 className="text-sm font-semibold text-[#015d3b]">Documentos</h4>
                            </div>
                            <div className="flex flex-col gap-3 p-3 sm:p-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">Documento de caracterización</p>
                                        <p className="text-xs text-gray-500">PDF generado con la información de la caracterización.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDescargarCaracterizacion}
                                        disabled={descargandoCaracterizacion}
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#015d3b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#004d2f] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <DownloadIcon sx={{ fontSize: 16 }} />
                                        {descargandoCaracterizacion ? 'Generando...' : 'Descargar PDF'}
                                    </button>
                                </div>

                                <div className="border-t border-gray-100 pt-3">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Archivos subidos ({archivos.length})
                                    </p>
                                    {archivos.length === 0 ? (
                                        <p className="text-sm text-gray-500">No hay archivos subidos para esta UP.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {archivos.map((archivo) => (
                                                <div
                                                    key={archivo.id}
                                                    className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-gray-800">
                                                            {archivo.Descripcion || archivo.NombreArchivo || `Archivo ${archivo.id}`}
                                                        </p>
                                                        {archivo.NombreArchivo && (
                                                            <p className="truncate text-xs text-gray-500">{archivo.NombreArchivo}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDescargarArchivo(archivo)}
                                                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                                                    >
                                                        <DownloadIcon sx={{ fontSize: 16 }} /> Descargar
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-[#e8f3ef] px-3 py-2.5 sm:px-4">
                                <div className="flex items-center gap-2">
                                    <EventIcon sx={{ fontSize: 18, color: '#015d3b' }} />
                                    <h4 className="text-sm font-semibold text-[#015d3b]">
                                        Visitas técnicas ({visitasFiltradas.length} de {visitas.length})
                                    </h4>
                                </div>
                                <div className="flex flex-wrap items-end gap-2">
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Desde</label>
                                        <input
                                            type="date"
                                            value={desde}
                                            onChange={(e) => setDesde(e.target.value)}
                                            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#015d3b] focus:ring-2 focus:ring-[#015d3b]/20"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Hasta</label>
                                        <input
                                            type="date"
                                            value={hasta}
                                            onChange={(e) => setHasta(e.target.value)}
                                            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-[#015d3b] focus:ring-2 focus:ring-[#015d3b]/20"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setDesde(''); setHasta('') }}
                                        disabled={!desde && !hasta}
                                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                            </div>
                            <div className="p-3 sm:p-4">
                                {visitas.length === 0 ? (
                                    <p className="text-sm text-gray-500">No hay visitas técnicas registradas para esta UP.</p>
                                ) : visitasFiltradas.length === 0 ? (
                                    <p className="text-sm text-gray-500">No hay visitas en el rango de fechas seleccionado.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {visitasFiltradas.map((visita, i) => (
                                            <VisitaInfoCard
                                                key={visita.id}
                                                visita={visita}
                                                numero={i + 1}
                                                onClick={() => mostrarInfoVisita(visita, i + 1)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
