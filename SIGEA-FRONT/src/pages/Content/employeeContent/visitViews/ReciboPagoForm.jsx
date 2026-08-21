import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { Header } from "../../../../components/Tettles-Buttons/Title"
import EstadoVisita from "../../../../components/EstadoVisita/EstadoVisita"
import VisitaResumen from "../../../../components/VisitaResumen/VisitaResumen"
import { Campo } from './fields'
import LienzoFirma from './visitas/LienzoFirma'
import { getServiciosPagos, getAperos, getPajillas, enviarFormularioRecibo, marcarVisitaRealizada } from "../../../../services/agroService"
import { getInfoProductor, getInfoUP, getInfoPredio } from './visitas/visitaService'
import Swal from 'sweetalert2'
import { AGRO_COLORS } from "../../../../utils/agroConstants"
import { formatFecha } from "../../../../utils/dateHelpers"

const inputClase = "w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white disabled:bg-gray-100 disabled:text-gray-500"
const labelClase = "text-xs font-semibold uppercase tracking-wide text-gray-500"

const normalizar = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export default function ReciboPagoForm() {
    const location = useLocation()
    const navigate = useNavigate()
    const visita = location.state?.visita

    const solicitud = useMemo(() => visita?.solicitud_info ?? {}, [visita])
    const solicitante = useMemo(() => solicitud.solicitante ?? {}, [solicitud])
    const userId = solicitante.usuario_id
    const solicitudId = solicitud.id
    const upId = solicitud.up_id

    const [servicios, setServicios] = useState([])
    const [aperos, setAperos] = useState([])
    const [pajillas, setPajillas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [finalizando, setFinalizando] = useState(false)

    const [datos, setDatos] = useState({
        fecha: '',
        usuario: '',
        vereda: '',
        sector: '',
        cedula: '',
        telefono: '',
        ruea: '',
    })

    const [form, setForm] = useState({
        servicio_pago_id: '',
        apero_id: '',
        numero_horas: '',
        pajilla_id: '',
        numero_pajillas: '',
        toro: '',
        valor_total: '',
        firma_usuario: '',
        firma_funcionario: '',
    })

    const esMaquinaria = useMemo(() => {
        const s = servicios.find((x) => String(x.id) === String(form.servicio_pago_id))
        return !!s && normalizar(s.ServicioPago).includes('maquinaria')
    }, [servicios, form.servicio_pago_id])

    const esInseminacion = useMemo(() => {
        const s = servicios.find((x) => String(x.id) === String(form.servicio_pago_id))
        return !!s && normalizar(s.ServicioPago).includes('inseminacion')
    }, [servicios, form.servicio_pago_id])

    const aperoSeleccionado = useMemo(
        () => aperos.find((a) => String(a.id) === String(form.apero_id)) ?? null,
        [aperos, form.apero_id]
    )
    const pajillaSeleccionada = useMemo(
        () => pajillas.find((p) => String(p.id) === String(form.pajilla_id)) ?? null,
        [pajillas, form.pajilla_id]
    )

    const valorUnitario = esMaquinaria
        ? (aperoSeleccionado?.ValorHora ?? '')
        : esInseminacion
            ? (pajillaSeleccionada?.ValorPajilla ?? '')
            : ''

    const valorTotalMaquinaria = useMemo(() => {
        if (!esMaquinaria) return ''
        const horas = Number(form.numero_horas)
        const unit = Number(valorUnitario)
        if (!Number.isFinite(horas) || horas <= 0 || !Number.isFinite(unit)) return ''
        return String(horas * unit)
    }, [esMaquinaria, form.numero_horas, valorUnitario])

    useEffect(() => {
        let activo = true
        const cargar = async () => {
            setCargando(true)
            setError(null)
            try {
                const [serv, ape, paj] = await Promise.all([
                    getServiciosPagos(),
                    getAperos(),
                    getPajillas(),
                ])
                if (!activo) return
                setServicios(serv ?? [])
                setAperos(ape ?? [])
                setPajillas(paj ?? [])
            } catch {
                if (activo) setError('No se pudieron cargar los servicios y tarifas. Intenta de nuevo.')
            } finally {
                if (activo) setCargando(false)
            }
        }
        cargar()
        return () => { activo = false }
    }, [])

    useEffect(() => {
        if (!userId || !solicitudId) return
        let activo = true
        const nombre = [solicitante.primer_nombre, solicitante.primer_apellido]
            .filter(Boolean).join(' ').trim()

        const cargar = async () => {
            try {
                const [p, u, pr] = await Promise.all([
                    getInfoProductor(userId, solicitudId, upId),
                    getInfoUP(userId, solicitudId, upId),
                    getInfoPredio(userId, solicitudId, upId),
                ])
                if (!activo) return
                setDatos({
                    fecha: visita?.FechaYHoraVisita ? formatFecha(visita.FechaYHoraVisita) : '',
                    usuario: nombre,
                    vereda: pr?.Vereda ?? '',
                    sector: pr?.Sector ?? '',
                    cedula: p?.DocumentoProductor ?? '',
                    telefono: p?.Celular ?? '',
                    ruea: u?.RUEA ?? p?.Rudea ?? '',
                })
            } catch {
                if (activo) {
                    setDatos((d) => ({ ...d, fecha: visita?.FechaYHoraVisita ? formatFecha(visita.FechaYHoraVisita) : '', usuario: nombre }))
                }
            }
        }
        cargar()
        return () => { activo = false }
    }, [userId, solicitudId, upId, visita, solicitante])

    const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

    const finalizar = async () => {
        const faltantes = []
        if (!form.servicio_pago_id) faltantes.push('Servicio a pagar')

        if (esMaquinaria) {
            if (!form.apero_id) faltantes.push('Apero o implemento')
            if (!String(form.numero_horas ?? '').trim() || Number(form.numero_horas) <= 0) faltantes.push('Nº de horas')
        } else if (esInseminacion) {
            if (!form.pajilla_id) faltantes.push('Pajilla')
            if (!String(form.numero_pajillas ?? '').trim() || Number(form.numero_pajillas) <= 0) faltantes.push('Nº de pajillas')
            if (form.toro === '') faltantes.push('Toro')
            if (!String(form.valor_total ?? '').trim()) faltantes.push('Valor total')
        } else {
            faltantes.push('Servicio a pagar')
        }

        if (!form.firma_usuario) faltantes.push('Firma del usuario')
        if (!form.firma_funcionario) faltantes.push('Firma del funcionario')

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
        const servicio = servicios.find((s) => String(s.id) === String(form.servicio_pago_id))
        const payload = {
            visita_id: visita?.id,
            servicio_pago_id: form.servicio_pago_id,
            servicio_pago: servicio?.ServicioPago ?? '',
            apero_id: esMaquinaria ? form.apero_id : null,
            numero_horas: esMaquinaria ? Number(form.numero_horas) : null,
            pajilla_id: esInseminacion ? form.pajilla_id : null,
            numero_pajillas: esInseminacion ? Number(form.numero_pajillas) : null,
            toro: esInseminacion ? (form.toro === 'si') : null,
            valor_total: esMaquinaria ? Number(valorTotalMaquinaria) : (esInseminacion ? Number(form.valor_total) : null),
            firma_usuario: form.firma_usuario,
            firma_funcionario: form.firma_funcionario,
        }

        try {
            await enviarFormularioRecibo(payload)
            await marcarVisitaRealizada(visita.id)
            Swal.fire({
                icon: 'success',
                title: 'Recibo registrado',
                text: 'El recibo de pago fue generado y la visita fue marcada como realizada.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
            }).then(() => navigate('/funcionario/agenda'))
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo guardar el recibo de pago. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
        } finally {
            setFinalizando(false)
        }
    }

    const datoPredefinido = (label, value) => (
        <div className="flex flex-col gap-1">
            <label className={labelClase}>{label}</label>
            <input value={value ?? ''} disabled className={inputClase} />
        </div>
    )

    return (
        <div className="w-full max-w-full">
            <Header
                componentLogo={<ReceiptLongIcon sx={{ fontSize: 40, color: "ActiveCaption" }} />}
                headerText={'Recibo de pago'}
                message={userId ? 'Diligencie el recibo de pago del servicio prestado al productor.' : 'No se pudo identificar el productor de la visita.'}
                colorLogo={'#55bd85'}
            />

            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full">
                {!visita ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-sm mb-4">No se recibió la información de la visita.</p>
                        <button onClick={() => navigate('/funcionario/agenda')} className="px-4 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors">
                            Volver a la agenda
                        </button>
                    </div>
                ) : !userId ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-sm mb-4">La visita no tiene un productor asociado.</p>
                        <button onClick={() => navigate('/funcionario/agenda')} className="px-4 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors">
                            Volver a la agenda
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-start mb-4">
                            <EstadoVisita estado={visita?.estado} />
                        </div>

                        <VisitaResumen visita={visita} />

                        <div className="mt-6 flex flex-col gap-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {datoPredefinido('Fecha', datos.fecha)}
                                {datoPredefinido('Usuario', datos.usuario)}
                                {datoPredefinido('Vereda', datos.vereda)}
                                {datoPredefinido('Sector', datos.sector)}
                                {datoPredefinido('Cédula', datos.cedula)}
                                {datoPredefinido('Teléfono', datos.telefono)}
                                {datoPredefinido('Nº de RUEA', datos.ruea)}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className={labelClase}>Servicio a pagar</label>
                                <div className="flex flex-wrap gap-6">
                                    {servicios.map((s) => (
                                        <label key={s.id} className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                                            <input
                                                type="radio"
                                                name="servicio_pago"
                                                value={s.id}
                                                checked={String(form.servicio_pago_id) === String(s.id)}
                                                onChange={(e) => onChange('servicio_pago_id', e.target.value)}
                                                className="accent-[#015d3b]"
                                            />
                                            {s.ServicioPago}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {esMaquinaria && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Campo label="Nº horas" name="numero_horas" type="number" min={1} value={form.numero_horas} onChange={onChange} required />
                                    <Campo label="Valor unitario" name="valor_unitario" type="number" value={valorUnitario} onChange={() => {}} disabled />
                                    <Campo label="Valor total" name="valor_total" type="number" value={valorTotalMaquinaria} onChange={() => {}} disabled />
                                    <div className="flex flex-col gap-1">
                                        <label className={labelClase}>Apero o implemento</label>
                                        <select
                                            value={form.apero_id}
                                            onChange={(e) => onChange('apero_id', e.target.value)}
                                            className={inputClase}
                                        >
                                            <option value="">Seleccione un apero</option>
                                            {aperos.map((a) => (
                                                <option key={a.id} value={a.id}>{a.Apero}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {esInseminacion && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Campo label="Nº de pajillas" name="numero_pajillas" type="number" min={1} value={form.numero_pajillas} onChange={onChange} required />
                                    <div className="flex flex-col gap-1">
                                        <label className={labelClase}>Toro</label>
                                        <div className="flex gap-4 items-center h-full pt-1">
                                            {['si', 'no'].map((op) => (
                                                <label key={op} className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                                                    <input
                                                        type="radio"
                                                        name="toro"
                                                        value={op}
                                                        checked={form.toro === op}
                                                        onChange={(e) => onChange('toro', e.target.value)}
                                                        className="accent-[#015d3b]"
                                                    />
                                                    {op === 'si' ? 'Sí' : 'No'}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className={labelClase}>Pajilla</label>
                                        <select
                                            value={form.pajilla_id}
                                            onChange={(e) => onChange('pajilla_id', e.target.value)}
                                            className={inputClase}
                                        >
                                            <option value="">Seleccione una pajilla</option>
                                            {pajillas.map((p) => (
                                                <option key={p.id} value={p.id}>{p.Pajilla}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <Campo label="Valor unitario" name="valor_unitario" type="number" value={valorUnitario} onChange={() => {}} disabled />
                                    <Campo label="Valor total" name="valor_total" type="number" min={0} value={form.valor_total} onChange={onChange} required />
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
                                <LienzoFirma label="Firma del usuario" valor={form.firma_usuario} onChange={(v) => onChange('firma_usuario', v)} />
                                <LienzoFirma label="Firma del funcionario" valor={form.firma_funcionario} onChange={(v) => onChange('firma_funcionario', v)} />
                            </div>

                            {error && <p className="text-sm text-red-600">{error}</p>}
                            {cargando && <p className="text-sm text-gray-500">Cargando servicios y tarifas...</p>}
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <button
                                onClick={() => navigate('/funcionario/agenda')}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Volver a la agenda
                            </button>
                            {visita?.estado ? (
                                <span className="px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-semibold">
                                    Visita completada
                                </span>
                            ) : (
                                <button
                                    onClick={finalizar}
                                    disabled={finalizando || cargando}
                                    className="px-4 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {finalizando ? 'Guardando...' : 'Guardar y finalizar visita'}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
