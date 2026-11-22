import MenuCard from '../../../components/MenuCard/MenuCard';
import InventoryIcon from '@mui/icons-material/Inventory';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupIcon from '@mui/icons-material/Group';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';



export default function DashboardContentAdmin(){
    return(
        <div className="grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MenuCard
                className="w-full h-full m-0"
                componentLogo={
                    <InventoryIcon sx={{fontSize: 40}}/>
                } 
                title={'Inventario'} 
                message={'Gestiona los inventarios aquí'} 
                path={'/administrador/inventario'} 
                colorLogo={'#3e9a8a'}
            />

            <MenuCard
                className="w-full h-full m-0"
                componentLogo={
                    <AgricultureIcon sx={{fontSize: 40}}/>
                } 
                title={'Productores'} 
                message={'Consulta productores, sus UPs y caracterizaciones'} 
                path={'/administrador/productores'} 
                colorLogo={'#55bd85'}
            />

            <MenuCard
                className="w-full h-full m-0"
                componentLogo={
                    <CalendarMonthIcon sx={{fontSize: 40}}/>
                } 
                title={'Horarios'} 
                message={'Realiza la asignación de las visitas'} 
                path={'/administrador/horarios'} 
                colorLogo={'#55bd85'}
            />

            <MenuCard
                className="w-full h-full m-0"
                componentLogo={
                    <GroupIcon sx={{fontSize: 40}}/>
                } 
                title={'Usuarios'} 
                message={'Gestiona los usuarios aquí'} 
                path={'/administrador/usuarios'} 
                colorLogo={'#9ebd57'}/>

            <MenuCard
                className="w-full h-full m-0"
                componentLogo={
                    <AssignmentIcon sx={{fontSize: 40}}/>
                }
                title={'Solicitudes'}
                message={'Asigna las solicitudes pendientes de los productores'}
                path={'/administrador/solicitudes'}
                colorLogo={'#55bd85'}
            />

            <MenuCard
                className="w-full h-full m-0"
                componentLogo={
                    <EventIcon sx={{fontSize: 40}}/>
                } 
                title={'Eventos'} 
                message={'Gestiona los eventos aquí'} 
                path={'/administrador/eventos'} 
                colorLogo={'#7ebcab'}
            />

            {/* <MenuCard 
                componentLogo={
                    <AssessmentIcon sx={{fontSize: 40}}/>
                } 
                title={'Reportes'} 
                message={'Consulta los reportes aquí'} 
                path={'/administrador/reportes'} 
                colorLogo={'#7ebcab'}
            /> */}
        </div>
    )
}
