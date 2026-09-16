import { createContext, useState, useEffect } from "react";
import { currentUserService } from "../services/authService";

export const ContxtCurrentUser = createContext()

export function CurrentUserDataProvider ({children}){
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [loading, setLoading] = useState(true)

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

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }

    return (
        <ContxtCurrentUser.Provider value={{
            user, token, loading, login, logout
        }}>
            {children}
        </ContxtCurrentUser.Provider>
    )
}
