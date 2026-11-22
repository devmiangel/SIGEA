import api from './api';

export const checkEsProductor = async () => {
    const response = await api.get('/usuarios/me/es_productor/');
    return response.data;
}

export const crearSolicitud = async (data) => {
    const response = await api.post('/visitas/solicitudes/crear/', data);
    return response.data;
}

export const getSolicitudes = async (params = {}) => {
    const response = await api.get('/visitas/solicitudes/', { params });
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

export const getUPs = async () => {
    const response = await api.get('/UPs/UPs/');
    return response.data;
}

export const getUP = async (upId) => {
    const response = await api.get(`/UPs/UPs/${upId}/`);
    return response.data;
}

export const getProductores = async (params = {}) => {
    const response = await api.get('/usuarios/productores/', { params });
    return response.data;
}

export const getProductorDetalle = async (productorId) => {
    const response = await api.get(`/usuarios/productores/${productorId}/detalle/`);
    return response.data;
}

export const getEventos = async () => {
    const response = await api.get('/UPs/eventosUP/');
    return response.data;
}

export const getEvento = async (eventoId) => {
    const response = await api.get(`/UPs/eventosUP/${eventoId}/`);
    return response.data;
}

export const crearEvento = async (data) => {
    const response = await api.post('/UPs/eventosUP/', data);
    return response.data;
}

export const actualizarEvento = async (eventoId, data) => {
    const response = await api.patch(`/UPs/eventosUP/${eventoId}/`, data);
    return response.data;
}

export const eliminarEvento = async (eventoId) => {
    const response = await api.delete(`/UPs/eventosUP/${eventoId}/`);
    return response.data;
}

export const validarUP = async (upId, aprobada, motivo = '') => {
    const response = await api.post(`/UPs/validar-ups/${upId}/`, { aprobada, motivo });
    return response.data;
}

export const getFuncionarios = async () => {
    const response = await api.get('/usuarios/funcionarios/');
    return response.data;
}

export const getUsuarios = async (params = {}) => {
    const response = await api.get('/usuarios/usuarios/', { params });
    return response.data;
}

export const getUsuario = async (usuarioId) => {
    const response = await api.get(`/usuarios/usuarios/${usuarioId}/`);
    return response.data;
}

export const getDetalleUsuario = async (usuarioId) => {
    const response = await api.get(`/usuarios/usuarios/${usuarioId}/detalle/`);
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

export const getServiciosPagos = async () => {
    const response = await api.get('/visitas/serviciosPagos/');
    return response.data;
}

export const getAperos = async () => {
    const response = await api.get('/visitas/aperos/');
    return response.data;
}

export const getPajillas = async () => {
    const response = await api.get('/visitas/pajillas/');
    return response.data;
}

export const enviarFormularioRecibo = async (data) => {
    const response = await api.post('/visitas/formulario-recibo/', data);
    return response.data;
}

export const getVisitas = async (params = {}) => {
    const response = await api.get('/visitas/visitas/', { params });
    return response.data;
}

export const getMisVisitas = async () => {
    const response = await api.get('/visitas/mis-visitas/');
    return response.data;
}

export const buscarProductoresUsuarios = async (q = '') => {
    const response = await api.get('/usuarios/usuarios/buscar/', { params: { q } });
    return response.data;
}

export const crearOrdenVisita = async (data) => {
    const response = await api.post('/visitas/ordenes/crear/', data);
    return response.data;
}

export const getMisOrdenes = async () => {
    const response = await api.get('/visitas/mis-ordenes/');
    return response.data;
}

export const marcarVisitaRealizada = async (visitaId) => {
    const response = await api.patch(`/visitas/visitas/${visitaId}/`, { estado: true });
    return response.data;
}

export const guardarFirmasVisita = async (visitaId, firmaProductor, firmaFuncionario, autorizacion = null) => {
    const payload = {
        FirmaProductor: firmaProductor,
        FirmaFuncionario: firmaFuncionario,
    }
    if (autorizacion !== null) payload.Autorizacion = autorizacion
    const response = await api.patch(`/visitas/visitas/${visitaId}/`, payload);
    return response.data;
}

export const atenderSolicitud = async (solicitudId, data) => {
    const response = await api.post(`/visitas/solicitudes/${solicitudId}/atender/`, data);
    return response.data;
}

export const reagendarSolicitud = async (solicitudId, data) => {
    const response = await api.post(`/visitas/solicitudes/${solicitudId}/reagendar/`, data);
    return response.data;
}

export const rechazarSolicitud = async (solicitudId, data = {}) => {
    const response = await api.post(`/visitas/solicitudes/${solicitudId}/rechazar/`, data);
    return response.data;
}

export const generarInformeVisita = async (visitaId) => {
    const response = await api.get(`/documentos/visita/${visitaId}/generar/`, { responseType: 'blob' });
    const disposition = response.headers?.['content-disposition'] ?? ''
    const match = disposition.match(/filename="?([^";]+)"?/)
    const nombreArchivo = match ? match[1] : `visita_${visitaId}.pdf`
    return { blob: response.data, nombreArchivo }
}

export const getInsumos = async (params = {}) => {
    const response = await api.get('/inventario/insumos/', { params });
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

export const crearTipoHerramienta = async (nombre) => {
    const response = await api.post('/inventario/tiposHerramientas/', { TipoHerramienta: nombre });
    return response.data;
}

export const getHerramientas = async (params = {}) => {
    const response = await api.get('/inventario/herramientas/', { params });
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

export const getVehiculos = async (params = {}) => {
    const response = await api.get('/inventario/detalleVehiculos/', { params });
    return response.data;
}

export const getVehiculo = async (vehiculoId) => {
    const response = await api.get(`/inventario/detalleVehiculos/${vehiculoId}/`);
    return response.data;
}

export const getRegistroVehiculo = async (vehiculoId) => {
    const response = await api.get(`/inventario/vehiculos/${vehiculoId}/`);
    return response.data;
}

export const crearVehiculoCompleto = async (data) => {
    const response = await api.post('/inventario/detalleVehiculos/completo/', data);
    return response.data;
}

export const editarVehiculoCompleto = async (detalleId, data) => {
    const response = await api.patch(`/inventario/detalleVehiculos/${detalleId}/completo/`, data);
    return response.data;
}

export const getInventarioFuncionario = async () => {
    const response = await api.get('/inventario/inventarioFuncionario/');
    return response.data;
}

export const getCardexInsumoFuncionario = async () => {
    const response = await api.get('/inventario/cardexInsumoFuncionario/');
    return response.data;
}

export const crearSolicitudInsumo = async (data) => {
    const response = await api.post('/inventario/solicitudInsumo/crear/', data);
    return response.data;
}

export const getSolicitudesInsumo = async () => {
    const response = await api.get('/inventario/solicitudInsumo/');
    return response.data;
}

export const asignarSolicitudInsumo = async (solicitudId, data) => {
    const response = await api.post(`/inventario/solicitudInsumo/${solicitudId}/asignar/`, data);
    return response.data;
}

export const rechazarSolicitudInsumo = async (solicitudId, data) => {
    const response = await api.post(`/inventario/solicitudInsumo/${solicitudId}/rechazar/`, data);
    return response.data;
}

export const asignarInsumoDirecto = async (insumoId, data) => {
    const response = await api.post(`/inventario/insumos/${insumoId}/asignar/`, data);
    return response.data;
}

export const asignarHerramientaDirecto = async (herramientaId, data) => {
    const response = await api.post(`/inventario/herramientas/${herramientaId}/asignar/`, data);
    return response.data;
}

export const asignarVehiculoDirecto = async (vehiculoId, data) => {
    const response = await api.post(`/inventario/detalleVehiculos/${vehiculoId}/asignar/`, data);
    return response.data;
}

export const devolverHerramienta = async (asignacionId) => {
    const response = await api.post(`/inventario/asignacionHerramientas/${asignacionId}/devolver/`);
    return response.data;
}

export const devolverVehiculo = async (asignacionId) => {
    const response = await api.post(`/inventario/registroAsignacionVehiculos/${asignacionId}/devolver/`);
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

export const buscarUPPorRUEA = async (ruea) => {
    const response = await api.get('/UPs/buscar-por-ruea/', { params: { ruea } });
    return response.data;
}

export const generarQR = async (upId) => {
    const response = await api.post(`/UPs/${upId}/generar-qr/`);
    return response.data;
}

export const getQR = async (upId) => {
    const response = await api.get(`/UPs/${upId}/qr/`);
    return response.data;
}

export const descargarQR = async (upId) => {
    const response = await api.get(`/UPs/${upId}/descargar-qr/`, { responseType: 'blob' });
    const disposition = response.headers?.['content-disposition'] ?? ''
    const match = disposition.match(/filename="?([^";]+)"?/)
    const nombreArchivo = match ? match[1] : `qr_up_${upId}.png`
    return { blob: response.data, nombreArchivo }
}

// Descarga un adjunto de UP (archivo privado: el backend valida el dueño de la UP).
export const descargarArchivoUP = async (archivoId) => {
    const response = await api.get(`/UPs/archivosUP/${archivoId}/descargar/`, { responseType: 'blob' });
    const disposition = response.headers['content-disposition'] || ''
    const match = disposition.match(/filename="?([^"]+)"?/)
    return { blob: response.data, nombreArchivo: match ? match[1] : `archivo_${archivoId}` }
}

export const getArchivosUP = async (upId) => {
    const response = await api.get('/UPs/archivosUP/', { params: { UP: upId } });
    return response.data;
}

export const descargarCaracterizacionUP = async (upId) => {
    const response = await api.get(`/documentos/up/${upId}/caracterizacion/`, {
        responseType: 'blob',
    });
    const disposition = response.headers?.['content-disposition'] ?? ''
    const match = disposition.match(/filename="?([^";]+)"?/)
    return {
        blob: response.data,
        nombreArchivo: match ? match[1] : `caracterizacion_up_${upId}.pdf`,
    }
}
