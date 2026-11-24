import { useCallback, useEffect, useMemo, useState } from "react"
import PaymentsIcon from '@mui/icons-material/Payments'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import Swal from 'sweetalert2'
import { Header } from "../../../components/Tettles-Buttons/Title"
import TabList from "../../../components/TabList/TabList"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import {
    getAperos,
    getPajillas,
    crearApero,
    actualizarApero,
    eliminarApero,
    crearPajilla,
    actualizarPajilla,
    eliminarPajilla,
} from "../../../services/visitasService"

const TABS = [
    { id: 'aperos', label: 'Aperos' },
    { id: 'pajillas', label: 'Pajillas' },
]

const NOMBRE_CAMPO = {
    aperos: 'Apero',
    pajillas: 'Pajilla',
}

const VALOR_CAMPO = {
    aperos: 'ValorHora',
    pajillas: 'ValorPajilla',
}

const formatearValor = (valor) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
}).format(Number(valor) || 0)

const mensajeError = (err) => {
    const data = err?.response?.data
    if (!data) return ''
    if (typeof data === 'string') return data
    if (data.error) return data.error
    const primero = Object.values(data).flat().find((valor) => typeof valor === 'string')
    return primero ?? ''
}

export default function ServiciosPagosContentAdmin() {
    const [aperos, setAperos] = useState([])
    const [pajillas, setPajillas] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [tab, setTab] = useState('aperos')
    const [modal, setModal] = useState(null)
    const [form, setForm] = useState({ nombre: '', valor: '' })
    const [formError, setFormError] = useState('')
    const [guardando, setGuardando] = useState(false)

    const cargar = useCallback(async () => {
        setLoading(true)
        try {
            const [ape, paj] = await Promise.all([
                getAperos(),
                getPajillas(),
            ])
            setAperos(Array.isArray(ape) ? ape : [])
            setPajillas(Array.isArray(paj) ? paj : [])
            setError(null)
        } catch {
            setError('No se pudieron cargar las tarifas.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        let activo = true
        Promise.resolve().then(() => {
            if (activo) cargar()
        })
        return () => { activo = false }
    }, [cargar])

    const tabActual = TABS.find((item) => item.id === tab) ?? TABS[0]
    const items = useMemo(
        () => (tab === 'aperos' ? aperos : pajillas),
        [tab, aperos, pajillas],
    )

    const abrirModal = (tipo, item = null) => {
        const campoNombre = NOMBRE_CAMPO[tipo]
        const campoValor = VALOR_CAMPO[tipo]
        setModal({ tipo, item })
        setForm({
            nombre: item?.[campoNombre] ?? '',
            valor: campoValor ? String(item?.[campoValor] ?? '') : '',
        })
        setFormError('')
    }

    const cerrarModal = () => {
        if (guardando) return
        setModal(null)
        setFormError('')
    }

    const guardar = async (e) => {
        e.preventDefault()
        if (!modal) return

        const { tipo, item } = modal
        const nombre = form.nombre.trim()
        if (!nombre) {
            setFormError('El nombre es obligatorio.')
            return
        }

        let valor = null
        if (String(form.valor).trim() === '') {
            setFormError('Ingresa el valor de la tarifa.')
            return
        }
        const numero = Number(form.valor)
        if (!Number.isInteger(numero) || numero < 0) {
            setFormError('Ingresa un valor entero mayor o igual a 0.')
            return
        }
        valor = numero

        setGuardando(true)
        setFormError('')
        try {
            if (tipo === 'aperos') {
                const payload = { Apero: nombre, ValorHora: valor }
                if (item) await actualizarApero(item.id, payload)
                else await crearApero(payload)
            } else {
                const payload = { Pajilla: nombre, ValorPajilla: valor }
                if (item) await actualizarPajilla(item.id, payload)
                else await crearPajilla(payload)
            }

            setModal(null)
            await cargar()
            Swal.fire({
                icon: 'success',
                title: item ? 'Cambios guardados' : 'Registro creado',
                text: item ? 'La información fue actualizada.' : 'El registro fue agregado correctamente.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 1800,
                timerProgressBar: true,
            })
        } catch (err) {
            setFormError(mensajeError(err) || 'No se pudo guardar. Intenta de nuevo.')
        } finally {
            setGuardando(false)
        }
    }

    const eliminar = async (tipo, item) => {
        const campoNombre = NOMBRE_CAMPO[tipo]
        const nombre = item?.[campoNombre] ?? 'este registro'
        const confirmacion = await Swal.fire({
            icon: 'warning',
            title: '¿Eliminar registro?',
            text: `Se eliminará "${nombre}". Esta acción no se puede deshacer.`,
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: AGRO_COLORS.danger,
        })
        if (!confirmacion.isConfirmed) return

        try {
            if (tipo === 'aperos') await eliminarApero(item.id)
            else await eliminarPajilla(item.id)

            await cargar()
            Swal.fire({
                icon: 'success',
                title: 'Registro eliminado',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 1600,
                timerProgressBar: true,
            })
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'No se pudo eliminar',
                text: mensajeError(err) || 'El registro está en uso o no se pudo eliminar.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
        }
    }

    const nombreDe = (tipo, item) => item?.[NOMBRE_CAMPO[tipo]] ?? ''
    const valorDe = (tipo, item) => item?.[VALOR_CAMPO[tipo]] ?? null

    return (
        <>
            <Header
                componentLogo={<PaymentsIcon sx={{ fontSize: 40, color: 'ActiveCaption' }} />}
                headerText={'Servicios pagos'}
                message={'Administra los aperos, pajillas y sus tarifas'}
                colorLogo={'#55bd85'}
            />

            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Tarifas de aperos y pajillas</h3>
                    <p className="text-xs text-gray-500">
                        Estos valores se usan para calcular el total del recibo de pago.
                    </p>
                </div>

                <TabList
                    categories={TABS.map((item) => item.label)}
                    active={tabActual.label}
                    onChange={(label) => {
                        const siguiente = TABS.find((item) => item.label === label)
                        if (siguiente) setTab(siguiente.id)
                    }}
                />

                <div className="my-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-gray-800">{tabActual.label}</p>
                        <p className="text-xs text-gray-500">
                            {loading ? 'Cargando...' : `${items.length} registro(s)`}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => abrirModal(tab)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#005C39] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#004d2f]"
                    >
                        <AddIcon sx={{ fontSize: 18 }} />
                        Agregar {tabActual.label.toLowerCase().replace(/s$/, '')}
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-2">
                        <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
                        <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
                        <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
                    </div>
                ) : error ? (
                    <p className="text-red-600 text-sm">{error}</p>
                ) : items.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-gray-300 bg-[#f4f9f7] py-10 text-center text-sm text-gray-500">
                        No hay {tabActual.label.toLowerCase()} registrados.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {items.map((item) => {
                            const valor = valorDe(tab, item)
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-[#3e9a8a]"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#005C39] text-white">
                                        <PaymentsIcon sx={{ fontSize: 20 }} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-gray-900">
                                            {nombreDe(tab, item)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {`Valor ${tab === 'aperos' ? 'por hora' : 'por pajilla'}: ${formatearValor(valor)}`}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => abrirModal(tab, item)}
                                        title="Editar"
                                        className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-100"
                                    >
                                        <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => eliminar(tab, item)}
                                        title="Eliminar"
                                        className="rounded-lg border border-gray-300 bg-white p-2 text-red-600 transition-colors hover:bg-red-50"
                                    >
                                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {modal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
                    onClick={cerrarModal}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-base font-semibold text-gray-900">
                            {modal.item ? 'Editar' : 'Agregar'} {TABS.find((item) => item.id === modal.tipo)?.label.toLowerCase().replace(/s$/, '')}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                            Los cambios se reflejan en el recibo de pago de las próximas visitas.
                        </p>

                        <form onSubmit={guardar} className="mt-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={form.nombre}
                                    onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
                                    maxLength={255}
                                    autoFocus
                                    placeholder="Ej. Arado de discos"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#015d3b] focus:ring-2 focus:ring-[#015d3b]/20"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {modal.tipo === 'aperos' ? 'Valor por hora (COP)' : 'Valor por pajilla (COP)'}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={form.valor}
                                    onChange={(e) => setForm((prev) => ({ ...prev, valor: e.target.value }))}
                                    placeholder="Ej. 80000"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#015d3b] focus:ring-2 focus:ring-[#015d3b]/20"
                                />
                            </div>

                            {formError && (
                                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{formError}</p>
                            )}

                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={cerrarModal}
                                    disabled={guardando}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardando}
                                    className="rounded-lg bg-[#005C39] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004d2f] disabled:opacity-50"
                                >
                                    {guardando ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
