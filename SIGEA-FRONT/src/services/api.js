import axios from "axios";

// En producción (front y API en el mismo dominio) se usa la ruta relativa "/api".
// En desarrollo se define VITE_API_BASE_URL en .env.development.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// Evento que escucha el contexto de usuario para cerrar la sesión.
export const SESSION_EXPIRED_EVENT = 'sigea:session-expired'

// Páginas públicas: allí un 401 solo limpia el token, nunca redirige.
const PUBLIC_PATHS = ['/', '/registro', '/tratamiento-datos']

// Endpoints cuyo 401 NO significa "sesión expirada":
//  - login: credenciales inválidas (lo maneja el formulario)
//  - me: el contexto ya lo maneja al iniciar la app
//  - logout: el cierre de sesión local se hace igual (SideBar)
const IGNORED_401_ENDPOINTS = ['/usuarios/login/', '/me/', '/auth/logout/']

const api = axios.create({
    baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if(token){
        config.headers.Authorization = `Token ${token}`;
    }

    return config;
})

// Bandera de módulo: evita que una ráfaga de 401 en paralelo dispare varios cierres de sesión.
let sessionExpiredHandled = false

export const resetSessionExpiredFlag = () => {
    sessionExpiredHandled = false
}

const clearStoredSession = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
}

const esRespuestaPaginada = (data) =>
    data && !Array.isArray(data) && Array.isArray(data.results) && typeof data.count === 'number'

const desenvloverPaginacion = async (response) => {
    if (!esRespuestaPaginada(response.data)) return response

    const config = response.config ?? {}
    const params = config.params ?? {}
    if (config.__rawPaginated || params.page !== undefined || params.page_size !== undefined) {
        return response
    }

    // El backend pagina todos los listados (páginas de 200 cuando no se pide página).
    // Si la llamada no pidió página, se recorren los enlaces `next` y se devuelve la
    // lista completa. El `page_size` no se cambia: el backend ya lo incluye en `next`,
    // y alterarlo desalinearía las páginas (se saltarían filas).
    let resultados = [...response.data.results]
    let siguiente = response.data.next

    while (siguiente) {
        const url = new URL(siguiente, window.location.origin)
        if (!url.searchParams.has('page_size')) {
            url.searchParams.set('page_size', String(response.data.results.length))
        }
        const pagina = await api.get(url.toString(), { __rawPaginated: true })
        const datos = pagina.data
        resultados = resultados.concat(datos.results ?? [])
        siguiente = datos.next
    }

    response.data = resultados
    return response
}

api.interceptors.response.use(
    (response) => desenvloverPaginacion(response),
    async (error) => {
        const { response, config } = error

        if (response?.status !== 401 || !config) {
            return Promise.reject(error)
        }

        const url = config.url ?? ''
        if (IGNORED_401_ENDPOINTS.some((endpoint) => url.includes(endpoint))) {
            return Promise.reject(error)
        }

        const sentToken = Boolean(config.headers?.Authorization)

        // 1. Limpiar primero: así ninguna petición siguiente vuelve a enviar el token vencido
        //    (Knox responde 401 incluso en endpoints públicos si el token es inválido).
        clearStoredSession()

        // 2. En páginas públicas (login, registro) el token vencido no debe bloquear al usuario:
        //    se reintenta una vez la petición sin token y no se redirige.
        if (PUBLIC_PATHS.includes(window.location.pathname)) {
            if (sentToken && !config._retriedWithoutToken) {
                config._retriedWithoutToken = true
                delete config.headers.Authorization
                return api(config)
            }
            return Promise.reject(error)
        }

        // 3. En rutas protegidas: notificar una sola vez. El contexto hace logout() y
        //    ProtectedRoute redirige con <Navigate replace /> (sin recargar la página).
        if (!sessionExpiredHandled) {
            sessionExpiredHandled = true
            window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
        }

        return Promise.reject(error)
    }
)

export default api;
