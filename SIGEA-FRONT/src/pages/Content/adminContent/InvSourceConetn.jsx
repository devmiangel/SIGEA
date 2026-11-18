import { useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import InsumoPreviewCard from "../../../components/InsumoPreviewCard/InsumoPreviewCard"
import InventoryFilterBar from "../../../components/InventoryFilterBar/InventoryFilterBar"
import { useInsumos } from "../../../hooks/useInsumos"
import { getFuncionarios, asignarInsumoDirecto } from "../../../services/agroService"
import { getUnidades } from "../../../services/caracterizacionService"
import { esInsumoActivo } from "../../../utils/insumoHelpers"
import { abrirModalAsignarInsumoDirecto } from "../../../components/AgroModals/AsignarInsumoDirectoModal"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

export default function InvSourceContentAdmin() {
    const { insumos, loading, error, eliminar, refresh } = useInsumos()
    const navigate = useNavigate()

    const [unidades, setUnidades] = useState([])
    const [busqueda, setBusqueda] = useState('')
    const [filtroUnidad, setFiltroUnidad] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const [filtroStock, setFiltroStock] = useState('')

    useEffect(() => {
        let activo = true
        getUnidades()
            .then((data) => { if (activo) setUnidades(data ?? []) })
            .catch(() => {})
        return () => { activo = false }
    }, [])

    const handleAnadir = () => {
        navigate('/administrador/inventario/insumos/nuevo')
    }

    const handleSolicitudes = () => {
        navigate('/administrador/inventario/insumos/solicitudes')
    }

    const handleAsignar = async (insumo) => {
        try {
            const funcionarios = (await getFuncionarios()) ?? []
            const result = await abrirModalAsignarInsumoDirecto(insumo, funcionarios)
            if (!result.isConfirmed) return

            await asignarInsumoDirecto(insumo.id, result.value)
            Swal.fire({
                icon: 'success',
                title: 'Asignación realizada',
                text: 'El insumo fue asignado correctamente al funcionario.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
            })
            refresh()
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err?.response?.data?.error || 'No se pudo realizar la asignación. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
        }
    }

    const handleEditar = (insumo) => {
        navigate(`/administrador/inventario/insumos/actualizar/${insumo.id}`)
    }

    const handleEliminar = async (insumo) => {
        const confirmacion = await Swal.fire({
            icon: 'warning',
            title: '¿Eliminar insumo?',
            text: `Se eliminará "${insumo?.Nombre}". Esta acción no se puede deshacer.`,
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: AGRO_COLORS.danger
        })

        if (!confirmacion.isConfirmed) return

        const result = await eliminar(insumo.id)
        if (result.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Insumo eliminado',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el insumo.',
                confirmButtonColor: AGRO_COLORS.primary
            })
        }
    }

    const opcionesUnidad = useMemo(
        () => unidades.map((unidad) => ({ value: String(unidad.id), label: unidad.Unidad })),
        [unidades]
    )

    const insumosFiltrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase()
        return insumos.filter((insumo) => {
            const texto = `${insumo.Nombre ?? ''} ${insumo.Descripcion ?? ''}`.toLowerCase()
            const coincideTexto = !q || texto.includes(q)
            const coincideUnidad = !filtroUnidad || String(insumo.Unidades) === filtroUnidad
            const activo = esInsumoActivo(insumo)
            const coincideEstado = !filtroEstado || (filtroEstado === 'activo' ? activo : !activo)
            const cantidad = Number(insumo.Cantidad ?? 0)
            let coincideStock = true
            if (filtroStock === 'con') coincideStock = cantidad > 0
            else if (filtroStock === 'sin') coincideStock = cantidad <= 0
            else if (filtroStock === 'bajo') coincideStock = cantidad > 0 && cantidad <= 5
            return coincideTexto && coincideUnidad && coincideEstado && coincideStock
        })
    }, [insumos, busqueda, filtroUnidad, filtroEstado, filtroStock])

    const limpiarFiltros = () => {
        setBusqueda('')
        setFiltroUnidad('')
        setFiltroEstado('')
        setFiltroStock('')
    }

    return (
        <>
            <Header
                componentLogo={
                    <Inventory2OutlinedIcon
                        sx={{fontSize: 40, color:"ActiveCaption"}}
                    />
                }
                headerText={'Gestión de insumos'}
                message={'Lista y administra los insumos registrados en el sistema'}
                colorLogo={AGRO_COLORS.primaryLight}
                firstButton={
                    <ButtonLink
                        buttonText={'Solicitudes'}
                        onClick={handleSolicitudes}
                    />
                }
                secondButton={
                    <ButtonLink
                        buttonText={'Añadir insumo'}
                        onClick={handleAnadir}
                    />
                }
            />
            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4 overflow-y-hidden">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Insumos del sistema</h3>
                    <p className="text-xs text-gray-500">{insumos.length} insumo(s) registrado(s)</p>
                </div>

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando insumos...</p>
                ) : error ? (
                    <p className="text-red-600 text-sm">No se pudieron cargar los insumos. Intenta de nuevo.</p>
                ) : insumos.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay insumos registrados en el sistema.</p>
                ) : (
                    <>
                        <InventoryFilterBar
                            search={busqueda}
                            onSearchChange={setBusqueda}
                            searchPlaceholder="Buscar por nombre o descripción..."
                            total={insumos.length}
                            shown={insumosFiltrados.length}
                            onClear={limpiarFiltros}
                            filters={[
                                {
                                    key: 'unidad',
                                    label: 'Unidad',
                                    value: filtroUnidad,
                                    onChange: setFiltroUnidad,
                                    options: opcionesUnidad,
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
                                    key: 'stock',
                                    label: 'Stock',
                                    value: filtroStock,
                                    onChange: setFiltroStock,
                                    options: [
                                        { value: 'con', label: 'Con stock' },
                                        { value: 'sin', label: 'Sin stock' },
                                        { value: 'bajo', label: 'Stock bajo (≤ 5)' },
                                    ],
                                },
                            ]}
                        />
                        {insumosFiltrados.length === 0 ? (
                            <p className="text-gray-500 text-sm">
                                No hay insumos que coincidan con la búsqueda o los filtros.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {insumosFiltrados.map((insumo) => (
                                    <InsumoPreviewCard
                                        key={insumo.id}
                                        insumo={insumo}
                                        onEdit={handleEditar}
                                        onDelete={handleEliminar}
                                        onAsignar={handleAsignar}
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
