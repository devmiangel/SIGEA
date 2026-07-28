import { Header } from "../../../../components/Tettles-Buttons/Title"
import TabComponent from '../../../../components/Tab/Tab';

import AgricultureIcon from '@mui/icons-material/Agriculture';
import ButtonLink from '../../../../components/Tettles-Buttons/Buttons';

export default function ProductorView(){
    return(
            <>
                <Header 
                    componentLogo={<AgricultureIcon sx={{fontSize: 40}}/>} 
                    headerText={'Mis Unidades Productivas'} 
                    colorLogo={'#3e9a8a'}
                    message={'Gestiona tus unidades productivas registradas y en proceso de aprobación'}
                    firstButton={<ButtonLink buttonText={'Agregar Unidad'}/>}
                />
                <div className="bg-white min-h-[80vh] w-full rounded-xl p-5 m-5">
                    <TabComponent/>
                </div>
            </>
             
               
     
    )
}