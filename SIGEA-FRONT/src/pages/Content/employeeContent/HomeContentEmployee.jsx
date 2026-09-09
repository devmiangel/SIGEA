import MenuCard from '../../../components/MenuCard/MenuCard';
import InventoryIcon from '@mui/icons-material/Inventory';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';



export default function HomeContentEmployee(){
    return(
        <>
        <div className='md:flex md:flex-wrap md:justify-center'>
            <MenuCard 
                componentLogo={
                    <InventoryIcon sx={{fontSize: 40}}/>
                } 
                title={'Inventario'} 
                message={'Consulta y has solicitudes de insumos'} 
                path={'/funcionario/recursos'} 
                colorLogo={'#3e9a8a'}
            />

            <MenuCard 
                componentLogo={
                    <EventIcon sx={{fontSize: 40}}/>
                } 
                title={'Agenda'} 
                message={'este es el mensaje xd'} 
                path={'/funcionario/agenda'} 
                colorLogo={'#55bd85'}
            />

            <MenuCard 
                componentLogo={
                    <AssignmentIcon sx={{fontSize: 40}}/>
                } 
                title={'Gestion'} 
                message={'Genera ordenes de visita a productores y usuarios'} 
                path={'/funcionario/gestion'} 
                colorLogo={'#9ebd57'}
            />
        </div>
            
        </>
    )
}