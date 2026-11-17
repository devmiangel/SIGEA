import HandymanIcon from '@mui/icons-material/Handyman'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { Header } from "../../../components/Tettles-Buttons/Title"
import ButtonLink from "../../../components/Tettles-Buttons/Buttons"
import HerramientaPreviewCard from "../../../components/HerramientaPreviewCard/HerramientaPreviewCard"
import { useHerramientas } from "../../../hooks/useHerramientas"
import { getFuncionarios, asignarHerramientaDirecto, getAsignacionHerramientas, devolverHerramienta } from "../../../services/agroService"
import { abrirModalAsignarHerramienta } from "../../../components/AgroModals/AsignarHerramientaModal"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

export default function InvToolsContentAdmin() {
    const navigate = useNavigate()
    const { herramientas, loading, error, eliminar, refresh } = useHerramientas()

    // Asignaciones vigentes (sin devolver), indexadas por herramienta.
    const [asignaciones, setAsignaciones] = useState({})

    const cargarAsignaciones = useCallback(async () => {
        try {
            const data = (await getAsignacionHerramientas()) ?? []
            const vigentes = {}
            for (const a of data) {
                if (!a.Entregado) vigentes[a.Herramienta] = a
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

    const handleDevolver = async (herramienta, asignacion) => {
        const confirmacion = await Swal.fire({
            icon: 'question',
            title: 'Registrar devolución',
            text: 'La herramienta quedará disponible para asignarla de nuevo.',
            showCancelButton: true,
            confirmButtonText: 'Sí, registrar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: AGRO_COLORS.primary,
        })
        if (!confirmacion.isConfirmed) return
        try {
            await devolverHerramienta(asignacion.id)
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
        navigate('/administrador/inventario/herramientas/nuevo')
    }

    const handleAsignar = async (herramienta) => {
        try {
            const funcionarios = (await getFuncionarios()) ?? []
            const result = await abrirModalAsignarHerramienta(herramienta, funcionarios)
            if (!result.isConfirmed) return

            await asignarHerramientaDirecto(herramienta.id, result.value)
            Swal.fire({
                icon: 'success',
                title: 'Asignación realizada',
                text: 'La herramienta fue asignada correctamente al funcionario.',
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
            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4 overflow-y-hidden">
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
                                onAsignar={handleAsignar}
                                asignacion={asignaciones[herramienta.id]}
                                onDevolver={handleDevolver}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    )
}