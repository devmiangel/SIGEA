import api from './api';

export const checkEsProductor = async () => {
    const response = await api.get('/usuarios/me/es_productor/');
    return response.data;
}

export const crearSolicitud = async (data) => {
    const response = await api.post('/visitas/solicitudes/crear/', data);
    return response.data;
}

export const getSolicitudes = async () => {
    const response = await api.get('/visitas/solicitudes/');
    return response.data;
}

export const getTodasSolicitudes = async () => {
    const response = await api.get('/visitas/solicitudes/');
    return response.data;
}

export const getMisUPs = async () => {
    const response = await api.get('/UPs/mis-ups/');
    return response.data;
}

export const validarUP = async (upId, aprobada) => {
    const response = await api.post(`/UPs/validar-ups/${upId}/`, { aprobada });
    return response.data;
}

export const getFuncionarios = async () => {
    const response = await api.get('/usuarios/funcionarios/');
    return response.data;
}

export const getUsuarios = async () => {
    const response = await api.get('/usuarios/usuarios/');
    return response.data;
}

export const getUsuario = async (usuarioId) => {
    const response = await api.get(`/usuarios/usuarios/${usuarioId}/`);
    return response.data;
}

export const actualizarUsuario = async (usuarioId, data) => {
    const response = await api.patch(`/usuarios/usuarios/${usuarioId}/`, data);
    return response.data;
}

export const eliminarUsuario = async (usuarioId) => {
    const response = await api.delete(`/usuarios/usuarios/${usuarioId}/`);
    return response.data;
}

export const getTiposVisitas = async () => {
    const response = await api.get('/visitas/tiposVisitas/');
    return response.data;
}

export const getVisitas = async () => {
    const response = await api.get('/visitas/visitas/');
    return response.data;
}

export const getMisVisitas = async () => {
    const response = await api.get('/visitas/mis-visitas/');
    return response.data;
}

export const marcarVisitaRealizada = async (visitaId) => {
    const response = await api.patch(`/visitas/visitas/${visitaId}/`, { estado: true });
    return response.data;
}

export const atenderSolicitud = async (solicitudId, data) => {
    const response = await api.post(`/visitas/solicitudes/${solicitudId}/atender/`, data);
    return response.data;
}

export const rechazarSolicitud = async (solicitudId) => {
    const response = await api.post(`/visitas/solicitudes/${solicitudId}/rechazar/`);
    return response.data;
}

export const getInsumos = async () => {
    const response = await api.get('/inventario/insumos/');
    return response.data;
}

export const getInsumo = async (insumoId) => {
    const response = await api.get(`/inventario/insumos/${insumoId}/`);
    return response.data;
}

export const crearInsumo = async (data) => {
    const response = await api.post('/inventario/insumos/', data);
    return response.data;
}

export const actualizarInsumo = async (insumoId, data) => {
    const response = await api.patch(`/inventario/insumos/${insumoId}/`, data);
    return response.data;
}

export const eliminarInsumo = async (insumoId) => {
    const response = await api.delete(`/inventario/insumos/${insumoId}/`);
    return response.data;
}

export const getTiposHerramientas = async () => {
    const response = await api.get('/inventario/tiposHerramientas/');
    return response.data;
}

export const getHerramientas = async () => {
    const response = await api.get('/inventario/herramientas/');
    return response.data;
}

export const getHerramienta = async (herramientaId) => {
    const response = await api.get(`/inventario/herramientas/${herramientaId}/`);
    return response.data;
}

export const crearHerramienta = async (data) => {
    const response = await api.post('/inventario/herramientas/', data);
    return response.data;
}

export const actualizarHerramienta = async (herramientaId, data) => {
    const response = await api.patch(`/inventario/herramientas/${herramientaId}/`, data);
    return response.data;
}

export const eliminarHerramienta = async (herramientaId) => {
    const response = await api.delete(`/inventario/herramientas/${herramientaId}/`);
    return response.data;
}

export const getMarcasVehiculos = async () => {
    const response = await api.get('/inventario/marcasVehiculos/');
    return response.data;
}

export const crearMarcaVehiculo = async (nombre) => {
    const response = await api.post('/inventario/marcasVehiculos/', { MarcaVehiculo: nombre });
    return response.data;
}

export const getLineasVehiculos = async () => {
    const response = await api.get('/inventario/lineasVehiculos/');
    return response.data;
}

export const crearLineaVehiculo = async (linea, marcaId) => {
    const response = await api.post('/inventario/lineasVehiculos/', { LineaVehiculo: linea, MarcaVehiculo: marcaId });
    return response.data;
}

export const getTiposVehiculos = async () => {
    const response = await api.get('/inventario/tiposVehiculos/');
    return response.data;
}

export const crearTipoVehiculo = async (nombre) => {
    const response = await api.post('/inventario/tiposVehiculos/', { TipoVehiculo: nombre });
    return response.data;
}

export const getTiposCombustibles = async () => {
    const response = await api.get('/inventario/tiposCombustibles/');
    return response.data;
}

export const crearTipoCombustible = async (nombre) => {
    const response = await api.post('/inventario/tiposCombustibles/', { TipoCombustible: nombre });
    return response.data;
}

export const getVehiculos = async () => {
    const response = await api.get('/inventario/detalleVehiculos/');
    return response.data;
}

export const getVehiculo = async (vehiculoId) => {
    const response = await api.get(`/inventario/detalleVehiculos/${vehiculoId}/`);
    return response.data;
}

export const getInventarioFuncionario = async () => {
    const response = await api.get('/inventario/inventarioFuncionario/');
    return response.data;
}

export const getRegistroAsignacionVehiculos = async () => {
    const response = await api.get('/inventario/registroAsignacionVehiculos/');
    return response.data;
}

export const getAsignacionHerramientas = async () => {
    const response = await api.get('/inventario/asignacionHerramientas/');
    return response.data;
}

export const getConductores = async () => {
    const response = await api.get('/inventario/conductores/');
    return response.data;
}

export const crearRegistroVehiculo = async (data) => {
    const response = await api.post('/inventario/vehiculos/', data);
    return response.data;
}

export const crearDetalleVehiculo = async (data) => {
    const response = await api.post('/inventario/detalleVehiculos/', data);
    return response.data;
}

export const crearVehiculo = async (data) => {
    const response = await api.post('/inventario/detalleVehiculos/', data);
    return response.data;
}

export const actualizarVehiculo = async (vehiculoId, data) => {
    const response = await api.patch(`/inventario/detalleVehiculos/${vehiculoId}/`, data);
    return response.data;
}

export const eliminarVehiculo = async (vehiculoId) => {
    const response = await api.delete(`/inventario/detalleVehiculos/${vehiculoId}/`);
    return response.data;
}
