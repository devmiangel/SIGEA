import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import GroupIcon from '@mui/icons-material/Group'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import UserPreviewCard from "../../../components/UserPreviewCard/UserPreviewCard"
import { getUsuarios, actualizarUsuario, eliminarUsuario } from "../../../services/agroService"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

export default function UsersContentAdmin(){
    const navigate = useNavigate()
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)

    const cargarUsuarios = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getUsuarios()
            setUsuarios(data)
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los usuarios.',
                confirmButtonColor: AGRO_COLORS.success
            })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { cargarUsuarios() }, [cargarUsuarios])

    const handleEditar = async (user) => {
        const esActivo = user?.Estado !== false && user?.Estado !== 0 && user?.Estado != null
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

        try {
            await actualizarUsuario(user.id, { Estado: result.value === 'activo' })
            await cargarUsuarios()
            Swal.fire({
                icon: 'success',
                title: 'Usuario actualizado',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            })
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el usuario.',
                confirmButtonColor: AGRO_COLORS.success
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
            confirmButtonColor: '#d9534f'
        })

        if (!confirmacion.isConfirmed) return

        try {
            await eliminarUsuario(user.id)
            await cargarUsuarios()
            Swal.fire({
                icon: 'success',
                title: 'Usuario eliminado',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            })
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el usuario.',
                confirmButtonColor: AGRO_COLORS.success
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