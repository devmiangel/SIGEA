import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import DriveEtaIcon from '@mui/icons-material/DriveEta'
import { Header } from "../../../components/Tettles-Buttons/Title"
import { Campo, CampoSelectDinamico, CampoCheck } from "../employeeContent/visitViews/fields"
import {
    getMarcasVehiculos,
    getLineasVehiculos,
    getTiposVehiculos,
    getTiposCombustibles,
    crearMarcaVehiculo,
    crearLineaVehiculo,
    crearTipoVehiculo,
    crearTipoCombustible,
    crearRegistroVehiculo,
    crearDetalleVehiculo,
} from "../../../services/agroService"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import Swal from 'sweetalert2'

const INICIAL = {
    Placa: '',
    Modelo: '',
    TipoVehiculo: '',
    TipoCombustible: '',
    Marca: '',
    Linea: '',
    FechaTecno: '',
    FechaSoat: '',
    Descripcion: '',
    Estado: true,
}

const REQUERIDOS = [
    { nombre: 'Placa', label: 'Placa' },
    { nombre: 'Modelo', label: 'Modelo' },
    { nombre: 'TipoVehiculo', label: 'Tipo de vehículo' },
    { nombre: 'TipoCombustible', label: 'Tipo de combustible' },
    { nombre: 'Marca', label: 'Marca del vehículo' },
    { nombre: 'Linea', label: 'Línea del vehículo' },
    { nombre: 'FechaTecno', label: 'Fecha de tecnomecánica' },
    { nombre: 'FechaSoat', label: 'Fecha de vencimiento del SOAT' },
]

const resolverId = (lista, valor) =>
    lista.find((o) => String(o.texto).trim().toLowerCase() === String(valor).trim().toLowerCase())?.id

export default function InvVehicleFormContentAdmin() {
    const navigate = useNavigate()
    const [form, setForm] = useState(INICIAL)
    const [marcas, setMarcas] = useState([])
    const [lineas, setLineas] = useState([])
    const [tiposVehiculos, setTiposVehiculos] = useState([])
    const [tiposCombustibles, setTiposCombustibles] = useState([])
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        let activo = true
        Promise.all([
            getMarcasVehiculos(),
            getLineasVehiculos(),
            getTiposVehiculos(),
            getTiposCombustibles(),
        ])
            .then(([marcasData, lineasData, tiposData, combustiblesData]) => {
                if (!activo) return
                setMarcas(marcasData.map((m) => ({ id: m.id, texto: m.MarcaVehiculo })))
                setLineas(lineasData.map((l) => ({ id: l.id, texto: l.LineaVehiculo })))
                setTiposVehiculos(tiposData.map((t) => ({ id: t.id, texto: t.TipoVehiculo })))
                setTiposCombustibles(combustiblesData.map((c) => ({ id: c.id, texto: c.TipoCombustible })))
            })
            .catch(() => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los catálogos de vehículos. Intenta de nuevo.',
                    confirmButtonColor: AGRO_COLORS.primary,
                })
            })
            .finally(() => { if (activo) setCargando(false) })
        return () => { activo = false }
    }, [])

    const onChange = (name, value) => setForm((f) => ({ ...f, [name]: value }))

    const handleCrearMarca = async (valor) => {
        const registro = await crearMarcaVehiculo(valor)
        setMarcas((prev) => [...prev, { id: registro.id, texto: registro.MarcaVehiculo }])
    }

    const handleCrearTipoVehiculo = async (valor) => {
        const registro = await crearTipoVehiculo(valor)
        setTiposVehiculos((prev) => [...prev, { id: registro.id, texto: registro.TipoVehiculo }])
    }

    const handleCrearTipoCombustible = async (valor) => {
        const registro = await crearTipoCombustible(valor)
        setTiposCombustibles((prev) => [...prev, { id: registro.id, texto: registro.TipoCombustible }])
    }

    const handleCrearLinea = async (valor) => {
        const marcaId = resolverId(marcas, form.Marca)
        if (!marcaId) {
            Swal.fire({
                icon: 'warning',
                title: 'Marca requerida',
                text: 'Seleccione o cree la marca antes de crear una nueva línea de vehículo.',
                confirmButtonColor: AGRO_COLORS.primary,
            })
            return
        }
        const registro = await crearLineaVehiculo(valor, marcaId)
        setLineas((prev) => [...prev, { id: registro.id, texto: registro.LineaVehiculo }])
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

        const tipoVehiculoId = resolverId(tiposVehiculos, form.TipoVehiculo)
        const tipoCombustibleId = resolverId(tiposCombustibles, form.TipoCombustible)
        const marcaId = resolverId(marcas, form.Marca)
        const lineaId = resolverId(lineas, form.Linea)

        const invalidos = []
        if (!tipoVehiculoId) invalidos.push('tipo de vehículo')
        if (!tipoCombustibleId) invalidos.push('tipo de combustible')
        if (!marcaId) invalidos.push('marca')
        if (!lineaId) invalidos.push('línea')
        if (invalidos.length) {
            Swal.fire({
                icon: 'warning',
                title: 'Selección inválida',
                text: `Confirme la selección o creación de: ${invalidos.join(', ')}.`,
                confirmButtonColor: AGRO_COLORS.primary,
            })
            return
        }

        setGuardando(true)
        try {
            const registro = await crearRegistroVehiculo({
                LineaVehiculo: lineaId,
                TipoCombustible: tipoCombustibleId,
                TipoVehiculo: tipoVehiculoId,
            })
            await crearDetalleVehiculo({
                Vehiculo: registro.id,
                Placa: form.Placa,
                Modelo: form.Modelo,
                FechaTecno: form.FechaTecno,
                FechaSoat: form.FechaSoat,
                Descripcion: form.Descripcion,
                Estado: form.Estado,
            })
            Swal.fire({
                icon: 'success',
                title: 'Vehículo creado',
                text: 'El vehículo fue registrado correctamente en el sistema.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
            }).then(() => navigate('/administrador/inventario/vehiculos'))
        } catch {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear el vehículo. Intenta de nuevo.',
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
                    <DriveEtaIcon
                        sx={{ fontSize: 40, color: "ActiveCaption" }}
                    />
                }
                headerText={'Registro de vehículo'}
                message={'Ingresa un nuevo vehículo con su información técnica al sistema'}
                colorLogo={AGRO_COLORS.primaryLight}
            />

            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">Nuevo vehículo</h3>
                    <p className="text-xs text-gray-500">
                        Diligencia la información del vehículo. Los campos marcados con * son obligatorios.
                        Si el tipo de vehículo, combustible, marca o línea no existe, podrás crearlo directamente desde el campo.
                    </p>
                </div>

                {cargando ? (
                    <p className="text-gray-500 text-sm">Cargando catálogos de vehículos...</p>
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <Campo
                                name="Placa"
                                label="Placa *"
                                value={form.Placa}
                                onChange={onChange}
                                placeholder="Ej. ABC-123"
                            />
                            <Campo
                                name="Modelo"
                                label="Modelo *"
                                value={form.Modelo}
                                onChange={onChange}
                                placeholder="Ej. 2020"
                            />
                            <CampoSelectDinamico
                                name="TipoVehiculo"
                                label="Tipo de vehículo *"
                                value={form.TipoVehiculo}
                                options={tiposVehiculos.map((t) => t.texto)}
                                onCrear={handleCrearTipoVehiculo}
                                onChange={onChange}
                                placeholder="Escriba o seleccione..."
                            />
                            <CampoSelectDinamico
                                name="TipoCombustible"
                                label="Tipo de combustible *"
                                value={form.TipoCombustible}
                                options={tiposCombustibles.map((c) => c.texto)}
                                onCrear={handleCrearTipoCombustible}
                                onChange={onChange}
                                placeholder="Escriba o seleccione..."
                            />
                            <CampoSelectDinamico
                                name="Marca"
                                label="Marca del vehículo *"
                                value={form.Marca}
                                options={marcas.map((m) => m.texto)}
                                onCrear={handleCrearMarca}
                                onChange={onChange}
                                placeholder="Escriba o seleccione..."
                            />
                            <CampoSelectDinamico
                                name="Linea"
                                label="Línea del vehículo *"
                                value={form.Linea}
                                options={lineas.map((l) => l.texto)}
                                onCrear={handleCrearLinea}
                                onChange={onChange}
                                placeholder="Escriba o seleccione..."
                            />
                            <Campo
                                name="FechaTecno"
                                label="Fecha de tecnomecánica *"
                                type="date"
                                value={form.FechaTecno}
                                onChange={onChange}
                            />
                            <Campo
                                name="FechaSoat"
                                label="Fecha de vencimiento del SOAT *"
                                type="date"
                                value={form.FechaSoat}
                                onChange={onChange}
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Descripción</label>
                            <textarea
                                name="Descripcion"
                                value={form.Descripcion}
                                onChange={(e) => onChange('Descripcion', e.target.value)}
                                placeholder="Detalles adicionales del vehículo (opcional)"
                                rows={4}
                                className="w-full px-3 py-2 rounded-md border border-[#015d3b] outline-none focus:ring-2 focus:ring-[#015d3b]/40 text-sm bg-white resize-none"
                            />
                        </div>

                        <CampoCheck
                            name="Estado"
                            label="Vehículo activo"
                            checked={form.Estado}
                            onChange={onChange}
                        />

                        <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                            <button
                                onClick={() => navigate('/administrador/inventario/vehiculos')}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={guardar}
                                disabled={guardando}
                                className="px-6 py-2 rounded-lg bg-[#015d3b] text-white text-sm font-semibold hover:bg-[#004d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {guardando ? 'Guardando...' : 'Registrar vehículo'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
