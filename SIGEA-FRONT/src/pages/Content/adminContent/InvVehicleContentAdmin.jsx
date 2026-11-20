import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback, useMemo } from 'react'
import DriveEtaIcon from '@mui/icons-material/DriveEta'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import VehiculoPreviewCard from "../../../components/VehiculoPreviewCard/VehiculoPreviewCard"
import InventoryFilterBar from "../../../components/InventoryFilterBar/InventoryFilterBar"
import PaginationBar from "../../../components/PaginationBar/PaginationBar"
import { useVehiculos } from "../../../hooks/useVehiculos"
import { getFuncionarios, getConductores, asignarVehiculoDirecto, getRegistroAsignacionVehiculos, devolverVehiculo, getMarcasVehiculos, getLineasVehiculos, getTiposVehiculos, getTiposCombustibles } from "../../../services/agroService"
import { abrirModalAsignarVehiculo } from "../../../components/AgroModals/AsignarVehiculoModal"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

export default function InvVehicleContentAdmin() {
    const navigate = useNavigate()

    // Asignaciones vigentes (sin devolver), indexadas por vehículo.
    const [asignaciones, setAsignaciones] = useState({})
    const [busqueda, setBusqueda] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const [filtroDisponibilidad, setFiltroDisponibilidad] = useState('')
    const [filtroMarca, setFiltroMarca] = useState('')
    const [filtroLinea, setFiltroLinea] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('')
    const [filtroCombustible, setFiltroCombustible] = useState('')
    const [filtroSoat, setFiltroSoat] = useState('')
    const [marcas, setMarcas] = useState([])
    const [lineas, setLineas] = useState([])
    const [tiposVehiculos, setTiposVehiculos] = useState([])
    const [tiposCombustibles, setTiposCombustibles] = useState([])

    const {
        vehiculos,
        count,
        page,
        setPage,
        pageSize,
        loading,
        error,
        eliminar,
        refresh,
    } = useVehiculos({
        search: busqueda.trim(),
        marca: filtroMarca,
        linea: filtroLinea,
        tipo: filtroTipo,
        combustible: filtroCombustible,
        estado: filtroEstado,
        disponibilidad: filtroDisponibilidad,
        soat: filtroSoat,
    })

    const cargarAsignaciones = useCallback(async () => {
        try {
            const data = (await getRegistroAsignacionVehiculos()) ?? []
            const vigentes = {}
            for (const a of data) {
                if (!a.Entregado) vigentes[a.DetalleVehiculo] = a
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
        Promise.all([
            getMarcasVehiculos(),
            getLineasVehiculos(),
            getTiposVehiculos(),
            getTiposCombustibles(),
        ])
            .then(([marcasData, lineasData, tiposData, combustiblesData]) => {
                if (!activo) return
                setMarcas(marcasData ?? [])
                setLineas(lineasData ?? [])
                setTiposVehiculos(tiposData ?? [])
                setTiposCombustibles(combustiblesData ?? [])
            })
            .catch(() => {})
        return () => { activo = false }
    }, [])

    const handleDevolver = async (vehiculo, asignacion) => {
        const confirmacion = await Swal.fire({
            icon: 'question',
            title: 'Registrar devolución',
            text: 'El vehículo quedará disponible para asignarlo de nuevo.',
            showCancelButton: true,
            confirmButtonText: 'Sí, registrar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: AGRO_COLORS.primary,
        })
        if (!confirmacion.isConfirmed) return
        try {
            await devolverVehiculo(asignacion.id)
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
        navigate('/administrador/inventario/vehiculos/nuevo')
    }

    const handleAsignar = async (vehiculo) => {
        try {
            const [funcionariosData, conductoresData] = await Promise.all([
                getFuncionarios(),
                getConductores(),
            ])
            const conductorIds = new Set(
                (conductoresData ?? [])
                    .filter((c) => c.Estado !== false)
                    .map((c) => c.Funcionario)
            )
            const funcionarios = (funcionariosData ?? []).filter((f) => conductorIds.has(f.id))

            const result = await abrirModalAsignarVehiculo(vehiculo, funcionarios)
            if (!result.isConfirmed) return

            await asignarVehiculoDirecto(vehiculo.id, result.value)
            Swal.fire({
                icon: 'success',
                title: 'Asignación realizada',
                text: 'El vehículo fue asignado correctamente al funcionario.',
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

    const handleEditar = (vehiculo) => {
        navigate(`/administrador/inventario/vehiculos/editar/${vehiculo.id}`)
    }

    const handleEliminar = async (vehiculo) => {
        const confirmacion = await Swal.fire({
            icon: 'warning',
            title: '¿Eliminar vehículo?',
            text: `Se eliminará el vehículo con placa "${vehiculo?.Placa}". Esta acción no se puede deshacer.`,
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: AGRO_COLORS.danger
        })

        if (!confirmacion.isConfirmed) return

        const result = await eliminar(vehiculo.id)
        if (result.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Vehículo eliminado',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el vehículo.',
                confirmButtonColor: AGRO_COLORS.primary
            })
        }
    }

    const opciones = useMemo(() => ({
        marcas: marcas.map((marca) => ({ value: marca.MarcaVehiculo, label: marca.MarcaVehiculo })),
        lineas: lineas.map((linea) => ({ value: linea.LineaVehiculo, label: linea.LineaVehiculo })),
        tipos: tiposVehiculos.map((tipo) => ({ value: tipo.TipoVehiculo, label: tipo.TipoVehiculo })),
        combustibles: tiposCombustibles.map((tipo) => ({
            value: tipo.TipoCombustible,
            label: tipo.TipoCombustible,
        })),
    }), [marcas, lineas, tiposVehiculos, tiposCombustibles])

    const limpiarFiltros = () => {
        setBusqueda('')
        setFiltroEstado('')
        setFiltroDisponibilidad('')
        setFiltroMarca('')
        setFiltroLinea('')
        setFiltroTipo('')
        setFiltroCombustible('')
        setFiltroSoat('')
        setPage(1)
    }

    const hayFiltros = Boolean(busqueda.trim()) || Boolean(filtroEstado)
        || Boolean(filtroDisponibilidad) || Boolean(filtroMarca)
        || Boolean(filtroLinea) || Boolean(filtroTipo)
        || Boolean(filtroCombustible) || Boolean(filtroSoat)

    return (
        <>
            <Header
                componentLogo={
                    <DriveEtaIcon
                        sx={{ fontSize: 40, color: "ActiveCaption" }}
                    />
                }
                headerText={'Gestión de vehículos'}
                message={'Lista y administra los vehículos registrados en el sistema'}
                colorLogo={AGRO_COLORS.primaryLight}
                firstButton={
                    <ButtonLink
                        buttonText={'Añadir vehículo'}
                        onClick={handleAnadir}
                    />
                }
            />
            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4 overflow-y-hidden">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Vehículos del sistema</h3>
                    <p className="text-xs text-gray-500">{count} vehículo(s) registrado(s)</p>
                </div>

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando vehículos...</p>
                ) : error ? (
                    <p className="text-red-600 text-sm">No se pudieron cargar los vehículos. Intenta de nuevo.</p>
                ) : count === 0 ? (
                    <div className="flex flex-col items-start gap-2">
                        <p className="text-gray-500 text-sm">
                            {hayFiltros
                                ? 'No hay vehículos que coincidan con la búsqueda o los filtros.'
                                : 'No hay vehículos registrados en el sistema.'}
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
                            searchPlaceholder="Buscar por placa, modelo, marca o línea..."
                            total={count}
                            shown={vehiculos.length}
                            onClear={limpiarFiltros}
                            filters={[
                                {
                                    key: 'marca',
                                    label: 'Marca',
                                    value: filtroMarca,
                                    onChange: (valor) => { setFiltroMarca(valor); setPage(1) },
                                    options: opciones.marcas,
                                },
                                {
                                    key: 'linea',
                                    label: 'Línea',
                                    value: filtroLinea,
                                    onChange: (valor) => { setFiltroLinea(valor); setPage(1) },
                                    options: opciones.lineas,
                                },
                                {
                                    key: 'tipo',
                                    label: 'Tipo',
                                    value: filtroTipo,
                                    onChange: (valor) => { setFiltroTipo(valor); setPage(1) },
                                    options: opciones.tipos,
                                },
                                {
                                    key: 'combustible',
                                    label: 'Combustible',
                                    value: filtroCombustible,
                                    onChange: (valor) => { setFiltroCombustible(valor); setPage(1) },
                                    options: opciones.combustibles,
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
                                        { value: 'asignado', label: 'Asignados' },
                                    ],
                                },
                                {
                                    key: 'soat',
                                    label: 'SOAT',
                                    value: filtroSoat,
                                    onChange: (valor) => { setFiltroSoat(valor); setPage(1) },
                                    options: [
                                        { value: 'vigente', label: 'Vigente' },
                                        { value: 'por_vencer', label: 'Por vencer (≤ 30 días)' },
                                        { value: 'vencido', label: 'Vencido' },
                                    ],
                                },
                            ]}
                        />
                        <div className="grid grid-cols-1 gap-3 2xl:grid-cols-2">
                            {vehiculos.map((vehiculo) => (
                                <VehiculoPreviewCard
                                    key={vehiculo.id}
                                    vehiculo={vehiculo}
                                    onEdit={handleEditar}
                                    onDelete={handleEliminar}
                                    onAsignar={handleAsignar}
                                    asignacion={asignaciones[vehiculo.id]}
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