import AgricultureIcon from '@mui/icons-material/Agriculture';
import HomeIcon from '@mui/icons-material/Home';
import InventoryIcon from '@mui/icons-material/Inventory';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventIcon from '@mui/icons-material/Event';
import PetsIcon from '@mui/icons-material/Pets';

export const SidebarData = [
    {
        title: 'Inicio',
        icon: <HomeIcon/>, 
        link: '/administrador', 
        roles: ['admin']
    }, 
    {
        title: 'Menu Principal',
        icon: <HomeIcon/>, 
        link: '/funcionario', 
        roles: ['funcionario']
    }, 
     {
        title: 'Inventario',
        icon: <InventoryIcon/>, 
        link: '/administrador/inventary', 
        roles: ['admin']
    }, 
     {
        title: 'Recursos',
        icon: <InventoryIcon/>, 
        link: '/funcionario/recursos', 
        roles: ['funcionario']
    }, 
    {
        title: 'Horarios',
        icon: <CalendarMonthIcon/>, 
        link: '/administrador/schedule', 
        roles: ['admin']
    }, 
     {
        title: 'Usuarios',
        icon: <GroupIcon/>, 
        link: '/administrador/users', 
        roles: ['admin']
    }, 
     {
        title: 'Reportes',
        icon: <AssessmentIcon/>, 
        link: '/administrador/report', 
        roles: ['admin']
    }, 
     {
        title: 'Agenda',
        icon: <EventIcon/>, 
        link: '/funcionario/agenda', 
        roles: ['funcionario']
    }, 
     {
        title: 'extension Agropecuaria',
        icon: <AgricultureIcon/>, 
        link: '/usuario/Extension_Agropecuaria', 
        roles: ['usuario']
    }, 
     {
        title: 'Proteccion Animal',
        icon: <PetsIcon/>, 
        link: '/usuario/Proteccion_Animal', 
        roles: ['usuario']
    }
    
]