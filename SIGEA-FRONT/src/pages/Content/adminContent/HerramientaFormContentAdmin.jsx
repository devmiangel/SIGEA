import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Header } from "../../../components/Tettles-Buttons/Title"
import HandymanIcon from '@mui/icons-material/Handyman'
import { Campo, CampoSelectDinamico, CampoCheck } from "../employeeContent/visitViews/fields"
import {
    crearHerramienta,
    actualizarHerramienta,
    getHerramienta,
    getTiposHerramientas,
    crearTipoHerramienta,
} from "../../../services/inventarioService"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage"
import Swal from 'sweetalert2'

const INICIAL = {
    Herramienta: '',
    TipoHerramienta: '',
    Descripcion: '',
    Estado: true,
}

const REQUERIDOS = [
    { nombre: 'Herramienta', label: 'Nombre de la herramienta' },
    { nombre: 'TipoHerramienta', label: 'Tipo de herramienta' },
]

export default function HerramientaFormContentAdmin() {
    const navigate = useNavigate()
    const { herramientaId } = useParams()
    const esEdicion = Boolean(herramientaId)

    const [form, setForm] = useState(INICIAL)
    const [tipos, setTipos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        let activo = true
        const cargar = async () => {
            try {
                const [tiposData, herramienta] = await Promise.all([
                    getTiposHerramientas(),
                    esEdicion ? getHerramienta(herramientaId) : Promise.resolve(null),
                ])
                if (!activo) return
                setTipos(tiposData)
                if (herramienta) {
                    setForm({
                        Herramienta: herramienta.Herramienta ?? '',
                        TipoHerramienta: tiposData.find(
                            (t) => t.id === herramienta.TipoHerramienta
                        )?.TipoHerramienta ?? '',
                        Descripcion: herramienta.Descripcion ?? '',
                        Estado: herramienta.Estado ?? true,
                    })
                }
            } catch (e) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: getApiErrorMessage(
                        e,
                        esEdicion
                            ? 'No se pudieron cargar los datos de la herramienta.'
                            : 'No se pudieron cargar los tipos de herramienta.'
                    ),
                    confirmButtonColor: AGRO_COLORS.primary,
                })
            } finally {
                if (activo) setCargando(false)
            }
        }
        cargar()
        return () => { activo = false }
    }, [esEdicion, herramientaId])

    const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

    const handleCrearTipoHerramienta = async (valor) => {
        const texto = String(valor ?? '').trim()
        const existente = tipos.find(
            (t) => String(t.TipoHerramienta).trim().toLowerCase() === texto.toLowerCase()
        )
        if (existente) return existente
        const registro = await crearTipoHerramienta(texto)
        setTipos((prev) => (
            prev.some((t) => t.id === registro.id) ? prev : [...prev, registro]
        ))
        return registro
    }

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

        const tipoId = tipos.find(
            (t) => String(t.TipoHerramienta).trim().toLowerCase()
                === String(form.TipoHerramienta).trim().toLowerCase()
        )?.id
        if (!tipoId) {
            Swal.fire({
                icon: 'warning',
                title: 'Tipo de herramienta inválido',
                text: 'Seleccione un tipo de herramienta de la lista.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
            return
        }

        const payload = {
            Herramienta: String(form.Herramienta).trim(),
            TipoHerramienta: tipoId,
            Descripcion: String(form.Descripcion ?? '').trim(),
            Estado: Boolean(form.Estado),
        }

        setGuardando(true)
        try {
            if (esEdicion) {
                await actualizarHerramienta(herramientaId, payload)
            } else {
                await crearHerramienta(payload)
            }
            Swal.fire({
                icon: 'success',
                title: esEdicion ? 'Herramienta actualizada' : 'Herramienta creada',
                text: esEdicion
                    ? 'Los cambios se guardaron correctamente.'
                    : 'La herramienta fue registrada correctamente en el sistema.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
            }).then(() => navigate('/administrador/inventario/herramientas'))
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: getApiErrorMessage(
                    e,
                    esEdicion
                        ? 'No se pudo actualizar la herramienta.'
                        : 'No se pudo crear la herramienta.'
                ),
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
                    <HandymanIcon
                        sx={{ fontSize: 40, color: "ActiveCaption" }}
                    />
                }
                headerText={esEdicion ? 'Edición de herramienta' : 'Registro de herramienta'}
                message={esEdicion
                    ? 'Actualiza la información de la herramienta en el inventario'
                    : 'Ingresa una nueva herramienta al inventario del sistema'}
                colorLogo={AGRO_COLORS.primaryLight}
            />

            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">
                        {esEdicion ? 'Editar herramienta' : 'Nueva herramienta'}
                    </h3>
                    <p className="text-xs text-gray-500">
                        Diligencia la información de la herramienta. Los campos marcados con * son obligatorios.
                    </p>
                </div>

                {cargando ? (
                    <p className="text-gray-500 text-sm">Cargando información de la herramienta...</p>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                            <Campo
                                name="Herramienta"
                                label="Nombre de la herramienta *"
                                value={form.Herramienta}
                                onChange={onChange}
                                placeholder="Ej. Martillo"
                            />
                            <CampoSelectDinamico
                                name="TipoHerramienta"
                                label="Tipo de herramienta *"
                                value={form.TipoHerramienta}
                                options={tipos.map((t) => t.TipoHerramienta)}
                                onCrear={handleCrearTipoHerramienta}
                                onChange={onChange}
                                placeholder="Escriba o seleccione..."
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Descripción</label>
                            <textarea
                                name="Descripcion"
                                value={form.Descripcion}
                                onChange={(e) => onChange('Descripcion', e.target.value)}
                                placeholder="Detalles adicionales de la herramienta (opcional)"
                                rows={4}
                                className="w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white resize-none"
                            />
                        </div>

                        <CampoCheck
                            name="Estado"
                            label="Herramienta activa"
                            checked={form.Estado}
                            onChange={onChange}
                        />

                        <div className="pt-4 border-t border-gray-100 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:items-center">
                            <button
                                onClick={() => navigate('/administrador/inventario/herramientas')}
                                className="w-full sm:w-auto text-center px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={guardar}
                                disabled={guardando}
                                className="w-full sm:w-auto px-6 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {guardando
                                    ? 'Guardando...'
                                    : esEdicion ? 'Actualizar herramienta' : 'Registrar herramienta'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
