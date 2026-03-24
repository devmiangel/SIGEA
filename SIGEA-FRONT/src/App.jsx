import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useState } from 'react'

import Dashboard from './pages/dashboard/dashboard.jsx'
import Preferences from './pages/preferences/preferences.jsx'
import Login from './pages/login/login.jsx'
import Register from './pages/login/register.jsx'
import './styles/app.css'



const App = () => {
    const [token, setToken] = useState()

   /*  if (!token){
        return <Login setToken={setToken} />
    }   */

    return (
        <>
            <div className ='wrapper'>
                
                <BrowserRouter>
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard/>} />
                        <Route path="/preferences" element={<Preferences/>} />
                        <Route path="/login" element={<Login/>} />
                        <Route path="/register" element={<Register/>} />
                    </Routes>
                </BrowserRouter>    
            </div>    
        </>
    )
}

export default App