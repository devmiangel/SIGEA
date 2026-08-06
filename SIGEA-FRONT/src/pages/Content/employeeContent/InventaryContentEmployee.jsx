import { useState, useEffect, useCallback } from "react"
import { Header } from "../../../components/Tettles-Buttons/Title"
import TabList from "../../../components/TabList/TabList"
import Inventory2Icon from '@mui/icons-material/Inventory2'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import BuildIcon from '@mui/icons-material/Build'
import { useCurrentDataUser } from "../../../hooks/currentUserHook"
import {
    getFuncionarios,
    getInventarioFuncionario,
    getRegistroAsignacionVehiculos,
    getAsignacionHerramientas,
    getConductores,
    getInsumos,
    getHerramientas,
    getVehiculos,
} from "../../../services/agroService"

export default function InventaryContentEmployee(){
    const { user, loading: loadingUser } = useCurrentDataUser()
    const [activeTab, setActiveTab] = useState('Insumos')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [funcionario, setFuncionario] = useState(null)
    const [insumos, setInsumos] = useState([])
    const [vehiculos, setVehiculos] = useState([])
    const [herramientas, setHerramientas] = useState([])

    const cargarRecursos = useCallback(async () => {
        if (!user) return

        setLoading(true)
        setError(null)

        try {
            const [funcionarios, inventario, registros, asignaciones, conductores, insumosData, herramientasData, vehiculosData] = await Promise.all([
                getFuncionarios(),
                getInventarioFuncionario(),
                getRegistroAsignacionVehiculos(),
                getAsignacionHerramientas(),
                getConductores(),
                getInsumos(),
                getHerramientas(),
                getVehiculos(),
            ])

            const funcionarioActual = funcionarios.find((f) => f.usuario === user.id || f.email === user.email)
            setFuncionario(funcionarioActual ?? null)

            if (!funcionarioActual) {
                setInsumos([])
                setVehiculos([])
                setHerramientas([])
                return
            }

            const conductorIds = conductores
                .filter((conductor) => conductor.Funcionario === funcionarioActual.id)
                .map((conductor) => conductor.id)

            const insumosMap = insumosData.reduce((acc, item) => {
                acc[item.id] = item
                return acc
            }, {})

            const herramientasMap = herramientasData.reduce((acc, item) => {
                acc[item.id] = item
                return acc
            }, {})

            const vehiculosMap = vehiculosData.reduce((acc, item) => {
                acc[item.id] = item
                return acc
            }, {})

            setInsumos(
                inventario
                    .filter((item) => item.Funcionario === funcionarioActual.id)
                    .map((item) => ({
                        ...item,
                        insumo: insumosMap[item.Insumo] ?? null,
                    }))
            )

            setHerramientas(
                asignaciones
                    .filter((item) => item.Funcionario === funcionarioActual.id)
                    .map((item) => ({
                        ...item,
                        herramienta: herramientasMap[item.Herramienta] ?? null,
                    }))
            )

            setVehiculos(
                registros
                    .filter((item) => conductorIds.includes(item.Conductor))
                    .map((item) => ({
                        ...item,
                        detalleVehiculo: vehiculosMap[item.DetalleVehiculo] ?? null,
                    }))
            )
        } catch (err) {
            setError('No se pudieron cargar los recursos. Intenta de nuevo.')
            setInsumos([])
            setVehiculos([])
            setHerramientas([])
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (user) cargarRecursos()
    }, [user, cargarRecursos])

    const tituloUsuario = user?.persona_info
        ? `${user.persona_info.primer_nombre} ${user.persona_info.primer_apellido}`
        : user?.email ?? 'Funcionario'

    const subtituloUsuario = funcionario
        ? `Funcionario · ${user?.rol ?? 'Funcionario'} `
        : 'No se encontró el registro de funcionario'

    const contenidoActivo = {
        Insumos: insumos,
        Vehículos: vehiculos,
        Herramientas: herramientas,
    }

    return (
        <>
            <Header
                componentLogo={<Inventory2Icon sx={{ fontSize: 40 }} />}
                headerText={'Recursos del funcionario'}
                message={'Consulta los insumos, vehículos y herramientas asignados a tu usuario'}
                colorLogo={'#3e9a8a'}
            />
            <div className="bg-white min-h-screen rounded-xl m-3 p-4 w-full max-w-full overflow-y-hidden">
                <div className="mb-6 p-4 rounded-xl bg-[#f7fafc] border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">{tituloUsuario}</h3>
                    <p className="text-sm text-gray-500">{subtituloUsuario}</p>
                    <p className="text-sm text-gray-500">Email: {user?.email ?? '—'}</p>
                </div>

                <TabList
                    categories={['Insumos', 'Vehículos', 'Herramientas']}
                    active={activeTab}
                    onChange={setActiveTab}
                />

                <div className="mt-6">
                    {loadingUser || loading ? (
                        <p className="text-gray-500 text-sm">Cargando recursos...</p>
                    ) : error ? (
                        <p className="text-red-600 text-sm">{error}</p>
                    ) : !funcionario ? (
                        <p className="text-gray-500 text-sm">No se encontró el registro de funcionario para este usuario.</p>
                    ) : contenidoActivo[activeTab].length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            {activeTab === 'Insumos'
                                ? 'No hay insumos asignados.'
                                : activeTab === 'Vehículos'
                                ? 'No hay vehículos asignados.'
                                : 'No hay herramientas asignadas.'}
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            {activeTab === 'Insumos' && (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insumo</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unidad</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {insumos.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.insumo?.Nombre ?? `ID ${item.Insumo}`}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.Cantidad}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{item.insumo?.Unidades ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'Vehículos' && (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignación</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devolución</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entregado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {vehiculos.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.detalleVehiculo?.Placa ?? `ID ${item.DetalleVehiculo}`}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.detalleVehiculo?.Modelo ?? '—'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.FechaAsignacion}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.FechaDevolucion ?? 'Sin devolver'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.Entregado ? 'Sí' : 'No'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {activeTab === 'Herramientas' && (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Herramienta</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignación</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devolución</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entregado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {herramientas.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.herramienta?.Herramienta ?? `ID ${item.Herramienta}`}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.FechaAsignacion}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.FechaDevolucion ?? 'Sin devolver'}</td>
                                                <td className="px-4 py-3 text-sm text-gray-900">{item.Entregado ? 'Sí' : 'No'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
