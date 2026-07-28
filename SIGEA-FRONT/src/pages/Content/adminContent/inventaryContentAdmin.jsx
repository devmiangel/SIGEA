import MenuCard from '../../../components/MenuCard/MenuCard';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import HandymanIcon from '@mui/icons-material/Handyman';
import InterestsIcon from '@mui/icons-material/Interests';

export default function InventaryContentAdmin(){
    return(
        <>
             <MenuCard 
                componentLogo={
                    <InterestsIcon sx={{fontSize: 40}}/>
                } 
                title={'Insumos'} 
                message={'Gestiona los insumos'} 
                path={'/administrador/inventario/insumos'} 
                colorLogo={'#3e9a8a'}
            />

            <MenuCard 
                componentLogo={
                    <HandymanIcon sx={{fontSize: 40}}/>
                } 
                title={'Herramientas'} 
                message={'Gestiona las herramientas'} 
                path={'/administrador/inventario/herramientas'} 
                colorLogo={'#3e9a8a'}
            />

            <MenuCard 
                componentLogo={
                    <DriveEtaIcon sx={{fontSize: 40}}/>
                } 
                title={'Vehiculos'} 
                message={'Gestiona los vehiculos'} 
                path={'/administrador/inventario/vehiculos'} 
                colorLogo={'#3e9a8a'}/>
        </>
    )
}