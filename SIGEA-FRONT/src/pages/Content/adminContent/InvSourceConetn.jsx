import { useNavigate } from 'react-router-dom'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import InsumoPreviewCard from "../../../components/InsumoPreviewCard/InsumoPreviewCard"
import { useInsumos } from "../../../hooks/useInsumos"
import { getFuncionarios, asignarInsumoDirecto } from "../../../services/agroService"
import { abrirModalAsignarInsumoDirecto } from "../../../components/AgroModals/AsignarInsumoDirectoModal"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

export default function InvSourceContentAdmin() {
    const { insumos, loading, error, eliminar, refresh } = useInsumos()
    const navigate = useNavigate()

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
            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full overflow-y-hidden">
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
                    <div className="space-y-3">
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
                )}
            </div>
        </>
    )
}
