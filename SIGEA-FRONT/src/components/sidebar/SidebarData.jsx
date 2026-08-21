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
        roles: ['Administradores']
    }, 
     {
        title: 'Principal',
        icon: <HomeIcon/>, 
        link: '/usuario', 
        roles: ['Usuarios', 'Productores']
    }, 
    {
        title: 'Menu',
        icon: <HomeIcon/>, 
        link: '/funcionario', 
        roles: ['Funcionarios']
    }, 
     {
        title: 'Inventario',
        icon: <InventoryIcon/>, 
        link: '/administrador/inventario', 
        roles: ['Administradores']
    }, 
     {
        title: 'Recursos',
        icon: <InventoryIcon/>, 
        link: '/funcionario/recursos', 
        roles: ['Funcionarios']
    }, 
    {
        title: 'Horarios',
        icon: <CalendarMonthIcon/>, 
        link: '/administrador/horarios', 
        roles: ['Administradores']
    }, 
     {
        title: 'Usuarios',
        icon: <GroupIcon/>, 
        link: '/administrador/usuarios', 
        roles: ['Administradores']
    }, 
     {
        title: 'Reportes',
        icon: <AssessmentIcon/>, 
        link: '/administrador/reportes', 
        roles: [] //'Administradores'
    }, 
     {
        title: 'Agenda',
        icon: <EventIcon/>, 
        link: '/funcionario/agenda', 
        roles: ['Funcionarios']
    }, 
     {
        title: 'extension Agro',
        icon: <AgricultureIcon/>, 
        link: '/usuario/Extension_Agropecuaria', 
        roles: ['Usuarios', 'Productores']
    }, 
     {
        title: 'Pro Animal',
        icon: <PetsIcon/>, 
        link: '/usuario/Proteccion_Animal', 
        roles: [] //'Usuarios', 'Productores'
    }
    
]