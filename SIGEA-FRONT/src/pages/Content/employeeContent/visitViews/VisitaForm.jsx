import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef, useMemo } from 'react'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import TabList from "../../../../components/TabList/TabList"
import { Header } from "../../../../components/Tettles-Buttons/Title"
import EstadoVisita from "../../../../components/EstadoVisita/EstadoVisita"
import VisitaResumen from "../../../../components/VisitaResumen/VisitaResumen"
import ResumenDescriptivo from './visitas/ResumenDescriptivo'
import SeccionDatosProductor from './visitas/SeccionDatosProductor'
import SeccionDescripcion from './visitas/SeccionDescripcion'
import SeccionAccion from './visitas/SeccionAccion'
import SeccionFirmas from './visitas/SeccionFirmas'
import { enviarFormularioVisita, getInfoProductor, getInfoUP, getInfoPredio } from './visitas/visitaService'
import { marcarVisitaRealizada } from "../../../../services/agroService"
import { useSeccion } from "../../../../hooks/useSeccion"
import Swal from 'sweetalert2'
import { AGRO_COLORS } from "../../../../utils/agroConstants"

const SECCIONES = [
    { nombre: 'Datos del productor', componente: SeccionDatosProductor },
    { nombre: 'Descripción', componente: SeccionDescripcion },
    { nombre: 'Acción tomada', componente: SeccionAccion },
    { nombre: 'Cierre', componente: SeccionFirmas },
]

const INICIAL = {
    fecha_recepcion: '',
    nruea: '',
    nombres_apellidos: '',
    sisben: '',
    documento_identidad: '',
    vereda_sector: '',
    telefono: '',
    tipo_visita: '',
    descripcion_solicitud: '',
    diagnostico_presuntivo: '',
    fecha_visita: '',
    funcionario: '',
    cc_funcionario: '',
    acciones: [],
    hora_inicio: '',
    accion_tomada: '',
    observaciones: '',
    hora_salida: '',
    calificacion: '',
    firmado: false,
    firma_usuario: '',
    firma_funcionario: '',
}

function aDatetimeLocal(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    if (isNaN(d.getTime())) return ''
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function VisitaForm() {
    const location = useLocation()
    const navigate = useNavigate()
    const visita = location.state?.visita

    const solicitud = useMemo(() => visita?.solicitud_info ?? {}, [visita])
    const solicitante = useMemo(() => solicitud.solicitante ?? {}, [solicitud])
    const userId = solicitante.usuario_id
    const solicitudId = solicitud.id
    const upId = solicitud.up_id

    const [active, setActive] = useState(SECCIONES[0].nombre)
    const [form, setForm] = useState(INICIAL)
    const [productor, setProductor] = useState(null)
    const [up, setUp] = useState(null)
    const [finalizando, setFinalizando] = useState(false)
    const { loading: cargandoDatos, cargarSeccion } = useSeccion()
    const prefillRef = useRef(false)

    useEffect(() => {
        if (!visita || prefillRef.current) return
        prefillRef.current = true

        const nombre = [solicitante.primer_nombre, solicitante.primer_apellido]
            .filter(Boolean).join(' ').trim()
        setForm((f) => ({
            ...f,
            nombres_apellidos: f.nombres_apellidos || nombre,
            funcionario: f.funcionario || visita?.funcionario_info?.nombre || '',
            cc_funcionario: f.cc_funcionario || visita?.funcionario_info?.documento || '',
            tipo_visita: f.tipo_visita || visita?.tipo_visita_label || '',
            descripcion_solicitud: f.descripcion_solicitud || solicitud.observacion || '',
            fecha_visita: f.fecha_visita || aDatetimeLocal(visita?.FechaYHoraVisita),
        }))
    }, [visita, solicitante, solicitud])

    useEffect(() => {
        if (!userId || !solicitudId) return
        let activo = true
        cargarSeccion(async () => {
            const [p, u, pr] = await Promise.all([
                getInfoProductor(userId, solicitudId, upId),
                getInfoUP(userId, solicitudId, upId),
                getInfoPredio(userId, solicitudId, upId),
            ])
            if (!activo) return
            setProductor(p)
            setUp(u)
            const ruea = u?.RUEA || u?.Rudea || u?.Rudev || p?.Rudea || ''
            const veredaSector = [pr?.Vereda, pr?.Sector].filter(Boolean).join(' - ')
            setForm((f) => ({
                ...f,
                nruea: f.nruea || ruea || '',
                vereda_sector: f.vereda_sector || veredaSector || '',
                documento_identidad: f.documento_identidad || p?.DocumentoProductor || '',
                telefono: f.telefono || p?.Celular || '',
                sisben: f.sisben || p?.Sisben || '',
            }))
        })
        return () => { activo = false }
    }, [userId, solicitudId, upId, cargarSeccion])

    const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

    const finalizar = async () => {
        const faltantes = []
        if (!String(form.documento_identidad ?? '').trim()) faltantes.push('Documento de identidad')
        if (!String(form.fecha_visita ?? '').trim()) faltantes.push('Fecha de visita')
        if (!String(form.tipo_visita ?? '').trim()) faltantes.push('Tipo de visita')
        if (!String(form.calificacion ?? '').trim()) faltantes.push('Calificación')

        if (faltantes.length) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos obligatorios',
                html: `Complete los campos obligatorios: <strong>${faltantes.join(', ')}</strong>.`,
                confirmButtonColor: AGRO_COLORS.primary,
            })
            return
        }

        setFinalizando(true)
        const payload = {
            ...form,
            usuario_id: userId,
            up_id: upId,
            tipo_visita_id: visita?.TipoVisita,
            funcionario_id: visita?.Funcionario,
            administrador_id: visita?.Administrador,
            motivo_id: 1,
            motivo_admin: solicitud.observacion || '',
            firmado: Boolean(form.firma_usuario || form.firma_funcionario),
        }

        try {
            await enviarFormularioVisita(payload)
            await marcarVisitaRealizada(visita.id)
            Swal.fire({
                icon: 'success',
                title: 'Visita realizada',
                text: 'El formulario fue generado y la visita fue marcada como realizada.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
            }).then(() => navigate('/funcionario/agenda'))
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar la visita. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
        } finally {
            setFinalizando(false)
        }
    }

    return (
        <div className="w-full max-w-full">
            <Header
                componentLogo={
                    <FactCheckOutlinedIcon sx={{ fontSize: 40, color: "ActiveCaption" }} />
                }
                headerText={'Formulario de visita técnica'}
                message={
                    userId
                        ? 'Diligencie el formulario de la visita asignada al productor.'
                        : 'No se pudo identificar el productor de la visita.'
                }
                colorLogo={'#55bd85'}
            />

            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full">
                {!visita ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-sm mb-4">
                            No se recibió la información de la visita.
                        </p>
                        <button
                            onClick={() => navigate('/funcionario/agenda')}
                            className="px-4 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors"
                        >
                            Volver a la agenda
                        </button>
                    </div>
                ) : !userId ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-sm mb-4">
                            La visita no tiene un productor asociado.
                        </p>
                        <button
                            onClick={() => navigate('/funcionario/agenda')}
                            className="px-4 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors"
                        >
                            Volver a la agenda
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-start mb-4">
                            <EstadoVisita estado={visita?.estado} />
                        </div>

                        <VisitaResumen visita={visita} />

                        {cargandoDatos ? (
                            <p className="text-sm text-gray-500 mb-6">
                                Cargando información del productor y la UP...
                            </p>
                        ) : (
                            <ResumenDescriptivo productor={productor} up={up} />
                        )}

                        <div className="mb-6 mt-6 w-full overflow-x-auto">
                            <div className="inline-flex">
                                <TabList
                                    categories={SECCIONES.map((s) => s.nombre)}
                                    active={active}
                                    onChange={setActive}
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            {SECCIONES.map((s) => {
                                if (s.nombre !== active) return null
                                const Seccion = s.componente
                                return (
                                    <div key={s.nombre}>
                                        <Seccion form={form} onChange={onChange} />
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <button
                                onClick={() => navigate('/funcionario/agenda')}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Volver a la agenda
                            </button>
                            <div className="flex gap-3">
                                {visita?.estado ? (
                                    <span className="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-semibold">
                                        Visita completada
                                    </span>
                                ) : (
                                    <button
                                        onClick={finalizar}
                                        disabled={finalizando}
                                        className="px-4 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {finalizando ? 'Guardando...' : 'Guardar y finalizar visita'}
                                    </button>
                                )}
                                {active !== SECCIONES[SECCIONES.length - 1].nombre && (
                                    <button
                                        onClick={() => {
                                            const idx = SECCIONES.findIndex((s) => s.nombre === active)
                                            setActive(SECCIONES[idx + 1].nombre)
                                        }}
                                        className="px-4 py-2 rounded-lg border border-[#015d3b] text-[#015d3b] text-sm font-semibold hover:bg-[#015d3b]/5 transition-colors"
                                    >
                                        Siguiente sección
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}