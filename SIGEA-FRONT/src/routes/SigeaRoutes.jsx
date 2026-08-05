import { Route, Routes } from "react-router-dom";

import Login from "../pages/secure/login";
import Register from "../pages/secure/register";

import AdminLayout from "../layouts/adminlayout";
import EmployeeLayout from "../layouts/EmployeeLayout";
import UserLayout from "../layouts/userLayout";

import ProtectedRoute from "../components/ProtectedRoute";

import DashboardContentAdmin from "../pages/Content/adminContent/DashboardContentAdmin";
import ReportContentAdmin from "../pages/Content/adminContent/ReportContentAdmin";
import InventaryContentAdmin from "../pages/Content/adminContent/inventaryContentAdmin";
import ScheduleContentAdmin from "../pages/Content/adminContent/ScheduleContentAdmin";
import UsersContentAdmin from "../pages/Content/adminContent/UsersContentAdmin";

import InvSourceContentAdmin from "../pages/Content/adminContent/InvSourceConetn";
import InvToolsContentAdmin from "../pages/Content/adminContent/InvToolsContentAdmin";
import InvVehicleContentAdmin from "../pages/Content/adminContent/InvVehicleContentAdmin";

import AgendaContentEmployee from "../pages/Content/employeeContent/AgendaContentEmployee";
import HomeContentEmployee from "../pages/Content/employeeContent/HomeContentEmployee";
import InventaryContentEmployee from "../pages/Content/employeeContent/InventaryContentEmployee";
import CaracterForm from "../pages/Content/employeeContent/visitViews/CaracterForm";

import HomePageContentUser from "../pages/Content/userContent/PrincipalPageContentUser";
import AgroModuleContentUser from "../pages/Content/userContent/AgroExtentionContentUser";
import AnimalProtectionModuleContentUser from "../pages/Content/userContent/AnimalProtectionContentUser";
import UPDetailView from "../pages/Content/userContent/AgroExtensionViews/UPDetailView";

export default function SigeaRoutes(){
    return(
        <Routes>
            <Route index element={<Login/>} />
            <Route path="/registro" element={<Register/>} />

            <Route path="/administrador" element={
                <ProtectedRoute allowedRoles={['Administradores']}>
                    <AdminLayout/>
                </ProtectedRoute>
            }>
                <Route index element={<DashboardContentAdmin/>}/>
                <Route path="reportes" element={<ReportContentAdmin/>}/>
                <Route path="inventario" element={<InventaryContentAdmin/>}/>
                <Route path="horarios" element={<ScheduleContentAdmin/>}/>
                <Route path="usuarios" element={<UsersContentAdmin/>}/> 

                <Route path='inventario/insumos' element={<InvSourceContentAdmin/>}/>
                <Route path='inventario/herramientas' element={<InvToolsContentAdmin/>}/>
                <Route path='inventario/vehiculos' element={<InvVehicleContentAdmin/>}/>
            </Route>

            <Route path="/funcionario" element={
                <ProtectedRoute allowedRoles={['Funcionarios']}>
                    <EmployeeLayout/>
                </ProtectedRoute>
            }>
                <Route index element={<HomeContentEmployee/>}/>
                <Route path="agenda" element={<AgendaContentEmployee/>}/>
                <Route path="recursos" element={<InventaryContentEmployee/>}/>
                <Route path="visitas/caracterizacion" element={<CaracterForm/>}/>
            </Route>

            <Route path="/usuario" element={
                <ProtectedRoute allowedRoles={['Usuarios', 'Productores']}>
                    <UserLayout/>
                </ProtectedRoute>
            }>
                <Route index element={<HomePageContentUser/>}/>
                <Route path="extension_agropecuaria" element={<AgroModuleContentUser/>}/>
                <Route path="extension_agropecuaria/up/:upId" element={<UPDetailView/>}/>
                <Route path="proteccion_animal" element={<AnimalProtectionModuleContentUser/>}/>
            </Route>
            
        </Routes>
    )
    
}
