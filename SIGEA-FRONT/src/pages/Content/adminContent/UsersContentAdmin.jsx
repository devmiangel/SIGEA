import { useNavigate } from "react-router-dom"
import GroupIcon from '@mui/icons-material/Group'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import UserPreviewCard from "../../../components/UserPreviewCard/UserPreviewCard"
import { useUsuarios } from "../../../hooks/useUsuarios"
import { esRegistroActivo } from "../../../utils/insumoHelpers"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

export default function UsersContentAdmin(){
    const navigate = useNavigate()
    const { usuarios, loading, error, actualizar, eliminar } = useUsuarios()

    const handleEditar = async (user) => {
        const esActivo = esRegistroActivo(user)
        const result = await Swal.fire({
            title: 'Editar usuario',
            text: 'Selecciona el estado del usuario.',
            input: 'select',
            inputOptions: {
                activo: 'Activo',
                inactivo: 'Inactivo'
            },
            inputValue: esActivo ? 'activo' : 'inactivo',
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: AGRO_COLORS.success,
            inputValidator: (value) => {
                if (!value) return 'Debes seleccionar un estado'
                return null
            }
        })

        if (!result.isConfirmed) return

        const res = await actualizar(user.id, { Estado: result.value === 'activo' })
        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Usuario actualizado',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el usuario.',
                confirmButtonColor: AGRO_COLORS.primary
            })
        }
    }

    const handleEliminar = async (user) => {
        const confirmacion = await Swal.fire({
            icon: 'warning',
            title: '¿Eliminar usuario?',
            text: `Se eliminará a ${user?.email}. Esta acción no se puede deshacer.`,
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: AGRO_COLORS.danger
        })

        if (!confirmacion.isConfirmed) return

        const res = await eliminar(user.id)
        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Usuario eliminado',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el usuario.',
                confirmButtonColor: AGRO_COLORS.primary
            })
        }
    }

    return (
        <>
            <Header
                componentLogo={
                    <GroupIcon
                        sx={{fontSize: 40, color:"ActiveCaption"}}
                    />
                }
                headerText={'Gestion de usuarios'}
                message={'Lista y administra los usuarios registrados en el sistema'}
                colorLogo={'#9ebd57'}
                firstButton={
                    <ButtonLink
                        buttonText={'Agregar Usuario'}
                        onClick={() => navigate('/registro')}
                    />
                }
            />
            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full overflow-y-hidden">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Usuarios del sistema</h3>
                    <p className="text-xs text-gray-500">{usuarios.length} usuario(s) registrado(s)</p>
                </div>

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando usuarios...</p>
                ) : error ? (
                    <p className="text-red-600 text-sm">No se pudieron cargar los usuarios. Intenta de nuevo.</p>
                ) : usuarios.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay usuarios registrados en el sistema.</p>
                ) : (
                    <div className="space-y-3">
                        {usuarios.map((user) => (
                            <UserPreviewCard
                                key={user.id}
                                user={user}
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