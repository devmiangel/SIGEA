import { useState, useEffect, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import { currentUserService } from "../services/authService";
import { SESSION_EXPIRED_EVENT, resetSessionExpiredFlag } from "../services/api";
import { ContxtCurrentUser } from "./contextoUsuario";

const leerTokenGuardado = () => localStorage.getItem('token')

export function CurrentUserDataProvider ({children}){
    const [user, setUser] = useState(null)
    // El token guardado se lee al crear el estado (no en un efecto): así no hay
    // un render extra, y "loading" solo empieza en true si hay sesión que verificar.
    const [token, setToken] = useState(leerTokenGuardado)
    const [loading, setLoading] = useState(() => Boolean(leerTokenGuardado()))

    // Referencia al usuario actual para el listener de expiración (evita closures viejos).
    const userRef = useRef(null)
    useEffect(() => { userRef.current = user }, [user])

    // Con un token guardado, se trae el usuario completo desde /api/me/.
    useEffect(() => {
        if (!leerTokenGuardado()) return
        currentUserService()
            .then(userData => {
                setUser(userData)
            })
            .catch(() => {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                setToken(null)
                setUser(null)
            })
            .finally(() => setLoading(false))
    }, [])

    const login = (userData, userToken) => {
        resetSessionExpiredFlag()
        setUser(userData)
        setToken(userToken)
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', userToken)
        currentUserService()
            .then(fullUserData => {
                setUser(fullUserData)
                localStorage.setItem('user', JSON.stringify(fullUserData))
            })
            .catch(() => {})
    }

    const logout = useCallback(() => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }, [])

    // Token vencido detectado por el interceptor de axios (services/api.js).
    // Solo se limpia el estado: ProtectedRoute redirige a "/" con <Navigate replace />,
    // sin recargar la página, por lo que no hay bucle de redirecciones.
    useEffect(() => {
        const handleSessionExpired = () => {
            const habiaSesion = Boolean(userRef.current)
            logout()
            if (habiaSesion) {
                Swal.fire({
                    icon: 'info',
                    title: 'Su sesión expiró',
                    text: 'Por seguridad, inicie sesión nuevamente.',
                    confirmButtonText: 'Entendido',
                })
            }
        }
        window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
        return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired)
    }, [logout])

    return (
        <ContxtCurrentUser.Provider value={{
            user, token, loading, login, logout
        }}>
            {children}
        </ContxtCurrentUser.Provider>
    )
}
