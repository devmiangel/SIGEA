import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Header } from "../../../components/Tettles-Buttons/Title"
import HandymanIcon from '@mui/icons-material/Handyman'
import { Campo, CampoSelectDinamico, CampoCheck } from "../employeeContent/visitViews/fields"
import { crearHerramienta, getTiposHerramientas, crearTipoHerramienta } from "../../../services/agroService"
import { AGRO_COLORS } from "../../../utils/agroConstants"
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
    const [form, setForm] = useState(INICIAL)
    const [tipos, setTipos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        let activo = true
        getTiposHerramientas()
            .then((data) => { if (activo) setTipos(data) })
            .catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los tipos de herramienta. Intenta de nuevo.',
                    confirmButtonColor: AGRO_COLORS.primary,
                })
            })
            .finally(() => { if (activo) setCargando(false) })
        return () => { activo = false }
    }, [])

    const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

    const handleCrearTipoHerramienta = async (valor) => {
        const registro = await crearTipoHerramienta(valor)
        setTipos((prev) => [...prev, registro])
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

        const tipoId = tipos.find((t) => t.TipoHerramienta === form.TipoHerramienta)?.id
        if (!tipoId) {
            Swal.fire({
                icon: 'warning',
                title: 'Tipo de herramienta inválido',
                text: 'Seleccione un tipo de herramienta de la lista.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
            return
        }

        setGuardando(true)
        try {
            await crearHerramienta({ ...form, TipoHerramienta: tipoId })
            Swal.fire({
                icon: 'success',
                title: 'Herramienta creada',
                text: 'La herramienta fue registrada correctamente en el sistema.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
            }).then(() => navigate('/administrador/inventario/herramientas'))
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear la herramienta. Intenta de nuevo.',
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
                headerText={'Registro de herramienta'}
                message={'Ingresa una nueva herramienta al inventario del sistema'}
                colorLogo={AGRO_COLORS.primaryLight}
            />

            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Nueva herramienta</h3>
                    <p className="text-xs text-gray-500">
                        Diligencia la información de la herramienta. Los campos marcados con * son obligatorios.
                    </p>
                </div>

                {cargando ? (
                    <p className="text-gray-500 text-sm">Cargando tipos de herramienta...</p>
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

                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                            <button
                                onClick={() => navigate('/administrador/inventario/herramientas')}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={guardar}
                                disabled={guardando}
                                className="px-6 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {guardando ? 'Guardando...' : 'Registrar herramienta'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}