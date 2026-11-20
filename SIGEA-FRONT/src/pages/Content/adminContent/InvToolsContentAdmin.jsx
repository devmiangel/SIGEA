import HandymanIcon from '@mui/icons-material/Handyman'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import HerramientaPreviewCard from "../../../components/HerramientaPreviewCard/HerramientaPreviewCard"
import InventoryFilterBar from "../../../components/InventoryFilterBar/InventoryFilterBar"
import PaginationBar from "../../../components/PaginationBar/PaginationBar"
import { useHerramientas } from "../../../hooks/useHerramientas"
import { getFuncionarios, asignarHerramientaDirecto, getAsignacionHerramientas, devolverHerramienta, getTiposHerramientas } from "../../../services/agroService"
import { abrirModalAsignarHerramienta } from "../../../components/AgroModals/AsignarHerramientaModal"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

export default function InvToolsContentAdmin() {
    const navigate = useNavigate()

    // Asignaciones vigentes (sin devolver), indexadas por herramienta.
    const [asignaciones, setAsignaciones] = useState({})
    const [tipos, setTipos] = useState([])
    const [busqueda, setBusqueda] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('')

    const {
        herramientas,
        count,
        page,
        setPage,
        pageSize,
        loading,
        error,
        eliminar,
        refresh,
    } = useHerramientas({
        search: busqueda.trim(),
        tipo: filtroTipo,
        estado: filtroEstado,
        disponibilidad: filtroDisponibilidad,
    })

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

    const limpiarFiltros = () => {
        setBusqueda('')
        setFiltroTipo('')
        setFiltroEstado('')
        setFiltroDisponibilidad('')
        setPage(1)
    }

    const hayFiltros = Boolean(busqueda.trim()) || Boolean(filtroTipo)
        || Boolean(filtroEstado) || Boolean(filtroDisponibilidad)

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
                    <p className="text-xs text-gray-500">{count} herramienta(s) registrada(s)</p>
                </div>

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando herramientas...</p>
                ) : error ? (
                    <p className="text-red-600 text-sm">No se pudieron cargar las herramientas. Intenta de nuevo.</p>
                ) : count === 0 ? (
                    <div className="flex flex-col items-start gap-2">
                        <p className="text-gray-500 text-sm">
                            {hayFiltros
                                ? 'No hay herramientas que coincidan con la búsqueda o los filtros.'
                                : 'No hay herramientas registradas en el sistema.'}
                        </p>
                        {hayFiltros && (
                            <button
                                type="button"
                                onClick={limpiarFiltros}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <InventoryFilterBar
                            search={busqueda}
                            onSearchChange={(valor) => { setBusqueda(valor); setPage(1) }}
                            searchPlaceholder="Buscar por nombre o descripción..."
                            total={count}
                            shown={herramientas.length}
                            onClear={limpiarFiltros}
                            filters={[
                                {
                                    key: 'tipo',
                                    label: 'Tipo',
                                    value: filtroTipo,
                                    onChange: (valor) => { setFiltroTipo(valor); setPage(1) },
                                    options: opcionesTipo,
                                },
                                {
                                    key: 'estado',
                                    label: 'Estado',
                                    value: filtroEstado,
                                    onChange: (valor) => { setFiltroEstado(valor); setPage(1) },
                                    options: [
                                        { value: 'activo', label: 'Activos' },
                                        { value: 'inactivo', label: 'Inactivos' },
                                    ],
                                },
                                {
                                    key: 'disponibilidad',
                                    label: 'Disponibilidad',
                                    value: filtroDisponibilidad,
                                    onChange: (valor) => { setFiltroDisponibilidad(valor); setPage(1) },
                                    options: [
                                        { value: 'disponible', label: 'Disponibles' },
                                        { value: 'asignada', label: 'Asignadas' },
                                    ],
                                },
                            ]}
                        />
                        <div className="grid grid-cols-1 gap-3 2xl:grid-cols-2">
                            {herramientas.map((herramienta) => (
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
                        <PaginationBar
                            page={page}
                            count={count}
                            pageSize={pageSize}
                            onPageChange={setPage}
                            loading={loading}
                        />
                    </>
                )}
            </div>
        </>
    )
}