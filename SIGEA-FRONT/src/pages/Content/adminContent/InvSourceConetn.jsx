import { useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import InsumoPreviewCard from "../../../components/InsumoPreviewCard/InsumoPreviewCard"
import InventoryFilterBar from "../../../components/InventoryFilterBar/InventoryFilterBar"
import PaginationBar from "../../../components/PaginationBar/PaginationBar"
import { useInsumos } from "../../../hooks/useInsumos"
import { getFuncionarios, asignarInsumoDirecto } from "../../../services/agroService"
import { getUnidades } from "../../../services/caracterizacionService"
import { abrirModalAsignarInsumoDirecto } from "../../../components/AgroModals/AsignarInsumoDirectoModal"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

export default function InvSourceContentAdmin() {
    const navigate = useNavigate()

    const [unidades, setUnidades] = useState([])
    const [busqueda, setBusqueda] = useState('')
    const [filtroUnidad, setFiltroUnidad] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')
    const [filtroStock, setFiltroStock] = useState('')

    const {
        insumos,
        count,
        page,
        setPage,
        pageSize,
        loading,
        error,
        eliminar,
        refresh,
    } = useInsumos({
        search: busqueda.trim(),
        unidad: filtroUnidad,
        estado: filtroEstado,
        stock: filtroStock,
    })

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

    const limpiarFiltros = () => {
        setBusqueda('')
        setFiltroUnidad('')
        setFiltroEstado('')
        setFiltroStock('')
        setPage(1)
    }

    const hayFiltros = Boolean(busqueda.trim()) || Boolean(filtroUnidad)
        || Boolean(filtroEstado) || Boolean(filtroStock)

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
                    <p className="text-xs text-gray-500">{count} insumo(s) registrado(s)</p>
                </div>

                <InventoryFilterBar
                    search={busqueda}
                    onSearchChange={(valor) => { setBusqueda(valor); setPage(1) }}
                    searchPlaceholder="Buscar por nombre o descripción..."
                    total={count}
                    shown={insumos.length}
                    onClear={limpiarFiltros}
                    filters={[
                        {
                            key: 'unidad',
                            label: 'Unidad',
                            value: filtroUnidad,
                            onChange: (valor) => { setFiltroUnidad(valor); setPage(1) },
                            options: opcionesUnidad,
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
                            key: 'stock',
                            label: 'Stock',
                            value: filtroStock,
                            onChange: (valor) => { setFiltroStock(valor); setPage(1) },
                            options: [
                                { value: 'con', label: 'Con stock' },
                                { value: 'sin', label: 'Sin stock' },
                                { value: 'bajo', label: 'Stock bajo (≤ 5)' },
                            ],
                        },
                    ]}
                />

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando insumos...</p>
                ) : error ? (
                    <p className="text-red-600 text-sm">No se pudieron cargar los insumos. Intenta de nuevo.</p>
                ) : count === 0 ? (
                    <p className="text-gray-500 text-sm">
                        {hayFiltros
                            ? 'No hay insumos que coincidan con la búsqueda o los filtros.'
                            : 'No hay insumos registrados en el sistema.'}
                    </p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-3 2xl:grid-cols-2">
                            {insumos.map((insumo) => (
                                <InsumoPreviewCard
                                    key={insumo.id}
                                    insumo={insumo}
                                    onEdit={handleEditar}
                                    onDelete={handleEliminar}
                                    onAsignar={handleAsignar}
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
