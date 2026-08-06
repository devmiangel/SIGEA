import HandymanIcon from '@mui/icons-material/Handyman'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import HerramientaPreviewCard from "../../../components/HerramientaPreviewCard/HerramientaPreviewCard"
import { useHerramientas } from "../../../hooks/useHerramientas"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

export default function InvToolsContentAdmin() {
    const { herramientas, loading, error, eliminar } = useHerramientas()

    const handleAnadir = () => {
        Swal.fire({
            icon: 'info',
            title: 'Añadir herramienta',
            text: 'El formulario de creación de herramientas estará disponible a continuación.',
            confirmButtonColor: AGRO_COLORS.primary
        })
    }

    const handleEditar = (herramienta) => {
        Swal.fire({
            icon: 'info',
            title: 'Editar herramienta',
            text: `El formulario de edición de "${herramienta?.Herramienta}" estará disponible a continuación.`,
            confirmButtonColor: AGRO_COLORS.primary
        })
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
            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full overflow-y-hidden">
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
                    <div className="space-y-3">
                        {herramientas.map((herramienta) => (
                            <HerramientaPreviewCard
                                key={herramienta.id}
                                herramienta={herramienta}
                                onEdit={handleEditar}
                                onDelete={handleEliminar}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}