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

import ComponentsTest from './components/components'

import AgendaEmployee from './pages/employee/AgendaEmployee'
import HomeEmployee from './pages/employee/HomeEmployee'
import InventaryEmployee from './pages/employee/InventaryEmployee'

import AgroExtension from './pages/users/AgroExtentionUser'
import AnimalProtection from './pages/users/AnimalProtectionUser' 

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
                    
                    <Route path='/administrador/' element={<DashboardAdmin/>}/>
                    <Route path='/administrador/report' element={<ReportAdmin/>}/>
                    <Route path='/administrador/schedule' element={<ShceduleAdmin/>}/>
                    <Route path='/administrador/users' element={<UsersAdmin/>}/>
                    <Route path='/administrador/inventary' element={<InventaryAdmin/>}/>
                    
                    <Route path='/funcionario/agenda' element={<AgendaEmployee/>}/>
                    <Route path='/funcionario' element={<HomeEmployee/>}/>
                    <Route path='/funcionario/recursos' element={<InventaryEmployee/>}/>

                    <Route path='/usuario/Extension_Agropecuaria' element={<AgroExtension/>}/>
                    <Route path='/usuario/Proteccion_Animal' element={<AnimalProtection/>}/>
                    
                    <Route path='/componentes' element={<ComponentsTest/>}/>
                </Routes>
            </BrowserRouter>    
        </>
    )
}

export default App