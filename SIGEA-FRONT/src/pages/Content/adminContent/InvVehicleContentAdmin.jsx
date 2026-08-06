import { useNavigate } from 'react-router-dom'
import DriveEtaIcon from '@mui/icons-material/DriveEta'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import VehiculoPreviewCard from "../../../components/VehiculoPreviewCard/VehiculoPreviewCard"
import { useVehiculos } from "../../../hooks/useVehiculos"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

export default function InvVehicleContentAdmin() {
    const { vehiculos, loading, error, eliminar } = useVehiculos()
    const navigate = useNavigate()

    const handleAnadir = () => {
        navigate('/administrador/inventario/vehiculos/nuevo')
    }

    const handleEditar = (vehiculo) => {
        Swal.fire({
            icon: 'info',
            title: 'Editar vehículo',
            text: `El formulario de edición del vehículo "${vehiculo?.Placa}" estará disponible a continuación.`,
            confirmButtonColor: AGRO_COLORS.primary
        })
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
            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full overflow-y-hidden">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Vehículos del sistema</h3>
                    <p className="text-xs text-gray-500">{vehiculos.length} vehículo(s) registrado(s)</p>
                </div>

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando vehículos...</p>
                ) : error ? (
                    <p className="text-red-600 text-sm">No se pudieron cargar los vehículos. Intenta de nuevo.</p>
                ) : vehiculos.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay vehículos registrados en el sistema.</p>
                ) : (
                    <div className="space-y-3">
                        {vehiculos.map((vehiculo) => (
                            <VehiculoPreviewCard
                                key={vehiculo.id}
                                vehiculo={vehiculo}
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