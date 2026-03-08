import './components/dashboard/dashboard'
import Dashboard from './components/dashboard/dashboard.jsx'
import Preferences from './components/preferences/preferences.jsx'
import Login from './components/login/login.jsx'
import './styles/app.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useState } from 'react'
import './'

const App = () => {
    const [token, setToken] = useState(false)

    return (
        <>
            <div className ='wrapper'>
                
                <BrowserRouter>
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard/>} />
                        <Route path="/preferences" element={<Preferences/>} />
                        <Route path="/login" element={<Login/>} />
                    </Routes>
                </BrowserRouter>    
            </div>    
        </>
    )
}

export default App