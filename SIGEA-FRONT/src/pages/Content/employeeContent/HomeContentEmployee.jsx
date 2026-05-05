import MenuCard from '../../../components/MenuCard/MenuCard';
import InventoryIcon from '@mui/icons-material/Inventory';
import EventIcon from '@mui/icons-material/Event';



export default function HomeContentEmployee(){
    return(
        <>
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
        </>
    )
}