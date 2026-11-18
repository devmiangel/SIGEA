import MenuCard from '../../../components/MenuCard/MenuCard';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import HandymanIcon from '@mui/icons-material/Handyman';
import InterestsIcon from '@mui/icons-material/Interests';

export default function InventaryContentAdmin(){
    return(
        <div className="grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <MenuCard
                className="w-full h-full m-0"
                componentLogo={
                    <InterestsIcon sx={{fontSize: 40}}/>
                } 
                title={'Insumos'} 
                message={'Gestiona los insumos'} 
                path={'/administrador/inventario/insumos'} 
                colorLogo={'#3e9a8a'}
            />

            <MenuCard
                className="w-full h-full m-0"
                componentLogo={
                    <HandymanIcon sx={{fontSize: 40}}/>
                } 
                title={'Herramientas'} 
                message={'Gestiona las herramientas'} 
                path={'/administrador/inventario/herramientas'} 
                colorLogo={'#3e9a8a'}
            />

            <MenuCard
                className="w-full h-full m-0"
                componentLogo={
                    <DriveEtaIcon sx={{fontSize: 40}}/>
                } 
                title={'Vehiculos'} 
                message={'Gestiona los vehiculos'} 
                path={'/administrador/inventario/vehiculos'} 
                colorLogo={'#3e9a8a'}/>
        </div>
    )
}
