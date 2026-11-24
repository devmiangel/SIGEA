import { leer, crear, modificar, borrar } from './http'

// Insumos, herramientas, vehículos y sus asignaciones (/api/inventario/).

// --- Insumos ---
export const getInsumos = (params = {}) => leer('/inventario/insumos/', params)
export const getInsumo = (insumoId) => leer(`/inventario/insumos/${insumoId}/`)
export const crearInsumo = (data) => crear('/inventario/insumos/', data)
export const actualizarInsumo = (insumoId, data) => modificar(`/inventario/insumos/${insumoId}/`, data)
export const eliminarInsumo = (insumoId) => borrar(`/inventario/insumos/${insumoId}/`)
export const asignarInsumoDirecto = (insumoId, data) => crear(`/inventario/insumos/${insumoId}/asignar/`, data)

// Inventario y kárdex del funcionario autenticado
export const getInventarioFuncionario = () => leer('/inventario/inventarioFuncionario/')
export const getCardexInsumoFuncionario = () => leer('/inventario/cardexInsumoFuncionario/')

// --- Solicitudes de insumo ---
export const getSolicitudesInsumo = (params = {}) => leer('/inventario/solicitudInsumo/', params)
export const crearSolicitudInsumo = (data) => crear('/inventario/solicitudInsumo/crear/', data)
export const asignarSolicitudInsumo = (solicitudId, data) => crear(`/inventario/solicitudInsumo/${solicitudId}/asignar/`, data)
export const rechazarSolicitudInsumo = (solicitudId, data) => crear(`/inventario/solicitudInsumo/${solicitudId}/rechazar/`, data)

// --- Herramientas ---
export const getTiposHerramientas = () => leer('/inventario/tiposHerramientas/')
export const crearTipoHerramienta = (nombre) => crear('/inventario/tiposHerramientas/', { TipoHerramienta: nombre })

export const getHerramientas = (params = {}) => leer('/inventario/herramientas/', params)
export const getHerramienta = (herramientaId) => leer(`/inventario/herramientas/${herramientaId}/`)
export const crearHerramienta = (data) => crear('/inventario/herramientas/', data)
export const actualizarHerramienta = (herramientaId, data) => modificar(`/inventario/herramientas/${herramientaId}/`, data)
export const eliminarHerramienta = (herramientaId) => borrar(`/inventario/herramientas/${herramientaId}/`)
export const asignarHerramientaDirecto = (herramientaId, data) => crear(`/inventario/herramientas/${herramientaId}/asignar/`, data)

export const getAsignacionHerramientas = () => leer('/inventario/asignacionHerramientas/')
export const devolverHerramienta = (asignacionId) => crear(`/inventario/asignacionHerramientas/${asignacionId}/devolver/`)

// --- Catálogos de vehículos ---
export const getMarcasVehiculos = () => leer('/inventario/marcasVehiculos/')
export const crearMarcaVehiculo = (nombre) => crear('/inventario/marcasVehiculos/', { MarcaVehiculo: nombre })

export const getLineasVehiculos = () => leer('/inventario/lineasVehiculos/')
export const crearLineaVehiculo = (linea, marcaId) => crear('/inventario/lineasVehiculos/', { LineaVehiculo: linea, MarcaVehiculo: marcaId })

export const getTiposVehiculos = () => leer('/inventario/tiposVehiculos/')
export const crearTipoVehiculo = (nombre) => crear('/inventario/tiposVehiculos/', { TipoVehiculo: nombre })

export const getTiposCombustibles = () => leer('/inventario/tiposCombustibles/')
export const crearTipoCombustible = (nombre) => crear('/inventario/tiposCombustibles/', { TipoCombustible: nombre })

// --- Vehículos ---
// El "vehículo" del listado es un DetalleVehiculos; el registro base (placa, marca...)
// es /vehiculos/. Crear y editar usan los endpoints /completo/ que guardan ambos.
export const getVehiculos = (params = {}) => leer('/inventario/detalleVehiculos/', params)
export const getVehiculo = (vehiculoId) => leer(`/inventario/detalleVehiculos/${vehiculoId}/`)
export const getRegistroVehiculo = (vehiculoId) => leer(`/inventario/vehiculos/${vehiculoId}/`)
export const crearVehiculoCompleto = (data) => crear('/inventario/detalleVehiculos/completo/', data)
export const editarVehiculoCompleto = (detalleId, data) => modificar(`/inventario/detalleVehiculos/${detalleId}/completo/`, data)
export const eliminarVehiculo = (vehiculoId) => borrar(`/inventario/detalleVehiculos/${vehiculoId}/`)
export const asignarVehiculoDirecto = (vehiculoId, data) => crear(`/inventario/detalleVehiculos/${vehiculoId}/asignar/`, data)

export const getRegistroAsignacionVehiculos = () => leer('/inventario/registroAsignacionVehiculos/')
export const devolverVehiculo = (asignacionId) => crear(`/inventario/registroAsignacionVehiculos/${asignacionId}/devolver/`)

export const getConductores = () => leer('/inventario/conductores/')
