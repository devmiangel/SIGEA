import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { useState } from 'react'

import './styles/app.css'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ShceduleAdmin from './pages/admin/ScheduleAdmin' 
import InventaryAdmin from './pages/admin/inventaryAdmin' 
import DashboardAdmin from './pages/admin/DashboardAdmin' 
import UsersAdmin from './pages/admin/usersAdmin'
import ReportAdmin from './pages/admin/ReportAdmin' 


const App = () => {
    const [token, setToken] = useState()

   /*  if (!token){
        return <Login setToken={setToken} />
    }   */

    return (
        <>
            
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<LoginPage/>} />

                    <Route path="/register" element={<RegisterPage/>} />
                    
                    <Route path='/administrador/dashboard' element={<DashboardAdmin/>}/>
                    <Route path='/administrador/report' element={<ReportAdmin/>}/>
                    <Route path='/administrador/schedule' element={<ShceduleAdmin/>}/>
                    <Route path='/administrador/users' element={<UsersAdmin/>}/>
                    <Route path='/administrador/inventary' element={<InventaryAdmin/>}/>
                      
                </Routes>
            </BrowserRouter>    
        </>
    )
}

export default App