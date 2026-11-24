import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import Login from "../pages/secure/login";
import Register from "../pages/secure/register";
import DataTreatment from "../pages/secure/dataTreatment";

import AdminLayout from "../layouts/adminlayout";
import EmployeeLayout from "../layouts/EmployeeLayout";
import UserLayout from "../layouts/userLayout";

import ProtectedRoute from "../components/ProtectedRoute";

// Las páginas de cada rol se descargan solo cuando se visitan (code splitting):
// el login no carga el código del administrador ni del funcionario.
const DashboardContentAdmin = lazy(() => import("../pages/Content/adminContent/DashboardContentAdmin"));
const ReportContentAdmin = lazy(() => import("../pages/Content/adminContent/ReportContentAdmin"));
const InventaryContentAdmin = lazy(() => import("../pages/Content/adminContent/inventaryContentAdmin"));
const ScheduleContentAdmin = lazy(() => import("../pages/Content/adminContent/ScheduleContentAdmin"));
const UsersContentAdmin = lazy(() => import("../pages/Content/adminContent/UsersContentAdmin"));
const UserFormContentAdmin = lazy(() => import("../pages/Content/adminContent/UserFormContentAdmin"));
const UpValidationAdmin = lazy(() => import("../pages/Content/adminContent/UpValidationAdmin"));
const VisitasContentAdmin = lazy(() => import("../pages/Content/adminContent/VisitasContentAdmin"));
const SolicitudesContentAdmin = lazy(() => import("../pages/Content/adminContent/SolicitudesContentAdmin"));
const EventosContentAdmin = lazy(() => import("../pages/Content/adminContent/EventosContentAdmin"));
const EventoFormContentAdmin = lazy(() => import("../pages/Content/adminContent/EventoFormContentAdmin"));
const ProductoresContentAdmin = lazy(() => import("../pages/Content/adminContent/ProductoresContentAdmin"));
const ProductorDetailContentAdmin = lazy(() => import("../pages/Content/adminContent/ProductorDetailContentAdmin"));
const UPAdminDetailContentAdmin = lazy(() => import("../pages/Content/adminContent/UPAdminDetailContentAdmin"));

const InvSourceContentAdmin = lazy(() => import("../pages/Content/adminContent/InvSourceConetn"));
const SolicitudesInsumoContentAdmin = lazy(() => import("../pages/Content/adminContent/SolicitudesInsumoContentAdmin"));
const InvToolsContentAdmin = lazy(() => import("../pages/Content/adminContent/InvToolsContentAdmin"));
const InvVehicleContentAdmin = lazy(() => import("../pages/Content/adminContent/InvVehicleContentAdmin"));
const InvVehicleFormContentAdmin = lazy(() => import("../pages/Content/adminContent/InvVehicleFormContentAdmin"));
const InsumoFormContentAdmin = lazy(() => import("../pages/Content/adminContent/InsumoFormContentAdmin"));
const HerramientaFormContentAdmin = lazy(() => import("../pages/Content/adminContent/HerramientaFormContentAdmin"));

const AgendaContentEmployee = lazy(() => import("../pages/Content/employeeContent/AgendaContentEmployee"));
const HistorialVisitasEmployee = lazy(() => import("../pages/Content/employeeContent/HistorialVisitasEmployee"));
const HomeContentEmployee = lazy(() => import("../pages/Content/employeeContent/HomeContentEmployee"));
const InventaryContentEmployee = lazy(() => import("../pages/Content/employeeContent/InventaryContentEmployee"));
const GestionContentEmployee = lazy(() => import("../pages/Content/employeeContent/GestionContentEmployee"));
const CaracterForm = lazy(() => import("../pages/Content/employeeContent/visitViews/CaracterForm"));
const VisitaForm = lazy(() => import("../pages/Content/employeeContent/visitViews/VisitaForm"));
const ReciboPagoForm = lazy(() => import("../pages/Content/employeeContent/visitViews/ReciboPagoForm"));

const HomePageContentUser = lazy(() => import("../pages/Content/userContent/PrincipalPageContentUser"));
const AgroModuleContentUser = lazy(() => import("../pages/Content/userContent/AgroExtentionContentUser"));
const AnimalProtectionModuleContentUser = lazy(() => import("../pages/Content/userContent/AnimalProtectionContentUser"));
const UPDetailView = lazy(() => import("../pages/Content/userContent/AgroExtensionViews/UPDetailView"));

// Cada página perezosa va en su propio Suspense para que el layout (barra lateral)
// siga visible mientras se descarga.
function Pagina({ children }) {
    return (
        <Suspense fallback={<p className="p-4 text-sm text-gray-500">Cargando...</p>}>
            {children}
        </Suspense>
    )
}

export default function SigeaRoutes(){
    return(
        <Routes>
            <Route index element={<Login/>} />
            <Route path="/registro" element={<Register/>} />
            <Route path="/tratamiento-datos" element={<DataTreatment/>} />

            <Route path="/administrador" element={
                <ProtectedRoute allowedRoles={['Administradores']}>
                    <AdminLayout/>
                </ProtectedRoute>
            }>
                <Route index element={<Pagina><DashboardContentAdmin/></Pagina>}/>
                <Route path="reportes" element={<Pagina><ReportContentAdmin/></Pagina>}/>
                <Route path="inventario" element={<Pagina><InventaryContentAdmin/></Pagina>}/>
                <Route path="horarios" element={<Pagina><ScheduleContentAdmin/></Pagina>}/> 
                <Route path="solicitudes" element={<Pagina><SolicitudesContentAdmin/></Pagina>}/> 
                <Route path="usuarios" element={<Pagina><UsersContentAdmin/></Pagina>}/> 
                <Route path="usuarios/nuevo" element={<Pagina><UserFormContentAdmin/></Pagina>}/> 
                <Route path="usuarios/editar/:usuarioId" element={<Pagina><UserFormContentAdmin/></Pagina>}/> 
                <Route path="productores" element={<Pagina><ProductoresContentAdmin/></Pagina>}/>
                <Route path="productores/:productorId" element={<Pagina><ProductorDetailContentAdmin/></Pagina>}/>
                <Route path="productores/:productorId/up/:upId" element={<Pagina><UPAdminDetailContentAdmin/></Pagina>}/>
                <Route path="validacion-ups" element={<Pagina><UpValidationAdmin/></Pagina>}/> 
                <Route path="visitas" element={<Pagina><VisitasContentAdmin/></Pagina>}/> 
                <Route path="eventos" element={<Pagina><EventosContentAdmin/></Pagina>}/> 
                <Route path="eventos/nuevo" element={<Pagina><EventoFormContentAdmin/></Pagina>}/> 
                <Route path="eventos/editar/:eventoId" element={<Pagina><EventoFormContentAdmin/></Pagina>}/> 

                <Route path='inventario/insumos' element={<Pagina><InvSourceContentAdmin/></Pagina>}/>
                <Route path='inventario/insumos/solicitudes' element={<Pagina><SolicitudesInsumoContentAdmin/></Pagina>}/>
                <Route path='inventario/insumos/nuevo' element={<Pagina><InsumoFormContentAdmin/></Pagina>}/>
                <Route path='inventario/insumos/actualizar/:insumoId' element={<Pagina><InsumoFormContentAdmin/></Pagina>}/>
                <Route path='inventario/herramientas' element={<Pagina><InvToolsContentAdmin/></Pagina>}/>
                <Route path='inventario/herramientas/nuevo' element={<Pagina><HerramientaFormContentAdmin/></Pagina>}/>
                <Route path='inventario/herramientas/editar/:herramientaId' element={<Pagina><HerramientaFormContentAdmin/></Pagina>}/>
                <Route path='inventario/vehiculos' element={<Pagina><InvVehicleContentAdmin/></Pagina>}/>
                <Route path='inventario/vehiculos/nuevo' element={<Pagina><InvVehicleFormContentAdmin/></Pagina>}/>
                <Route path='inventario/vehiculos/editar/:vehiculoId' element={<Pagina><InvVehicleFormContentAdmin/></Pagina>}/>
            </Route>

            <Route path="/funcionario" element={
                <ProtectedRoute allowedRoles={['Funcionarios']}>
                    <EmployeeLayout/>
                </ProtectedRoute>
            }>
                <Route index element={<Pagina><HomeContentEmployee/></Pagina>}/>
                <Route path="agenda" element={<Pagina><AgendaContentEmployee/></Pagina>}/>
                <Route path="agenda/historial" element={<Pagina><HistorialVisitasEmployee/></Pagina>}/>
                <Route path="recursos" element={<Pagina><InventaryContentEmployee/></Pagina>}/>
                <Route path="gestion" element={<Pagina><GestionContentEmployee/></Pagina>}/>
                <Route path="visitas/caracterizacion" element={<Pagina><CaracterForm/></Pagina>}/>
                <Route path="visitas/visita" element={<Pagina><VisitaForm/></Pagina>}/>
                <Route path="visitas/recibo" element={<Pagina><ReciboPagoForm/></Pagina>}/>
            </Route>

            <Route path="/usuario" element={
                <ProtectedRoute allowedRoles={['Usuarios', 'Productores']}>
                    <UserLayout/>
                </ProtectedRoute>
            }>
                <Route index element={<Pagina><HomePageContentUser/></Pagina>}/>
                <Route path="extension_agropecuaria" element={<Pagina><AgroModuleContentUser/></Pagina>}/>
                <Route path="extension_agropecuaria/up/:upId" element={<Pagina><UPDetailView/></Pagina>}/>
                <Route path="proteccion_animal" element={<Pagina><AnimalProtectionModuleContentUser/></Pagina>}/>
            </Route>
            
        </Routes>
    )
    
}
