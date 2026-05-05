import MenuCard from '../../../components/MenuCard/MenuCard';

import AgricultureIcon from '@mui/icons-material/Agriculture';
import PetsIcon from '@mui/icons-material/Pets';

export default function HomePageContentUser(){
    return(
        <>
            <MenuCard 
                componentLogo={
                    <AgricultureIcon sx={{fontSize: 40}}/>
                } 
                title={'Extension Agropecuaria'} 
                message={'Realiza solicitudes a tu unidad productiva'} 
                path={'/usuario/Extension_Agropecuaria'} 
                colorLogo={'#3e9a8a'}
            />

            <MenuCard
                componentLogo={
                    <PetsIcon sx={{fontSize: 40}}/>
                } 
                title={'Proteccion Animal'} 
                message={'Accede a beneficios de proteccion animal'} 
                path={'/usuario/Proteccion_Animal'} 
                colorLogo={'#55bd85'}
            />
        </>
    )
}