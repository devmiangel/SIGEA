import { leer, modificar, borrar } from './http'

// Usuarios, productores y funcionarios (/api/usuarios/).

export const checkEsProductor = () => leer('/usuarios/me/es_productor/')

export const getUsuarios = (params = {}) => leer('/usuarios/usuarios/', params)
export const getUsuario = (usuarioId) => leer(`/usuarios/usuarios/${usuarioId}/`)
export const getDetalleUsuario = (usuarioId) => leer(`/usuarios/usuarios/${usuarioId}/detalle/`)
export const actualizarUsuario = (usuarioId, data) => modificar(`/usuarios/usuarios/${usuarioId}/`, data)
export const eliminarUsuario = (usuarioId) => borrar(`/usuarios/usuarios/${usuarioId}/`)

// Productores y usuarios sin rol staff, para asignarles solicitudes u órdenes.
export const buscarProductoresUsuarios = (q = '') => leer('/usuarios/usuarios/buscar/', { q })

export const getProductores = (params = {}) => leer('/usuarios/productores/', params)
export const getProductorDetalle = (productorId) => leer(`/usuarios/productores/${productorId}/detalle/`)

export const getFuncionarios = () => leer('/usuarios/funcionarios/')
