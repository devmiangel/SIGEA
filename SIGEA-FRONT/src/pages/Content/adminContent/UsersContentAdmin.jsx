import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import GroupIcon from '@mui/icons-material/Group'
import SearchIcon from '@mui/icons-material/Search'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import UserPreviewCard from "../../../components/UserPreviewCard/UserPreviewCard"
import { useUsuarios } from "../../../hooks/useUsuarios"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import { getNombreCompleto, getCorreo } from "../../../utils/userDisplay"
import Swal from 'sweetalert2'

const ROLES = ['Administradores', 'Funcionarios', 'Productores', 'Usuarios']
const INPUT_CLASE = "w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white"

export default function UsersContentAdmin(){
    const navigate = useNavigate()
    const { usuarios, loading, error, eliminar } = useUsuarios()
    const [busqueda, setBusqueda] = useState("")
    const [rolFiltro, setRolFiltro] = useState("")

    const usuariosFiltrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase()
        return usuarios.filter((user) => {
            if (rolFiltro && user?.rol !== rolFiltro) return false
            if (!q) return true
            const texto = `${getNombreCompleto(user)} ${getCorreo(user)}`.toLowerCase()
            return texto.includes(q)
        })
    }, [usuarios, busqueda, rolFiltro])

    const handleEditar = (user) => {
        navigate(`/administrador/usuarios/editar/${user.id}`)
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
                        onClick={() => navigate('/administrador/usuarios/nuevo')}
                    />
                }
            />
            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full overflow-y-hidden">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Usuarios del sistema</h3>
                    <p className="text-xs text-gray-500">
                        {rolFiltro || busqueda.trim()
                            ? `${usuariosFiltrados.length} de ${usuarios.length} usuario(s)`
                            : `${usuarios.length} usuario(s) registrado(s)`}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <SearchIcon
                            fontSize="small"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre o correo..."
                            className={`${INPUT_CLASE} pl-9`}
                        />
                    </div>
                    <select
                        value={rolFiltro}
                        onChange={(e) => setRolFiltro(e.target.value)}
                        className={`${INPUT_CLASE} sm:w-60`}
                    >
                        <option value="">Todos los roles</option>
                        {ROLES.map((rol) => (
                            <option key={rol} value={rol}>{rol}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando usuarios...</p>
                ) : error ? (
                    <p className="text-red-600 text-sm">No se pudieron cargar los usuarios. Intenta de nuevo.</p>
                ) : usuariosFiltrados.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                        {usuarios.length === 0
                            ? 'No hay usuarios registrados en el sistema.'
                            : 'No se encontraron usuarios con los filtros aplicados.'}
                    </p>
                ) : (
                    <div className="space-y-3">
                        {usuariosFiltrados.map((user) => (
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