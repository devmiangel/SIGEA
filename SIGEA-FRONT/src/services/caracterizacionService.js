import api from './api'

const SECCIONES = {
    personal: 'info_personal_caracterizacion',
    predio: 'info_predio_caracterizacion',
    up: 'info_up_caracterizacion',
    agricola: 'info_produccion_agricola',
    animal: 'info_produccion_animal',
    agroindustrial: 'info_produccion_agroindustrial',
    adicional: 'info_adicional_caracterizacion',
}

const getSeccion = async (seccion, userId, solicitudId) => {
    const url = `/UPs/${SECCIONES[seccion]}/${userId}/`
    const params = solicitudId ? { params: { solicitud_id: solicitudId } } : {}
    const response = await api.get(url, params)
    return response.data
}

const guardarSeccion = async (seccion, userId, solicitudId, data) => {
    const payload = solicitudId ? { ...data, solicitud_id: solicitudId } : data
    const response = await api.post(`/UPs/${SECCIONES[seccion]}/${userId}/`, payload)
    return response.data
}

export const getInfoPersonal = (userId, solicitudId) => getSeccion('personal', userId, solicitudId)
export const saveInfoPersonal = (userId, solicitudId, data) => guardarSeccion('personal', userId, solicitudId, data)

export const getInfoPredio = (userId, solicitudId) => getSeccion('predio', userId, solicitudId)
export const saveInfoPredio = (userId, solicitudId, data) => guardarSeccion('predio', userId, solicitudId, data)

export const getInfoUP = (userId, solicitudId) => getSeccion('up', userId, solicitudId)
export const saveInfoUP = (userId, solicitudId, data) => guardarSeccion('up', userId, solicitudId, data)

export const getInfoAgricola = (userId, solicitudId) => getSeccion('agricola', userId, solicitudId)
export const saveInfoAgricola = (userId, solicitudId, data) => guardarSeccion('agricola', userId, solicitudId, data)

export const getInfoAnimal = (userId, solicitudId) => getSeccion('animal', userId, solicitudId)
export const saveInfoAnimal = (userId, solicitudId, data) => guardarSeccion('animal', userId, solicitudId, data)

export const getInfoAgroindustrial = (userId, solicitudId) => getSeccion('agroindustrial', userId, solicitudId)
export const saveInfoAgroindustrial = (userId, solicitudId, data) => guardarSeccion('agroindustrial', userId, solicitudId, data)

export const getInfoAdicional = (userId, solicitudId) => getSeccion('adicional', userId, solicitudId)
export const saveInfoAdicional = (userId, solicitudId, data) => guardarSeccion('adicional', userId, solicitudId, data)

const getCatalogo = async (url) => {
    const response = await api.get(url)
    return response.data
}

const crearCatalogo = async (url, body) => {
    const response = await api.post(url, body)
    return response.data
}

export const getTiposUP = () => getCatalogo('/UPs/tiposUP/')
export const getActividadesUP = () => getCatalogo('/UPs/actividadesUP/')
export const getUnidades = () => getCatalogo('/UPs/unidades/')
export const getProductosUPs = () => getCatalogo('/UPs/productosUPs/')
export const getGruposAnimales = () => getCatalogo('/UPs/gruposAnimales/')
export const getPropositos = () => getCatalogo('/UPs/propositos/')
export const getTiposAves = () => getCatalogo('/UPs/tiposAves/')
export const getRazas = () => getCatalogo('/UPs/razas/')
export const getProductosApicolas = () => getCatalogo('/UPs/productosApicolas/')

export const getTiposTenencias = () => getCatalogo('/predios/tiposTenencias/')
export const getSeguros = () => getCatalogo('/predios/seguros/')
export const getVeredas = () => getCatalogo('/predios/veredas/')
export const getSectores = () => getCatalogo('/predios/sectores/')
export const getTiposRegistrosICA = () => getCatalogo('/predios/tiposRegistrosICA/')

export const getNivelesEducativos = () => getCatalogo('/usuarios/tiposNivelesEducativos/')
export const getSisben = () => getCatalogo('/usuarios/sisben/')

export const crearActividadUP = (nombre) => crearCatalogo('/UPs/actividadesUP/', { Actividad: nombre })
export const crearUnidad = (nombre) => crearCatalogo('/UPs/unidades/', { Unidad: nombre })
export const crearProducto = (nombre) => crearCatalogo('/UPs/productosUPs/', { Producto: nombre })
export const crearProposito = (nombre) => crearCatalogo('/UPs/propositos/', { Proposito: nombre })
export const crearTipoAve = (nombre) => crearCatalogo('/UPs/tiposAves/', { TipoAve: nombre })
export const crearProductoApicola = (nombre) => crearCatalogo('/UPs/productosApicolas/', { ProductoApicolas: nombre })

export const crearSeguro = (nombre) => crearCatalogo('/predios/seguros/', { NombreSeguro: nombre })
export const crearVereda = (nombre) => crearCatalogo('/predios/veredas/', { NombreVereda: nombre })
export const crearSector = (nombre) => crearCatalogo('/predios/sectores/', { NombreSector: nombre })

export const subirArchivoUP = async (userId, archivo) => {
    const formData = new FormData()
    formData.append('userId', userId)
    formData.append('archivo', archivo)
    const response = await api.post('/UPs/upload-archivo-up/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
}
