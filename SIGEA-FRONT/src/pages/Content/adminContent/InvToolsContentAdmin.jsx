import HandymanIcon from '@mui/icons-material/Handyman'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import HerramientaPreviewCard from "../../../components/HerramientaPreviewCard/HerramientaPreviewCard"
import InventoryFilterBar from "../../../components/InventoryFilterBar/InventoryFilterBar"
import { useHerramientas } from "../../../hooks/useHerramientas"
import { getFuncionarios, asignarHerramientaDirecto, getAsignacionHerramientas, devolverHerramienta, getTiposHerramientas } from "../../../services/agroService"
import { abrirModalAsignarHerramienta } from "../../../components/AgroModals/AsignarHerramientaModal"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import { esRegistroActivo } from "../../../utils/insumoHelpers"
import Swal from 'sweetalert2'

export default function InvToolsContentAdmin() {
    const navigate = useNavigate()
    const { herramientas, loading, error, eliminar, refresh } = useHerramientas()

    // Asignaciones vigentes (sin devolver), indexadas por herramienta.
    const [asignaciones, setAsignaciones] = useState({})
    const [tipos, setTipos] = useState([])
    const [busqueda, setBusqueda] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('')

    const cargarAsignaciones = useCallback(async () => {
        try {
            const data = (await getAsignacionHerramientas()) ?? []
            const vigentes = {}
            for (const a of data) {
                if (!a.Entregado) vigentes[a.Herramienta] = a
            }
            setAsignaciones(vigentes)
        } catch {
            setAsignaciones({})
        }
    }, [])

    useEffect(() => {
        let activo = true
        ;(async () => { if (activo) await cargarAsignaciones() })()
        return () => { activo = false }
    }, [cargarAsignaciones])

    useEffect(() => {
        let activo = true
        getTiposHerramientas()
            .then((data) => { if (activo) setTipos(data ?? []) })
            .catch(() => {})
        return () => { activo = false }
    }, [])

    const handleDevolver = async (herramienta, asignacion) => {
        const confirmacion = await Swal.fire({
            icon: 'question',
            title: 'Registrar devolución',
            text: 'La herramienta quedará disponible para asignarla de nuevo.',
            showCancelButton: true,
            confirmButtonText: 'Sí, registrar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: AGRO_COLORS.primary,
        })
        if (!confirmacion.isConfirmed) return
        try {
            await devolverHerramienta(asignacion.id)
            Swal.fire({
                icon: 'success',
                title: 'Devolución registrada',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
            })
            cargarAsignaciones()
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err?.response?.data?.error || 'No se pudo registrar la devolución. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
        }
    }

    const handleAnadir = () => {
        navigate('/administrador/inventario/herramientas/nuevo')
    }

    const handleAsignar = async (herramienta) => {
        try {
            const funcionarios = (await getFuncionarios()) ?? []
            const result = await abrirModalAsignarHerramienta(herramienta, funcionarios)
            if (!result.isConfirmed) return

            await asignarHerramientaDirecto(herramienta.id, result.value)
            Swal.fire({
                icon: 'success',
                title: 'Asignación realizada',
                text: 'La herramienta fue asignada correctamente al funcionario.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
            })
            refresh()
            cargarAsignaciones()
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err?.response?.data?.error || 'No se pudo realizar la asignación. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
        }
    }

    const handleEditar = (herramienta) => {
        navigate(`/administrador/inventario/herramientas/editar/${herramienta.id}`)
    }

    const handleEliminar = async (herramienta) => {
        const confirmacion = await Swal.fire({
            icon: 'warning',
            title: '¿Eliminar herramienta?',
            text: `Se eliminará "${herramienta?.Herramienta}". Esta acción no se puede deshacer.`,
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: AGRO_COLORS.danger
        })

        if (!confirmacion.isConfirmed) return

        const result = await eliminar(herramienta.id)
        if (result.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Herramienta eliminada',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar la herramienta.',
                confirmButtonColor: AGRO_COLORS.primary
            })
        }
    }

    const opcionesTipo = useMemo(
        () => tipos.map((tipo) => ({ value: String(tipo.id), label: tipo.TipoHerramienta })),
        [tipos]
    )

    const herramientasFiltradas = useMemo(() => {
        const q = busqueda.trim().toLowerCase()
        return herramientas.filter((herramienta) => {
            const texto = `${herramienta.Herramienta ?? ''} ${herramienta.Descripcion ?? ''}`.toLowerCase()
            const coincideTexto = !q || texto.includes(q)
            const coincideTipo = !filtroTipo || String(herramienta.TipoHerramienta) === filtroTipo
            const activo = esRegistroActivo(herramienta)
            const coincideEstado = !filtroEstado || (filtroEstado === 'activo' ? activo : !activo)
            const asignada = Boolean(asignaciones[herramienta.id])
            const coincideDisponibilidad = !filtroDisponibilidad
                || (filtroDisponibilidad === 'asignada' ? asignada : !asignada)
            return coincideTexto && coincideTipo && coincideEstado && coincideDisponibilidad
        })
    }, [herramientas, busqueda, filtroTipo, filtroEstado, filtroDisponibilidad, asignaciones])

    const limpiarFiltros = () => {
        setBusqueda('')
        setFiltroTipo('')
        setFiltroEstado('')
        setFiltroDisponibilidad('')
    }

    return (
        <>
            <Header
                componentLogo={
                    <HandymanIcon
                        sx={{ fontSize: 40, color: "ActiveCaption" }}
                    />
                }
                headerText={'Gestión de herramientas'}
                message={'Lista y administra las herramientas registradas en el sistema'}
                colorLogo={AGRO_COLORS.primaryLight}
                firstButton={
                    <ButtonLink
                        buttonText={'Añadir herramienta'}
                        onClick={handleAnadir}
                    />
                }
            />
            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4 overflow-y-hidden">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Herramientas del sistema</h3>
                    <p className="text-xs text-gray-500">{herramientas.length} herramienta(s) registrada(s)</p>
                </div>

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando herramientas...</p>
                ) : error ? (
                    <p className="text-red-600 text-sm">No se pudieron cargar las herramientas. Intenta de nuevo.</p>
                ) : herramientas.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay herramientas registradas en el sistema.</p>
                ) : (
                    <>
                        <InventoryFilterBar
                            search={busqueda}
                            onSearchChange={setBusqueda}
                            searchPlaceholder="Buscar por nombre o descripción..."
                            total={herramientas.length}
                            shown={herramientasFiltradas.length}
                            onClear={limpiarFiltros}
                            filters={[
                                {
                                    key: 'tipo',
                                    label: 'Tipo',
                                    value: filtroTipo,
                                    onChange: setFiltroTipo,
                                    options: opcionesTipo,
                                },
                                {
                                    key: 'estado',
                                    label: 'Estado',
                                    value: filtroEstado,
                                    onChange: setFiltroEstado,
                                    options: [
                                        { value: 'activo', label: 'Activos' },
                                        { value: 'inactivo', label: 'Inactivos' },
                                    ],
                                },
                                {
                                    key: 'disponibilidad',
                                    label: 'Disponibilidad',
                                    value: filtroDisponibilidad,
                                    onChange: setFiltroDisponibilidad,
                                    options: [
                                        { value: 'disponible', label: 'Disponibles' },
                                        { value: 'asignada', label: 'Asignadas' },
                                    ],
                                },
                            ]}
                        />
                        {herramientasFiltradas.length === 0 ? (
                            <p className="text-gray-500 text-sm">
                                No hay herramientas que coincidan con la búsqueda o los filtros.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 2xl:grid-cols-2">
                                {herramientasFiltradas.map((herramienta) => (
                                    <HerramientaPreviewCard
                                        key={herramienta.id}
                                        herramienta={herramienta}
                                        onEdit={handleEditar}
                                        onDelete={handleEliminar}
                                        onAsignar={handleAsignar}
                                        asignacion={asignaciones[herramienta.id]}
                                        onDevolver={handleDevolver}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    )
}