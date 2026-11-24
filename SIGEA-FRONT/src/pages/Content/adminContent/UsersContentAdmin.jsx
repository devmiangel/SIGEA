import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import GroupIcon from '@mui/icons-material/Group'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import UserPreviewCard from "../../../components/UserPreviewCard/UserPreviewCard"
import InventoryFilterBar from "../../../components/InventoryFilterBar/InventoryFilterBar"
import PaginationBar from "../../../components/PaginationBar/PaginationBar"
import { mostrarInfoUsuario } from "../../../components/AgroModals/UsuarioInfoModal"
import { useUsuarios } from "../../../hooks/useUsuarios"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

export default function UsersContentAdmin(){
    const navigate = useNavigate()
    const [busqueda, setBusqueda] = useState("")
    const [busquedaDebounced, setBusquedaDebounced] = useState("")
    const [rolFiltro, setRolFiltro] = useState("")
    const [estadoFiltro, setEstadoFiltro] = useState("")

    useEffect(() => {
        const t = setTimeout(() => setBusquedaDebounced(busqueda.trim()), 300)
        return () => clearTimeout(t)
    }, [busqueda])

    const {
        usuarios,
        count,
        page,
        setPage,
        pageSize,
        loading,
        error,
        eliminar,
    } = useUsuarios({
        search: busquedaDebounced,
        rol: rolFiltro,
        estado: estadoFiltro,
    })

    const hayFiltros = Boolean(busqueda.trim()) || Boolean(rolFiltro) || Boolean(estadoFiltro)

    const limpiarFiltros = () => {
        setBusqueda('')
        setRolFiltro('')
        setEstadoFiltro('')
        setPage(1)
    }

    const handleEditar = (user) => {
        navigate(`/administrador/usuarios/editar/${user.id}`)
    }

    const handleEliminar = async (user) => {
        const confirmacion = await Swal.fire({
            icon: 'warning',
            title: '¿Desactivar usuario?',
            text: `Se desactivará a ${user?.email}. El registro no se elimina y podrás reactivarlo desde la edición.`,
            showCancelButton: true,
            confirmButtonText: 'Sí, desactivar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: AGRO_COLORS.danger
        })

        if (!confirmacion.isConfirmed) return

        const res = await eliminar(user.id)
        if (res.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Usuario desactivado',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo desactivar el usuario.',
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
            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4 overflow-y-hidden">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Usuarios del sistema</h3>
                    <p className="text-xs text-gray-500">{count} usuario(s) registrado(s)</p>
                </div>

                <InventoryFilterBar
                    search={busqueda}
                    onSearchChange={(valor) => { setBusqueda(valor); setPage(1) }}
                    searchPlaceholder="Buscar por nombre, correo o documento..."
                    total={count}
                    shown={usuarios.length}
                    onClear={limpiarFiltros}
                    filters={[
                        {
                            key: 'rol',
                            label: 'Rol',
                            value: rolFiltro,
                            onChange: (valor) => { setRolFiltro(valor); setPage(1) },
                            options: [
                                { value: 'Administradores', label: 'Administradores' },
                                { value: 'Funcionarios', label: 'Funcionarios' },
                                { value: 'Productores', label: 'Productores' },
                                { value: 'Usuarios', label: 'Usuarios' },
                            ],
                        },
                        {
                            key: 'estado',
                            label: 'Estado',
                            value: estadoFiltro,
                            onChange: (valor) => { setEstadoFiltro(valor); setPage(1) },
                            options: [
                                { value: 'activo', label: 'Activos' },
                                { value: 'inactivo', label: 'Inactivos' },
                            ],
                        },
                    ]}
                />

                {loading ? (
                    <p className="text-gray-500 text-sm">Cargando usuarios...</p>
                ) : error ? (
                    <p className="text-red-600 text-sm">No se pudieron cargar los usuarios. Intenta de nuevo.</p>
                ) : count === 0 ? (
                    <p className="text-gray-500 text-sm">
                        {hayFiltros
                            ? 'No se encontraron usuarios con los filtros aplicados.'
                            : 'No hay usuarios registrados en el sistema.'}
                    </p>
                ) : (
                    <>
                        <div className="space-y-3">
                            {usuarios.map((user) => (
                                <UserPreviewCard
                                    key={user.id}
                                    user={user}
                                    onCardClick={mostrarInfoUsuario}
                                    onEdit={handleEditar}
                                    onDelete={handleEliminar}
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
