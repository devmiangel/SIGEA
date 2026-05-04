import './contentadmin.css'

import MenuCard from '../../../components/MenuCard/MenuCard';
import InventoryIcon from '@mui/icons-material/Inventory';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';



export default function DashboardContentAdmin(){
    return(
        <>
            <MenuCard 
                componentLogo={
                    <InventoryIcon sx={{fontSize: 40}}/>
                } 
                title={'Inventario'} 
                message={'Gestiona los inventarios aquí'} 
                path={'/administrador/inventario'} 
                colorLogo={'#3e9a8a'}
            />

            <MenuCard 
                componentLogo={
                    <CalendarMonthIcon sx={{fontSize: 40}}/>
                } 
                title={'Horarios'} 
                message={'Realiza la asignacion de las visitas'} 
                path={'/administrador/horarios'} 
                colorLogo={'#55bd85'}
            />

            <MenuCard 
                componentLogo={
                    <GroupIcon sx={{fontSize: 40}}/>
                } 
                title={'Usuarios'} 
                message={'Gestiona los usuarios aquí'} 
                path={'/administrador/usuarios'} 
                colorLogo={'#9ebd57'}/>

            <MenuCard 
                componentLogo={
                    <AssessmentIcon sx={{fontSize: 40}}/>
                } 
                title={'Reportes'} 
                message={'Consulta los reportes aquí'} 
                path={'/administrador/reportes'} 
                colorLogo={'#7ebcab'}
            />
        </>
    )
}