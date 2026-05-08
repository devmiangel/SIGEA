import { createContext, useState, useContext, useEffect } from "react";
import { currentUserService, loginService, logoutService } from "../services/authService";

export const ContxtCurrentUser = createContext()

export function CurrentUserDataProvider ({children}){
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)


    const login = (userData, userToken) =>{
        setUser(userData)
        setToken(userToken)

        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('token', (userToken))

    }

    const logout = () => {
        setUser(null)
        setToken(null)

        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }
    

    return (
        <ContxtCurrentUser.Provider value={{
            user, token, login, logout
        }}>
            {children}
        </ContxtCurrentUser.Provider>
    )
} 