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

const getSeccion = async (seccion, userId) => {
    const response = await api.get(`/UPs/${SECCIONES[seccion]}/${userId}/`)
    return response.data
}

const guardarSeccion = async (seccion, userId, data) => {
    const response = await api.post(`/UPs/${SECCIONES[seccion]}/${userId}/`, data)
    return response.data
}

export const getInfoPersonal = (userId) => getSeccion('personal', userId)
export const saveInfoPersonal = (userId, data) => guardarSeccion('personal', userId, data)

export const getInfoPredio = (userId) => getSeccion('predio', userId)
export const saveInfoPredio = (userId, data) => guardarSeccion('predio', userId, data)

export const getInfoUP = (userId) => getSeccion('up', userId)
export const saveInfoUP = (userId, data) => guardarSeccion('up', userId, data)

export const getInfoAgricola = (userId) => getSeccion('agricola', userId)
export const saveInfoAgricola = (userId, data) => guardarSeccion('agricola', userId, data)

export const getInfoAnimal = (userId) => getSeccion('animal', userId)
export const saveInfoAnimal = (userId, data) => guardarSeccion('animal', userId, data)

export const getInfoAgroindustrial = (userId) => getSeccion('agroindustrial', userId)
export const saveInfoAgroindustrial = (userId, data) => guardarSeccion('agroindustrial', userId, data)

export const getInfoAdicional = (userId) => getSeccion('adicional', userId)
export const saveInfoAdicional = (userId, data) => guardarSeccion('adicional', userId, data)

const getCatalogo = async (url) => {
    const response = await api.get(url)
    return response.data
}

export const getTiposUP = () => getCatalogo('/UPs/tiposUP/')
export const getActividadesUP = () => getCatalogo('/UPs/actividadesUP/')
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
