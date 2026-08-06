import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Header } from "../../../components/Tettles-Buttons/Title"
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { Campo, CampoSelect, CampoCheck } from "../employeeContent/visitViews/fields"
import { crearInsumo, actualizarInsumo, getInsumo } from "../../../services/agroService"
import { getUnidades } from "../../../services/caracterizacionService"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

const INICIAL = {
    Nombre: '',
    Cantidad: '',
    Unidades: '',
    Descripcion: '',
    Estado: true,
}

const REQUERIDOS = [
    { nombre: 'Nombre', label: 'Nombre del insumo' },
    { nombre: 'Cantidad', label: 'Cantidad' },
    { nombre: 'Unidades', label: 'Unidad de medida' },
]

export default function InsumoFormContentAdmin() {
    const navigate = useNavigate()
    const { insumoId } = useParams()
    const esEdicion = Boolean(insumoId)
    const [form, setForm] = useState(INICIAL)
    const [unidades, setUnidades] = useState([])
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        let activo = true
        const cargar = async () => {
            try {
                const [dataUnidades, insumo] = await Promise.all([
                    getUnidades(),
                    esEdicion ? getInsumo(insumoId) : Promise.resolve(null),
                ])
                if (!activo) return
                setUnidades(dataUnidades)
                if (insumo) {
                    setForm({
                        Nombre: insumo.Nombre ?? '',
                        Cantidad: insumo.Cantidad ?? '',
                        Unidades: dataUnidades.find((u) => u.id === insumo.Unidades)?.Unidad ?? '',
                        Descripcion: insumo.Descripcion ?? '',
                        Estado: insumo.Estado ?? true,
                    })
                }
            } catch {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: esEdicion
                        ? 'No se pudieron cargar los datos del insumo. Intenta de nuevo.'
                        : 'No se pudieron cargar las unidades de medida. Intenta de nuevo.',
                    confirmButtonColor: AGRO_COLORS.primary,
                })
            } finally {
                if (activo) setCargando(false)
            }
        }
        cargar()
        return () => { activo = false }
    }, [esEdicion, insumoId])

    const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

    const guardar = async () => {
        const faltantes = REQUERIDOS
            .filter((r) => !String(form[r.nombre] ?? '').trim())
            .map((r) => r.label)
        if (faltantes.length) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos obligatorios',
                text: `Complete los campos: ${faltantes.join(', ')}.`,
                confirmButtonColor: AGRO_COLORS.primary,
            })
            return
        }

        const cantidad = Number(form.Cantidad)
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Cantidad inválida',
                text: 'La cantidad debe ser un número entero mayor a cero.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
            return
        }

        const unidadId = unidades.find((u) => u.Unidad === form.Unidades)?.id
        if (!unidadId) {
            Swal.fire({
                icon: 'warning',
                title: 'Unidad de medida inválida',
                text: 'Seleccione una unidad de medida de la lista.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
            return
        }

        const payload = { ...form, Cantidad: cantidad, Unidades: unidadId }

        setGuardando(true)
        try {
            if (esEdicion) {
                await actualizarInsumo(insumoId, payload)
            } else {
                await crearInsumo(payload)
            }
            Swal.fire({
                icon: 'success',
                title: esEdicion ? 'Insumo actualizado' : 'Insumo creado',
                text: esEdicion
                    ? 'El insumo fue actualizado correctamente.'
                    : 'El insumo fue registrado correctamente en el sistema.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
            }).then(() => navigate('/administrador/inventario/insumos'))
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: esEdicion
                    ? 'No se pudo actualizar el insumo. Intenta de nuevo.'
                    : 'No se pudo crear el insumo. Intenta de nuevo.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
        } finally {
            setGuardando(false)
        }
    }

    return (
        <div className="w-full max-w-full">
            <Header
                componentLogo={
                    <Inventory2OutlinedIcon
                        sx={{ fontSize: 40, color: "ActiveCaption" }}
                    />
                }
                headerText={esEdicion ? 'Actualización de insumo' : 'Registro de insumo'}
                message={esEdicion
                    ? 'Modifica la información del insumo seleccionado'
                    : 'Ingresa un nuevo insumo al inventario del sistema'}
                colorLogo={AGRO_COLORS.primaryLight}
            />

            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">{esEdicion ? 'Editar insumo' : 'Nuevo insumo'}</h3>
                    <p className="text-xs text-gray-500">
                        Diligencia la información del insumo. Los campos marcados con * son obligatorios.
                    </p>
                </div>

                {cargando ? (
                    <p className="text-gray-500 text-sm">{esEdicion ? 'Cargando información del insumo...' : 'Cargando unidades de medida...'}</p>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Campo
                                name="Nombre"
                                label="Nombre del insumo *"
                                value={form.Nombre}
                                onChange={onChange}
                                placeholder="Ej. Abono orgánico"
                            />
                            <Campo
                                name="Cantidad"
                                label="Cantidad *"
                                type="number"
                                value={form.Cantidad}
                                onChange={onChange}
                                placeholder="Ej. 50"
                            />
                            <CampoSelect
                                name="Unidades"
                                label="Unidad de medida *"
                                value={form.Unidades}
                                options={unidades.map((u) => u.Unidad)}
                                onChange={onChange}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Descripción</label>
                            <textarea
                                name="Descripcion"
                                value={form.Descripcion}
                                onChange={(e) => onChange('Descripcion', e.target.value)}
                                placeholder="Detalles adicionales del insumo (opcional)"
                                rows={4}
                                className="w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white resize-none"
                            />
                        </div>

                        <CampoCheck
                            name="Estado"
                            label="Insumo activo"
                            checked={form.Estado}
                            onChange={onChange}
                        />

                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                            <button
                                onClick={() => navigate('/administrador/inventario/insumos')}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={guardar}
                                disabled={guardando}
                                className="px-6 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {guardando ? 'Guardando...' : esEdicion ? 'Actualizar insumo' : 'Registrar insumo'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
