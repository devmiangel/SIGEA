import { useNavigate, useParams } from 'react-router-dom'
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
    getVehiculo,
    getRegistroVehiculo,
    crearVehiculoCompleto,
    editarVehiculoCompleto,
} from "../../../services/agroService"
import { AGRO_COLORS } from "../../../utils/agroConstants"
import { getApiErrorMessage } from "../../../utils/getApiErrorMessage"
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

const normalizar = (valor) => String(valor ?? '').trim().toLowerCase()

const resolverId = (lista, valor) =>
    lista.find((o) => normalizar(o.texto) === normalizar(valor))?.id

export default function InvVehicleFormContentAdmin() {
    const navigate = useNavigate()
    const { vehiculoId } = useParams()
    const esEdicion = Boolean(vehiculoId)

    const [form, setForm] = useState(INICIAL)
    const [marcas, setMarcas] = useState([])
    const [lineas, setLineas] = useState([])
    const [tiposVehiculos, setTiposVehiculos] = useState([])
    const [tiposCombustibles, setTiposCombustibles] = useState([])
    const [cargando, setCargando] = useState(true)
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        let activo = true
        const cargar = async () => {
            try {
                const [marcasData, lineasData, tiposData, combustiblesData] = await Promise.all([
                    getMarcasVehiculos(),
                    getLineasVehiculos(),
                    getTiposVehiculos(),
                    getTiposCombustibles(),
                ])
                if (!activo) return

                setMarcas(marcasData.map((m) => ({ id: m.id, texto: m.MarcaVehiculo })))
                setLineas(lineasData.map((l) => ({
                    id: l.id,
                    texto: l.LineaVehiculo,
                    marcaId: l.MarcaVehiculo,
                })))
                setTiposVehiculos(tiposData.map((t) => ({ id: t.id, texto: t.TipoVehiculo })))
                setTiposCombustibles(combustiblesData.map((c) => ({ id: c.id, texto: c.TipoCombustible })))

                if (esEdicion) {
                    const detalle = await getVehiculo(vehiculoId)
                    const registro = await getRegistroVehiculo(detalle.Vehiculo)
                    if (!activo) return

                    const linea = lineasData.find((l) => l.id === registro.LineaVehiculo)
                    const marca = marcasData.find((m) => m.id === linea?.MarcaVehiculo)

                    setForm({
                        Placa: detalle.Placa ?? '',
                        Modelo: detalle.Modelo ?? '',
                        TipoVehiculo: tiposData.find(
                            (t) => t.id === registro.TipoVehiculo
                        )?.TipoVehiculo ?? '',
                        TipoCombustible: combustiblesData.find(
                            (c) => c.id === registro.TipoCombustible
                        )?.TipoCombustible ?? '',
                        Marca: marca?.MarcaVehiculo ?? '',
                        Linea: linea?.LineaVehiculo ?? '',
                        FechaTecno: detalle.FechaTecno ?? '',
                        FechaSoat: detalle.FechaSoat ?? '',
                        Descripcion: detalle.Descripcion ?? '',
                        Estado: detalle.Estado ?? true,
                    })
                }
            } catch (e) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: getApiErrorMessage(
                        e,
                        esEdicion
                            ? 'No se pudieron cargar los datos del vehículo.'
                            : 'No se pudieron cargar los catálogos de vehículos.'
                    ),
                    confirmButtonColor: AGRO_COLORS.primary,
                })
            } finally {
                if (activo) setCargando(false)
            }
        }
        cargar()
        return () => { activo = false }
    }, [esEdicion, vehiculoId])

    const onChange = (name, value) => {
        setForm((f) => {
            if (name === 'Marca') {
                const marcaId = resolverId(marcas, value)
                const lineaActual = lineas.find((l) => normalizar(l.texto) === normalizar(f.Linea))
                const lineaValida = lineaActual && lineaActual.marcaId === marcaId
                return { ...f, Marca: value, Linea: lineaValida ? f.Linea : '' }
            }
            return { ...f, [name]: value }
        })
    }

    const handleCrearMarca = async (valor) => {
        const texto = String(valor ?? '').trim()
        const existente = marcas.find((m) => normalizar(m.texto) === normalizar(texto))
        if (existente) return existente
        const registro = await crearMarcaVehiculo(texto)
        setMarcas((prev) => (
            prev.some((m) => m.id === registro.id)
                ? prev
                : [...prev, { id: registro.id, texto: registro.MarcaVehiculo }]
        ))
        return registro
    }

    const handleCrearTipoVehiculo = async (valor) => {
        const texto = String(valor ?? '').trim()
        const existente = tiposVehiculos.find((t) => normalizar(t.texto) === normalizar(texto))
        if (existente) return existente
        const registro = await crearTipoVehiculo(texto)
        setTiposVehiculos((prev) => (
            prev.some((t) => t.id === registro.id)
                ? prev
                : [...prev, { id: registro.id, texto: registro.TipoVehiculo }]
        ))
        return registro
    }

    const handleCrearTipoCombustible = async (valor) => {
        const texto = String(valor ?? '').trim()
        const existente = tiposCombustibles.find((c) => normalizar(c.texto) === normalizar(texto))
        if (existente) return existente
        const registro = await crearTipoCombustible(texto)
        setTiposCombustibles((prev) => (
            prev.some((c) => c.id === registro.id)
                ? prev
                : [...prev, { id: registro.id, texto: registro.TipoCombustible }]
        ))
        return registro
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
        const texto = String(valor ?? '').trim()
        const existente = lineas.find(
            (l) => normalizar(l.texto) === normalizar(texto) && l.marcaId === marcaId
        )
        if (existente) return existente
        const registro = await crearLineaVehiculo(texto, marcaId)
        setLineas((prev) => (
            prev.some((l) => l.id === registro.id)
                ? prev
                : [...prev, {
                    id: registro.id,
                    texto: registro.LineaVehiculo,
                    marcaId,
                }]
        ))
        return registro
    }

    const marcaId = resolverId(marcas, form.Marca)
    const lineasDisponibles = marcaId
        ? lineas.filter((l) => l.marcaId === marcaId)
        : lineas

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
        const lineaId = lineas.find(
            (l) => normalizar(l.texto) === normalizar(form.Linea) && l.marcaId === marcaId
        )?.id

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

        const payload = {
            Placa: String(form.Placa).trim(),
            Modelo: String(form.Modelo).trim(),
            FechaTecno: form.FechaTecno,
            FechaSoat: form.FechaSoat,
            Descripcion: String(form.Descripcion ?? '').trim(),
            Estado: Boolean(form.Estado),
            LineaVehiculo: lineaId,
            TipoCombustible: tipoCombustibleId,
            TipoVehiculo: tipoVehiculoId,
        }

        setGuardando(true)
        try {
            if (esEdicion) {
                await editarVehiculoCompleto(vehiculoId, payload)
            } else {
                await crearVehiculoCompleto(payload)
            }
            Swal.fire({
                icon: 'success',
                title: esEdicion ? 'Vehículo actualizado' : 'Vehículo creado',
                text: esEdicion
                    ? 'Los cambios se guardaron correctamente.'
                    : 'El vehículo fue registrado correctamente en el sistema.',
                confirmButtonColor: AGRO_COLORS.success,
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
            }).then(() => navigate('/administrador/inventario/vehiculos'))
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: getApiErrorMessage(
                    e,
                    esEdicion
                        ? 'No se pudo actualizar el vehículo.'
                        : 'No se pudo crear el vehículo.'
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
                    <DriveEtaIcon
                        sx={{ fontSize: 40, color: "ActiveCaption" }}
                    />
                }
                headerText={esEdicion ? 'Edición de vehículo' : 'Registro de vehículo'}
                message={esEdicion
                    ? 'Actualiza la información técnica del vehículo'
                    : 'Ingresa un nuevo vehículo con su información técnica al sistema'}
                colorLogo={AGRO_COLORS.primaryLight}
            />

            <div className="bg-white min-h-screen rounded-xl my-3 p-3 w-full max-w-full min-w-0 sm:p-4">
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900">
                        {esEdicion ? 'Editar vehículo' : 'Nuevo vehículo'}
                    </h3>
                    <p className="text-xs text-gray-500">
                        Diligencia la información del vehículo. Los campos marcados con * son obligatorios.
                        Si el tipo de vehículo, combustible, marca o línea no existe, podrás crearlo directamente desde el campo.
                    </p>
                </div>

                {cargando ? (
                    <p className="text-gray-500 text-sm">Cargando información del vehículo...</p>
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
                                options={lineasDisponibles.map((l) => l.texto)}
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

                        <div className="pt-4 border-t border-gray-100 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:items-center">
                            <button
                                onClick={() => navigate('/administrador/inventario/vehiculos')}
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
                                    : esEdicion ? 'Actualizar vehículo' : 'Registrar vehículo'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
