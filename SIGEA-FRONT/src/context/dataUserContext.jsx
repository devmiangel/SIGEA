import { createContext, useState, useEffect, useRef, useCallback } from "react";
import Swal from "sweetalert2";
import { currentUserService } from "../services/authService";
import { SESSION_EXPIRED_EVENT, resetSessionExpiredFlag } from "../services/api";

export const ContxtCurrentUser = createContext()

export function CurrentUserDataProvider ({children}){
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

    // Referencia al usuario actual para el listener de expiración (evita closures viejos).
    const userRef = useRef(null)
    useEffect(() => { userRef.current = user }, [user])

    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        if (storedToken) {
            setToken(storedToken)
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
        } else {
            setLoading(false)
        }
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
